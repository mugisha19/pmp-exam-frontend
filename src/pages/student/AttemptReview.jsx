import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAttemptReview } from "@/services/quiz.service";
import { Spinner } from "@/components/ui";
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Flag,
  Timer,
  Award,
  Target,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export const AttemptReview = () => {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();

  const {
    data: reviewData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["attempt-review", quizId, attemptId],
    queryFn: () => getAttemptReview(quizId, attemptId),
    enabled: !!quizId && !!attemptId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !reviewData?.attempt_id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            {error ? "Failed to load attempt" : "No attempt data found"}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {error?.message ||
              "This attempt may not exist or you don't have access to it."}
          </p>
          <button
            onClick={() => navigate(`/exams/${quizId}`)}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ background: "#476072" }}
          >
            Back to Quiz
          </button>
        </div>
      </div>
    );
  }

  const attempt = reviewData;
  const questions = reviewData.questions || [];
  const isPassed = attempt.passed;
  const score = Math.round(attempt.score);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0m 0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(`/exams/${quizId}`)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quiz
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                {attempt.quiz_title}
              </h1>
              <p className="text-sm text-gray-600">
                Attempt #{attempt.attempt_number} Review
              </p>
            </div>

            <div
              className={`px-4 py-2 rounded-lg ${
                isPassed
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {isPassed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span
                  className={`text-2xl font-bold ${
                    isPassed ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {score}%
                </span>
              </div>
              <p
                className={`text-xs font-semibold ${
                  isPassed ? "text-green-700" : "text-red-700"
                }`}
              >
                {isPassed ? "Passed" : "Failed"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "#476072" }}
              >
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Correct Answers</p>
                <p className="text-lg font-bold text-gray-900">
                  {attempt.correct_answers || 0}/{attempt.total_questions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Timer className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Time Taken</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatTime(attempt.time_spent_seconds)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Passing Score</p>
                <p className="text-lg font-bold text-gray-900">
                  {attempt.passing_score}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Completed</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatDate(attempt.completed_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pass/Fail Message */}
        <div
          className={`mb-6 p-4 rounded-lg border ${
            isPassed
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {isPassed ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div>
              <p
                className={`font-semibold mb-1 ${
                  isPassed ? "text-green-900" : "text-red-900"
                }`}
              >
                {isPassed
                  ? "Congratulations! You passed!"
                  : "You did not pass this time"}
              </p>
              <p className="text-sm text-gray-700">
                You scored {score}% and the passing score is{" "}
                {attempt.passing_score}%.
                {!isPassed && " Keep practicing and try again!"}
              </p>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Question Review</h2>

          {questions.map((question, index) => {
            const isCorrect = question.is_correct;
            let options = question.options;
            let userAnswer = question.user_answer;
            let correctAnswer = question.correct_answer;

            if (typeof options === "string") {
              try {
                options = JSON.parse(options);
              } catch (e) {
                options = {};
              }
            }
            if (typeof userAnswer === "string") {
              try {
                userAnswer = JSON.parse(userAnswer);
              } catch (e) {}
            }
            if (typeof correctAnswer === "string") {
              try {
                correctAnswer = JSON.parse(correctAnswer);
              } catch (e) {}
            }

            return (
              <div
                key={question.question_id}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                {/* Question Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      isCorrect
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-xs font-semibold ${
                          isCorrect ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {isCorrect ? "Correct" : "Incorrect"}
                      </span>
                      {question.was_flagged && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 rounded text-yellow-700">
                          <Flag className="w-3 h-3" />
                          <span className="text-xs font-semibold">Flagged</span>
                        </div>
                      )}
                    </div>
                    <div
                      className="text-sm text-gray-900 font-medium"
                      dangerouslySetInnerHTML={{
                        __html: question.question_text,
                      }}
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2 mb-4">
                  {question.question_type === "matching" ? (
                    <div>
                      {(() => {
                        const leftItems = options.left_items || [];
                        const rightItems = options.right_items || [];
                        const userPairs = Array.isArray(userAnswer)
                          ? userAnswer
                          : [];
                        const correctPairs = Array.isArray(correctAnswer)
                          ? correctAnswer
                          : [];

                        return (
                          <>
                            {userPairs.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs font-semibold text-gray-700 mb-2">
                                  Your Matches:
                                </p>
                                {userPairs.map((pair, idx) => {
                                  const left = leftItems.find(
                                    (l) => l.id === pair.left_id
                                  );
                                  const right = rightItems.find(
                                    (r) => r.id === pair.right_id
                                  );
                                  const isCorrectPair = correctPairs.some(
                                    (cp) =>
                                      cp.left_id === pair.left_id &&
                                      cp.right_id === pair.right_id
                                  );
                                  return (
                                    <div
                                      key={idx}
                                      className={`p-3 rounded-lg border flex items-center gap-2 mb-2 ${
                                        isCorrectPair
                                          ? "bg-green-50 border-green-200"
                                          : "bg-red-50 border-red-200"
                                      }`}
                                    >
                                      {isCorrectPair ? (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <XCircle className="w-4 h-4 text-red-600" />
                                      )}
                                      <span className="text-sm text-gray-900">
                                        {left?.text || "—"}
                                      </span>
                                      <span className="text-gray-500">→</span>
                                      <span className="text-sm text-gray-900">
                                        {right?.text || "—"}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {!isCorrect && (
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-2">
                                  Correct Matches:
                                </p>
                                {correctPairs.map((pair, idx) => {
                                  const left = leftItems.find(
                                    (l) => l.id === pair.left_id
                                  );
                                  const right = rightItems.find(
                                    (r) => r.id === pair.right_id
                                  );
                                  return (
                                    <div
                                      key={idx}
                                      className="p-3 rounded-lg border border-green-200 bg-green-50 flex items-center gap-2 mb-2"
                                    >
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                      <span className="text-sm text-gray-900">
                                        {left?.text || "—"}
                                      </span>
                                      <span className="text-gray-500">→</span>
                                      <span className="text-sm text-gray-900">
                                        {right?.text || "—"}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <>
                      {Array.isArray(options) &&
                        options.map((option) => {
                          let userAnswers = [];
                          if (userAnswer) {
                            if (Array.isArray(userAnswer)) {
                              userAnswers = userAnswer;
                            } else if (typeof userAnswer === "object") {
                              userAnswers =
                                userAnswer.selected_option_ids ||
                                (userAnswer.selected_option_id
                                  ? [userAnswer.selected_option_id]
                                  : []);
                            } else {
                              userAnswers = [userAnswer];
                            }
                          }

                          let correctAnswers = [];
                          if (correctAnswer) {
                            if (Array.isArray(correctAnswer)) {
                              correctAnswers = correctAnswer;
                            } else if (typeof correctAnswer === "object") {
                              correctAnswers =
                                correctAnswer.correct_option_ids ||
                                (correctAnswer.correct_option_id
                                  ? [correctAnswer.correct_option_id]
                                  : []);
                            } else {
                              correctAnswers = [correctAnswer];
                            }
                          }

                          const isUserAnswer =
                            userAnswers.includes(option.id) ||
                            userAnswers.includes(String(option.id));
                          const isCorrectOption =
                            correctAnswers.includes(option.id) ||
                            correctAnswers.includes(String(option.id)) ||
                            option.is_correct;

                          if (!isUserAnswer && !isCorrectOption) return null;

                          let bgColor = "bg-gray-50";
                          let borderColor = "border-gray-200";
                          let icon = null;

                          if (isUserAnswer && isCorrectOption) {
                            bgColor = "bg-green-50";
                            borderColor = "border-green-200";
                            icon = (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            );
                          } else if (isUserAnswer && !isCorrectOption) {
                            bgColor = "bg-red-50";
                            borderColor = "border-red-200";
                            icon = <XCircle className="w-5 h-5 text-red-600" />;
                          } else if (!isUserAnswer && isCorrectOption) {
                            bgColor = "bg-green-50";
                            borderColor = "border-green-200";
                            icon = (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            );
                          }

                          return (
                            <div
                              key={option.id}
                              className={`p-3 rounded-lg border ${bgColor} ${borderColor}`}
                            >
                              <div className="flex items-center gap-3">
                                {icon}
                                <span className="flex-1 text-sm text-gray-900">
                                  {option.option_text || option.text}
                                </span>
                                {isUserAnswer && isCorrectOption && (
                                  <span className="text-xs font-semibold text-green-700">
                                    Your Answer
                                  </span>
                                )}
                                {isUserAnswer && !isCorrectOption && (
                                  <span className="text-xs font-semibold text-red-700">
                                    Your Answer
                                  </span>
                                )}
                                {!isUserAnswer && isCorrectOption && (
                                  <span className="text-xs font-semibold text-green-700">
                                    Correct
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </>
                  )}
                </div>

                {/* Explanation */}
                {!isCorrect && question.explanation && (
                  <div
                    className="p-3 rounded-lg border border-blue-200"
                    style={{ background: "#476072" + "10" }}
                  >
                    <p
                      className="text-xs font-semibold mb-1"
                      style={{ color: "#476072" }}
                    >
                      💡 Explanation
                    </p>
                    <div
                      className="text-sm text-gray-700"
                      dangerouslySetInnerHTML={{ __html: question.explanation }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate(`/exams/${quizId}`)}
            className="px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ background: "#476072" }}
          >
            Back to Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttemptReview;
