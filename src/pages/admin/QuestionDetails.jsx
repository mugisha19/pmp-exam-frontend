/**
 * Question Details Page
 * View and edit a specific question
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  BookOpen,
  FileQuestion,
  Calendar,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useQuestion,
  useDeleteQuestionMutation,
} from "@/hooks/queries/useQuestionQueries";
import { useAuthStore } from "@/stores/auth.store";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EditQuestionModal } from "@/components/features/questions";

/**
 * Format date for display
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "Not set";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Info item component
 */
// eslint-disable-next-line no-unused-vars
const InfoItem = ({ icon: IconComponent, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-gray-100 rounded-lg">
      <IconComponent className="w-5 h-5 text-gray-600" />
    </div>
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  </div>
);

/**
 * Render options based on question type
 */
const renderOptions = (question) => {
  const { question_type, options, correct_answer } = question;

  if (question_type === "matching") {
    const matchingOptions = options || {};
    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Left Items</h4>
          <div className="space-y-2">
            {matchingOptions.left_items?.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <span className="font-medium text-gray-700">
                  {String.fromCharCode(65 + index)}.
                </span>{" "}
                {typeof item === 'object' ? item.text : item}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Right Items</h4>
          <div className="space-y-2">
            {matchingOptions.right_items?.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <span className="font-medium text-gray-700">{index + 1}.</span>{" "}
                {typeof item === 'object' ? item.text : item}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Correct Matches</h4>
          <div className="space-y-2">
            {matchingOptions.correct_matches?.map((match, index) => {
              const leftItem = matchingOptions.left_items?.find(
                (item) => item.id === match.left_id
              );
              const rightItem = matchingOptions.right_items?.find(
                (item) => item.id === match.right_id
              );
              return (
                <div key={index} className="space-y-2">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                    <span className="font-medium text-green-700">
                      {leftItem?.text || match.left_id}
                    </span>
                    <span className="text-green-600">→</span>
                    <span className="font-medium text-green-700">
                      {rightItem?.text || match.right_id}
                    </span>
                  </div>
                  {match.explanation && (
                    <div className="ml-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-blue-700 mb-1">Explanation:</p>
                          <div
                            className="text-sm text-gray-700"
                            dangerouslySetInnerHTML={{ __html: match.explanation }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // For other question types
  const optionsArray = Array.isArray(options) ? options : [];
  const correctAnswers = Array.isArray(correct_answer)
    ? correct_answer
    : [correct_answer];

  return (
    <div className="space-y-2">
      {optionsArray.map((option, index) => {
        const isCorrect =
          correctAnswers.includes(option.id) ||
          correctAnswers.includes(String(index)) ||
          option.is_correct === true;

        return (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              isCorrect
                ? "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`font-medium ${
                  isCorrect ? "text-green-700" : "text-gray-700"
                }`}
              >
                {String.fromCharCode(65 + index)}.
              </span>
              <div className="flex-1">
                <p
                  className={isCorrect ? "text-green-900" : "text-gray-900"}
                  dangerouslySetInnerHTML={{ __html: option.text }}
                />
                {isCorrect && (
                  <Badge variant="success" className="mt-2">
                    Correct Answer
                  </Badge>
                )}
                {option.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-blue-700 mb-1">Explanation:</p>
                        <div
                          className="text-sm text-gray-700"
                          dangerouslySetInnerHTML={{ __html: option.explanation }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Extract explanation from options
 */
const getExplanation = (question) => {
  const { question_type, options } = question;

  if (question_type === "matching") {
    // For matching, explanations can be in correct_matches
    const matchingOptions = options || {};
    const explanations = matchingOptions.correct_matches
      ?.map(match => match.explanation)
      .filter(Boolean);
    
    if (explanations && explanations.length > 0) {
      return explanations.join('<br/><br/>');
    }
    return null;
  }

  // For other question types, find explanation in correct answer option(s)
  const optionsArray = Array.isArray(options) ? options : [];
  const correctOptions = optionsArray.filter(opt => opt.is_correct === true);
  
  if (correctOptions.length > 0) {
    const explanations = correctOptions
      .map(opt => opt.explanation)
      .filter(Boolean);
    
    if (explanations.length > 0) {
      return explanations.join('<br/><br/>');
    }
  }

  return null;
};

export const QuestionDetails = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch question details
  const {
    data: question,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuestion(questionId);
  const deleteQuestionMutation = useDeleteQuestionMutation();

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteQuestionMutation.mutateAsync(questionId);
      toast.success("Question deleted successfully");
      navigate("/questions");
    } catch (error) {
      toast.error(error.message || "Failed to delete question");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <EmptyState
          icon={FileQuestion}
          title="Error loading question"
          description={error?.message || "Failed to load question details"}
          actionLabel="Go Back"
          onAction={() => navigate(-1)}
        />
      </div>
    );
  }

  // Not found state
  if (!question) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <EmptyState
          icon={FileQuestion}
          title="Question not found"
          description="The question you're looking for doesn't exist or has been deleted."
          actionLabel="Go Back"
          onAction={() => navigate(-1)}
        />
      </div>
    );
  }

  const difficultyColors = {
    easy: "success",
    medium: "warning",
    hard: "danger",
  };

  const typeLabels = {
    multiple_choice: "Multiple Choice",
    multiple_response: "Multiple Response",
    true_false: "True/False",
    matching: "Matching",
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Question Details"
        subtitle={`View and manage question information`}
        actions={
          <div className="flex items-center gap-2">
            {(user?.role === "admin" || user?.role === "instructor") && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit2 className="w-4 h-4" />}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit Question
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  Delete
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </div>
        }
      />

      {/* Question Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <InfoItem
              icon={BookOpen}
              label="Topic"
              value={question.topic_name || "No topic"}
            />
            <InfoItem
              icon={Tag}
              label="Type"
              value={
                typeLabels[question.question_type] || question.question_type
              }
            />
            <InfoItem
              icon={Tag}
              label="Difficulty"
              value={
                <Badge
                  variant={difficultyColors[question.difficulty?.toLowerCase()]}
                >
                  {question.difficulty}
                </Badge>
              }
            />
            <InfoItem
              icon={Calendar}
              label="Created"
              value={formatDate(question.created_at)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Question Content */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Question</h3>
            <StatusBadge status={question.status || "active"} />
          </div>
          <div
            className="prose max-w-none text-gray-900 text-base"
            dangerouslySetInnerHTML={{ __html: question.question_text }}
          />
        </CardContent>
      </Card>

      {/* Answer Options */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Answer Options
          </h3>
          {renderOptions(question)}
        </CardContent>
      </Card>

      {/* Metadata */}
      {question.metadata && Object.keys(question.metadata).length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Additional Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(question.metadata).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm text-gray-500 capitalize">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm font-medium text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={deleteQuestionMutation.isPending}
      />

      {/* Edit Question Modal */}
      <EditQuestionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        question={question}
        onSuccess={() => {
          setIsEditModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default QuestionDetails;
