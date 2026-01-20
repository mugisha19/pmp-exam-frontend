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

import { useState, useEffect, useCallback, useRef } from "react";
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
  Loader2,
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
import { FeedbackModal } from "@/components/ui/FeedbackModal";
import { submitFeedback } from "@/services/feedback.service";
import QuestionNavigator from "./QuestionNavigator";

export const QuizTaking = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Use ref for session token to prevent re-renders from triggering navigation
  const sessionTokenRef = useRef(sessionStorage.getItem("quiz_session_token"));
  const sessionToken = sessionTokenRef.current;

  // Track if quiz has been submitted (to prevent effects from running)
  const isQuizSubmittedRef = useRef(false);
  
  // Track if this is the initial load (for auto-navigation to next unanswered)
  const isInitialLoadRef = useRef(true);
  
  // Track current question index in a ref to avoid stale closures
  const currentQuestionIndexRef = useRef(0);

  // Session state
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerModified, setIsAnswerModified] = useState(false);

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
  const [isFlagging, setIsFlagging] = useState(false);
  const [isWaitingForAutoSubmit, setIsWaitingForAutoSubmit] = useState(false);
  const [lastQuestionAnswerSaved, setLastQuestionAnswerSaved] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [submittedAttemptId, setSubmittedAttemptId] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // Load session state from backend
  const loadSessionState = useCallback(async () => {
    // Skip if quiz has been submitted (showing feedback modal)
    if (isQuizSubmittedRef.current) {
      return;
    }

    if (!sessionToken) {
      navigate(`/my-exams/${quizId}`);
      return;
    }

    try {
      const state = await getSessionState(sessionToken);

      // Handle submitted/auto-submitted sessions
      if (state.status === "submitted" || state.status === "auto_submitted") {
        isQuizSubmittedRef.current = true;
        sessionStorage.removeItem("quiz_session_token");
        sessionStorage.removeItem("quiz_session_data");

        // Try to show feedback modal if we have an attempt_id
        const attemptId = state.result?.attempt_id || state.attempt_id;
        if (attemptId) {
          if (state.status === "auto_submitted") {
            showToast.info("Time's up!", "Quiz was auto-submitted.");
          }
          setSubmittedAttemptId(attemptId);
          setShowFeedbackModal(true);
          return;
        }

        // No attempt_id, navigate to quiz detail
        if (state.status === "auto_submitted") {
          showToast.info("Time's up!", "Quiz was auto-submitted.");
        } else {
          showToast.info(
            "Already Submitted",
            "This quiz has already been submitted"
          );
        }
        navigate(`/my-exams/${quizId}`);
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

      // Only auto-navigate to next unanswered question on INITIAL load
      // This prevents the jumping behavior when user manually navigates
      if (isInitialLoadRef.current && currentQ?.is_answered) {
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
        currentQuestionIndexRef.current = qIndex;
        const updatedQ = state.questions?.[qIndex];
        setSelectedAnswer(updatedQ?.user_answer || null);
      }
      
      // Mark initial load as complete after first successful load
      const wasInitialLoad = isInitialLoadRef.current;
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      }

      setSessionData(state);
      
      // Only update currentQuestionIndex from backend on initial load
      // On subsequent refreshes, preserve the user's current position
      if (wasInitialLoad) {
        setCurrentQuestionIndex(qIndex);
        currentQuestionIndexRef.current = qIndex;
      }

      // Get the actual current question index using ref (avoids stale closure)
      const actualIndex = wasInitialLoad ? qIndex : currentQuestionIndexRef.current;
      const finalQ = state.questions?.[actualIndex];
      if (finalQ) {
        setSelectedAnswer(finalQ.user_answer || null);
      }

      const isLastQuestion = actualIndex === state.questions.length - 1;
      if (!isLastQuestion) {
        setLastQuestionAnswerSaved(false);
      } else {
        const lastQ = state.questions?.[actualIndex];
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
      navigate(`/my-exams/${quizId}`);
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
    if (isQuizSubmittedRef.current) return;

    const heartbeat = setInterval(async () => {
      // Skip heartbeat if quiz has been submitted
      if (isQuizSubmittedRef.current) {
        clearInterval(heartbeat);
        return;
      }

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
          // Mark as submitted to prevent other effects from running
          isQuizSubmittedRef.current = true;
          clearInterval(heartbeat);

          sessionStorage.removeItem("quiz_session_token");
          sessionStorage.removeItem("quiz_session_data");
          showToast.info("Time's up!", "Quiz was auto-submitted.");

          // Try to get attempt_id from the response
          if (response.attempt_id) {
            setSubmittedAttemptId(response.attempt_id);
            setShowFeedbackModal(true);
          } else {
            // Set waiting for auto-submit to trigger polling which should get the attempt_id
            setIsWaitingForAutoSubmit(true);
          }
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
    if (isQuizSubmittedRef.current) return;

    let pollCount = 0;
    const maxPolls = 30; // Maximum 60 seconds (30 * 2s)

    const pollInterval = setInterval(async () => {
      if (isQuizSubmittedRef.current) {
        clearInterval(pollInterval);
        return;
      }

      pollCount++;
      if (pollCount > maxPolls) {
        clearInterval(pollInterval);
        sessionStorage.removeItem("quiz_session_token");
        sessionStorage.removeItem("quiz_session_data");
        showToast.error("Timeout", "Quiz submission took too long. Redirecting...");
        navigate(`/my-exams/${quizId}`);
        return;
      }

      try {
        const state = await getSessionState(sessionToken);

        if (state.status === "auto_submitted" || state.status === "submitted") {
          isQuizSubmittedRef.current = true;

          sessionStorage.removeItem("quiz_session_token");
          sessionStorage.removeItem("quiz_session_data");

          // Invalidate queries
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

          showToast.info("Time's up!", "Quiz was auto-submitted.");

          // Try to get attempt_id from various places in the response
          const attemptId = state.result?.attempt_id || state.attempt_id;

          if (attemptId) {
            setSubmittedAttemptId(attemptId);
            setIsWaitingForAutoSubmit(false);
            setShowFeedbackModal(true);
            clearInterval(pollInterval);
          } else {
            // Even without attempt_id, navigate to quiz detail
            // User can provide feedback from there if needed
            clearInterval(pollInterval);
            navigate(`/my-exams/${quizId}`);
          }
          return;
        }

        if (state.status === "expired" || !state.session_id) {
          isQuizSubmittedRef.current = true;
          clearInterval(pollInterval);
          sessionStorage.removeItem("quiz_session_token");
          sessionStorage.removeItem("quiz_session_data");
          showToast.error("Session Expired", "Quiz was auto-submitted.");

          // Try to get attempt_id even from expired state
          const attemptId = state.result?.attempt_id || state.attempt_id;
          if (attemptId) {
            setSubmittedAttemptId(attemptId);
            setIsWaitingForAutoSubmit(false);
            setShowFeedbackModal(true);
          } else {
            navigate(`/my-exams/${quizId}`);
          }
          return;
        }
      } catch (error) {
        if (error.response?.status === 404 || error.response?.status === 410) {
          isQuizSubmittedRef.current = true;
          clearInterval(pollInterval);
          sessionStorage.removeItem("quiz_session_token");
          sessionStorage.removeItem("quiz_session_data");
          showToast.info("Time's up!", "Quiz was auto-submitted.");
          // For 404/410 errors, we don't have the attempt_id, so navigate
          navigate(`/my-exams/${quizId}`);
        } else {
          console.error("Failed to poll session status:", error);
        }
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [isWaitingForAutoSubmit, sessionToken, quizId, navigate, queryClient]);

  const handleAnswerChange = (answer) => {
    if (isWaitingForAutoSubmit || sessionData?.pause_info?.is_paused) {
      return;
    }
    
    // Check if this is a modification to an existing answer
    const currentQ = sessionData?.questions?.[currentQuestionIndex];
    if (currentQ?.user_answer && answer !== currentQ.user_answer) {
      setIsAnswerModified(true);
    } else if (!currentQ?.user_answer && answer) {
      // New answer (not a modification)
      setIsAnswerModified(false);
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
    
    // Store the current answer and index before any state changes
    const currentAnswer = selectedAnswer;
    const currentIndex = currentQuestionIndexRef.current;
    const isLastQuestion = currentIndex === sessionData.questions.length - 1;

    try {
      const currentQ = sessionData.questions[currentIndex];
      
      // Validate that we have a valid question before saving
      if (!currentQ || !currentQ.quiz_question_id) {
        console.error("Invalid question data:", currentQ);
        return { autoPaused: false };
      }
      
      const response = await saveAnswer(sessionToken, {
        quiz_question_id: currentQ.quiz_question_id,
        question_type: currentQ.question_type,
        answer: currentAnswer,
        time_spent_seconds: currentQ.time_spent_seconds || 0,
        is_flagged: currentQ.is_flagged || false,
      });

      if (response.auto_paused) {
        await loadSessionState();
        // Restore the answer after loading state since we're staying on the same question
        setSelectedAnswer(currentAnswer);
        return { autoPaused: true };
      }

      // Get fresh state after saving
      const updatedState = await getSessionState(sessionToken);
      setSessionData(updatedState);
      
      // Update timing from fresh state
      if (updatedState.timing) {
        setTimeRemaining(updatedState.timing.time_remaining_seconds);
        setExamTimeElapsed(updatedState.timing.time_elapsed_seconds || 0);
        setPauseTimeElapsed(updatedState.timing.pause_time_seconds || 0);
      }
      
      if (updatedState.pause_info?.is_paused) {
        setPauseTimeRemaining(updatedState.pause_info.pause_remaining_seconds);
        // Restore the answer since we're staying on the same question
        setSelectedAnswer(currentAnswer);
        return { autoPaused: true };
      }

      // Restore the selected answer from the updated state for current question
      const updatedQ = updatedState.questions?.[currentIndex];
      if (updatedQ) {
        setSelectedAnswer(updatedQ.user_answer || currentAnswer);
      }

      if (isLastQuestion) {
        setLastQuestionAnswerSaved(true);
      }

      return { autoPaused: false };
    } catch (error) {
      console.error("Failed to save answer:", error);
      console.error("Error details:", error.response?.data);
      
      if (
        error.response?.status === 400 &&
        error.response?.data?.detail?.includes("paused")
      ) {
        await loadSessionState();
        setSelectedAnswer(currentAnswer);
        return { autoPaused: true };
      }
      if (error.response?.status === 410) {
        sessionStorage.removeItem("quiz_session_token");
        sessionStorage.removeItem("quiz_session_data");
        navigate(`/my-exams/${quizId}`);
        return { autoPaused: false };
      }
      
      // Show specific error message if available
      const errorMsg = error.response?.data?.detail || "Failed to save answer";
      showToast.error("Save Failed", errorMsg);
      return { autoPaused: false };
    } finally {
      setIsSaving(false);
    }
  };

  const handleFlagToggle = async () => {
    if (isWaitingForAutoSubmit || isFlagging) {
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

    setIsFlagging(true);
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
        navigate(`/my-exams/${quizId}`);
        return;
      }
      showToast.error("Flag Failed", "Failed to flag question");
    } finally {
      setIsFlagging(false);
    }
  };

  const handleNavigate = async (direction) => {
    if (isWaitingForAutoSubmit) {
      return;
    }

    // Reset show answer when navigating
    setShowAnswer(false);

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
    
    // Auto-save when navigating away from a modified answered question (not using Next)
    const currentQ = sessionData.questions[currentQuestionIndex];
    const isNavigatingByClick = typeof direction === "number";
    const isNavigatingBack = direction === "prev";
    const shouldAutoSave = (isNavigatingByClick || isNavigatingBack) && 
                           currentQ?.is_answered && 
                           isAnswerModified && 
                           selectedAnswer;

    if (shouldAutoSave) {
      const saveResult = await handleSaveAnswer();
      setIsAnswerModified(false);
      
      if (saveResult?.autoPaused) {
        return;
      }
    }

    if (isGoingForward && selectedAnswer) {
      const saveResult = await handleSaveAnswer();
      setIsAnswerModified(false);

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
        navigate(`/my-exams/${quizId}`);
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
        currentQuestionIndexRef.current = newIndex;
        const newQ = updatedState.questions[newIndex];
        setSelectedAnswer(newQ?.user_answer || null);
        setIsAnswerModified(false);

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
      currentQuestionIndexRef.current = newIndex;
      const newQ = sessionData.questions[newIndex];
      setSelectedAnswer(newQ?.user_answer || null);
      setIsAnswerModified(false);

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
        navigate(`/my-exams/${quizId}`);
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
    // Store current answer before pause
    const currentAnswer = selectedAnswer;
    try {
      const response = await pauseQuiz(sessionToken);
      showToast.success(
        "Quiz Paused",
        "Take your time. Resume when you're ready."
      );
      await loadSessionState();
      // Restore the answer after loading state
      setSelectedAnswer(currentAnswer);
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
      const resumeResponse = await resumeQuiz(sessionToken);
      showToast.success(
        "Quiz Resumed",
        "Good luck! Continue where you left off."
      );
      
      // Use the session state returned from resume endpoint
      if (resumeResponse.session) {
        const state = resumeResponse.session;
        setSessionData(state);
        
        // Update timing
        if (state.timing) {
          setTimeRemaining(state.timing.time_remaining_seconds);
          setExamTimeElapsed(state.timing.time_elapsed_seconds || 0);
          setPauseTimeElapsed(state.timing.pause_time_seconds || 0);
        }
        
        // Clear pause state
        setPauseTimeRemaining(null);
        
        // Find the next unanswered question to navigate to
        const currentIndex = currentQuestionIndexRef.current;
        let nextIndex = currentIndex;
        
        // If current question is answered, find next unanswered
        const currentQ = state.questions?.[currentIndex];
        if (currentQ?.is_answered) {
          const nextUnansweredIndex = state.questions.findIndex(
            (q, idx) => idx > currentIndex && !q.is_answered
          );
          
          if (nextUnansweredIndex !== -1) {
            nextIndex = nextUnansweredIndex;
          } else {
            // If no unanswered questions after current, go to next question
            const nextSeqIndex = currentIndex + 1;
            if (nextSeqIndex < state.questions.length) {
              nextIndex = nextSeqIndex;
            }
          }
        }
        
        // Navigate to the next question if different from current
        if (nextIndex !== currentIndex) {
          try {
            await navigateToQuestion(sessionToken, nextIndex + 1);
          } catch (error) {
            console.error("Failed to navigate after resume:", error);
          }
          setCurrentQuestionIndex(nextIndex);
          currentQuestionIndexRef.current = nextIndex;
        }
        
        // Set the answer for the target question
        const targetQ = state.questions?.[nextIndex];
        if (targetQ) {
          setSelectedAnswer(targetQ.user_answer || null);
        }
        
        // Update last question saved status
        const isLastQuestion = nextIndex === state.questions.length - 1;
        if (!isLastQuestion) {
          setLastQuestionAnswerSaved(false);
        } else if (targetQ?.user_answer) {
          setLastQuestionAnswerSaved(true);
        } else {
          setLastQuestionAnswerSaved(false);
        }
      } else {
        // Fallback to loadSessionState if no session in response
        await loadSessionState();
      }
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

      // Clear all flags before submitting
      const flaggedQuestions = sessionData.questions.filter(q => q.is_flagged);
      for (const q of flaggedQuestions) {
        try {
          await flagQuestion(sessionToken, q.quiz_question_id, false);
        } catch (error) {
          console.error("Failed to unflag question:", error);
        }
      }

      const result = await submitQuiz(sessionToken);

      sessionStorage.removeItem("quiz_session_token");
      sessionStorage.removeItem("quiz_session_data");

      showToast.success(
        "Quiz Submitted!",
        "Your answers have been saved successfully."
      );

      if (result?.attempt_id) {
        setSubmittedAttemptId(result.attempt_id);
        setShowFeedbackModal(true);
        setIsSubmitting(false);
        return;
      }

      navigate(`/my-exams/${quizId}`);
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
        navigate(`/my-exams/${quizId}`);
        return;
      }
      showToast.error("Submit Failed", "Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (rating, comment) => {
    setIsSubmittingFeedback(true);
    try {
      await submitFeedback(submittedAttemptId, rating, comment);

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

      showToast.success("Thank you!", "Your feedback has been submitted.");
      setShowFeedbackModal(false);
      navigate(`/my-exams/${quizId}`);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      showToast.error("Feedback Failed", "Failed to submit feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleFeedbackSkip = () => {
    queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
    queryClient.invalidateQueries({ queryKey: ["quiz-attempts", quizId] });
    queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    queryClient.invalidateQueries({ queryKey: ["all-quizzes-dashboard"] });
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === "all-quiz-attempts",
    });

    setShowFeedbackModal(false);
    navigate(`/my-exams/${quizId}`);
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
              // Ensure both IDs are strings for comparison
              const isSelected =
                String(selectedAnswer?.selected_option_id) === String(option.id);
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
                      ? "border-[#6EC1E4] bg-[rgba(110,193,228,0.1)] shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg font-semibold text-sm shrink-0 transition-colors",
                      isSelected
                        ? "bg-[#6EC1E4] text-white"
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
                    <CheckCircle className="w-5 h-5 text-[#6EC1E4] shrink-0 mt-1" />
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
              // Ensure both IDs are strings for comparison
              const isSelected = selectedIds.map(id => String(id)).includes(String(option.id));
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
                      ? "border-[#6EC1E4] bg-[rgba(110,193,228,0.1)] shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg font-semibold text-sm shrink-0 transition-colors",
                      isSelected
                        ? "bg-[#6EC1E4] text-white"
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
                        ? "border-[#6EC1E4] bg-[#6EC1E4]"
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
                color: "blue",
              },
              { value: "false", label: "False", icon: XCircle, color: "red" },
            ].map(({ value, label, icon: Icon, color }) => {
              // Ensure both values are strings for comparison
              const isSelected = String(selectedAnswer?.selected_option_id) === String(value);

              return (
                <label
                  key={value}
                  className={cn(
                    "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200",
                    isDisabled
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer",
                    isSelected
                      ? color === "blue"
                        ? "border-[#6EC1E4] bg-blue-50 shadow-sm"
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
                        ? color === "blue"
                          ? "text-[#6EC1E4]"
                          : "text-red-500"
                        : "text-gray-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-lg font-semibold transition-colors",
                      isSelected
                        ? color === "blue"
                          ? "text-blue-700"
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
        // Convert all IDs to strings for consistent comparison
        const matchedRightIds = new Set(matchedPairs.map((p) => String(p.right_id)));

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
                  // Convert IDs to strings for consistent comparison
                  const match = matchedPairs.find(
                    (p) => String(p.left_id) === String(leftItem.id)
                  );
                  const rightItem = match
                    ? currentQ.options.right_items.find(
                        (r) => String(r.id) === String(match.right_id)
                      )
                    : null;

                  return (
                    <div
                      key={leftItem.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="flex-shrink-0 w-7 h-7 bg-[#6EC1E4] text-white rounded-lg flex items-center justify-center font-semibold text-sm">
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
                            "border-[#FF6B2C]",
                            "bg-orange-50"
                          );
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove(
                            "border-[#FF6B2C]",
                            "bg-orange-50"
                          );
                        }}
                        onDrop={(e) => {
                          if (isDisabled) return;
                          e.preventDefault();
                          e.currentTarget.classList.remove(
                            "border-[#FF6B2C]",
                            "bg-orange-50"
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
                            ? "border-secondary-400 bg-[rgba(110,193,228,0.1)]"
                            : "border-gray-300 bg-gray-50"
                        )}
                      >
                        {rightItem ? (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              <CheckCircle className="w-4 h-4 text-[#6EC1E4] shrink-0" />
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
                    // Convert IDs to strings for consistent comparison
                    const isMatched = matchedRightIds.has(String(rightItem.id));

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
                            ? "border-[rgba(110,193,228,0.3)] bg-[rgba(110,193,228,0.1)] opacity-60"
                            : "border-orange-200 bg-orange-50 cursor-grab hover:border-orange-300 hover:shadow-md active:cursor-grabbing"
                        )}
                      >
                        <p className="text-sm text-gray-700">
                          {rightItem.text}
                        </p>
                        {isMatched && (
                          <div className="flex items-center gap-1 mt-2 text-[#6EC1E4]">
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

  // Show feedback modal after submission - must be checked before other early returns
  if (showFeedbackModal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={handleFeedbackSkip}
          onSubmit={handleFeedbackSubmit}
          isSubmitting={isSubmittingFeedback}
        />
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[rgba(255,81,0,0.2)] border-t-[#FF5100] rounded-full animate-spin" />
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
            onClick={() => navigate(`/my-exams/${quizId}`)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF5100] text-white font-semibold rounded-lg hover:bg-[#E64800] transition-colors"
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
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[rgba(255,81,0,0.1)] to-[rgba(255,107,44,0.1)] flex items-center justify-center">
            <Coffee className="w-12 h-12 text-[#FF5100]" />
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
                    : "bg-[rgba(255,81,0,0.1)] text-[#FF5100] border-2 border-[rgba(255,81,0,0.2)]"
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
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-[rgba(110,193,228,0.1)] text-[#6EC1E4] border border-[rgba(110,193,228,0.3)]">
                <div className="w-5 h-5 border-2 border-[#6EC1E4] border-t-transparent rounded-full animate-spin" />
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
              className="w-full px-6 py-4 bg-[#FF5100] text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-[#E64800] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[rgba(255,81,0,0.2)]"
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

  // Waiting for Auto-Submit State - Show feedback modal instead
  if (isWaitingForAutoSubmit && !showFeedbackModal) {
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

          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-[rgba(110,193,228,0.1)] text-[#6EC1E4] border border-[rgba(110,193,228,0.3)] mb-6">
            <div className="w-5 h-5 border-2 border-[#6EC1E4] border-t-transparent rounded-full animate-spin" />
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
      <header className="bg-white border-b border-gray-200 sticky top-20 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Quiz Info */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/my-exams/${quizId}`)}
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
                        : "bg-[rgba(110,193,228,0.1)] text-[#6EC1E4]"
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
                className="flex items-center gap-2 px-5 py-2 bg-[#FF5100] text-white rounded-lg hover:bg-[#E64800] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors shadow-sm"
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
              className="h-full bg-[#6EC1E4] transition-all duration-500"
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
                    disabled={isFlagging}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all",
                      isFlagging && "opacity-70 cursor-wait",
                      currentQ?.is_flagged
                        ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                    )}
                  >
                    {isFlagging ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Flag
                        className="w-4 h-4"
                        fill={currentQ?.is_flagged ? "currentColor" : "none"}
                      />
                    )}
                    {isFlagging ? "Saving..." : (currentQ?.is_flagged ? "Flagged" : "Flag")}
                  </button>
                </div>
              </div>

              {/* Question Content */}
              <div className="p-6">
                {/* Question Text */}
                <div className="mb-8">
                  <div 
                    className="text-lg text-gray-800 leading-relaxed font-medium"
                    dangerouslySetInnerHTML={{ __html: currentQ?.question_text }}
                  />
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

                {/* Show Answer Button (Practice Mode Only) */}
                {!isExamMode && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowAnswer(!showAnswer)}
                      disabled={
                        sessionData.pause_info?.is_paused ||
                        isWaitingForAutoSubmit
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-[#FF5100] text-white rounded-lg hover:bg-[#3a4d5c] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      <Target className="w-4 h-4" />
                      {showAnswer ? "Hide Answer" : "Show Answer"}
                    </button>
                  </div>
                )}

                {/* Answer Display */}
                {showAnswer && !isExamMode && (
                  <div className="p-4 bg-[rgba(110,193,228,0.1)] border-2 border-[rgba(110,193,228,0.3)] rounded-xl">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#6EC1E4] shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#2A5F80] mb-2">
                          Correct Answer:
                        </h4>
                        {currentQ?.question_type === "multiple_choice" && (
                          <div>
                            <p className="text-[#2A5F80] font-medium mb-2">
                              {currentQ.options.find((opt) => opt.is_correct)
                                ?.text || "Answer not available"}
                            </p>
                            {currentQ.options.find((opt) => opt.is_correct)
                              ?.explanation && (
                              <div className="mt-3 pt-3 border-t border-[rgba(110,193,228,0.3)]">
                                <p className="text-sm text-[#5AAFD0]">
                                  <span className="font-semibold">
                                    Explanation:{" "}
                                  </span>
                                  {
                                    currentQ.options.find(
                                      (opt) => opt.is_correct
                                    )?.explanation
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        {currentQ?.question_type === "multiple_response" && (
                          <div>
                            <ul className="list-disc list-inside space-y-1 text-[#2A5F80] mb-2">
                              {currentQ.options
                                .filter((opt) => opt.is_correct)
                                .map((opt) => (
                                  <li key={opt.id} className="font-medium">
                                    {opt.text}
                                  </li>
                                ))}
                            </ul>
                            {currentQ.options
                              .filter((opt) => opt.is_correct)
                              .some((opt) => opt.explanation) && (
                              <div className="mt-3 pt-3 border-t border-[rgba(110,193,228,0.3)]">
                                <p className="text-sm font-semibold text-[#5AAFD0] mb-2">
                                  Explanations:
                                </p>
                                {currentQ.options
                                  .filter(
                                    (opt) => opt.is_correct && opt.explanation
                                  )
                                  .map((opt) => (
                                    <div
                                      key={opt.id}
                                      className="text-sm text-[#5AAFD0] mb-2"
                                    >
                                      <span className="font-semibold">
                                        {opt.text}:{" "}
                                      </span>
                                      {opt.explanation}
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}
                        {currentQ?.question_type === "true_false" && (
                          <div>
                            <p className="text-[#2A5F80] font-semibold mb-2">
                              {currentQ.options.find((opt) => opt.is_correct)
                                ?.text || "Answer not available"}
                            </p>
                            {currentQ.options.find((opt) => opt.is_correct)
                              ?.explanation && (
                              <div className="mt-3 pt-3 border-t border-[rgba(110,193,228,0.3)]">
                                <p className="text-sm text-[#5AAFD0]">
                                  <span className="font-semibold">
                                    Explanation:{" "}
                                  </span>
                                  {
                                    currentQ.options.find(
                                      (opt) => opt.is_correct
                                    )?.explanation
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        {currentQ?.question_type === "matching" && (
                          <div>
                            <div className="space-y-2 mb-2">
                              {currentQ.options.correct_matches?.map(
                                (pair, idx) => {
                                  const leftItem =
                                    currentQ.options.left_items.find(
                                      (l) => l.id === pair.left_id
                                    );
                                  const rightItem =
                                    currentQ.options.right_items.find(
                                      (r) => r.id === pair.right_id
                                    );
                                  return (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-2 text-[#2A5F80] font-medium"
                                    >
                                      <span>{leftItem?.text}</span>
                                      <span>→</span>
                                      <span>{rightItem?.text}</span>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                            {currentQ.options.correct_matches?.some(
                              (pair) => pair.explanation
                            ) && (
                              <div className="mt-3 pt-3 border-t border-[rgba(110,193,228,0.3)]">
                                <p className="text-sm font-semibold text-[#5AAFD0] mb-2">
                                  Explanations:
                                </p>
                                {currentQ.options.correct_matches
                                  .filter((pair) => pair.explanation)
                                  .map((pair, idx) => {
                                    const leftItem =
                                      currentQ.options.left_items.find(
                                        (l) => l.id === pair.left_id
                                      );
                                    const rightItem =
                                      currentQ.options.right_items.find(
                                        (r) => r.id === pair.right_id
                                      );
                                    return (
                                      <div
                                        key={idx}
                                        className="text-sm text-[#5AAFD0] mb-2"
                                      >
                                        <span className="font-semibold">
                                          {leftItem?.text} → {rightItem?.text}:{" "}
                                        </span>
                                        {pair.explanation}
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
                                ? "w-4 bg-[#6EC1E4]"
                                : q.is_answered
                                ? "bg-[#6EC1E4]"
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
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#6EC1E4] text-white rounded-lg hover:bg-[#5AAFD0] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
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
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#6EC1E4] text-white rounded-lg hover:bg-[#5AAFD0] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
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
            <QuestionNavigator
              questions={sessionData.questions}
              currentQuestion={currentQ}
              currentQuestionIndex={currentQuestionIndex}
              onNavigate={handleNavigate}
              progress={sessionData.progress}
            />
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
              <div className="w-full p-4 bg-[rgba(110,193,228,0.1)] border border-[rgba(110,193,228,0.3)] rounded-xl text-left">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#6EC1E4] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#2A5F80]">
                      All questions answered!
                    </p>
                    <p className="text-sm text-[#5AAFD0] mt-1">
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
            className="px-5 py-2.5 bg-[#6EC1E4] text-white rounded-lg hover:bg-[#5AAFD0] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors flex items-center gap-2"
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



