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
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-900 mb-2">Failed to load attempt</p>
          <p className="text-gray-600 mb-4">{error.message || "Please try again later"}</p>
          <button
            onClick={() => navigate(`/exams/${quizId}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-900 mb-2">No attempt data found</p>
          <p className="text-gray-600 mb-4">This attempt may not exist or you don't have access to it.</p>
          <button
            onClick={() => navigate(`/exams/${quizId}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
  
  // Debug log to see data structure
  console.log('Review Data:', reviewData);
  console.log('Questions:', questions);
  if (questions.length > 0) {
    console.log('First Question:', questions[0]);
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(`/exams/${quizId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Quiz
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {attempt.quiz_title}
              </h1>
              <p className="text-gray-600">
                Attempt #{attempt.attempt_number} Review
              </p>
            </div>
            
            <div className={`px-6 py-3 rounded-lg ${
              attempt.passed 
                ? "bg-green-100 border-2 border-green-500" 
                : "bg-red-100 border-2 border-red-500"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {attempt.passed ? (
                  <CheckCircle className="w-6 h-6 text-green-700" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-700" />
                )}
                <span className={`text-2xl font-bold ${
                  attempt.passed ? "text-green-700" : "text-red-700"
                }`}>
                  {attempt.score}%
                </span>
              </div>
              <p className={`text-sm font-medium ${
                attempt.passed ? "text-green-700" : "text-red-700"
              }`}>
                {attempt.passed ? "Passed" : "Failed"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">Correct Answers</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {attempt.correct_answers || 0} / {attempt.total_questions}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Timer className="w-4 h-4" />
              <span className="text-sm font-medium">Time Spent</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatTime(attempt.time_spent_seconds)}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">Passing Score</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {attempt.passing_score}%
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(attempt.completed_at)}
            </p>
            <p className="text-xs text-gray-600">
              {formatDateTime(attempt.completed_at)}
            </p>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div
              key={question.question_id}
              className={`bg-white rounded-lg border-2 p-6 ${
                question.is_correct
                  ? "border-green-200"
                  : "border-red-200"
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-semibold text-gray-700">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {question.is_correct ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`text-sm font-semibold ${
                        question.is_correct ? "text-green-700" : "text-red-700"
                      }`}>
                        {question.is_correct ? "Correct" : "Incorrect"}
                      </span>
                      {question.was_flagged && (
                        <Flag className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                      )}
                    </div>
                    <div
                      className="text-gray-900 prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: question.question_text }}
                    />
                  </div>
                </div>
              </div>

              {/* Options */}

              {/* Matching type: show user matches and correct matches */}
              <div className="ml-11 space-y-2">
                {(() => {
                  // Parse options if it's a JSON string
                  let options = question.options;
                  if (typeof options === 'string') {
                    try {
                      options = JSON.parse(options);
                    } catch (e) {
                      console.error('Failed to parse options:', e);
                      options = {};
                    }
                  }
                  // Parse user_answer if it's a string
                  let userAnswer = question.user_answer;
                  if (typeof userAnswer === 'string') {
                    try {
                      userAnswer = JSON.parse(userAnswer);
                    } catch (e) {
                      console.error('Failed to parse user_answer:', e);
                    }
                  }
                  // Parse correct_answer if it's a string
                  let correctAnswer = question.correct_answer;
                  if (typeof correctAnswer === 'string') {
                    try {
                      correctAnswer = JSON.parse(correctAnswer);
                    } catch (e) {
                      console.error('Failed to parse correct_answer:', e);
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
                            <div key={idx} className={`p-2 rounded border flex items-center gap-2 ${isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                              {isCorrect ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                              <span className="text-gray-900 font-medium">{left?.text || '—'}</span>
                              <span className="mx-2 text-gray-500">→</span>
                              <span className="text-gray-900 font-medium">{right?.text || '—'}</span>
                              <span className={`ml-auto text-xs px-2 py-1 rounded font-semibold ${isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{isCorrect ? 'Correct' : 'Wrong'}</span>
                            </div>
                          );
                        })}
                        {/* Show correct matches if any were wrong */}
                        {userPairs.length > 0 && userPairs.some(pair => !correctPairs.some(cp => cp.left_id === pair.left_id && cp.right_id === pair.right_id)) && (
                          <div className="mt-2">
                            <p className="text-sm font-semibold text-green-700">Correct Matches:</p>
                            {correctPairs.map((pair, idx) => {
                              const left = leftItems.find(l => l.id === pair.left_id);
                              const right = rightItems.find(r => r.id === pair.right_id);
                              return (
                                <div key={idx} className="p-2 rounded border border-green-200 bg-green-50 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
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
                      bgColor = "bg-green-50";
                      borderColor = "border-green-500";
                      textColor = "text-green-900";
                      icon = <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />;
                      label = <span className="ml-auto text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">✓ Your Answer (Correct)</span>;
                    } else if (isUserAnswer && !isCorrect) {
                      bgColor = "bg-red-50";
                      borderColor = "border-red-500";
                      textColor = "text-red-900";
                      icon = <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />;
                      label = <span className="ml-auto text-xs bg-red-200 text-red-800 px-2 py-1 rounded font-semibold">✗ Your Answer (Wrong)</span>;
                    } else if (!isUserAnswer && isCorrect) {
                      bgColor = "bg-green-50";
                      borderColor = "border-green-300";
                      textColor = "text-green-900";
                      icon = <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />;
                      label = <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Correct Answer</span>;
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
                <div className="ml-11 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    💡 Explanation:
                  </p>
                  <div
                    className="text-sm text-blue-800 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: question.explanation }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate(`/exams/${quizId}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Back to Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttemptReview;
