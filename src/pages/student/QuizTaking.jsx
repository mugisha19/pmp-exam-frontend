/**
 * Modern Quiz Taking Interface
 * Follows backend rules exactly as expected by quiz-service
 *
 * Key Behaviors:
 * - Practice Mode: Unlimited time, unlimited pauses, no auto-submit
 * - Exam Mode: Time limit, structured pauses, auto-submit on expiry
 * - Proper timing: Exam time excludes pause time
 * - Answer formats: Matches backend expectations exactly
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Send,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BookOpen,
  Timer,
  Target,
  Zap,
  Coffee,
  ArrowLeft,
} from "lucide-react";
import {
  getSessionState,
  saveAnswer,
  pauseQuiz,
  resumeQuiz,
  submitQuiz,
  flagQuestion,
  navigateToQuestion,
  sendHeartbeat,
} from "@/services/session.service";
import { showToast } from "@/utils/toast.utils";
import { cn } from "@/utils/cn";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/Modal";

export const QuizTaking = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sessionToken = sessionStorage.getItem("quiz_session_token");

  // Session state
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Timing state (synced with backend)
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [examTimeElapsed, setExamTimeElapsed] = useState(0);
  const [pauseTimeElapsed, setPauseTimeElapsed] = useState(0);
  const [pauseTimeRemaining, setPauseTimeRemaining] = useState(null);

  // UI state
  const [isPausing, setIsPausing] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isWaitingForAutoSubmit, setIsWaitingForAutoSubmit] = useState(false);
  const [lastQuestionAnswerSaved, setLastQuestionAnswerSaved] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Load session state from backend
  const loadSessionState = useCallback(async () => {
    if (!sessionToken) {
      navigate(`/exams/${quizId}`);
      return;
    }

    try {
      const state = await getSessionState(sessionToken);

      // Handle submitted/auto-submitted sessions
      if (state.status === "submitted" || state.status === "auto_submitted") {
        sessionStorage.removeItem("quiz_session_token");
        sessionStorage.removeItem("quiz_session_data");
        if (state.status === "auto_submitted") {
          showToast.info("Time's up!", "Quiz was auto-submitted.");
        } else {
          showToast.info(
            "Already Submitted",
            "This quiz has already been submitted"
          );
        }
        navigate(`/exams/${quizId}`);
        return;
      }

      // Handle auto-submitted from backend (with result)
      if (state.status === "auto_submitted" && state.result) {
        sessionStorage.removeItem("quiz_session_token");
        sessionStorage.removeItem("quiz_session_data");
        showToast.info("Time's up!", "Quiz was auto-submitted.");
        navigate(`/exams/${quizId}`);
        return;
      }

      // Check if time has expired (exam mode)
      if (
        state.quiz_mode === "exam" &&
        state.timing?.time_remaining_seconds !== null &&
        state.timing.time_remaining_seconds <= 0
      ) {
        setIsWaitingForAutoSubmit(true);
        setTimeRemaining(0);
      }

      // Set current question from backend's current_question_number
      const currentQNum = state.progress?.current_question_number || 1;
      let qIndex = currentQNum - 1;
      const currentQ = state.questions?.[qIndex];

      // If current question is answered, navigate to next unanswered question
      if (currentQ?.is_answered) {
        const nextUnansweredIndex = state.questions.findIndex(
          (q, idx) => idx > qIndex && !q.is_answered
        );

        if (nextUnansweredIndex !== -1) {
          qIndex = nextUnansweredIndex;
        } else {
          const nextIndex = qIndex + 1;
          if (nextIndex < state.questions.length) {
            qIndex = nextIndex;
          }
        }

        if (!state.pause_info?.is_paused && state.status !== "expired") {
          try {
            await navigateToQuestion(sessionToken, qIndex + 1);
          } catch (error) {
            console.error("Failed to navigate to next unanswered:", error);
          }
        }

        setCurrentQuestionIndex(qIndex);
        const updatedQ = state.questions?.[qIndex];
        setSelectedAnswer(updatedQ?.user_answer || null);
      }

      setSessionData(state);
      setCurrentQuestionIndex(qIndex);

      const finalQ = state.questions?.[qIndex];
      if (finalQ) {
        setSelectedAnswer(finalQ.user_answer || null);
      }

      const isLastQuestion = qIndex === state.questions.length - 1;
      if (!isLastQuestion) {
        setLastQuestionAnswerSaved(false);
      } else {
        const lastQ = state.questions?.[qIndex];
        if (lastQ?.user_answer) {
          setLastQuestionAnswerSaved(true);
        } else {
          setLastQuestionAnswerSaved(false);
        }
      }

      if (state.timing) {
        setTimeRemaining(state.timing.time_remaining_seconds);
        setExamTimeElapsed(state.timing.time_elapsed_seconds || 0);
        setPauseTimeElapsed(state.timing.pause_time_seconds || 0);
      }

      if (state.pause_info?.is_paused) {
        setPauseTimeRemaining(state.pause_info.pause_remaining_seconds);
      } else {
        setPauseTimeRemaining(null);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
      showToast.error(
        "Session Error",
        "Failed to load quiz session. Please try again."
      );
      navigate(`/exams/${quizId}`);
    } finally {
      setLoading(false);
    }
  }, [sessionToken, quizId, navigate]);

  // Initial load
  useEffect(() => {
    loadSessionState();
  }, [loadSessionState]);

  // Exam timer countdown
  useEffect(() => {
    if (!sessionData || !sessionData.timing?.has_time_limit) return;
    if (sessionData.pause_info?.is_paused) return;
    if (timeRemaining === null || timeRemaining <= 0) {
      if (timeRemaining === 0 && !isWaitingForAutoSubmit) {
        setIsWaitingForAutoSubmit(true);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          setIsWaitingForAutoSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionData, timeRemaining, isWaitingForAutoSubmit]);

  // Pause countdown timer
  useEffect(() => {
    if (!sessionData?.pause_info?.is_paused) {
      setPauseTimeRemaining(null);
      return;
    }

    if (sessionData.quiz_mode === "practice") return;

    let pauseTimer;
    let pollTimer;

    if (pauseTimeRemaining !== null && pauseTimeRemaining > 0) {
      pauseTimer = setInterval(() => {
        setPauseTimeRemaining((prev) => {
          if (prev === null || prev <= 0) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    pollTimer = setInterval(async () => {
      try {
        const state = await getSessionState(sessionToken);

        if (!state.pause_info?.is_paused) {
          await loadSessionState();
          return;
        }

        if (state.pause_info?.pause_remaining_seconds !== undefined) {
          setPauseTimeRemaining(state.pause_info.pause_remaining_seconds);
        }
      } catch (error) {
        console.error("Failed to poll pause state:", error);
      }
    }, 5000);

    return () => {
      if (pauseTimer) clearInterval(pauseTimer);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [
    sessionData?.pause_info?.is_paused,
    sessionData?.quiz_mode,
    pauseTimeRemaining,
    sessionToken,
    loadSessionState,
  ]);

  // Heartbeat every 30 seconds
  useEffect(() => {
    if (!sessionToken || !sessionData) return;
    if (sessionData.pause_info?.is_paused) return;

    const heartbeat = setInterval(async () => {
      try {
        const response = await sendHeartbeat(sessionToken);

        if (response.time_remaining_seconds !== undefined) {
          setTimeRemaining(response.time_remaining_seconds);
        }
        if (response.exam_time_seconds !== undefined) {
          setExamTimeElapsed(response.exam_time_seconds);
        }
        if (response.pause_time_seconds !== undefined) {
          setPauseTimeElapsed(response.pause_time_seconds);
        }

        if (response.auto_resumed) {
          await loadSessionState();
        }

        if (
          response.status === "auto_submitted" ||
          response.status === "expired"
        ) {
          sessionStorage.removeItem("quiz_session_token");
          sessionStorage.removeItem("quiz_session_data");
          showToast.info("Time's up!", "Quiz was auto-submitted.");
          navigate(`/exams/${quizId}`);
          return;
        }

        if (
          response.time_remaining_seconds !== undefined &&
          response.time_remaining_seconds <= 0
        ) {
          setIsWaitingForAutoSubmit(true);
          setTimeRemaining(0);
        }
      } catch (error) {
        console.error("Heartbeat failed:", error);
      }
    }, 30000);

    return () => clearInterval(heartbeat);
  }, [sessionToken, sessionData, quizId, navigate, loadSessionState]);

  // Poll for auto-submit
  useEffect(() => {
    if (!isWaitingForAutoSubmit || !sessionToken) return;

    const pollInterval = setInterval(async () => {
      try {
        const state = await getSessionState(sessionToken);

        if (state.status === "auto_submitted" || state.status === "submitted") {
          sessionStorage.removeItem("quiz_session_token");
          sessionStorage.removeItem("quiz_session_data");
          showToast.info("Time's up!", "Quiz was auto-submitted.");
          navigate(`/exams/${quizId}`);
          return;
        }

        if (state.status === "expired" || !state.session_id) {
          sessionStorage.removeItem("quiz_session_token");
          sessionStorage.removeItem("quiz_session_data");
          showToast.error("Session Expired", "Quiz was auto-submitted.");
          navigate(`/exams/${quizId}`);
          return;
        }
      } catch (error) {
        if (error.response?.status === 404 || error.response?.status === 410) {
          sessionStorage.removeItem("quiz_session_token");
          sessionStorage.removeItem("quiz_session_data");
          showToast.info("Time's up!", "Quiz was auto-submitted.");
          navigate(`/exams/${quizId}`);
        } else {
          console.error("Failed to poll session status:", error);
        }
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [isWaitingForAutoSubmit, sessionToken, quizId, navigate]);

  const handleAnswerChange = (answer) => {
    if (isWaitingForAutoSubmit || sessionData?.pause_info?.is_paused) {
      return;
    }
    setSelectedAnswer(answer);

    if (
      sessionData &&
      currentQuestionIndex === sessionData.questions.length - 1
    ) {
      setLastQuestionAnswerSaved(false);
    }
  };

  const handleSaveAnswer = async () => {
    if (isWaitingForAutoSubmit) {
      return { autoPaused: false };
    }

    if (!sessionData || sessionData.pause_info?.is_paused) {
      return { autoPaused: false };
    }

    if (!selectedAnswer) {
      return { autoPaused: false };
    }

    setIsSaving(true);

    try {
      const currentQ = sessionData.questions[currentQuestionIndex];
      const response = await saveAnswer(sessionToken, {
        quiz_question_id: currentQ.quiz_question_id,
        question_type: currentQ.question_type,
        answer: selectedAnswer,
        time_spent_seconds: currentQ.time_spent_seconds || 0,
        is_flagged: currentQ.is_flagged || false,
      });

      if (response.auto_paused) {
        await loadSessionState();
        return { autoPaused: true };
      }

      await loadSessionState();

      const updatedState = await getSessionState(sessionToken);
      if (updatedState.pause_info?.is_paused) {
        return { autoPaused: true };
      }

      if (
        sessionData &&
        currentQuestionIndex === sessionData.questions.length - 1
      ) {
        setLastQuestionAnswerSaved(true);
      }

      return { autoPaused: false };
    } catch (error) {
      console.error("Failed to save answer:", error);
      if (
        error.response?.status === 400 &&
        error.response?.data?.detail?.includes("paused")
      ) {
        await loadSessionState();
        return { autoPaused: true };
      }
      if (error.response?.status === 410) {
        sessionStorage.removeItem("quiz_session_token");
        sessionStorage.removeItem("quiz_session_data");
        navigate(`/exams/${quizId}`);
        return { autoPaused: false };
      }
      showToast.error("Save Failed", "Failed to save answer");
      return { autoPaused: false };
    } finally {
      setIsSaving(false);
    }
  };

  const handleFlagToggle = async () => {
    if (isWaitingForAutoSubmit) {
      return;
    }

    if (!sessionData || sessionData.pause_info?.is_paused) {
      showToast.error(
        "Action Not Allowed",
        "Cannot flag questions while quiz is paused."
      );
      return;
    }

    const currentQ = sessionData.questions[currentQuestionIndex];
    const newFlagStatus = !currentQ.is_flagged;
    const currentAnswer = selectedAnswer; // Preserve current answer

    try {
      await flagQuestion(
        sessionToken,
        currentQ.quiz_question_id,
        newFlagStatus
      );
      await loadSessionState();

      // Restore the selected answer after reloading state
      setSelectedAnswer(currentAnswer);
    } catch (error) {
      console.error("Failed to flag question:", error);
      if (error.response?.status === 410) {
        sessionStorage.removeItem("quiz_session_token");
        sessionStorage.removeItem("quiz_session_data");
        navigate(`/exams/${quizId}`);
        return;
      }
      showToast.error("Flag Failed", "Failed to flag question");
    }
  };

  const handleNavigate = async (direction) => {
    if (isWaitingForAutoSubmit) {
      return;
    }

    if (!sessionData || sessionData.pause_info?.is_paused) {
      showToast.error(
        "Action Not Allowed",
        "Cannot navigate while quiz is paused."
      );
      return;
    }

    // Determine the new index first
    let newIndex;
    if (direction === "prev") {
      newIndex = Math.max(0, currentQuestionIndex - 1);
    } else if (direction === "next") {
      newIndex = Math.min(
        sessionData.questions.length - 1,
        currentQuestionIndex + 1
      );
    } else if (typeof direction === "number") {
      newIndex = direction - 1;
      if (newIndex === currentQuestionIndex) {
        return;
      }

      // Prevent navigation to unanswered questions ahead of current position
      if (newIndex > currentQuestionIndex) {
        const targetQuestion = sessionData.questions[newIndex];
        if (!targetQuestion.is_answered && !targetQuestion.is_flagged) {
          showToast.error(
            "Navigation Restricted",
            "You can only navigate forward by answering questions in order. You can go back to review previous questions."
          );
          return;
        }
      }
    } else {
      return;
    }

    // Only save answer when going forward (Next button)
    const isGoingForward = direction === "next";

    if (isGoingForward && selectedAnswer) {
      const saveResult = await handleSaveAnswer();

      if (saveResult?.autoPaused) {
        return;
      }

      // Get fresh state after saving
      const currentState = await getSessionState(sessionToken);
      if (currentState.pause_info?.is_paused) {
        setSessionData(currentState);
        if (currentState.timing) {
          setTimeRemaining(currentState.timing.time_remaining_seconds);
        }
        if (currentState.pause_info?.is_paused) {
          setPauseTimeRemaining(
            currentState.pause_info.pause_remaining_seconds
          );
        }
        return;
      }
      setSessionData(currentState);
    }

    try {
      const latestState = await getSessionState(sessionToken);

      if (latestState.pause_info?.is_paused) {
        setSessionData(latestState);
        if (latestState.timing) {
          setTimeRemaining(latestState.timing.time_remaining_seconds);
          setExamTimeElapsed(latestState.timing.time_elapsed_seconds || 0);
          setPauseTimeElapsed(latestState.timing.pause_time_seconds || 0);
        }
        if (latestState.pause_info?.is_paused) {
          setPauseTimeRemaining(latestState.pause_info.pause_remaining_seconds);
        }
        return;
      }

      if (
        latestState.status === "expired" ||
        latestState.status === "submitted" ||
        latestState.status === "auto_submitted"
      ) {
        sessionStorage.removeItem("quiz_session_token");
        sessionStorage.removeItem("quiz_session_data");
        navigate(`/exams/${quizId}`);
        return;
      }

      if (!isWaitingForAutoSubmit) {
        await navigateToQuestion(sessionToken, newIndex + 1);
        // Get fresh state after navigation
        const updatedState = await getSessionState(sessionToken);
        setSessionData(updatedState);

        // Update timing from fresh state
        if (updatedState.timing) {
          setTimeRemaining(updatedState.timing.time_remaining_seconds);
          setExamTimeElapsed(updatedState.timing.time_elapsed_seconds || 0);
          setPauseTimeElapsed(updatedState.timing.pause_time_seconds || 0);
        }

        // Set the selected answer and current index from the updated state
        setCurrentQuestionIndex(newIndex);
        const newQ = updatedState.questions[newIndex];
        setSelectedAnswer(newQ?.user_answer || null);

        const isLastQuestion = newIndex === updatedState.questions.length - 1;
        if (!isLastQuestion) {
          setLastQuestionAnswerSaved(false);
        } else {
          if (newQ?.user_answer) {
            setLastQuestionAnswerSaved(true);
          } else {
            setLastQuestionAnswerSaved(false);
          }
        }
        return;
      }

      setCurrentQuestionIndex(newIndex);
      const newQ = sessionData.questions[newIndex];
      setSelectedAnswer(newQ?.user_answer || null);

      const isLastQuestion = newIndex === sessionData.questions.length - 1;
      if (!isLastQuestion) {
        setLastQuestionAnswerSaved(false);
      } else {
        if (newQ?.user_answer) {
          setLastQuestionAnswerSaved(true);
        } else {
          setLastQuestionAnswerSaved(false);
        }
      }
    } catch (error) {
      console.error("Failed to navigate:", error);
      if (error.response?.status === 410 || error.response?.status === 404) {
        sessionStorage.removeItem("quiz_session_token");
        sessionStorage.removeItem("quiz_session_data");
        navigate(`/exams/${quizId}`);
        return;
      }

      if (error.response?.status === 400) {
        const errorDetail = error.response?.data?.detail || "";
        if (errorDetail.includes("paused") || errorDetail.includes("pause")) {
          await loadSessionState();
          return;
        }
        await loadSessionState();
        return;
      }

      showToast.error("Navigation Failed", "Failed to navigate to question");
    }
  };

  const handlePause = async () => {
    if (!sessionData.pause_info.can_pause_now) {
      if (sessionData.quiz_mode === "exam") {
        const nextPauseAt = sessionData.pause_info.next_pause_at_question;
        showToast.error(
          "Pause Not Available",
          `Pause is only available after answering ${sessionData.pause_info.pause_after_questions} questions. ` +
            `Answer ${
              nextPauseAt - (currentQuestionIndex + 1)
            } more question(s) to pause.`
        );
      } else {
        showToast.error(
          "Pause Not Available",
          "Pause not available at this time"
        );
      }
      return;
    }

    setIsPausing(true);
    try {
      const response = await pauseQuiz(sessionToken);
      showToast.success(
        "Quiz Paused",
        "Take your time. Resume when you're ready."
      );
      await loadSessionState();
    } catch (error) {
      console.error("Failed to pause:", error);
      showToast.error(
        "Pause Failed",
        error.response?.data?.detail || "Failed to pause quiz"
      );
    } finally {
      setIsPausing(false);
    }
  };

  const handleResume = async () => {
    setIsResuming(true);
    try {
      await resumeQuiz(sessionToken);
      showToast.success(
        "Quiz Resumed",
        "Good luck! Continue where you left off."
      );
      await loadSessionState();
    } catch (error) {
      console.error("Failed to resume:", error);
      showToast.error("Resume Failed", "Failed to resume quiz");
    } finally {
      setIsResuming(false);
    }
  };

  const getUnansweredCount = () => {
    if (!sessionData?.questions) return 0;
    return sessionData.questions.filter((q) => !q.user_answer).length;
  };

  const handleSubmitClick = () => {
    if (isWaitingForAutoSubmit) {
      showToast.info(
        "Auto-Submit in Progress",
        "Quiz is being auto-submitted. Please wait..."
      );
      return;
    }
    setShowSubmitModal(true);
  };

  const handleSubmitConfirm = async () => {
    setShowSubmitModal(false);
    setIsSubmitting(true);

    try {
      if (selectedAnswer && sessionData && !sessionData.pause_info?.is_paused) {
        try {
          await handleSaveAnswer();
        } catch (error) {
          console.error("Failed to save answer before submit:", error);
        }
      }

      await submitQuiz(sessionToken);
      sessionStorage.removeItem("quiz_session_token");
      sessionStorage.removeItem("quiz_session_data");

      // Invalidate all queries to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
      await queryClient.invalidateQueries({
        queryKey: ["quiz-attempts", quizId],
      });
      await queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      await queryClient.invalidateQueries({
        queryKey: ["all-quizzes-dashboard"],
      });
      // Invalidate all attempts queries (matches any query starting with "all-quiz-attempts")
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "all-quiz-attempts",
      });

      showToast.success(
        "Quiz Submitted!",
        "Your answers have been saved successfully."
      );
      navigate(`/exams/${quizId}`);
    } catch (error) {
      console.error("Failed to submit:", error);
      if (error.response?.status === 200 || error.response?.status === 410) {
        sessionStorage.removeItem("quiz_session_token");
        sessionStorage.removeItem("quiz_session_data");

        // Invalidate queries to refetch fresh data
        await queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
        await queryClient.invalidateQueries({
          queryKey: ["quiz-attempts", quizId],
        });
        await queryClient.invalidateQueries({ queryKey: ["quizzes"] });
        await queryClient.invalidateQueries({
          queryKey: ["all-quizzes-dashboard"],
        });
        await queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === "all-quiz-attempts",
        });

        showToast.info("Already Submitted", "Quiz has already been submitted");
        navigate(`/exams/${quizId}`);
        return;
      }
      showToast.error("Submit Failed", "Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return "--:--";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const renderQuestionOptions = () => {
    const currentQ = sessionData.questions[currentQuestionIndex];
    if (!currentQ) return null;

    const isDisabled =
      sessionData.pause_info?.is_paused || isSaving || isWaitingForAutoSubmit;

    switch (currentQ.question_type) {
      case "multiple_choice":
        return (
          <div className="space-y-3">
            {currentQ.options.map((option, index) => {
              const isSelected =
                selectedAnswer?.selected_option_id === option.id;
              const optionLetter = String.fromCharCode(65 + index);

              return (
                <label
                  key={option.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200",
                    isDisabled
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer",
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg font-semibold text-sm shrink-0 transition-colors",
                      isSelected
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {optionLetter}
                  </div>
                  <div className="flex-1 pt-1">
                    <input
                      type="radio"
                      name="answer"
                      checked={isSelected}
                      onChange={() =>
                        handleAnswerChange({ selected_option_id: option.id })
                      }
                      className="sr-only"
                      disabled={isDisabled}
                    />
                    <span
                      className={cn(
                        "text-gray-700 font-medium",
                        isSelected && "text-gray-900"
                      )}
                    >
                      {option.text}
                    </span>
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                  )}
                </label>
              );
            })}
          </div>
        );

      case "multiple_response": {
        const selectedIds = selectedAnswer?.selected_option_ids || [];
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">
                Select all that apply
              </span>
            </div>
            {currentQ.options.map((option, index) => {
              const isSelected = selectedIds.includes(option.id);
              const optionLetter = String.fromCharCode(65 + index);

              return (
                <label
                  key={option.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200",
                    isDisabled
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer",
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg font-semibold text-sm shrink-0 transition-colors",
                      isSelected
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {optionLetter}
                  </div>
                  <div className="flex-1 pt-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const newIds = e.target.checked
                          ? [...selectedIds, option.id]
                          : selectedIds.filter((id) => id !== option.id);
                        handleAnswerChange({ selected_option_ids: newIds });
                      }}
                      className="sr-only"
                      disabled={isDisabled}
                    />
                    <span
                      className={cn(
                        "text-gray-700 font-medium",
                        isSelected && "text-gray-900"
                      )}
                    >
                      {option.text}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-1 transition-colors",
                      isSelected
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-gray-300 bg-white"
                    )}
                  >
                    {isSelected && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        );
      }

      case "true_false":
        return (
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                value: "true",
                label: "True",
                icon: CheckCircle,
                color: "emerald",
              },
              { value: "false", label: "False", icon: XCircle, color: "red" },
            ].map(({ value, label, icon: Icon, color }) => {
              const isSelected = selectedAnswer?.selected_option_id === value;

              return (
                <label
                  key={value}
                  className={cn(
                    "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200",
                    isDisabled
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer",
                    isSelected
                      ? color === "emerald"
                        ? "border-emerald-500 bg-emerald-50 shadow-sm"
                        : "border-red-500 bg-red-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <input
                    type="radio"
                    name="answer"
                    checked={isSelected}
                    onChange={() =>
                      handleAnswerChange({ selected_option_id: value })
                    }
                    className="sr-only"
                    disabled={isDisabled}
                  />
                  <Icon
                    className={cn(
                      "w-8 h-8 transition-colors",
                      isSelected
                        ? color === "emerald"
                          ? "text-emerald-500"
                          : "text-red-500"
                        : "text-gray-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-lg font-semibold transition-colors",
                      isSelected
                        ? color === "emerald"
                          ? "text-emerald-700"
                          : "text-red-700"
                        : "text-gray-600"
                    )}
                  >
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        );

      case "matching": {
        const matchedPairs = selectedAnswer?.pairs || [];
        const matchedRightIds = new Set(matchedPairs.map((p) => p.right_id));

        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-sm font-medium text-blue-700">
                Drag items from the right column to match with items on the left
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Match Items</h4>
                  <span className="text-sm text-gray-500">
                    {matchedPairs.length} / {currentQ.options.left_items.length}{" "}
                    matched
                  </span>
                </div>
                {currentQ.options.left_items.map((leftItem, index) => {
                  const match = matchedPairs.find(
                    (p) => p.left_id === leftItem.id
                  );
                  const rightItem = match
                    ? currentQ.options.right_items.find(
                        (r) => r.id === match.right_id
                      )
                    : null;

                  return (
                    <div
                      key={leftItem.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="flex-shrink-0 w-7 h-7 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </span>
                        <p className="font-medium text-gray-900 pt-0.5">
                          {leftItem.text}
                        </p>
                      </div>

                      <div
                        onDragOver={(e) => {
                          if (isDisabled) return;
                          e.preventDefault();
                          e.currentTarget.classList.add(
                            "border-emerald-400",
                            "bg-emerald-50"
                          );
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove(
                            "border-emerald-400",
                            "bg-emerald-50"
                          );
                        }}
                        onDrop={(e) => {
                          if (isDisabled) return;
                          e.preventDefault();
                          e.currentTarget.classList.remove(
                            "border-emerald-400",
                            "bg-emerald-50"
                          );
                          const rightId = e.dataTransfer.getData("rightId");
                          const newPairs = matchedPairs.filter(
                            (p) =>
                              p.left_id !== leftItem.id &&
                              p.right_id !== rightId
                          );
                          newPairs.push({
                            left_id: leftItem.id,
                            right_id: rightId,
                          });
                          handleAnswerChange({ pairs: newPairs });
                        }}
                        className={cn(
                          "min-h-[60px] border-2 border-dashed rounded-lg p-3 transition-all",
                          rightItem
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-gray-300 bg-gray-50"
                        )}
                      >
                        {rightItem ? (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="text-sm text-gray-700">
                                {rightItem.text}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const newPairs = matchedPairs.filter(
                                  (p) => p.left_id !== leftItem.id
                                );
                                handleAnswerChange({ pairs: newPairs });
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center text-gray-400 h-full">
                            <span className="text-xs font-medium">
                              Drop answer here
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">
                  Available Answers
                </h4>
                <div className="space-y-3">
                  {currentQ.options.right_items.map((rightItem) => {
                    const isMatched = matchedRightIds.has(rightItem.id);

                    return (
                      <div
                        key={rightItem.id}
                        draggable={!isMatched && !isDisabled}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("rightId", rightItem.id);
                          e.currentTarget.style.opacity = "0.5";
                        }}
                        onDragEnd={(e) => {
                          e.currentTarget.style.opacity = "1";
                        }}
                        className={cn(
                          "border-2 rounded-xl p-4 transition-all",
                          isMatched
                            ? "border-emerald-200 bg-emerald-50 opacity-60"
                            : "border-orange-200 bg-orange-50 cursor-grab hover:border-orange-300 hover:shadow-md active:cursor-grabbing"
                        )}
                      >
                        <p className="text-sm text-gray-700">
                          {rightItem.text}
                        </p>
                        {isMatched && (
                          <div className="flex items-center gap-1 mt-2 text-emerald-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">Matched</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      }

      default:
        return <p className="text-gray-500">Unknown question type</p>;
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // No Session State
  if (!sessionData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Session Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to load quiz session. Please try again.
          </p>
          <button
            onClick={() => navigate(`/exams/${quizId}`)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Paused State - Show as Modal Overlay
  const renderPauseModal = () => {
    if (!sessionData.pause_info?.is_paused) return null;

    const isCountdownExpired =
      pauseTimeRemaining !== null && pauseTimeRemaining <= 0;
    const showResumeButton =
      sessionData.quiz_mode === "practice" || !isCountdownExpired;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center border border-gray-200">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <Coffee className="w-12 h-12 text-amber-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Paused</h2>
          <p className="text-gray-600 mb-8">
            {sessionData.quiz_mode === "practice"
              ? "Take your time. Resume whenever you're ready."
              : "Your break time is tracked separately from exam time."}
          </p>

          {/* Pause Timer */}
          {pauseTimeRemaining !== null && pauseTimeRemaining > 0 && (
            <div className="mb-8">
              <p className="text-sm text-gray-500 mb-3">Auto-resume in</p>
              <div
                className={cn(
                  "inline-flex items-center gap-3 px-8 py-4 rounded-xl font-mono text-3xl font-bold",
                  pauseTimeRemaining < 60
                    ? "bg-red-50 text-red-600 border-2 border-red-200"
                    : "bg-amber-50 text-amber-600 border-2 border-amber-200"
                )}
              >
                <Timer className="w-8 h-8" />
                {formatTime(pauseTimeRemaining)}
              </div>
            </div>
          )}

          {/* Auto-resuming State */}
          {isCountdownExpired && sessionData.quiz_mode === "exam" && (
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span className="font-medium">
                  Resuming quiz automatically...
                </span>
              </div>
            </div>
          )}

          {/* Progress Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {sessionData.progress?.answered_count || 0}
                </div>
                <div className="text-xs text-gray-500">Answered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {sessionData.progress?.unanswered_count || 0}
                </div>
                <div className="text-xs text-gray-500">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {sessionData.progress?.flagged_count || 0}
                </div>
                <div className="text-xs text-gray-500">Flagged</div>
              </div>
            </div>
          </div>

          {/* Resume Button */}
          {showResumeButton && (
            <button
              onClick={handleResume}
              disabled={isResuming}
              className="w-full px-6 py-4 bg-emerald-600 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-600/20"
            >
              {isResuming ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Resuming...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Resume Quiz
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  // Waiting for Auto-Submit State
  if (isWaitingForAutoSubmit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border border-gray-200">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
            <Clock className="w-12 h-12 text-red-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Time's Up!</h2>
          <p className="text-gray-600 mb-8">
            Your quiz is being automatically submitted. Please wait...
          </p>

          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 mb-6">
            <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">Submitting quiz...</span>
          </div>

          <p className="text-sm text-gray-500">
            You will be redirected to view your results shortly.
          </p>
        </div>
      </div>
    );
  }

  const currentQ = sessionData.questions[currentQuestionIndex];
  const isExamMode = sessionData.quiz_mode === "exam";
  const hasTimeLimit = sessionData.timing?.has_time_limit;
  const progressPercentage =
    ((sessionData.progress?.answered_count || 0) /
      (sessionData.progress?.total_questions || 1)) *
    100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Pause Modal Overlay */}
      {renderPauseModal()}
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Quiz Info */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/exams/${quizId}`)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900 line-clamp-1">
                  {sessionData.quiz_title}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                      isExamMode
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    )}
                  >
                    {isExamMode ? (
                      <>
                        <Zap className="w-3 h-3" />
                        Exam Mode
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-3 h-3" />
                        Practice Mode
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Timer (if applicable) */}
            {hasTimeLimit && timeRemaining !== null && (
              <div
                className={cn(
                  "hidden md:flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold",
                  timeRemaining < 300
                    ? "bg-red-100 text-red-700 animate-pulse"
                    : timeRemaining < 600
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                <Clock className="w-5 h-5" />
                {formatTime(timeRemaining)}
              </div>
            )}

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {sessionData.pause_info?.can_pause_now && (
                <button
                  onClick={handlePause}
                  disabled={isPausing}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {isPausing ? (
                    <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                  <span className="hidden lg:inline">Pause</span>
                </button>
              )}
              <button
                onClick={handleSubmitClick}
                disabled={isSubmitting || isWaitingForAutoSubmit}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors shadow-sm"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-gray-100 -mx-4 sm:-mx-6 lg:-mx-8">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Mobile Timer */}
        {hasTimeLimit && timeRemaining !== null && (
          <div className="md:hidden border-t border-gray-100 px-4 py-2">
            <div
              className={cn(
                "flex items-center justify-center gap-2 py-1.5 rounded-lg font-mono font-bold",
                timeRemaining < 300
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              )}
            >
              <Clock className="w-4 h-4" />
              {formatTime(timeRemaining)}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Question Card */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Question Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        Question
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        {currentQ?.question_number}
                      </span>
                      <span className="text-sm text-gray-400">
                        of {sessionData.progress?.total_questions}
                      </span>
                    </div>
                    {currentQ?.question_type && (
                      <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600 capitalize">
                        {currentQ.question_type.replace("_", " ")}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleFlagToggle}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all",
                      currentQ?.is_flagged
                        ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                    )}
                  >
                    <Flag
                      className="w-4 h-4"
                      fill={currentQ?.is_flagged ? "currentColor" : "none"}
                    />
                    {currentQ?.is_flagged ? "Flagged" : "Flag"}
                  </button>
                </div>
              </div>

              {/* Question Content */}
              <div className="p-6">
                {/* Question Text */}
                <div className="mb-8">
                  <p className="text-lg text-gray-800 leading-relaxed font-medium">
                    {currentQ?.question_text}
                  </p>
                  {currentQ?.image_url && (
                    <img
                      src={currentQ.image_url}
                      alt="Question"
                      className="mt-4 rounded-xl border border-gray-200 max-w-full"
                    />
                  )}
                </div>

                {/* Answer Options */}
                <div className="mb-8">{renderQuestionOptions()}</div>
              </div>

              {/* Navigation Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleNavigate("prev")}
                    disabled={currentQuestionIndex === 0 || isSaving}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>

                  {/* Question Dots - Mobile */}
                  <div className="flex items-center gap-1 lg:hidden">
                    {sessionData.questions
                      .slice(
                        Math.max(0, currentQuestionIndex - 2),
                        Math.min(
                          sessionData.questions.length,
                          currentQuestionIndex + 3
                        )
                      )
                      .map((q, idx) => {
                        const actualIdx =
                          Math.max(0, currentQuestionIndex - 2) + idx;
                        const isCurrent = actualIdx === currentQuestionIndex;
                        return (
                          <div
                            key={q.quiz_question_id}
                            className={cn(
                              "w-2 h-2 rounded-full transition-all",
                              isCurrent
                                ? "w-4 bg-emerald-600"
                                : q.is_answered
                                ? "bg-emerald-400"
                                : "bg-gray-300"
                            )}
                          />
                        );
                      })}
                  </div>

                  {currentQuestionIndex === sessionData.questions.length - 1 ? (
                    <button
                      onClick={async () => {
                        if (
                          selectedAnswer &&
                          !isWaitingForAutoSubmit &&
                          !sessionData.pause_info?.is_paused
                        ) {
                          await handleSaveAnswer();
                        }
                      }}
                      disabled={
                        isSaving ||
                        isWaitingForAutoSubmit ||
                        sessionData.pause_info?.is_paused ||
                        !selectedAnswer ||
                        lastQuestionAnswerSaved
                      }
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Save Answer
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNavigate("next")}
                      disabled={
                        isSaving ||
                        isWaitingForAutoSubmit ||
                        sessionData.pause_info?.is_paused
                      }
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Question Navigator */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-24">
              {/* Navigator Header */}
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">
                  Question Navigator
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Click to jump to any question
                </p>
              </div>

              {/* Question Grid */}
              <div className="p-4">
                <div className="grid grid-cols-5 gap-2">
                  {sessionData.questions.map((q, idx) => {
                    const isCurrent =
                      q.quiz_question_id === currentQ?.quiz_question_id;
                    const isFlagged = q.is_flagged;
                    const isAnswered = q.is_answered;
                    const isAhead = idx > currentQuestionIndex;
                    const isDisabled = isAhead && !isAnswered && !isFlagged;

                    return (
                      <button
                        key={q.quiz_question_id}
                        onClick={() => handleNavigate(idx + 1)}
                        disabled={isDisabled}
                        className={cn(
                          "relative w-full aspect-square rounded-lg font-semibold text-sm transition-all duration-200",
                          isCurrent
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-110 z-10"
                            : isFlagged
                            ? "bg-orange-100 text-orange-700 hover:bg-orange-200 ring-2 ring-orange-300"
                            : isAnswered
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : isDisabled
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {idx + 1}
                        {isFlagged && !isCurrent && (
                          <Flag
                            className="absolute -top-1 -right-1 w-3 h-3 text-orange-600"
                            fill="currentColor"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-600" />
                    <span className="text-gray-600">Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-200" />
                    <span className="text-gray-600">Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200" />
                    <span className="text-gray-600">Unanswered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-orange-100 ring-2 ring-orange-300" />
                    <span className="text-gray-600">Flagged</span>
                  </div>
                </div>
              </div>

              {/* Progress Stats */}
              <div className="px-5 py-4 border-t border-gray-100">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-bold text-gray-900">
                      {sessionData.progress?.answered_count || 0} /{" "}
                      {sessionData.progress?.total_questions || 0}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="text-center p-2 bg-emerald-50 rounded-lg">
                      <div className="text-lg font-bold text-emerald-700">
                        {sessionData.progress?.answered_count || 0}
                      </div>
                      <div className="text-xs text-emerald-600">Done</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-700">
                        {sessionData.progress?.unanswered_count || 0}
                      </div>
                      <div className="text-xs text-gray-500">Left</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-700">
                        {sessionData.progress?.flagged_count || 0}
                      </div>
                      <div className="text-xs text-orange-600">Flagged</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => !isSubmitting && setShowSubmitModal(false)}
        title="Submit Quiz"
        size="md"
        closeOnOverlay={!isSubmitting}
      >
        <ModalBody>
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to submit?
            </h3>
            <p className="text-gray-600 mb-4">
              Once submitted, you cannot change your answers.
            </p>

            {getUnansweredCount() > 0 && (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-xl text-left">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">
                      {getUnansweredCount()} question
                      {getUnansweredCount() !== 1 ? "s" : ""} unanswered
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      You still have time to complete them before submitting.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {getUnansweredCount() === 0 && (
              <div className="w-full p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-800">
                      All questions answered!
                    </p>
                    <p className="text-sm text-emerald-700 mt-1">
                      Great job! You're ready to submit.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            onClick={() => setShowSubmitModal(false)}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 transition-colors"
          >
            Review Answers
          </button>
          <button
            onClick={handleSubmitConfirm}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Quiz
              </>
            )}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default QuizTaking;
