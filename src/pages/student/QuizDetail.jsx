import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getQuizzes } from "@/services/quiz.service";
import { startQuizSession, checkNetworkStatus, abandonQuiz } from "@/services/session.service";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui";
import {
  Clock,
  Play,
  AlertCircle,
  BookOpen,
  FileText,
  Timer,
} from "lucide-react";

export const QuizDetail = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [isStarting, setIsStarting] = React.useState(false);
  const [activeQuizError, setActiveQuizError] = React.useState(null);

  // Fetch quiz details
  const { data: quizData, isLoading } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => getQuizzes({ limit: 100 }),
    enabled: !!quizId,
    select: (data) => {
      // Handle different response structures
      let quizzes = [];
      if (Array.isArray(data)) {
        quizzes = data;
      } else if (data.items && Array.isArray(data.items)) {
        quizzes = data.items;
      } else if (data.quizzes && Array.isArray(data.quizzes)) {
        quizzes = data.quizzes;
      }
      return quizzes.find((q) => q.quiz_id === quizId);
    },
  });

  // Fetch user's attempts for this quiz
  const { data: attemptsData, isLoading: loadingAttempts } = useQuery({
    queryKey: ["quiz-attempts", quizId],
    queryFn: async () => {
      // TODO: Implement actual attempts API call
      // For now, return mock data
      return {
        attempts: [],
        total: 0,
      };
    },
    enabled: !!quizId,
  });

  const handleStartQuiz = async () => {
    // TODO: Check network connectivity
    // const isOnline = await checkNetworkStatus();
    // if (!isOnline) {
    //   toast.error("No internet connection. Please check your network and try again.");
    //   return;
    // }

    setIsStarting(true);
    try {
      // Start quiz session
      const sessionData = await startQuizSession(quizId);
      
      // Store session token
      sessionStorage.setItem("quiz_session_token", sessionData.session_token);
      sessionStorage.setItem("quiz_session_data", JSON.stringify(sessionData));
      
      // Navigate to quiz taking page
      navigate(`/exams/${quizId}/take`);
    } catch (error) {
      console.error("Failed to start quiz:", error);
      
      // Handle specific errors
      if (error.response?.status === 409) {
        const detail = error.response.data?.detail;
        if (detail?.error === "active_quiz_exists") {
          setActiveQuizError(detail);
          toast.error(detail.message || "You already have an active quiz");
        } else {
          toast.error("You already have an active quiz. Please complete it first.");
        }
      } else if (error.response?.status === 403) {
        toast.error(error.response.data?.detail || "You don't have permission to take this quiz");
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.detail || "This quiz is not available");
      } else {
        toast.error("Failed to start quiz. Please try again.");
      }
    } finally {
      setIsStarting(false);
    }
  };

  const handleRetakeQuiz = () => {
    // TODO: Navigate to quiz engine
    navigate(`/exams/${quizId}/start`);
  };

  const handleViewAttempt = (attemptId) => {
    navigate(`/exams/${quizId}/attempts/${attemptId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Not Found</h2>
        <p className="text-gray-600 mb-6">The quiz you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const quiz = quizData;
  const attempts = attemptsData?.attempts || [];
  const totalAttempts = attempts.length;
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score || 0)) : null;
  const hasAttempted = totalAttempts > 0;
  const remainingAttempts = quiz.max_attempts ? quiz.max_attempts - totalAttempts : null;

  // Determine if quiz is available
  const canStartQuiz = () => {
    // Use backend's is_available flag if present
    if (typeof quiz.is_available === "boolean") {
      return quiz.is_available && quiz.status !== "cancelled" && quiz.status !== "completed";
    }

    // Fallback: check scheduling
    if (quiz.scheduling_enabled && quiz.starts_at && quiz.ends_at) {
      const now = new Date();
      const startDate = new Date(quiz.starts_at);
      const endDate = new Date(quiz.ends_at);

      return (
        quiz.status !== "cancelled" &&
        quiz.status !== "completed" &&
        now >= startDate &&
        now <= endDate
      );
    }

    // No scheduling - available if active
    return quiz.status === "active" && quiz.status !== "cancelled";
  };

  const canRetake = canStartQuiz() && (!quiz.max_attempts || remainingAttempts > 0);

  const getStatusBadge = () => {
    if (quiz.status === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
          <XCircle className="w-4 h-4" />
          Cancelled
        </span>
      );
    }

    if (quiz.status === "completed") {
      return (
        <span className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          Ended
        </span>
      );
    }

    if (quiz.scheduling_enabled && quiz.starts_at && quiz.ends_at) {
      const now = new Date();
      const startDate = new Date(quiz.starts_at);
      const endDate = new Date(quiz.ends_at);

      if (now > endDate) {
        return (
          <span className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Ended
          </span>
        );
      }

      if (now >= startDate && now <= endDate) {
        return (
          <span className="inline-flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
            <Play className="w-4 h-4" />
            Active Now
          </span>
        );
      }

      return (
        <span className="inline-flex items-center gap-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
          <Calendar className="w-4 h-4" />
          Starts {new Date(quiz.starts_at).toLocaleDateString()}
        </span>
      );
    }

    if (quiz.status === "active" || quiz.is_available) {
      return (
        <span className="inline-flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
          <Play className="w-4 h-4" />
          Available
        </span>
      );
    }

    return null;
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "attempts", label: "Attempts", icon: FileText },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{quiz.total_questions}-questions</span>
              <span>|</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {quiz.time_limit_minutes ? `${quiz.time_limit_minutes} minutes` : "No time limit"}
              </span>
              <span>|</span>
              {canStartQuiz() && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                  70% correct required to pass
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center gap-1 px-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white px-6 py-8">
        {activeTab === "overview" && (
          <div className="max-w-4xl">
            {/* Instructions Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>You can pause the test at any time and resume later.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>You can retake the test as many times as you would like.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>This practice test will not be timed, so you can take as much time as you need as well as the time remaining to the end of the course.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>You can review your answers and compare them to the correct answers after you submit the test.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>You can skip a question to come back to it at the end of the test.</span>
                </li>
              </ul>
            </div>

            {/* Active Quiz Warning */}
            {activeQuizError && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-900 mb-1">Active Quiz Detected</h3>
                    <p className="text-sm text-yellow-800 mb-3">{activeQuizError.message}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const sessionToken = sessionStorage.getItem("quiz_session_token");
                          if (sessionToken) {
                            navigate(`/exams/${activeQuizError.quiz_id}/take`);
                          } else {
                            toast.error("Session not found. Please try again.");
                            setActiveQuizError(null);
                          }
                        }}
                        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-medium"
                      >
                        Resume Quiz
                      </button>
                      <button
                        onClick={async () => {
                          const sessionToken = sessionStorage.getItem("quiz_session_token");
                          if (sessionToken) {
                            try {
                              await abandonQuiz(sessionToken);
                              sessionStorage.removeItem("quiz_session_token");
                              sessionStorage.removeItem("quiz_session_data");
                              setActiveQuizError(null);
                              toast.success("Quiz abandoned. You can start a new one.");
                            } catch (err) {
                              toast.error("Failed to abandon quiz");
                            }
                          } else {
                            setActiveQuizError(null);
                          }
                        }}
                        className="px-4 py-2 border border-yellow-600 text-yellow-700 rounded hover:bg-yellow-50 text-sm font-medium"
                      >
                        Abandon & Start New
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
              >
                Skip test
              </button>
              {canStartQuiz() ? (
                <button
                  onClick={handleStartQuiz}
                  disabled={isStarting}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded hover:bg-gray-800 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isStarting ? (
                    <>
                      <Spinner size="sm" />
                      Starting...
                    </>
                  ) : (
                    "Begin test"
                  )}
                </button>
              ) : (
                <button
                  disabled
                  className="px-6 py-2.5 bg-gray-300 text-gray-500 rounded cursor-not-allowed font-medium"
                >
                  Quiz Not Available
                </button>
              )}
            </div>

            {/* Progress Stats */}
            {totalAttempts > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Attempts</p>
                    <p className="text-2xl font-bold text-gray-900">{totalAttempts}</p>
                  </div>
                  {bestScore !== null && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Best Score</p>
                      <p className="text-2xl font-bold text-gray-900">{bestScore}%</p>
                    </div>
                  )}
                  {remainingAttempts !== null && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Remaining</p>
                      <p className="text-2xl font-bold text-gray-900">{remainingAttempts}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "attempts" && (
          <div className="max-w-4xl">
            {attempts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No attempts yet</p>
                <p className="text-sm mt-2">Start the quiz to see your attempts here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attempts.map((attempt, index) => (
                  <div
                    key={attempt.attempt_id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleViewAttempt(attempt.attempt_id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <span className="text-lg font-bold text-gray-900">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Score: {attempt.score}%
                          {attempt.passed && (
                            <span className="ml-2 text-sm text-green-600 font-semibold">
                              ✓ Passed
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(attempt.submitted_at).toLocaleDateString()} at{" "}
                          {new Date(attempt.submitted_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {attempt.time_spent_seconds && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Timer className="w-4 h-4" />
                          <span>{Math.floor(attempt.time_spent_seconds / 60)} min</span>
                        </div>
                      )}
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>


    </div>
  );
};

export default QuizDetail;
