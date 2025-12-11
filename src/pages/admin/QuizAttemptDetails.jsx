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
        {question.topic && (
          <Badge variant="default" size="sm">
            {question.topic}
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
      <div className="space-y-2 mb-4">
        {question.options && Object.entries(question.options).map(([key, option]) => {
          // Extract text from option (handle both string and object formats)
          const optionText = typeof option === 'object' && option !== null 
            ? option.text 
            : String(option);
          
          const isUserAnswer = Array.isArray(userAnswer) 
            ? userAnswer.includes(key)
            : userAnswer === key;
          const isCorrectAnswer = Array.isArray(correctAnswer)
            ? correctAnswer.includes(key)
            : correctAnswer === key;
          
          let bgClass = "bg-gray-100";
          let borderClass = "border-gray-300";
          let textClass = "text-gray-900";

          if (isCorrectAnswer) {
            bgClass = "bg-green-500/10";
            borderClass = "border-green-500";
            textClass = "text-green-600";
          } else if (isUserAnswer && !isCorrect) {
            bgClass = "bg-red-500/10";
            borderClass = "border-red-500";
            textClass = "text-red-600";
          }

          return (
            <div
              key={key}
              className={`p-3 rounded-lg border ${bgClass} ${borderClass}`}
            >
              <div className="flex items-center justify-between">
                <p className={`${textClass} flex items-center gap-2`}>
                  <span className="font-semibold">
                    {key}.
                  </span>
                  {optionText}
                </p>
                {isCorrectAnswer && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {isUserAnswer && !isCorrect && (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      {question.explanation && (
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm font-semibold text-blue-400 mb-1">Explanation</p>
          <p className="text-sm text-gray-700">{question.explanation}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Started At</p>
            <p className="text-gray-900 font-medium">{formatDate(attemptData?.started_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Submitted At</p>
            <p className="text-gray-900 font-medium">{formatDate(attemptData?.completed_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <Badge variant="success">
              Submitted
            </Badge>
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
