/**
 * Quiz Attempt Details Page
 * Shows detailed review of a specific quiz attempt with questions and answers
 */

import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Award,
} from "lucide-react";
import { useAttemptReview } from "@/hooks/queries/useQuizQueries";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Format date for display
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/**
 * Format duration
 */
const formatDuration = (seconds) => {
  if (!seconds) return "N/A";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

/**
 * Stat Card Component
 */
const StatCard = ({ icon: Icon, label, value, color = "blue" }) => {
  const colorClasses = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
    green: { bg: "bg-green-500/10", text: "text-green-500" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-500" },
    red: { bg: "bg-red-500/10", text: "text-red-500" },
  };
  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 ${classes.bg} rounded-lg`}>
          <Icon className={`w-5 h-5 ${classes.text}`} />
        </div>
        <div>
          <p className="text-xs text-gray-600">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );
};

/**
 * Question Review Card Component
 */
const QuestionReviewCard = ({ question, index }) => {
  const isCorrect = question.is_correct;
  const userAnswer = question.user_answer;
  const correctAnswer = question.correct_answer;
  const questionType = question.question_type;

  // Render user's answer (for incorrect/unanswered only)
  const renderUserAnswer = () => {
    if (!userAnswer) return null;

    if (questionType === 'matching') {
      // User answer for matching is in format: {"pairs": [{left_id, right_id}]}
      const pairs = userAnswer?.pairs || userAnswer;
      if (!Array.isArray(pairs)) return null;
      
      return (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Your Answer:</p>
          {pairs.map((pair, idx) => {
            const leftItem = question.options?.left_items?.find(l => l.id === pair.left_id);
            const rightItem = question.options?.right_items?.find(r => r.id === pair.right_id);
            return (
              <div key={idx} className="p-2 bg-blue-500/5 rounded border border-blue-500/20">
                <p className="text-sm text-gray-900">
                  {leftItem?.text} → {rightItem?.text}
                </p>
              </div>
            );
          })}
        </div>
      );
    }

    // For choice-based questions, extract selected options
    let selectedOptions = [];
    
    if (questionType === 'multiple_response') {
      // User answer format: {"selected_option_ids": ["A", "C"]}
      selectedOptions = userAnswer?.selected_option_ids || userAnswer;
    } else if (questionType === 'multiple_choice' || questionType === 'true_false') {
      // User answer format: {"selected_option_id": "A"} or {"selected_option_id": "true"}
      const selectedId = userAnswer?.selected_option_id || userAnswer;
      selectedOptions = selectedId ? [selectedId] : [];
    }

    if (!Array.isArray(selectedOptions)) {
      selectedOptions = [selectedOptions];
    }

    const optionLabels = selectedOptions.map(optId => {
      const opt = question.options?.find(o => o.id === optId);
      return opt ? opt.text : optId;
    }).join(', ');

    return (
      <div className="p-3 bg-blue-500/5 rounded border border-blue-500/20">
        <p className="text-sm font-semibold text-gray-700 mb-1">Your Answer:</p>
        <p className="text-sm text-gray-900">{optionLabels}</p>
      </div>
    );
  };

  // Render correct answer (for incorrect/unanswered only)
  const renderCorrectAnswer = () => {
    if (questionType === 'matching') {
      if (!Array.isArray(correctAnswer)) return null;
      return (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Correct Answer:</p>
          {correctAnswer.map((pair, idx) => {
            const leftItem = question.options?.left_items?.find(l => l.id === pair.left_id);
            const rightItem = question.options?.right_items?.find(r => r.id === pair.right_id);
            return (
              <div key={idx} className="p-2 bg-green-500/5 rounded border border-green-500/20">
                <p className="text-sm text-gray-900">
                  {leftItem?.text} → {rightItem?.text}
                </p>
              </div>
            );
          })}
        </div>
      );
    }

    // For choice-based questions
    const correctOptions = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
    const optionLabels = correctOptions.map(optId => {
      const opt = question.options?.find(o => o.id === optId);
      return opt ? opt.text : optId;
    }).join(', ');

    return (
      <div className="p-3 bg-green-500/5 rounded border border-green-500/20">
        <p className="text-sm font-semibold text-gray-700 mb-1">Correct Answer:</p>
        <p className="text-sm text-gray-900">{optionLabels}</p>
      </div>
    );
  };

  // Get user's selected option IDs for highlighting
  const getUserSelectedIds = () => {
    if (!userAnswer) return [];
    
    if (questionType === 'matching') {
      return [];
    } else if (questionType === 'multiple_response') {
      return userAnswer?.selected_option_ids || userAnswer || [];
    } else if (questionType === 'multiple_choice' || questionType === 'true_false') {
      const selectedId = userAnswer?.selected_option_id || userAnswer;
      return selectedId ? [selectedId] : [];
    }
    
    return Array.isArray(userAnswer) ? userAnswer : [userAnswer];
  };

  // Handle different option formats based on question type
  const renderOptions = () => {
    if (questionType === 'matching') {
      // Matching questions have a special structure
      return (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">Options:</p>
          {question.options?.left_items?.map((leftItem, idx) => {
            const correctMatch = question.options.correct_matches?.find(
              m => m.left_id === leftItem.id
            );
            const rightItem = question.options.right_items?.find(
              r => r.id === correctMatch?.right_id
            );
            
            return (
              <div key={leftItem.id} className="p-3 bg-gray-100 rounded-lg border border-gray-300">
                <p className="text-gray-900">
                  <span className="font-semibold">{leftItem.text}</span>
                  {rightItem && <span className="text-gray-600"> → {rightItem.text}</span>}
                </p>
              </div>
            );
          })}
        </div>
      );
    }

    // For multiple choice, multiple response, and true/false
    if (Array.isArray(question.options)) {
      const userSelectedIds = getUserSelectedIds();
      
      return (
        <div className="space-y-2">
          {question.options.map((option) => {
            const optionId = option.id;
            const optionText = option.text;
            
            const isUserAnswer = userSelectedIds.includes(optionId);
            const isCorrectAnswer = option.is_correct || 
              (Array.isArray(correctAnswer) 
                ? correctAnswer.includes(optionId) 
                : correctAnswer === optionId);
            
            let bgClass = "bg-gray-100";
            let borderClass = "border-gray-300";
            let textClass = "text-gray-900";

            if (isCorrectAnswer) {
              bgClass = "bg-green-500/10";
              borderClass = "border-green-500";
              textClass = "text-green-600";
            } else if (isUserAnswer && !isCorrectAnswer) {
              bgClass = "bg-red-500/10";
              borderClass = "border-red-500";
              textClass = "text-red-600";
            }

            return (
              <div
                key={optionId}
                className={`p-3 rounded-lg border ${bgClass} ${borderClass}`}
              >
                <div className="flex items-center justify-between">
                  <p className={`${textClass} flex items-center gap-2`}>
                    <span className="font-semibold">{optionId}.</span>
                    {optionText}
                  </p>
                  {isCorrectAnswer && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {isUserAnswer && !isCorrectAnswer && (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            {isCorrect ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600">Question {index + 1}</p>
            <Badge variant={isCorrect ? "success" : "error"} size="sm">
              {isCorrect ? "Correct" : "Incorrect"}
            </Badge>
          </div>
        </div>
        {question.question_type && (
          <Badge variant="default" size="sm">
            {question.question_type.replace('_', ' ')}
          </Badge>
        )}
      </div>

      {/* Question Text */}
      <div className="mb-4">
        <p className="text-gray-900 font-medium mb-2">{question.question_text}</p>
        {question.question_image && (
          <img
            src={question.question_image}
            alt="Question"
            className="rounded-lg max-w-md mt-2"
          />
        )}
      </div>

      {/* Options */}
      {renderOptions()}

      {/* Only show answer details and explanation if incorrect */}
      {!isCorrect && userAnswer !== null && (
        <div className="mt-4 space-y-3">
          {renderCorrectAnswer()}
          
          {question.explanation && (
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className="text-sm font-semibold text-orange-700 mb-1">Explanation:</p>
              <p className="text-sm text-gray-700">{question.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* User didn't answer */}
      {userAnswer === null && (
        <div className="mt-4 space-y-3">
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-700">No answer provided</p>
          </div>
          
          {renderCorrectAnswer()}
          
          {question.explanation && (
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className="text-sm font-semibold text-orange-700 mb-1">Explanation:</p>
              <p className="text-sm text-gray-700">{question.explanation}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export const QuizAttemptDetails = () => {
  const { groupId, quizId, attemptId } = useParams();
  const navigate = useNavigate();

  // Fetch attempt review
  const { data: attemptData, isLoading, error } = useAttemptReview(quizId, attemptId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!attemptData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <p className="text-center text-gray-600">
            {error?.message || "Attempt not found"}
          </p>
        </Card>
      </div>
    );
  }

  // Backend returns data at root level, not nested in 'attempt'
  const score = attemptData?.score || 0;
  const isPassed = score >= (attemptData?.passing_score || 70);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Attempt Review"
        description={`Review for ${attemptData?.quiz_title || "Quiz"} - Attempt #${attemptData?.attempt_number || 1}`}
        actions={
          <Button
            variant="secondary"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(`/admin/groups/${groupId}/quiz/${quizId}`)}
          >
            Back to Quiz
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Award}
          label="Score"
          value={`${score.toFixed(1)}%`}
          color={isPassed ? "green" : "red"}
        />
        <StatCard
          icon={CheckCircle}
          label="Correct Answers"
          value={`${attemptData?.correct_answers || 0}/${attemptData?.total_questions || 0}`}
          color="blue"
        />
        <StatCard
          icon={Clock}
          label="Time Taken"
          value={formatDuration(attemptData?.time_spent_seconds)}
          color="purple"
        />
        <StatCard
          icon={Target}
          label="Result"
          value={isPassed ? "Passed" : "Failed"}
          color={isPassed ? "green" : "red"}
        />
      </div>

      {/* Attempt Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attempt Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Started At</p>
            <p className="text-gray-900 font-medium">{formatDate(attemptData?.started_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Submitted At</p>
            <p className="text-gray-900 font-medium">{formatDate(attemptData?.submitted_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <Badge variant="success">
              Submitted
            </Badge>
          </div>
        </div>

        {/* Pass/Fail Explanation */}
        <div className={`mt-4 p-4 rounded-lg border ${
          isPassed 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-start gap-3">
            {isPassed ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className={`font-semibold ${isPassed ? 'text-green-700' : 'text-red-700'}`}>
                {isPassed ? 'Quiz Passed!' : 'Quiz Not Passed'}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                {isPassed ? (
                  <>
                    Score of <span className="font-semibold">{score.toFixed(1)}%</span> meets the required passing score of{' '}
                    <span className="font-semibold">{attemptData?.passing_score || 70}%</span>.
                  </>
                ) : (
                  <>
                    Score of <span className="font-semibold">{score.toFixed(1)}%</span> is below the required passing score of{' '}
                    <span className="font-semibold">{attemptData?.passing_score || 70}%</span>.{' '}
                    {attemptData?.passing_score && (
                      <span>
                        You need at least <span className="font-semibold">{attemptData.passing_score}%</span> to pass.
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Questions Review */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Question Review</h3>
        {attemptData?.questions?.length > 0 ? (
          attemptData.questions.map((question, index) => (
            <QuestionReviewCard key={index} question={question} index={index} />
          ))
        ) : (
          <Card className="p-6">
            <p className="text-center text-gray-600">No questions available for review</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuizAttemptDetails;
