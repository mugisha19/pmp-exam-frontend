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
const StatCard = ({ icon: Icon, label, value, color = "blue" }) => (
  <Card className="p-4">
    <div className="flex items-center gap-3">
      <div className={`p-2 bg-${color}-500/10 rounded-lg`}>
        <Icon className={`w-5 h-5 text-${color}-500`} />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  </Card>
);

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
            <p className="text-sm text-gray-400">Question {index + 1}</p>
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
        <p className="text-white font-medium mb-2">{question.question_text}</p>
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
        {question.options?.map((option, idx) => {
          const isUserAnswer = option === userAnswer;
          const isCorrectAnswer = option === correctAnswer;
          
          let bgClass = "bg-gray-800";
          let borderClass = "border-gray-700";
          let textClass = "text-gray-300";

          if (isCorrectAnswer) {
            bgClass = "bg-green-500/10";
            borderClass = "border-green-500";
            textClass = "text-green-400";
          } else if (isUserAnswer && !isCorrect) {
            bgClass = "bg-red-500/10";
            borderClass = "border-red-500";
            textClass = "text-red-400";
          }

          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${bgClass} ${borderClass}`}
            >
              <div className="flex items-center justify-between">
                <p className={`${textClass} flex items-center gap-2`}>
                  <span className="font-semibold">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option}
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
          <p className="text-sm text-gray-300">{question.explanation}</p>
        </div>
      )}
    </Card>
  );
};

export const QuizAttemptDetails = () => {
  const { groupId, quizId, attemptId } = useParams();
  const navigate = useNavigate();

  // Fetch attempt review
  const { data: attemptData, isLoading } = useAttemptReview(quizId, attemptId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const attempt = attemptData?.attempt || {};
  const questions = attemptData?.questions || [];
  const score = attempt.score || 0;
  const isPassed = score >= (attemptData?.passing_score || 70);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Attempt Review"
        description={`Review for ${attemptData?.quiz_title || "Quiz"} - Attempt #${attempt.attempt_number || 1}`}
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
          value={`${attempt.correct_answers || 0}/${attempt.total_questions || 0}`}
          color="blue"
        />
        <StatCard
          icon={Clock}
          label="Time Taken"
          value={formatDuration(attempt.total_time_seconds)}
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
        <h3 className="text-lg font-semibold text-white mb-4">Attempt Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-400">Started At</p>
            <p className="text-white font-medium">{formatDate(attempt.started_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Submitted At</p>
            <p className="text-white font-medium">{formatDate(attempt.submitted_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Status</p>
            <Badge variant={attempt.status === "submitted" ? "success" : "warning"}>
              {attempt.status || "unknown"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Questions Review */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Question Review</h3>
        {questions.length > 0 ? (
          questions.map((question, index) => (
            <QuestionReviewCard key={index} question={question} index={index} />
          ))
        ) : (
          <Card className="p-6">
            <p className="text-center text-gray-400">No questions available for review</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuizAttemptDetails;
