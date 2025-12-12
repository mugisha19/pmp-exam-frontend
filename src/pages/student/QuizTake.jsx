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
        setCurrentQuestion(sessionData.questions[0]);
        
        // Set time remaining from backend (accurate even after refresh)
        if (sessionData.timing.has_time_limit && sessionData.timing.time_remaining_seconds !== null) {
          setTimeRemaining(sessionData.timing.time_remaining_seconds);
        }
        
        // Load saved answer if exists (from backend)
        if (sessionData.questions[0].user_answer) {
          setSelectedAnswer(sessionData.questions[0].user_answer);
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

  // Heartbeat every 30 seconds
  React.useEffect(() => {
    if (!sessionToken) return;

    const heartbeat = setInterval(async () => {
      try {
        const response = await sendHeartbeat(sessionToken);
        // Sync time remaining from server to prevent drift
        if (response?.time_remaining_seconds !== undefined && response.time_remaining_seconds !== null) {
          setTimeRemaining(response.time_remaining_seconds);
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
      
      // Update session data
      const updatedQuestions = sessionData.questions.map(q => 
        q.quiz_question_id === currentQuestion.quiz_question_id 
          ? { ...q, user_answer: answer, is_answered: true }
          : q
      );
      setSessionData({ ...sessionData, questions: updatedQuestions });
    } catch (error) {
      toast.error("Failed to save answer");
    }
  };

  const handleFlagToggle = async () => {
    const newFlagStatus = !currentQuestion.is_flagged;
    
    try {
      await flagQuestion(sessionToken, currentQuestion.quiz_question_id, newFlagStatus);
      
      // Update questions array with new flag status
      const updatedQuestions = sessionData.questions.map(q => 
        q.quiz_question_id === currentQuestion.quiz_question_id 
          ? { ...q, is_flagged: newFlagStatus }
          : q
      );
      
      // Recalculate flagged count
      const newFlaggedCount = updatedQuestions.filter(q => q.is_flagged).length;
      
      // Update session data with new questions and flagged count
      setSessionData({ 
        ...sessionData, 
        questions: updatedQuestions,
        progress: {
          ...sessionData.progress,
          flagged_count: newFlaggedCount
        }
      });
      setCurrentQuestion({ ...currentQuestion, is_flagged: newFlagStatus });
    } catch (error) {
      toast.error("Failed to flag question");
    }
  };

  const handleNavigate = (questionNumber) => {
    const question = sessionData.questions[questionNumber - 1];
    setCurrentQuestion(question);
    setSelectedAnswer(question.user_answer);
  };

  const handlePause = async () => {
    if (!sessionData.pause_info.can_pause_now) {
      toast.error("Pause not available yet");
      return;
    }
    
    setIsPausing(true);
    try {
      await pauseQuiz(sessionToken);
      toast.success("Quiz paused");
      // Reload session data
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.detail?.message || "Failed to pause");
    } finally {
      setIsPausing(false);
    }
  };

  const handleResume = async () => {
    try {
      const result = await resumeQuiz(sessionToken);
      setSessionData(result.session);
      toast.success("Quiz resumed");
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
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Drag items from the right column to match with items in the left column
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Fixed Items */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 mb-3">Items</h4>
                {currentQuestion.options.left_items.map((leftItem) => {
                  const match = matchedPairs.find(p => p.left_id === leftItem.id);
                  const rightItem = match 
                    ? currentQuestion.options.right_items.find(r => r.id === match.right_id)
                    : null;
                  
                  return (
                    <div
                      key={leftItem.id}
                      className="border-2 border-gray-300 rounded-lg p-4 bg-white"
                    >
                      <div className="font-medium text-gray-900 mb-2">{leftItem.text}</div>
                      
                      {/* Drop Zone */}
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const rightId = e.dataTransfer.getData("rightId");
                          
                          // Remove any existing match for this left item
                          const newPairs = matchedPairs.filter(p => p.left_id !== leftItem.id && p.right_id !== rightId);
                          // Add new match
                          newPairs.push({ left_id: leftItem.id, right_id: rightId });
                          
                          handleAnswerChange({ pairs: newPairs });
                        }}
                        className={`min-h-[60px] border-2 border-dashed rounded p-3 transition-colors ${
                          rightItem
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                      >
                        {rightItem ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{rightItem.text}</span>
                            <button
                              onClick={() => {
                                const newPairs = matchedPairs.filter(p => p.left_id !== leftItem.id);
                                handleAnswerChange({ pairs: newPairs });
                              }}
                              className="text-red-500 hover:text-red-700"
                              title="Remove match"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Drop here to match</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Right Column - Draggable Items */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 mb-3">Match With</h4>
                {currentQuestion.options.right_items.map((rightItem) => {
                  const isMatched = matchedRightIds.has(rightItem.id);
                  
                  return (
                    <div
                      key={rightItem.id}
                      draggable={!isMatched}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("rightId", rightItem.id);
                      }}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        isMatched
                          ? "border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed"
                          : "border-blue-300 bg-blue-50 cursor-move hover:border-blue-500 hover:shadow-md"
                      }`}
                    >
                      <div className="text-sm text-gray-700">{rightItem.text}</div>
                      {isMatched && (
                        <div className="text-xs text-gray-500 mt-1">✓ Matched</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <div className="text-sm text-gray-600">
                Matched: {matchedPairs.length} / {currentQuestion.options.left_items.length}
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
          <p className="text-gray-600 mb-4">
            {sessionData.pause_info.pause_remaining_seconds
              ? `Resume in ${formatTime(sessionData.pause_info.pause_remaining_seconds)}`
              : "Resume whenever you're ready"}
          </p>
          <button
            onClick={handleResume}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
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
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400"
              >
                <Pause className="w-5 h-5" />
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
