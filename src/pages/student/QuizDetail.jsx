/**
 * QuizDetail Page
 * Modern quiz detail page with consistent design
 */

import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getQuizzes, getQuizAttempts } from "@/services/quiz.service";
import {
  startQuizSession,
  checkNetworkStatus,
  abandonQuiz,
} from "@/services/session.service";
import toast from "react-hot-toast";
import { QuizModeModal } from "@/components/features/quizzes/QuizModeModal";
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
  ChevronRight,
  ArrowLeft,
  Target,
  Zap,
  TrendingUp,
  XCircle,
  Info,
  Shield,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/utils/cn";

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
    refetchOnMount: true,
    select: (data) => {
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
    refetchOnMount: true,
  });

  const handleStartQuiz = () => {
    setShowModeModal(true);
  };

  const handleModeSelected = async (mode) => {
    setShowModeModal(false);
    setIsStarting(true);

    try {
      const sessionData = await startQuizSession(quizId, mode);
      sessionStorage.setItem("quiz_session_token", sessionData.session_token);
      sessionStorage.setItem("quiz_session_data", JSON.stringify(sessionData));
      navigate(`/exams/${quizId}/take`);
    } catch (error) {
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
    navigate(`/exams/${quizId}/start`);
  };

  const handleViewAttempt = (attemptId) => {
    navigate(`/exams/${quizId}/attempts/${attemptId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">
            Loading quiz details...
          </p>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Quiz Not Found
            </h2>
            <p className="text-gray-600 mb-8">
              The quiz you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
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

  const canStartQuiz = () => {
    if (typeof quiz.is_available === "boolean") {
      return (
        quiz.is_available &&
        quiz.status !== "cancelled" &&
        quiz.status !== "completed"
      );
    }

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

    return quiz.status === "active" && quiz.status !== "cancelled";
  };

  const canRetake =
    canStartQuiz() && (!quiz.max_attempts || remainingAttempts > 0);

  const getStatusInfo = () => {
    if (quiz.status === "cancelled") {
      return {
        label: "Cancelled",
        color: "bg-red-100 text-red-700",
        icon: XCircle,
      };
    }

    if (quiz.status === "completed") {
      return {
        label: "Ended",
        color: "bg-gray-100 text-gray-700",
        icon: CheckCircle,
      };
    }

    if (quiz.scheduling_enabled && quiz.starts_at && quiz.ends_at) {
      const now = new Date();
      const startDate = new Date(quiz.starts_at);
      const endDate = new Date(quiz.ends_at);

      if (now > endDate) {
        return {
          label: "Ended",
          color: "bg-gray-100 text-gray-700",
          icon: CheckCircle,
        };
      }

      if (now >= startDate && now <= endDate) {
        return {
          label: "Active Now",
          color: "bg-emerald-100 text-emerald-700",
          icon: Zap,
          pulse: true,
        };
      }

      return {
        label: `Starts ${new Date(quiz.starts_at).toLocaleDateString()}`,
        color: "bg-blue-100 text-blue-700",
        icon: Calendar,
      };
    }

    if (quiz.status === "active" || quiz.is_available) {
      return {
        label: "Available",
        color: "bg-emerald-100 text-emerald-700",
        icon: Play,
      };
    }

    return null;
  };

  const statusInfo = getStatusInfo();

  const getDifficultyInfo = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return { label: "Easy", color: "bg-green-100 text-green-700" };
      case "hard":
        return { label: "Hard", color: "bg-red-100 text-red-700" };
      default:
        return { label: "Medium", color: "bg-orange-100 text-orange-700" };
    }
  };

  const difficultyInfo = getDifficultyInfo(quiz.difficulty);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to="/browse"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Browse Exams
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {quiz.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            {/* Left Content */}
            <div className="flex-1">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {statusInfo && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
                      statusInfo.color
                    )}
                  >
                    {statusInfo.pulse && (
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    )}
                    {!statusInfo.pulse && (
                      <statusInfo.icon className="w-4 h-4" />
                    )}
                    {statusInfo.label}
                  </span>
                )}
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
                    difficultyInfo.color
                  )}
                >
                  {difficultyInfo.label}
                </span>
                {quiz.is_premium && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                    <Award className="w-4 h-4" />
                    Premium
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {quiz.title}
              </h1>

              {/* Description */}
              {quiz.description && (
                <div
                  className="text-lg text-gray-600 mb-6 max-w-2xl prose prose-lg"
                  dangerouslySetInnerHTML={{ __html: quiz.description }}
                />
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-gray-500" />
                  </div>
                  <span className="text-sm font-medium">
                    {quiz.total_questions} Questions
                  </span>
                </div>
                {quiz.time_limit_minutes && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium">
                      {quiz.time_limit_minutes} Minutes
                    </span>
                  </div>
                )}
                {quiz.passing_score && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                      <Target className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium">
                      {quiz.passing_score}% to Pass
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right - CTA Card (Desktop) */}
            <div className="hidden lg:block w-80 shrink-0">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-6 text-white shadow-lg">
                <h3 className="text-lg font-bold mb-2 text-white">
                  {hasAttempted ? "Continue Learning" : "Ready to Start?"}
                </h3>
                <p className="text-sm text-white/80 mb-6">
                  {canStartQuiz() && canRetake
                    ? hasAttempted
                      ? "Take another attempt to improve your score."
                      : "Begin your quiz and test your knowledge."
                    : !canStartQuiz()
                    ? "This quiz is not currently available."
                    : "You've reached the maximum attempts."}
                </p>

                {canStartQuiz() && canRetake ? (
                  <button
                    onClick={handleStartQuiz}
                    disabled={isStarting}
                    className="w-full px-6 py-3 bg-white text-emerald-600 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    {isStarting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Start Quiz
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-white/20 text-white/60 rounded-lg cursor-not-allowed font-semibold"
                  >
                    Not Available
                  </button>
                )}

                {/* Quick Stats in CTA */}
                {hasAttempted && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Best Score</span>
                      <span className="font-bold text-white">{bestScore}%</span>
                    </div>
                    {remainingAttempts !== null && (
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-white/70">Attempts Left</span>
                        <span className="font-bold text-white">
                          {remainingAttempts}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile CTA */}
      <div className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            {hasAttempted && bestScore !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-orange-500" />
                <span className="text-gray-600">
                  Best: <strong className="text-gray-900">{bestScore}%</strong>
                </span>
              </div>
            )}
          </div>
          {canStartQuiz() && canRetake && (
            <button
              onClick={handleStartQuiz}
              disabled={isStarting}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {isStarting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {hasAttempted ? "Retake" : "Start Quiz"}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                  activeTab === "overview"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <BookOpen className="w-4 h-4" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("attempts")}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                  activeTab === "attempts"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <FileText className="w-4 h-4" />
                Attempts
                {totalAttempts > 0 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                    {totalAttempts}
                  </span>
                )}
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Active Quiz Warning */}
                {activeQuizError && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-amber-900 mb-1">
                          Active Quiz Detected
                        </h3>
                        <p className="text-sm text-amber-700 mb-4">
                          {activeQuizError.message}
                        </p>
                        <div className="flex flex-wrap gap-3">
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
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium transition-colors"
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
                                  sessionStorage.removeItem(
                                    "quiz_session_token"
                                  );
                                  sessionStorage.removeItem(
                                    "quiz_session_data"
                                  );
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
                            className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-100 text-sm font-medium transition-colors"
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
                  <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-red-900 mb-1">
                          Maximum Attempts Reached
                        </h3>
                        <p className="text-sm text-red-700">
                          You have used all {quiz.max_attempts} attempts for
                          this quiz. You can still review your previous
                          attempts.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Instructions Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Info className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Instructions
                    </h2>
                  </div>
                  <ul className="space-y-3">
                    {[
                      {
                        icon: Play,
                        text: "You can pause the test at any time and resume later.",
                      },
                      {
                        icon: RefreshCw,
                        text: "You can retake the test as many times as you would like.",
                      },
                      {
                        icon: Clock,
                        text: "This practice test will not be timed, so you can take as much time as you need.",
                      },
                      {
                        icon: CheckCircle,
                        text: "You can review your answers and compare them to the correct answers after you submit.",
                      },
                      {
                        icon: ChevronRight,
                        text: "You can skip a question to come back to it at the end of the test.",
                      },
                    ].map((instruction, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                          <instruction.icon className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <span className="text-gray-600 text-sm">
                          {instruction.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quiz Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        Progress Saved
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your progress is automatically saved. You can safely close
                      the browser and continue later.
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        Detailed Analytics
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Get detailed breakdown of your performance with
                      explanations for each question.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "attempts" && (
              <div>
                {loadingAttempts ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                      <p className="text-sm text-gray-500">
                        Loading attempts...
                      </p>
                    </div>
                  </div>
                ) : attempts.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No attempts yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start the quiz to see your attempts here
                    </p>
                    {canStartQuiz() && canRetake && (
                      <button
                        onClick={handleStartQuiz}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Start Quiz
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attempts.map((attempt, index) => {
                      const isLatest = index === 0;
                      const scoreColor =
                        attempt.score >= (quiz.passing_score || 70)
                          ? "text-green-600"
                          : attempt.score >= 50
                          ? "text-orange-600"
                          : "text-red-600";

                      return (
                        <div
                          key={attempt.attempt_id}
                          onClick={() => handleViewAttempt(attempt.attempt_id)}
                          className={cn(
                            "flex items-center gap-5 p-5 bg-white border rounded-lg cursor-pointer transition-all",
                            isLatest
                              ? "border-emerald-200 hover:border-emerald-300"
                              : "border-gray-200 hover:border-gray-300",
                            "hover:shadow-md"
                          )}
                        >
                          {/* Attempt Number */}
                          <div
                            className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0",
                              isLatest
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-100 text-gray-600"
                            )}
                          >
                            #{attempt.attempt_number}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <span
                                className={cn("text-lg font-bold", scoreColor)}
                              >
                                {attempt.score !== null
                                  ? `${attempt.score}%`
                                  : "N/A"}
                              </span>
                              {attempt.passed === true && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                  <CheckCircle className="w-3 h-3" />
                                  Passed
                                </span>
                              )}
                              {attempt.passed === false && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                                  <XCircle className="w-3 h-3" />
                                  Failed
                                </span>
                              )}
                              {isLatest && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                                  Latest
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {attempt.status === "completed" ? (
                                <>
                                  Completed on{" "}
                                  {new Date(
                                    attempt.completed_at
                                  ).toLocaleDateString()}{" "}
                                  at{" "}
                                  {new Date(
                                    attempt.completed_at
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </>
                              ) : (
                                <>
                                  Started on{" "}
                                  {new Date(
                                    attempt.started_at
                                  ).toLocaleDateString()}{" "}
                                  •{" "}
                                  <span className="capitalize text-orange-600">
                                    {attempt.status}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>

                          {/* Time & Action */}
                          <div className="flex items-center gap-4 shrink-0">
                            {attempt.time_spent_seconds > 0 && (
                              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                <Timer className="w-4 h-4" />
                                <span>
                                  {Math.floor(attempt.time_spent_seconds / 60)}{" "}
                                  min
                                </span>
                              </div>
                            )}
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - Desktop Only */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-8 space-y-6">
              {/* Progress Card */}
              {hasAttempted && (
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-semibold text-gray-900">
                      Your Progress
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Best Score
                        </span>
                        <span
                          className={cn(
                            "text-lg font-bold",
                            bestScore >= (quiz.passing_score || 70)
                              ? "text-green-600"
                              : "text-orange-600"
                          )}
                        >
                          {bestScore}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            bestScore >= (quiz.passing_score || 70)
                              ? "bg-green-500"
                              : "bg-orange-500"
                          )}
                          style={{ width: `${bestScore}%` }}
                        />
                      </div>
                      {quiz.passing_score && (
                        <p className="text-xs text-gray-500 mt-1">
                          Passing score: {quiz.passing_score}%
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Total Attempts
                        </span>
                        <span className="font-semibold text-gray-900">
                          {totalAttempts}
                        </span>
                      </div>
                      {remainingAttempts !== null && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Remaining
                          </span>
                          <span className="font-semibold text-gray-900">
                            {remainingAttempts}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz Info Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Quiz Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {quiz.total_questions} Questions
                      </p>
                      <p className="text-xs text-gray-500">Total questions</p>
                    </div>
                  </div>
                  {quiz.time_limit_minutes && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {quiz.time_limit_minutes} Minutes
                        </p>
                        <p className="text-xs text-gray-500">Time limit</p>
                      </div>
                    </div>
                  )}
                  {quiz.passing_score && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Target className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {quiz.passing_score}%
                        </p>
                        <p className="text-xs text-gray-500">Passing score</p>
                      </div>
                    </div>
                  )}
                  {quiz.max_attempts && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {quiz.max_attempts} Attempts
                        </p>
                        <p className="text-xs text-gray-500">Maximum allowed</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Help Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-700">
                    Need Help?
                  </h3>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  If you have questions about this quiz, contact your
                  instructor.
                </p>
                <Link
                  to="/help"
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  View Help Center →
                </Link>
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
