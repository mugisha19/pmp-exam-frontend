import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAttemptReview } from "@/services/quiz.service";
import toast from "react-hot-toast";
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
  AlertCircle
} from "lucide-react";

export const AttemptReview = () => {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();

  // Fetch attempt review details
  const { data: reviewData, isLoading, error } = useQuery({
    queryKey: ["attempt-review", quizId, attemptId],
    queryFn: () => getAttemptReview(quizId, attemptId),
    enabled: !!quizId && !!attemptId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500 font-medium">Loading attempt review...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-inner">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">Failed to load attempt</p>
          <p className="text-gray-600 mb-8 font-medium">{error.message || "Please try again later"}</p>
          <button
            onClick={() => navigate(`/exams/${quizId}`)}
            className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-bold rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            Back to Quiz
          </button>
        </div>
      </div>
    );
  }

  if (!reviewData || !reviewData.attempt_id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow-inner">
            <AlertCircle className="w-12 h-12 text-yellow-500" />
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">No attempt data found</p>
          <p className="text-gray-600 mb-8 font-medium">This attempt may not exist or you don't have access to it.</p>
          <button
            onClick={() => navigate(`/exams/${quizId}`)}
            className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-bold rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            Back to Quiz
          </button>
        </div>
      </div>
    );
  }

  // Backend returns flat structure, not nested
  const attempt = reviewData;
  const questions = reviewData.questions || [];

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0m 0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString();
  };
  
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-gray-50/50 border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 py-1.5">
          <button
            onClick={() => navigate(`/exams/${quizId}`)}
            className="flex items-center gap-1 text-gray-600 hover:text-accent-primary mb-1.5 text-xs font-semibold transition-colors duration-200 group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Quiz
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {attempt.quiz_title}
              </h1>
              <p className="text-gray-600 font-medium text-xs">
                Attempt #{attempt.attempt_number} Review
              </p>
            </div>
            
            <div className={`px-3 py-1.5 rounded-md shadow ${
              attempt.passed 
                ? "bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-500 shadow-blue-200/50" 
                : "bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-500 shadow-red-200/50"
            }`}>
              <div className="flex items-center gap-1">
                {attempt.passed ? (
                  <CheckCircle className="w-4 h-4 text-blue-700" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-700" />
                )}
                <span className={`text-xl font-bold ${
                  attempt.passed ? "text-blue-700" : "text-red-700"
                }`}>
                  {Math.round(attempt.score)}%
                </span>
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-wide ${
                attempt.passed ? "text-green-700" : "text-red-700"
              }`}>
                {attempt.passed ? "Passed" : "Failed"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-3 py-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <div className="bg-gradient-to-br from-white to-blue-50/30 p-2 rounded-md border border-blue-100">
            <div className="flex items-center gap-1 text-gray-600 mb-1">
              <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center">
                <Target className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wide">Correct</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {attempt.correct_answers || 0} / {attempt.total_questions}
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50/30 p-2 rounded-md border border-purple-100">
            <div className="flex items-center gap-1 text-gray-600 mb-1">
              <div className="w-5 h-5 rounded bg-purple-100 flex items-center justify-center">
                <Timer className="w-3 h-3 text-purple-600" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wide">Time</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatTime(attempt.time_spent_seconds)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-blue-50/30 p-2 rounded-md border border-blue-100">
            <div className="flex items-center gap-1 text-gray-600 mb-1">
              <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center">
                <Award className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wide">Passing</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {attempt.passing_score}%
            </p>
          </div>

          {attempt.completed_at && (
            <div className="bg-gradient-to-br from-white to-gray-50/30 p-2 rounded-md border border-gray-100">
              <div className="flex items-center gap-1 text-gray-600 mb-1">
                <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center">
                  <Clock className="w-3 h-3 text-gray-600" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wide">Completed</span>
              </div>
              <p className="text-[11px] font-bold text-gray-900">
                {formatDate(attempt.completed_at)}
              </p>
              <p className="text-[9px] text-gray-600 font-medium">
                {formatDateTime(attempt.completed_at)}
              </p>
            </div>
          )}
        </div>

        {/* Questions Review */}
        <div className="space-y-2">
          {questions.map((question, index) => (
            <div
              key={question.question_id}
              className={`bg-gradient-to-br from-white to-gray-50/50 rounded-md border p-2 shadow-sm ${
                question.is_correct
                  ? "border-blue-200 shadow-blue-100/50"
                  : "border-red-200 shadow-red-100/50"
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-4 flex-1">
                  <span className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                    question.is_correct
                      ? "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border-2 border-blue-300"
                      : "bg-gradient-to-br from-red-100 to-red-200 text-red-700 border-2 border-red-300"
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      {question.is_correct ? (
                        <div className="w-4 h-4 rounded bg-blue-100 flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded bg-red-100 flex items-center justify-center">
                          <XCircle className="w-3 h-3 text-red-600" />
                        </div>
                      )}
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${
                        question.is_correct ? "text-blue-700" : "text-red-700"
                      }`}>
                        {question.is_correct ? "Correct" : "Incorrect"}
                      </span>
                      {question.was_flagged && (
                        <div className="px-1 py-0.5 bg-yellow-100 rounded border border-yellow-300 flex items-center gap-0.5">
                          <Flag className="w-2 h-2 text-yellow-600 fill-yellow-600" />
                          <span className="text-[9px] font-bold text-yellow-700">Flag</span>
                        </div>
                      )}
                    </div>
                    <div
                      className="text-gray-900 prose max-w-none font-medium text-xs leading-snug"
                      dangerouslySetInnerHTML={{ __html: question.question_text }}
                    />
                  </div>
                </div>
              </div>

              {/* Options */}

              {/* Matching type: show user matches and correct matches */}
              <div className="ml-6 space-y-1">
                {(() => {
                  // Parse options if it's a JSON string
                  let options = question.options;
                  if (typeof options === 'string') {
                    try {
                      options = JSON.parse(options);
                    } catch (e) {
                      options = {};
                    }
                  }
                  // Parse user_answer if it's a string
                  let userAnswer = question.user_answer;
                  if (typeof userAnswer === 'string') {
                    try {
                      userAnswer = JSON.parse(userAnswer);
                    } catch (e) {
                    }
                  }
                  // Parse correct_answer if it's a string
                  let correctAnswer = question.correct_answer;
                  if (typeof correctAnswer === 'string') {
                    try {
                      correctAnswer = JSON.parse(correctAnswer);
                    } catch (e) {
                    }
                  }

                  if (question.question_type === 'matching') {
                    // options: { left_items: [...], right_items: [...] }
                    const leftItems = options.left_items || [];
                    const rightItems = options.right_items || [];
                    // userAnswer: [{ left_id, right_id }]
                    // correctAnswer: [{ left_id, right_id }]
                    const userPairs = Array.isArray(userAnswer) ? userAnswer : [];
                    const correctPairs = Array.isArray(correctAnswer) ? correctAnswer : [];

                    return (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-700">Your Matches:</p>
                        {userPairs.length === 0 && <p className="text-gray-500 text-sm">No answer given.</p>}
                        {userPairs.map((pair, idx) => {
                          const left = leftItems.find(l => l.id === pair.left_id);
                          const right = rightItems.find(r => r.id === pair.right_id);
                          // Check if this pair is correct
                          const isCorrect = correctPairs.some(
                            cp => cp.left_id === pair.left_id && cp.right_id === pair.right_id
                          );
                          return (
                            <div key={idx} className={`p-2 rounded border flex items-center gap-2 ${isCorrect ? 'bg-blue-50 border-blue-300' : 'bg-red-50 border-red-300'}`}>
                              {isCorrect ? <CheckCircle className="w-4 h-4 text-blue-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                              <span className="text-gray-900 font-medium">{left?.text || '—'}</span>
                              <span className="mx-2 text-gray-500">→</span>
                              <span className="text-gray-900 font-medium">{right?.text || '—'}</span>
                              <span className={`ml-auto text-xs px-2 py-1 rounded font-semibold ${isCorrect ? 'bg-blue-200 text-blue-800' : 'bg-red-200 text-red-800'}`}>{isCorrect ? 'Correct' : 'Wrong'}</span>
                            </div>
                          );
                        })}
                        {/* Show correct matches if any were wrong */}
                        {userPairs.length > 0 && userPairs.some(pair => !correctPairs.some(cp => cp.left_id === pair.left_id && cp.right_id === pair.right_id)) && (
                          <div className="mt-2">
                            <p className="text-sm font-semibold text-blue-700">Correct Matches:</p>
                            {correctPairs.map((pair, idx) => {
                              const left = leftItems.find(l => l.id === pair.left_id);
                              const right = rightItems.find(r => r.id === pair.right_id);
                              return (
                                <div key={idx} className="p-2 rounded border border-blue-200 bg-blue-50 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-blue-600" />
                                  <span className="text-gray-900 font-medium">{left?.text || '—'}</span>
                                  <span className="mx-2 text-gray-500">→</span>
                                  <span className="text-gray-900 font-medium">{right?.text || '—'}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // ...existing code for other question types...
                  // Ensure options is an array for other types
                  if (!Array.isArray(options)) {
                    options = [];
                  }
                  // ...existing code for rendering options (as before)...
                  return options.map((option, optIndex) => {
                    // ...existing code...
                    let userAnswers = [];
                    if (userAnswer) {
                      if (Array.isArray(userAnswer)) {
                        userAnswers = userAnswer;
                      } else if (typeof userAnswer === 'object') {
                        userAnswers = userAnswer.selected_option_ids || 
                                     (userAnswer.selected_option_id ? [userAnswer.selected_option_id] : []);
                      } else if (typeof userAnswer === 'string') {
                        userAnswers = [userAnswer];
                      }
                    }
                    let correctAnswers = [];
                    if (correctAnswer) {
                      if (Array.isArray(correctAnswer)) {
                        correctAnswers = correctAnswer;
                      } else if (typeof correctAnswer === 'object') {
                        correctAnswers = correctAnswer.correct_option_ids || 
                                        (correctAnswer.correct_option_id ? [correctAnswer.correct_option_id] : []);
                      } else if (typeof correctAnswer === 'string') {
                        correctAnswers = [correctAnswer];
                      }
                    }
                    const isUserAnswer = userAnswers.includes(option.id) || 
                                        userAnswers.includes(String(option.id));
                    const isCorrect = correctAnswers.includes(option.id) || 
                                     correctAnswers.includes(String(option.id)) ||
                                     option.is_correct;
                    if (!isUserAnswer && !isCorrect) {
                      return null;
                    }
                    let bgColor = "bg-gray-50";
                    let borderColor = "border-gray-200";
                    let textColor = "text-gray-900";
                    let icon = null;
                    let label = null;
                    if (isUserAnswer && isCorrect) {
                      bgColor = "bg-blue-50";
                      borderColor = "border-blue-500";
                      textColor = "text-blue-900";
                      icon = <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />;
                      label = <span className="ml-auto text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded font-semibold">✓ Your Answer (Correct)</span>;
                    } else if (isUserAnswer && !isCorrect) {
                      bgColor = "bg-red-50";
                      borderColor = "border-red-500";
                      textColor = "text-red-900";
                      icon = <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />;
                      label = <span className="ml-auto text-xs bg-red-200 text-red-800 px-2 py-1 rounded font-semibold">✗ Your Answer (Wrong)</span>;
                    } else if (!isUserAnswer && isCorrect) {
                      bgColor = "bg-blue-50";
                      borderColor = "border-blue-300";
                      textColor = "text-blue-900";
                      icon = <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />;
                      label = <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Correct Answer</span>;
                    }
                    return (
                      <div
                        key={option.id || `option-${optIndex}`}
                        className={`p-3 rounded-lg border-2 ${bgColor} ${borderColor}`}
                      >
                        <div className="flex items-center gap-2">
                          {icon}
                          <span className={`flex-1 ${textColor} ${isUserAnswer || isCorrect ? "font-semibold" : ""}`}>
                            {option.option_text || option.text || 'Option'}
                          </span>
                          {label}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Explanation - Only show for incorrect answers */}
              {!question.is_correct && question.explanation && (
                <div className="ml-6 mt-2 p-2 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded border border-blue-200">
                  <p className="text-[10px] font-bold text-blue-900 mb-0.5 flex items-center gap-1">
                    <span className="text-xl">💡</span> Explanation:
                  </p>
                  <div
                    className="text-sm text-blue-800 prose prose-sm max-w-none font-medium"
                    dangerouslySetInnerHTML={{ __html: question.explanation }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-3 flex justify-center">
          <button
            onClick={() => navigate(`/exams/${quizId}`)}
            className="px-4 py-1.5 text-white text-xs rounded-md hover:shadow font-bold transition-all duration-200"
            style={{ background: 'linear-gradient(to right, #476072, #5a7a8f)' }}
          >
            Back to Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttemptReview;
