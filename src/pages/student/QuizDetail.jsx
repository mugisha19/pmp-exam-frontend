import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getQuizzes, getQuizAttempts } from "@/services/quiz.service";
import {
  startQuizSession,
  checkNetworkStatus,
  abandonQuiz,
} from "@/services/session.service";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui";
import { QuizModeModal } from "@/components/features/quizzes/QuizModeModal";
import { Breadcrumbs } from "@/components/website/navigation/Breadcrumbs";
import {
  Clock,
  Play,
  AlertCircle,
  BookOpen,
  FileText,
  Timer,
  Trophy,
  CheckCircle,
  Award,
  BarChart3,
  Calendar,
  User,
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
          toast.error(
            "You already have an active quiz. Please complete it first."
          );
        }
      } else if (error.response?.status === 403) {
        toast.error(
          error.response.data?.detail ||
            "You don't have permission to take this quiz"
        );
      } else if (error.response?.status === 400) {
        toast.error(
          error.response.data?.detail || "This quiz is not available"
        );
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
          <p className="text-sm text-gray-500 font-medium">
            Loading quiz details...
          </p>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Quiz Not Found
        </h2>
        <p className="text-gray-600 mb-8 font-medium">
          The quiz you're looking for doesn't exist.
        </p>
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
  const bestScore =
    attempts.length > 0 ? Math.max(...attempts.map((a) => a.score || 0)) : null;
  const hasAttempted = totalAttempts > 0;
  const remainingAttempts = quiz.max_attempts
    ? quiz.max_attempts - totalAttempts
    : null;

  // Determine if quiz is available
  const canStartQuiz = () => {
    // Use backend's is_available flag if present
    if (typeof quiz.is_available === "boolean") {
      return (
        quiz.is_available &&
        quiz.status !== "cancelled" &&
        quiz.status !== "completed"
      );
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

  const canRetake =
    canStartQuiz() && (!quiz.max_attempts || remainingAttempts > 0);

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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Browse Exams", path: "/browse" },
          { label: quiz.title, path: `/exams/${quizId}` },
        ]}
      />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary/5 via-white to-secondary/5 border-2 border-gray-100 rounded-2xl p-8">
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              {getStatusBadge()}
              <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold">
                {quiz.total_questions} Questions
              </span>
              {quiz.time_limit_minutes && (
                <span className="flex items-center gap-2 px-3 py-1.5 bg-orange/10 text-orange rounded-lg text-sm font-semibold">
                  <Clock className="w-4 h-4" />
                  {quiz.time_limit_minutes} min
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {quiz.title}
            </h1>
            {quiz.description && (
              <p className="text-lg text-gray-600 leading-relaxed">
                {quiz.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b-2 border-gray-100">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-3 -mb-0.5 transition-all ${
                activeTab === "overview"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("attempts")}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-3 -mb-0.5 transition-all ${
                activeTab === "attempts"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileText className="w-5 h-5" />
              Attempts
              {totalAttempts > 0 && (
                <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-bold">
                  {totalAttempts}
                </span>
              )}
            </button>
          </div>
          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-white border-2 border-gray-100 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  Instructions
                </h2>
                <ul className="space-y-3">
                  {[
                    "You can pause the test at any time and resume later.",
                    "You can retake the test as many times as you would like.",
                    "This practice test will not be timed, so you can take as much time as you need.",
                    "You can review your answers and compare them to the correct answers after you submit the test.",
                    "You can skip a question to come back to it at the end of the test.",
                  ].map((instruction, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Active Quiz Warning */}
              {activeQuizError && (
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 border-2 border-amber-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-amber-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-amber-900 mb-2">
                        Active Quiz Detected
                      </h3>
                      <p className="text-sm text-amber-800 mb-4">
                        {activeQuizError.message}
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            const sessionToken =
                              sessionStorage.getItem("quiz_session_token");
                            if (sessionToken) {
                              navigate(
                                `/exams/${activeQuizError.quiz_id}/take`
                              );
                            } else {
                              toast.error(
                                "Session not found. Please try again."
                              );
                              setActiveQuizError(null);
                            }
                          }}
                          className="px-5 py-2.5 bg-amber-600 text-white rounded-xl hover:shadow-lg text-sm font-semibold transition-all"
                        >
                          Resume Quiz
                        </button>
                        <button
                          onClick={async () => {
                            const sessionToken =
                              sessionStorage.getItem("quiz_session_token");
                            if (sessionToken) {
                              try {
                                await abandonQuiz(sessionToken);
                                sessionStorage.removeItem("quiz_session_token");
                                sessionStorage.removeItem("quiz_session_data");
                                setActiveQuizError(null);
                                toast.success(
                                  "Quiz abandoned. You can start a new one."
                                );
                              } catch (err) {
                                toast.error("Failed to abandon quiz");
                              }
                            } else {
                              setActiveQuizError(null);
                            }
                          }}
                          className="px-5 py-2.5 border-2 border-amber-600 text-amber-700 rounded-xl hover:bg-amber-50 text-sm font-semibold transition-all"
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
                <div className="bg-gradient-to-br from-red-50 to-red-100/30 border-2 border-red-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-200 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-red-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-red-900 mb-2">
                        Maximum Attempts Reached
                      </h3>
                      <p className="text-sm text-red-800">
                        You have used all {quiz.max_attempts} attempts for this
                        quiz.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "attempts" && (
            <div>
              {loadingAttempts ? (
                <div className="flex justify-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <Spinner size="lg" />
                    <p className="text-sm text-gray-500 font-medium">
                      Loading attempts...
                    </p>
                  </div>
                </div>
              ) : attempts.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-100">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No attempts yet
                  </h3>
                  <p className="text-gray-600">
                    Start the quiz to see your attempts here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {attempts.map((attempt) => (
                    <div
                      key={attempt.attempt_id}
                      onClick={() => handleViewAttempt(attempt.attempt_id)}
                      className="flex items-center justify-between p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border-2 border-primary/20 group-hover:scale-105 transition-transform">
                          <span className="text-xl font-bold text-gray-900">
                            #{attempt.attempt_number}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-bold text-gray-900 text-lg">
                              Score:{" "}
                              {attempt.score !== null
                                ? `${attempt.score}%`
                                : "N/A"}
                            </p>
                            {attempt.passed && (
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                                ✓ Passed
                              </span>
                            )}
                            {attempt.passed === false && (
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold">
                                ✗ Failed
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {attempt.status === "completed" ? (
                              <>
                                Completed on{" "}
                                {new Date(
                                  attempt.completed_at
                                ).toLocaleDateString()}{" "}
                                at{" "}
                                {new Date(
                                  attempt.completed_at
                                ).toLocaleTimeString()}
                              </>
                            ) : (
                              <>
                                Started on{" "}
                                {new Date(
                                  attempt.started_at
                                ).toLocaleDateString()}{" "}
                                - {attempt.status}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {attempt.time_spent_seconds > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Timer className="w-5 h-5 text-gray-500" />
                            <span>
                              {Math.floor(attempt.time_spent_seconds / 60)} min
                            </span>
                          </div>
                        )}
                        {attempt.status === "completed" && (
                          <button className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-semibold transition-colors">
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

        {/* Right Column - Sticky Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* CTA Card */}
            <div className="bg-gradient-to-br from-primary via-primary to-secondary text-white rounded-2xl p-6 shadow-glow">
              <h3 className="text-lg font-bold mb-2">Ready to Start?</h3>
              <p className="text-sm text-white/90 mb-6">
                {canStartQuiz() && canRetake
                  ? "Begin your quiz attempt now and test your knowledge."
                  : !canStartQuiz()
                  ? "This quiz is not currently available."
                  : "You've reached the maximum number of attempts."}
              </p>
              {!(canStartQuiz() && !canRetake && quiz.max_attempts) && (
                <>
                  {canStartQuiz() && canRetake ? (
                    <button
                      onClick={handleStartQuiz}
                      disabled={isStarting}
                      className="w-full px-6 py-3 bg-white text-primary rounded-xl hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                      {isStarting ? (
                        <>
                          <Spinner size="sm" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          Begin Test
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full px-6 py-3 bg-white/20 text-white rounded-xl cursor-not-allowed font-semibold"
                    >
                      Not Available
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Stats Card */}
            {totalAttempts > 0 && (
              <div className="bg-white border-2 border-gray-100 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Your Progress
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">
                      Total Attempts
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {totalAttempts}
                    </span>
                  </div>
                  {bestScore !== null && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Best Score</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {bestScore}%
                      </span>
                    </div>
                  )}
                  {remainingAttempts !== null && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Remaining</span>
                      <span className="text-lg font-bold text-gray-900">
                        {remainingAttempts}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quiz Info */}
            <div className="bg-white border-2 border-gray-100 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Quiz Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">
                    {quiz.total_questions} Questions
                  </span>
                </div>
                {quiz.time_limit_minutes && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">
                      {quiz.time_limit_minutes} Minutes
                    </span>
                  </div>
                )}
                {quiz.passing_score && (
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">
                      {quiz.passing_score}% to Pass
                    </span>
                  </div>
                )}
                {quiz.max_attempts && (
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">
                      {quiz.max_attempts} Max Attempts
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selection Modal */}
      <QuizModeModal
        isOpen={showModeModal}
        onClose={() => setShowModeModal(false)}
        onSelectMode={handleModeSelected}
        quiz={quiz}
      />
    </div>
  );
};

export default QuizDetail;
