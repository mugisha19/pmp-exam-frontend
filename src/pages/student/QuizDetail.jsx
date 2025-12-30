import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getQuizzes, getQuizAttempts } from "@/services/quiz.service";
import { startQuizSession, checkNetworkStatus, abandonQuiz } from "@/services/session.service";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui";
import { QuizModeModal } from "@/components/features/quizzes/QuizModeModal";
import {
  Clock,
  Play,
  AlertCircle,
  BookOpen,
  FileText,
  Timer,
  Trophy,
} from "lucide-react";

export const QuizDetail = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [isStarting, setIsStarting] = React.useState(false);
  const [activeQuizError, setActiveQuizError] = React.useState(null);
  const [showModeModal, setShowModeModal] = React.useState(false);

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
    queryFn: () => getQuizAttempts(quizId),
    enabled: !!quizId,
  });

  const handleStartQuiz = () => {
    // Show mode selection modal
    setShowModeModal(true);
  };

  const handleModeSelected = async (mode) => {
    setShowModeModal(false);
    setIsStarting(true);
    
    try {
      // Start quiz session with selected mode
      const sessionData = await startQuizSession(quizId, mode);
      
      // Store session token
      sessionStorage.setItem("quiz_session_token", sessionData.session_token);
      sessionStorage.setItem("quiz_session_data", JSON.stringify(sessionData));
      
      // Navigate to quiz taking page
      navigate(`/exams/${quizId}/take`);
    } catch (error) {
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
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500 font-medium">Loading quiz details...</p>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
          <AlertCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Not Found</h2>
        <p className="text-gray-600 mb-8 font-medium">The quiz you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-bold rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
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
          <span className="inline-flex items-center gap-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
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
        <span className="inline-flex items-center gap-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
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
      <div className="bg-gradient-to-br from-white to-gray-50/50 border-b-2 border-gray-200 shadow-lg shadow-gray-100/50 px-8 py-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{quiz.title}</h1>
            <div className="flex items-center gap-5 text-sm font-medium text-gray-700">
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-semibold">{quiz.total_questions} questions</span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                {quiz.time_limit_minutes ? `${quiz.time_limit_minutes} minutes` : "No time limit"}
              </span>
              {canStartQuiz() && quiz.passing_score && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 rounded-lg font-semibold border border-yellow-300">
                    {quiz.passing_score}% pass required
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-gradient-to-r from-gray-50/50 to-white border-b-2 border-gray-200">
        <div className="flex items-center gap-2 px-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-3 transition-all duration-200 whitespace-nowrap rounded-t-lg ${
                  activeTab === tab.id
                    ? "border-accent-primary text-accent-primary bg-white shadow-lg shadow-accent-primary/10"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {tab.badge && (
                  <span className="ml-1 px-2.5 py-1 bg-accent-primary/20 text-accent-primary rounded-full text-xs font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white px-8 py-10">
        {activeTab === "overview" && (
          <div className="max-w-4xl">
            {/* Instructions Section */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-accent-primary" />
                </div>
                Instructions
              </h2>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border-l-4 border-accent-primary">
                  <span className="text-accent-primary font-bold mt-0.5">•</span>
                  <span className="font-medium">You can pause the test at any time and resume later.</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border-l-4 border-accent-primary">
                  <span className="text-accent-primary font-bold mt-0.5">•</span>
                  <span className="font-medium">You can retake the test as many times as you would like.</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border-l-4 border-accent-primary">
                  <span className="text-accent-primary font-bold mt-0.5">•</span>
                  <span className="font-medium">This practice test will not be timed, so you can take as much time as you need as well as the time remaining to the end of the course.</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border-l-4 border-accent-primary">
                  <span className="text-accent-primary font-bold mt-0.5">•</span>
                  <span className="font-medium">You can review your answers and compare them to the correct answers after you submit the test.</span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border-l-4 border-accent-primary">
                  <span className="text-accent-primary font-bold mt-0.5">•</span>
                  <span className="font-medium">You can skip a question to come back to it at the end of the test.</span>
                </li>
              </ul>
            </div>

            {/* Active Quiz Warning */}
            {activeQuizError && (
              <div className="mb-8 p-6 bg-gradient-to-br from-yellow-50 to-yellow-100/30 border-2 border-yellow-200 rounded-xl shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-200 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-yellow-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-yellow-900 mb-2 text-lg">Active Quiz Detected</h3>
                    <p className="text-sm text-yellow-800 mb-4 font-medium">{activeQuizError.message}</p>
                    <div className="flex gap-3">
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
                        className="px-5 py-2.5 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-xl hover:shadow-lg text-sm font-bold transition-all duration-200 hover:scale-105"
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
                        className="px-5 py-2.5 border-2 border-yellow-600 text-yellow-700 rounded-xl hover:bg-yellow-50 text-sm font-bold transition-all duration-200"
                      >
                        Abandon & Start New
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Maximum Attempts Warning */}
            {canStartQuiz() && !canRetake && quiz.max_attempts && (
              <div className="mb-8 p-6 bg-gradient-to-br from-red-50 to-red-100/30 border-2 border-red-200 rounded-xl shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-200 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-red-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-900 mb-2 text-lg">Maximum Attempts Reached</h3>
                    <p className="text-sm text-red-800 font-medium">
                      You have used all {quiz.max_attempts} attempts for this quiz. You cannot take this quiz anymore.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!(canStartQuiz() && !canRetake && quiz.max_attempts) && (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-all duration-200 hover:shadow-md"
                >
                  Skip test
                </button>
                {canStartQuiz() && canRetake ? (
                  <button
                    onClick={handleStartQuiz}
                    disabled={isStarting}
                    className="px-8 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:shadow-xl font-bold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
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
                    className="px-8 py-3 bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed font-bold"
                  >
                    Quiz Not Available
                  </button>
                )}
              </div>
            )}

            {/* Mode Selection Modal */}
            <QuizModeModal
              isOpen={showModeModal}
              onClose={() => setShowModeModal(false)}
              onSelectMode={handleModeSelected}
              quiz={quiz}
            />

            {/* Progress Stats */}
            {totalAttempts > 0 && (
              <div className="mt-10 pt-10 border-t-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-accent-primary" />
                  </div>
                  Your Progress
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Total Attempts</p>
                    <p className="text-3xl font-bold text-gray-900">{totalAttempts}</p>
                  </div>
                  {bestScore !== null && (
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl border-2 border-blue-200 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Best Score</p>
                      <p className="text-3xl font-bold text-gray-900">{bestScore}%</p>
                    </div>
                  )}
                  {remainingAttempts !== null && (
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl border-2 border-blue-200 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Remaining</p>
                      <p className="text-3xl font-bold text-gray-900">{remainingAttempts}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "attempts" && (
          <div className="max-w-4xl">
            {loadingAttempts ? (
              <div className="flex justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <Spinner size="lg" />
                  <p className="text-sm text-gray-500 font-medium">Loading attempts...</p>
                </div>
              </div>
            ) : attempts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No attempts yet</h3>
                <p className="text-sm text-gray-600 font-medium">Start the quiz to see your attempts here</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl border-2 border-blue-200 shadow-md">
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Total Attempts</p>
                      <p className="text-3xl font-bold text-blue-900">{attemptsData?.attempts_used || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Max Allowed</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {attemptsData?.max_attempts || "Unlimited"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Best Score</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {bestScore !== null ? `${bestScore}%` : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                
                {attempts.map((attempt) => (
                  <div
                    key={attempt.attempt_id}
                    className="flex items-center justify-between p-6 bg-gradient-to-br from-white to-gray-50/50 rounded-xl border-2 border-gray-100 shadow-md hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:border-accent-primary/30"
                    onClick={() => handleViewAttempt(attempt.attempt_id)}
                  >
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 rounded-xl border-2 border-accent-primary/20 shadow-sm">
                        <span className="text-xl font-bold text-gray-900">#{attempt.attempt_number}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-bold text-gray-900 text-lg">
                            Score: {attempt.score !== null ? `${attempt.score}%` : "N/A"}
                          </p>
                          {attempt.passed && (
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-lg text-xs font-bold border border-blue-300">
                              ✓ Passed
                            </span>
                          )}
                          {attempt.passed === false && (
                            <span className="px-3 py-1 bg-gradient-to-r from-red-100 to-red-200 text-red-700 rounded-lg text-xs font-bold border border-red-300">
                              ✗ Failed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          {attempt.status === "completed" ? (
                            <>
                              Completed on {new Date(attempt.completed_at).toLocaleDateString()} at{" "}
                              {new Date(attempt.completed_at).toLocaleTimeString()}
                            </>
                          ) : (
                            <>
                              Started on {new Date(attempt.started_at).toLocaleDateString()} - {attempt.status}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {attempt.time_spent_seconds > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <Timer className="w-5 h-5 text-gray-500" />
                          <span>{Math.floor(attempt.time_spent_seconds / 60)} min</span>
                        </div>
                      )}
                      {attempt.status === "completed" && (
                        <button className="px-5 py-2.5 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl hover:shadow-lg text-sm font-bold transition-all duration-200 hover:scale-105">
                          View Details
                        </button>
                      )}
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
