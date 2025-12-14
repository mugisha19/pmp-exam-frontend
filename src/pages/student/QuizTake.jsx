import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui";
import { AlertCircle, Clock, Flag, ChevronLeft, ChevronRight, Pause, Play, Send } from "lucide-react";
import { getSessionState, saveAnswer, pauseQuiz, resumeQuiz, submitQuiz, flagQuestion, navigateToQuestion, sendHeartbeat } from "@/services/session.service";
import toast from "react-hot-toast";

export const QuizTake = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [currentQuestion, setCurrentQuestion] = React.useState(null);
  const [selectedAnswer, setSelectedAnswer] = React.useState(null);
  const [timeRemaining, setTimeRemaining] = React.useState(0);
  const [pauseTimeRemaining, setPauseTimeRemaining] = React.useState(0);
  const [isPausing, setIsPausing] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const sessionToken = sessionStorage.getItem("quiz_session_token");

  React.useEffect(() => {
    // Fetch fresh session data from backend on every page load/refresh
    const loadSessionData = async () => {
      const token = sessionStorage.getItem("quiz_session_token");

      if (!token) {
        // No session found, redirect back
        navigate(`/exams/${quizId}`);
        return;
      }

      try {
        // Fetch current session state from backend (includes all answers, flags, timing from DB)
        const sessionState = await getSessionState(token);
        
        // Handle different response structures
        // Active sessions: returns state directly
        // Submitted sessions: returns {status, result}
        let sessionData;
        if (sessionState.status === "submitted" || sessionState.status === "auto_submitted") {
          // Quiz already submitted, redirect to results
          toast.info("This quiz has already been submitted");
          navigate(`/exams/${quizId}`);
          return;
        } else {
          // Active/paused session - use the state directly
          sessionData = sessionState;
        }
        
        // Validate we have questions data
        if (!sessionData.questions || sessionData.questions.length === 0) {
          throw new Error("No questions found in session");
        }
        
        setSessionData(sessionData);
        
        // Use backend's current_question_number to restore user's position
        const currentQuestionNumber = sessionData.progress?.current_question_number || 1;
        const questionIndex = currentQuestionNumber - 1;
        const restoredQuestion = sessionData.questions[questionIndex];
        
        setCurrentQuestion(restoredQuestion);
        
        // Set time remaining from backend (accurate even after refresh)
        if (sessionData.timing.has_time_limit && sessionData.timing.time_remaining_seconds !== null) {
          setTimeRemaining(sessionData.timing.time_remaining_seconds);
        }
        
        // Set pause time remaining if quiz is paused
        if (sessionData.pause_info.is_paused && sessionData.pause_info.pause_remaining_seconds) {
          setPauseTimeRemaining(sessionData.pause_info.pause_remaining_seconds);
        }
        
        // Load saved answer if exists (from backend)
        if (restoredQuestion.user_answer) {
          setSelectedAnswer(restoredQuestion.user_answer);
        }
      } catch (error) {
        console.error("Failed to load session data:", error);
        toast.error("Failed to load quiz session");
        navigate(`/exams/${quizId}`);
      } finally {
        setLoading(false);
      }
    };

    loadSessionData();
  }, [quizId, navigate]);

  // Countdown timer for exam mode
  React.useEffect(() => {
    if (!sessionData || sessionData.pause_info.is_paused || !sessionData.timing.has_time_limit) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionData]);

  // Pause countdown timer - synced with backend
  React.useEffect(() => {
    if (!sessionData || !sessionData.pause_info.is_paused) return;
    
    // If no pause time limit (unlimited pause), don't run countdown
    if (!sessionData.pause_info.pause_remaining_seconds) return;

    const pauseTimer = setInterval(() => {
      setPauseTimeRemaining(prev => {
        if (prev <= 0) {
          // Time expired, backend will auto-resume
          // Fetch fresh state instead of auto-resuming from frontend
          clearInterval(pauseTimer);
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(pauseTimer);
  }, [sessionData?.pause_info?.is_paused]);

  // Heartbeat every 30 seconds
  React.useEffect(() => {
    if (!sessionToken) return;

    const heartbeat = setInterval(async () => {
      try {
        const response = await sendHeartbeat(sessionToken);
        // Update time remaining from heartbeat response
        if (response.time_remaining_seconds !== undefined) {
          setTimeRemaining(response.time_remaining_seconds);
        }
        // Update pause time remaining if quiz is paused
        if (response.pause_info?.is_paused && response.pause_info?.pause_remaining_seconds !== undefined) {
          setPauseTimeRemaining(response.pause_info.pause_remaining_seconds);
        }
      } catch (error) {
        console.error("Heartbeat failed:", error);
      }
    }, 30000);

    return () => clearInterval(heartbeat);
  }, [sessionToken]);

  const handleAutoSubmit = async () => {
    toast.error("Time's up! Submitting quiz...");
    await handleSubmit();
  };

  const handleAnswerChange = async (answer) => {
    setSelectedAnswer(answer);
    
    try {
      await saveAnswer(sessionToken, {
        quiz_question_id: currentQuestion.quiz_question_id,
        question_type: currentQuestion.question_type,
        answer: answer,
        time_spent_seconds: currentQuestion.time_spent_seconds,
        is_flagged: currentQuestion.is_flagged
      });
      
      // Fetch fresh session state from backend to update progress counts
      const sessionState = await getSessionState(sessionToken);
      setSessionData(sessionState);
      
      // Update current question with new data
      const updatedQuestion = sessionState.questions.find(
        q => q.quiz_question_id === currentQuestion.quiz_question_id
      );
      if (updatedQuestion) {
        setCurrentQuestion(updatedQuestion);
      }
    } catch (error) {
      toast.error("Failed to save answer");
    }
  };

  const handleFlagToggle = async () => {
    const newFlagStatus = !currentQuestion.is_flagged;
    
    try {
      // Save flag to backend database
      await flagQuestion(sessionToken, currentQuestion.quiz_question_id, newFlagStatus);
      
      // Fetch fresh session state from backend to update progress counts
      const sessionState = await getSessionState(sessionToken);
      setSessionData(sessionState);
      
      // Update current question with new data
      const updatedQuestion = sessionState.questions.find(
        q => q.quiz_question_id === currentQuestion.quiz_question_id
      );
      if (updatedQuestion) {
        setCurrentQuestion(updatedQuestion);
      }
    } catch (error) {
      toast.error("Failed to flag question");
    }
  };

  const handleNavigate = async (questionNumber) => {
    try {
      // Navigate to question via backend API (updates current_question_number in DB)
      await navigateToQuestion(sessionToken, questionNumber);
      
      // Fetch fresh session state to get latest progress
      const sessionState = await getSessionState(sessionToken);
      setSessionData(sessionState);
      
      // Set the question user wants to navigate to
      const question = sessionState.questions[questionNumber - 1];
      setCurrentQuestion(question);
      setSelectedAnswer(question.user_answer);
    } catch (error) {
      // Fallback to local navigation if backend fails
      const question = sessionData.questions[questionNumber - 1];
      setCurrentQuestion(question);
      setSelectedAnswer(question.user_answer);
    }
  };

  const handlePause = async () => {
    // Check if pause is allowed
    if (!sessionData.pause_info.can_pause_now) {
      if (sessionData.quiz_mode === "exam") {
        const questionsUntilPause = sessionData.pause_info.questions_until_next_pause || 0;
        toast.error(
          `Pause is only available after every ${sessionData.pause_info.pause_after_questions} questions. ` +
          `Answer ${questionsUntilPause} more question${questionsUntilPause !== 1 ? 's' : ''} to pause.`
        );
      } else {
        toast.error("Pause not available at this time");
      }
      return;
    }
    
    setIsPausing(true);
    try {
      await pauseQuiz(sessionToken);
      toast.success("Quiz paused");
      // Reload session data to get updated pause state
      window.location.reload();
    } catch (error) {
      const errorDetail = error.response?.data?.detail;
      if (errorDetail?.error === "pause_not_allowed") {
        toast.error(errorDetail.message || "Pause not allowed at this time");
      } else {
        toast.error(error.response?.data?.detail || "Failed to pause");
      }
    } finally {
      setIsPausing(false);
    }
  };

  const handleResume = async () => {
    try {
      await resumeQuiz(sessionToken);
      toast.success("Quiz resumed");
      // Reload page to get fresh session state from backend
      window.location.reload();
    } catch (error) {
      toast.error("Failed to resume");
    }
  };

  const handleSubmit = async () => {
    if (!confirm("Are you sure you want to submit the quiz?")) return;
    
    setIsSubmitting(true);
    try {
      const result = await submitQuiz(sessionToken);
      sessionStorage.removeItem("quiz_session_token");
      sessionStorage.removeItem("quiz_session_data");
      toast.success("Quiz submitted successfully!");
      navigate(`/exams/${quizId}`);
    } catch (error) {
      toast.error("Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestionOptions = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.question_type) {
      case "multiple_choice":
        return (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label
                key={option.id}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedAnswer?.selected_option_id === option.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  checked={selectedAnswer?.selected_option_id === option.id}
                  onChange={() => handleAnswerChange({ selected_option_id: option.id })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-gray-900">{option.text}</span>
              </label>
            ))}
          </div>
        );

      case "multiple_response":
        const selectedIds = selectedAnswer?.selected_option_ids || [];
        return (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label
                key={option.id}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedIds.includes(option.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(option.id)}
                  onChange={(e) => {
                    const newIds = e.target.checked
                      ? [...selectedIds, option.id]
                      : selectedIds.filter(id => id !== option.id);
                    handleAnswerChange({ selected_option_ids: newIds });
                  }}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-3 text-gray-900">{option.text}</span>
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
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedAnswer?.selected_option_id === value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  checked={selectedAnswer?.selected_option_id === value}
                  onChange={() => handleAnswerChange({ selected_option_id: value })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-gray-900 capitalize">{value}</span>
              </label>
            ))}
          </div>
        );

      case "matching":
        const matchedPairs = selectedAnswer?.pairs || [];
        const matchedRightIds = new Set(matchedPairs.map(p => p.right_id));
        
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-sm font-medium">
                  Drag items from the right and drop them next to their matching pair on the left
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Fixed Items with Drop Zones */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 text-lg">Items to Match</h4>
                  <span className="text-sm text-gray-500">
                    {matchedPairs.length} / {currentQuestion.options.left_items.length} matched
                  </span>
                </div>
                
                {currentQuestion.options.left_items.map((leftItem, index) => {
                  const match = matchedPairs.find(p => p.left_id === leftItem.id);
                  const rightItem = match 
                    ? currentQuestion.options.right_items.find(r => r.id === match.right_id)
                    : null;
                  
                  return (
                    <div
                      key={leftItem.id}
                      className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </span>
                        <p className="font-medium text-gray-900 pt-1">{leftItem.text}</p>
                      </div>
                      
                      {/* Drop Zone */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-blue-400', 'bg-blue-100', 'scale-[1.02]');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-100', 'scale-[1.02]');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-100', 'scale-[1.02]');
                          
                          const rightId = e.dataTransfer.getData("rightId");
                          
                          // Remove any existing match for this left item and the dragged right item
                          const newPairs = matchedPairs.filter(p => p.left_id !== leftItem.id && p.right_id !== rightId);
                          // Add new match
                          newPairs.push({ left_id: leftItem.id, right_id: rightId });
                          
                          handleAnswerChange({ pairs: newPairs });
                        }}
                        className={`min-h-[80px] border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
                          rightItem
                            ? "border-green-400 bg-green-50"
                            : "border-gray-300 bg-gray-50 hover:border-blue-300"
                        }`}
                      >
                        {rightItem ? (
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2 flex-1">
                              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm text-gray-700 leading-relaxed">{rightItem.text}</span>
                            </div>
                            <button
                              onClick={() => {
                                const newPairs = matchedPairs.filter(p => p.left_id !== leftItem.id);
                                handleAnswerChange({ pairs: newPairs });
                              }}
                              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                              title="Remove match"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400 py-2">
                            <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                            </svg>
                            <span className="text-xs font-medium">Drop answer here</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Right Column - Draggable Items */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg mb-4">Drag to Match</h4>
                
                <div className="space-y-3">
                  {currentQuestion.options.right_items.map((rightItem) => {
                    const isMatched = matchedRightIds.has(rightItem.id);
                    
                    return (
                      <div
                        key={rightItem.id}
                        draggable={!isMatched}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("rightId", rightItem.id);
                          e.currentTarget.style.opacity = '0.5';
                        }}
                        onDragEnd={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        className={`relative border-2 rounded-xl p-4 transition-all ${
                          isMatched
                            ? "border-green-300 bg-green-50 opacity-60"
                            : "border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 cursor-grab active:cursor-grabbing hover:border-purple-400 hover:shadow-lg transform hover:-translate-y-1"
                        }`}
                      >
                        {!isMatched && (
                          <div className="absolute top-2 right-2">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-700 pr-8 leading-relaxed">{rightItem.text}</p>
                        
                        {isMatched && (
                          <div className="flex items-center gap-1 mt-2 text-green-700">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
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
        return <p>Unknown question type</p>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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

  if (sessionData?.pause_info.is_paused) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <Pause className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Quiz Paused</h2>
          
          {pauseTimeRemaining > 0 ? (
            <div className="mb-6">
              <p className="text-gray-600 mb-3">Auto-resume in:</p>
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-2xl font-mono font-bold ${
                pauseTimeRemaining < 60 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
              }`}>
                <Clock className="w-6 h-6" />
                {formatTime(pauseTimeRemaining)}
              </div>
            </div>
          ) : (
            <p className="text-gray-600 mb-6">
              Resume whenever you're ready
            </p>
          )}
          
          <button
            onClick={handleResume}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 mx-auto"
          >
            <Play className="w-5 h-5" />
            Resume Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{sessionData.quiz_title}</h1>
            <p className="text-sm text-gray-600">{sessionData.quiz_mode === "exam" ? "Exam Mode" : "Practice Mode"}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Only show countdown timer for exam mode with time limit */}
            {sessionData.quiz_mode === "exam" && sessionData.timing.has_time_limit && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeRemaining < 300 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
              </div>
            )}
            
            {sessionData.quiz_mode === "practice" && (
              <button
                onClick={handlePause}
                disabled={isPausing}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {isPausing ? <Spinner size="sm" /> : <Pause className="w-5 h-5" />}
                Pause
              </button>
            )}
            
            {sessionData.quiz_mode === "exam" && (
              <button
                onClick={handlePause}
                disabled={isPausing || !sessionData.pause_info.can_pause_now}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  sessionData.pause_info.can_pause_now
                    ? "bg-yellow-600 text-white hover:bg-yellow-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                } disabled:bg-gray-400`}
                title={
                  !sessionData.pause_info.can_pause_now && sessionData.pause_info.questions_until_next_pause
                    ? `Answer ${sessionData.pause_info.questions_until_next_pause} more questions to pause`
                    : "Pause quiz"
                }
              >
                {isPausing ? <Spinner size="sm" /> : <Pause className="w-5 h-5" />}
                Pause
                {!sessionData.pause_info.can_pause_now && sessionData.pause_info.questions_until_next_pause > 0 && (
                  <span className="text-xs">
                    ({sessionData.pause_info.questions_until_next_pause} more)
                  </span>
                )}
              </button>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400 flex items-center gap-2"
            >
              {isSubmitting ? <Spinner size="sm" /> : <Send className="w-5 h-5" />}
              Submit
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 flex gap-6">
        {/* Question Panel */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-6">
            {/* Question Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Question {currentQuestion?.question_number} of {sessionData.progress.total_questions}
                  </span>
                  {/* Hide question metadata (type, difficulty, topic, domain) for students during quiz */}
                </div>
              </div>
              
              <button
                onClick={handleFlagToggle}
                className={`p-2 rounded-lg transition-colors ${
                  currentQuestion?.is_flagged
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Flag className="w-5 h-5" fill={currentQuestion?.is_flagged ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <p className="text-lg text-gray-900 leading-relaxed">{currentQuestion?.question_text}</p>
              {currentQuestion?.image_url && (
                <img src={currentQuestion.image_url} alt="Question" className="mt-4 rounded-lg max-w-full" />
              )}
            </div>

            {/* Options */}
            <div className="mb-6">
              {renderQuestionOptions()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <button
                onClick={() => handleNavigate(currentQuestion.question_number - 1)}
                disabled={currentQuestion?.question_number === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
              
              <button
                onClick={() => handleNavigate(currentQuestion.question_number + 1)}
                disabled={currentQuestion?.question_number === sessionData.progress.total_questions}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <div className="w-64">
          <div className="bg-white rounded-lg shadow p-4 sticky top-24">
            <h3 className="font-semibold mb-4">Questions</h3>
            
            <div className="grid grid-cols-5 gap-2 mb-4">
              {sessionData.questions.map((q, idx) => (
                <button
                  key={q.quiz_question_id}
                  onClick={() => handleNavigate(idx + 1)}
                  className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                    q.quiz_question_id === currentQuestion?.quiz_question_id
                      ? "bg-blue-600 text-white"
                      : q.is_answered
                      ? "bg-green-100 text-green-700"
                      : q.is_flagged
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span className="text-gray-600">Answered: {sessionData.progress.answered_count}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span className="text-gray-600">Unanswered: {sessionData.progress.unanswered_count}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 rounded"></div>
                <span className="text-gray-600">Flagged: {sessionData.progress.flagged_count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTake;
