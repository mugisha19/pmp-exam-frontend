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
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Send,
  AlertCircle,
  CheckCircle,
  XCircle,
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
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui";
import { cn } from "@/utils/cn";

export const QuizTaking = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
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
        toast.info("This quiz has already been submitted");
        navigate(`/exams/${quizId}`);
        return;
      }

      // Handle auto-submitted from backend
      if (state.status === "auto_submitted" && state.result) {
        toast.error("Time's up! Quiz was auto-submitted.");
        navigate(`/exams/${quizId}`);
        return;
      }

      setSessionData(state);
      
      // Set current question from backend's current_question_number
      const currentQNum = state.progress?.current_question_number || 1;
      const qIndex = currentQNum - 1;
      setCurrentQuestionIndex(qIndex);
      
      // Load current question's answer
      const currentQ = state.questions?.[qIndex];
      if (currentQ) {
        setSelectedAnswer(currentQ.user_answer || null);
      }

      // Update timing from backend (authoritative source)
      if (state.timing) {
        setTimeRemaining(state.timing.time_remaining_seconds);
        setExamTimeElapsed(state.timing.time_elapsed_seconds || 0);
        setPauseTimeElapsed(state.timing.pause_time_seconds || 0);
      }

      // Update pause info
      if (state.pause_info?.is_paused) {
        setPauseTimeRemaining(state.pause_info.pause_remaining_seconds);
      } else {
        setPauseTimeRemaining(null);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
      toast.error("Failed to load quiz session");
      navigate(`/exams/${quizId}`);
    } finally {
      setLoading(false);
    }
  }, [sessionToken, quizId, navigate]);

  // Initial load
  useEffect(() => {
    loadSessionState();
  }, [loadSessionState]);

  // Exam timer countdown (only for exam mode with time limit)
  useEffect(() => {
    if (!sessionData || !sessionData.timing?.has_time_limit) return;
    if (sessionData.pause_info?.is_paused) return; // Don't countdown when paused
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionData, timeRemaining]);

  // Pause countdown timer (exam mode only)
  useEffect(() => {
    if (!sessionData?.pause_info?.is_paused) {
      setPauseTimeRemaining(null);
      return;
    }

    // Practice mode: no countdown
    if (sessionData.quiz_mode === "practice") return;

    // Exam mode: countdown if pause has duration
    if (pauseTimeRemaining === null || pauseTimeRemaining <= 0) return;

    const timer = setInterval(() => {
      setPauseTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          // Backend will auto-resume, reload state
          loadSessionState();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionData?.pause_info?.is_paused, pauseTimeRemaining, loadSessionState]);

  // Heartbeat every 30 seconds
  useEffect(() => {
    if (!sessionToken || !sessionData) return;

    const heartbeat = setInterval(async () => {
      try {
        const response = await sendHeartbeat(sessionToken);
        
        // Update timing from heartbeat response
        if (response.time_remaining_seconds !== undefined) {
          setTimeRemaining(response.time_remaining_seconds);
        }
        if (response.exam_time_seconds !== undefined) {
          setExamTimeElapsed(response.exam_time_seconds);
        }
        if (response.pause_time_seconds !== undefined) {
          setPauseTimeElapsed(response.pause_time_seconds);
        }
        
        // Check for auto-resume
        if (response.auto_resumed) {
          loadSessionState();
        }
        
        // Check for auto-submit
        if (response.status === "auto_submitted") {
          toast.error("Time's up! Quiz was auto-submitted.");
          navigate(`/exams/${quizId}`);
        }
      } catch (error) {
        console.error("Heartbeat failed:", error);
      }
    }, 30000);

    return () => clearInterval(heartbeat);
  }, [sessionToken, sessionData, quizId, navigate, loadSessionState]);

  const handleAutoSubmit = async () => {
    try {
      await submitQuiz(sessionToken);
      sessionStorage.removeItem("quiz_session_token");
      sessionStorage.removeItem("quiz_session_data");
      toast.error("Time's up! Quiz auto-submitted.");
      navigate(`/exams/${quizId}`);
    } catch (error) {
      console.error("Auto-submit failed:", error);
      navigate(`/exams/${quizId}`);
    }
  };

  const handleAnswerChange = (answer) => {
    // Only update local state, don't save to backend yet
    setSelectedAnswer(answer);
  };

  const handleSaveAnswer = async () => {
    if (!sessionData || sessionData.pause_info?.is_paused) {
      toast.error("Cannot save answers while quiz is paused");
      return;
    }

    if (!selectedAnswer) {
      // Allow navigating without an answer (skipping)
      return;
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

      // Reload session state to get updated progress
      await loadSessionState();

      // Handle auto-pause response (exam mode)
      if (response.auto_paused) {
        toast.info(response.pause_message || "Auto-pause triggered");
        await loadSessionState();
      }
    } catch (error) {
      console.error("Failed to save answer:", error);
      toast.error("Failed to save answer");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFlagToggle = async () => {
    if (!sessionData || sessionData.pause_info?.is_paused) {
      toast.error("Cannot flag questions while quiz is paused");
      return;
    }

    const currentQ = sessionData.questions[currentQuestionIndex];
    const newFlagStatus = !currentQ.is_flagged;

    try {
      await flagQuestion(sessionToken, currentQ.quiz_question_id, newFlagStatus);
      await loadSessionState();
    } catch (error) {
      console.error("Failed to flag question:", error);
      toast.error("Failed to flag question");
    }
  };

  const handleNavigate = async (direction) => {
    if (!sessionData || sessionData.pause_info?.is_paused) {
      toast.error("Cannot navigate while quiz is paused");
      return;
    }

    // Save current answer before navigating (if there's an answer)
    if (selectedAnswer) {
      await handleSaveAnswer();
    }

    let newIndex;
    if (direction === "prev") {
      newIndex = Math.max(0, currentQuestionIndex - 1);
    } else if (direction === "next") {
      newIndex = Math.min(sessionData.questions.length - 1, currentQuestionIndex + 1);
    } else if (typeof direction === "number") {
      newIndex = direction - 1; // Convert 1-indexed to 0-indexed
      // Don't navigate if clicking on current question
      if (newIndex === currentQuestionIndex) {
        return;
      }
    } else {
      return;
    }

    try {
      await navigateToQuestion(sessionToken, newIndex + 1);
      // Reload session state to get latest data
      await loadSessionState();
      setCurrentQuestionIndex(newIndex);
      const newQ = sessionData.questions[newIndex];
      setSelectedAnswer(newQ?.user_answer || null);
    } catch (error) {
      console.error("Failed to navigate:", error);
      // Fallback to local navigation
      setCurrentQuestionIndex(newIndex);
      const newQ = sessionData.questions[newIndex];
      setSelectedAnswer(newQ?.user_answer || null);
    }
  };

  const handlePause = async () => {
    if (!sessionData.pause_info.can_pause_now) {
      if (sessionData.quiz_mode === "exam") {
        const nextPauseAt = sessionData.pause_info.next_pause_at_question;
        toast.error(
          `Pause is only available after answering ${sessionData.pause_info.pause_after_questions} questions. ` +
          `Answer ${nextPauseAt - (currentQuestionIndex + 1)} more question(s) to pause.`
        );
      } else {
        toast.error("Pause not available at this time");
      }
      return;
    }

    setIsPausing(true);
    try {
      const response = await pauseQuiz(sessionToken);
      toast.success("Quiz paused");
      await loadSessionState();
    } catch (error) {
      console.error("Failed to pause:", error);
      toast.error(error.response?.data?.detail || "Failed to pause quiz");
    } finally {
      setIsPausing(false);
    }
  };

  const handleResume = async () => {
    setIsResuming(true);
    try {
      await resumeQuiz(sessionToken);
      toast.success("Quiz resumed");
      await loadSessionState();
    } catch (error) {
      console.error("Failed to resume:", error);
      toast.error("Failed to resume quiz");
    } finally {
      setIsResuming(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirm("Are you sure you want to submit the quiz? You cannot change your answers after submission.")) {
      return;
    }

    setIsSubmitting(true);
    try {
      await submitQuiz(sessionToken);
      sessionStorage.removeItem("quiz_session_token");
      sessionStorage.removeItem("quiz_session_data");
      toast.success("Quiz submitted successfully!");
      navigate(`/exams/${quizId}`);
    } catch (error) {
      console.error("Failed to submit:", error);
      toast.error("Failed to submit quiz");
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
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const renderQuestionOptions = () => {
    const currentQ = sessionData.questions[currentQuestionIndex];
    if (!currentQ) return null;

    switch (currentQ.question_type) {
      case "multiple_choice":
        return (
          <div className="space-y-3">
            {currentQ.options.map((option) => (
              <label
                key={option.id}
                  className={cn(
                  "flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all",
                  selectedAnswer?.selected_option_id === option.id
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <input
                  type="radio"
                  name="answer"
                  checked={selectedAnswer?.selected_option_id === option.id}
                  onChange={() => handleAnswerChange({ selected_option_id: option.id })}
                  className="w-4 h-4 text-blue-600"
                  disabled={sessionData.pause_info?.is_paused || isSaving}
                />
                <span className="ml-3 text-gray-900 font-medium">{option.text}</span>
              </label>
            ))}
          </div>
        );

      case "multiple_response":
        const selectedIds = selectedAnswer?.selected_option_ids || [];
        return (
          <div className="space-y-3">
            {currentQ.options.map((option) => (
              <label
                key={option.id}
                  className={cn(
                  "flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all",
                  selectedIds.includes(option.id)
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(option.id)}
                  onChange={(e) => {
                    const newIds = e.target.checked
                      ? [...selectedIds, option.id]
                      : selectedIds.filter((id) => id !== option.id);
                    handleAnswerChange({ selected_option_ids: newIds });
                  }}
                  className="w-4 h-4 text-blue-600 rounded"
                  disabled={sessionData.pause_info?.is_paused || isSaving}
                />
                <span className="ml-3 text-gray-900 font-medium">{option.text}</span>
              </label>
            ))}
          </div>
        );

      case "true_false":
        return (
          <div className="space-y-3">
            {["true", "false"].map((value) => (
              <label
                key={value}
                  className={cn(
                  "flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all",
                  selectedAnswer?.selected_option_id === value
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <input
                  type="radio"
                  name="answer"
                  checked={selectedAnswer?.selected_option_id === value}
                  onChange={() => handleAnswerChange({ selected_option_id: value })}
                  className="w-4 h-4 text-blue-600"
                  disabled={sessionData.pause_info?.is_paused || isSaving}
                />
                <span className="ml-3 text-gray-900 font-medium capitalize">{value}</span>
              </label>
            ))}
          </div>
        );

      case "matching":
        const matchedPairs = selectedAnswer?.pairs || [];
        const matchedRightIds = new Set(matchedPairs.map((p) => p.right_id));

        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">
                  Drag items from the right and drop them next to their matching pair on the left
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">
                  Items to Match ({matchedPairs.length} / {currentQ.options.left_items.length})
                </h4>
                {currentQ.options.left_items.map((leftItem, index) => {
                  const match = matchedPairs.find((p) => p.left_id === leftItem.id);
                  const rightItem = match
                    ? currentQ.options.right_items.find((r) => r.id === match.right_id)
                    : null;

                  return (
                    <div
                      key={leftItem.id}
                      className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </span>
                        <p className="font-medium text-gray-900 pt-1">{leftItem.text}</p>
                      </div>

                      <div
                        onDragOver={(e) => {
                          if (sessionData.pause_info?.is_paused || isSaving) return;
                          e.preventDefault();
                          e.currentTarget.classList.add("border-blue-400", "bg-blue-100");
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove("border-blue-400", "bg-blue-100");
                        }}
                        onDrop={(e) => {
                          if (sessionData.pause_info?.is_paused || isSaving) return;
                          e.preventDefault();
                          e.currentTarget.classList.remove("border-blue-400", "bg-blue-100");
                          const rightId = e.dataTransfer.getData("rightId");
                          const newPairs = matchedPairs.filter(
                            (p) => p.left_id !== leftItem.id && p.right_id !== rightId
                          );
                          newPairs.push({ left_id: leftItem.id, right_id: rightId });
                          handleAnswerChange({ pairs: newPairs });
                        }}
                        className={cn(
                          "min-h-[80px] border-2 border-dashed rounded-lg p-4 transition-all",
                          rightItem
                            ? "border-green-400 bg-green-50"
                            : "border-gray-300 bg-gray-50"
                        )}
                      >
                        {rightItem ? (
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2 flex-1">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">{rightItem.text}</span>
                            </div>
                            <button
                              onClick={() => {
                                const newPairs = matchedPairs.filter((p) => p.left_id !== leftItem.id);
                                handleAnswerChange({ pairs: newPairs });
                              }}
                              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400 py-2">
                            <span className="text-xs font-medium">Drop answer here</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">Drag to Match</h4>
                <div className="space-y-3">
                  {currentQ.options.right_items.map((rightItem) => {
                    const isMatched = matchedRightIds.has(rightItem.id);

                    return (
                      <div
                        key={rightItem.id}
                        draggable={!isMatched && !sessionData.pause_info?.is_paused && !isSaving}
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
                            ? "border-green-300 bg-green-50 opacity-60"
                            : "border-purple-300 bg-purple-50 cursor-grab hover:border-purple-400 hover:shadow-lg"
                        )}
                      >
                        <p className="text-sm text-gray-700">{rightItem.text}</p>
                        {isMatched && (
                          <div className="flex items-center gap-1 mt-2 text-green-700">
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

      default:
        return <p className="text-gray-500">Unknown question type</p>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to load quiz session.</p>
          <button
            onClick={() => navigate(`/exams/${quizId}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Paused state
  if (sessionData.pause_info?.is_paused) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border border-gray-200">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Pause className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Paused</h2>
          <p className="text-gray-600 mb-6">
            {sessionData.quiz_mode === "practice"
              ? "Take your time. Resume whenever you're ready."
              : "Your break time is being tracked separately from exam time."}
          </p>

          {pauseTimeRemaining !== null && pauseTimeRemaining > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">Auto-resume in:</p>
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3 rounded-xl text-2xl font-mono font-bold",
                  pauseTimeRemaining < 60 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                )}
              >
                <Clock className="w-6 h-6" />
                {formatTime(pauseTimeRemaining)}
              </div>
            </div>
          )}

          <button
            onClick={handleResume}
            disabled={isResuming}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isResuming ? <Spinner size="sm" /> : <Play className="w-5 h-5" />}
            Resume Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQ = sessionData.questions[currentQuestionIndex];
  const isExamMode = sessionData.quiz_mode === "exam";
  const hasTimeLimit = sessionData.timing?.has_time_limit;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{sessionData.quiz_title}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold",
                    isExamMode ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                  )}
                >
                  {isExamMode ? "Exam Mode" : "Practice Mode"}
                </span>
                {hasTimeLimit && timeRemaining !== null && (
                  <div
                    className={cn(
                      "flex items-center gap-2 px-4 py-1.5 rounded-lg font-mono font-bold text-sm",
                      timeRemaining < 300 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                    )}
                  >
                    <Clock className="w-4 h-4" />
                    {formatTime(timeRemaining)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {sessionData.pause_info?.can_pause_now && (
                <button
                  onClick={handlePause}
                  disabled={isPausing}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
                >
                  {isPausing ? <Spinner size="sm" /> : <Pause className="w-4 h-4" />}
                  Pause
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold transition-colors"
              >
                {isSubmitting ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex gap-6 p-6">
            {/* Left: Question */}
            <div className="flex-1">
              {/* Question Header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-500">Question</span>
                  <span className="text-2xl font-bold text-gray-900">{currentQ?.question_number}</span>
                  <span className="text-sm text-gray-400">
                    of {sessionData.progress?.total_questions}
                  </span>
                </div>
                <button
                  onClick={handleFlagToggle}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    currentQ?.is_flagged
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                  )}
                  title={currentQ?.is_flagged ? "Unflag question" : "Flag for review"}
                >
                  <Flag className="w-5 h-5" fill={currentQ?.is_flagged ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Question Text */}
              <div className="mb-6">
                <p className="text-lg text-gray-800 leading-relaxed">{currentQ?.question_text}</p>
                {currentQ?.image_url && (
                  <img
                    src={currentQ.image_url}
                    alt="Question"
                    className="mt-4 rounded-lg border border-gray-200 max-w-full"
                  />
                )}
              </div>

              {/* Options */}
              <div className="mb-8">{renderQuestionOptions()}</div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleNavigate("prev")}
                  disabled={currentQuestionIndex === 0 || isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                {currentQuestionIndex === sessionData.questions.length - 1 ? (
                  <button
                    onClick={async () => {
                      if (selectedAnswer) {
                        await handleSaveAnswer();
                      }
                    }}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {isSaving ? (
                      <>
                        <Spinner size="sm" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Save
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavigate("next")}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {isSaving ? (
                      <>
                        <Spinner size="sm" />
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

            {/* Right: Question Navigator */}
            <div className="w-80 border-l border-gray-200 pl-6">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-1">Question Palette</h3>
                <p className="text-xs text-gray-500">Click to navigate</p>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-6">
                {sessionData.questions.map((q, idx) => {
                  // Priority: flagged > current > answered > unanswered
                  const isCurrent = q.quiz_question_id === currentQ?.quiz_question_id;
                  const isFlagged = q.is_flagged;
                  const isAnswered = q.is_answered;
                  
                  return (
                    <button
                      key={q.quiz_question_id}
                      onClick={() => handleNavigate(idx + 1)}
                      className={cn(
                        "w-12 h-12 rounded-lg font-semibold text-sm transition-all",
                        isCurrent
                          ? "bg-blue-600 text-white shadow-md scale-105"
                          : isFlagged
                          ? "bg-red-100 text-red-700 hover:bg-red-200 border-2 border-red-300"
                          : isAnswered
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Progress Stats */}
              <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-gray-700">Answered</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {sessionData.progress?.answered_count || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded"></div>
                    <span className="text-gray-700">Unanswered</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {sessionData.progress?.unanswered_count || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-gray-700">Flagged</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {sessionData.progress?.flagged_count || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;

