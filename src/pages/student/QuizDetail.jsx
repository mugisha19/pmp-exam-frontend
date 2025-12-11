import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getQuizzes } from "@/services/quiz.service";
import { Spinner } from "@/components/ui";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Trophy,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  RotateCcw,
  Target,
  Award,
  Timer,
  FileText,
  User,
} from "lucide-react";

export const QuizDetail = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

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

  const handleStartQuiz = () => {
    // TODO: Navigate to quiz engine
    navigate(`/exams/${quizId}/start`);
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            {getStatusBadge()}
          </div>
          {quiz.description && (
            <p className="text-gray-600 text-lg">{quiz.description}</p>
          )}
        </div>
      </div>

      {/* Quiz Information Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Questions</p>
              <p className="text-xl font-bold text-gray-900">{quiz.total_questions}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Time Limit</p>
              <p className="text-xl font-bold text-gray-900">
                {quiz.time_limit_minutes ? `${quiz.time_limit_minutes} min` : "No limit"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Passing Score</p>
              <p className="text-xl font-bold text-gray-900">{quiz.passing_score}%</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Quiz Mode</p>
              <p className="text-xl font-bold text-gray-900 capitalize">{quiz.quiz_mode}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <RotateCcw className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Max Attempts</p>
              <p className="text-xl font-bold text-gray-900">
                {quiz.max_attempts || "Unlimited"}
              </p>
            </div>
          </div>

          {quiz.scheduling_enabled && quiz.starts_at && quiz.ends_at && (
            <div className="flex items-start gap-3 p-4 bg-pink-50 rounded-lg">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Calendar className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Until</p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(quiz.ends_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Your Progress Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-600">Total Attempts</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalAttempts}</p>
          </div>

          {bestScore !== null && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-gray-600" />
                <p className="text-sm text-gray-600">Best Score</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{bestScore}%</p>
            </div>
          )}

          {remainingAttempts !== null && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <RotateCcw className="w-4 h-4 text-gray-600" />
                <p className="text-sm text-gray-600">Remaining Attempts</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{remainingAttempts}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {!hasAttempted && canStartQuiz() ? (
            <button
              onClick={handleStartQuiz}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Play className="w-5 h-5" />
              Start Quiz
            </button>
          ) : hasAttempted && canRetake ? (
            <button
              onClick={handleRetakeQuiz}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Quiz
            </button>
          ) : !canStartQuiz() ? (
            <div className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-lg font-medium">
              <XCircle className="w-5 h-5" />
              Quiz Not Available
            </div>
          ) : (
            <div className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-lg font-medium">
              <XCircle className="w-5 h-5" />
              No Attempts Remaining
            </div>
          )}
        </div>
      </div>

      {/* Previous Attempts */}
      {attempts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Previous Attempts</h2>
          
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
        </div>
      )}
    </div>
  );
};

export default QuizDetail;
