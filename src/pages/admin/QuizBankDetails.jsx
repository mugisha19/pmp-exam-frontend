/**
 * Admin Quiz Bank Details Page
 * View and manage questions in a quiz bank template
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileQuestion,
  Plus,
  Calendar,
  BookOpen,
  Edit2,
  Trash2,
  Eye,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useQuizBank,
  useQuizBankQuestions,
  useRemoveQuestionFromBankMutation,
} from "@/hooks/queries/useQuizBankQueries";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EditQuizBankModal } from "@/components/features/quiz-banks";
import { PublishQuizModal } from "@/components/features/quizzes/PublishQuizModal";

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

export const QuizBankDetails = () => {
  const { quizBankId } = useParams();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Fetch quiz bank details
  const {
    data: quizBank,
    isLoading,
    isError,
    error,
    refetch: refetchQuizBank,
  } = useQuizBank(quizBankId);

  // Fetch questions
  const {
    data: questionsData,
    isLoading: questionsLoading,
    refetch: refetchQuestions,
  } = useQuizBankQuestions(quizBankId);

  // Remove question mutation
  const removeQuestionMutation = useRemoveQuestionFromBankMutation();

  const questions = questionsData?.items || questionsData || [];

  // Handle remove question
  const handleRemoveQuestion = (question) => {
    setSelectedQuestion(question);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedQuestion) return;

    try {
      await removeQuestionMutation.mutateAsync({
        quizBankId,
        questionId: selectedQuestion.question_id,
      });
      toast.success("Question removed from quiz bank");
      setIsDeleteDialogOpen(false);
      setSelectedQuestion(null);
      refetchQuestions();
    } catch (error) {
      toast.error(error.message || "Failed to remove question");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
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
          onClick={() => navigate("/admin/quiz-banks")}
        >
          Back to Quiz Banks
        </Button>
        <EmptyState
          icon={FileQuestion}
          title="Error loading quiz bank"
          description={error?.message || "Failed to load quiz bank details"}
          actionLabel="Go Back"
          onAction={() => navigate("/admin/quiz-banks")}
        />
      </div>
    );
  }

  // Not found state
  if (!quizBank) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate("/admin/quiz-banks")}
        >
          Back to Quiz Banks
        </Button>
        <EmptyState
          icon={FileQuestion}
          title="Quiz bank not found"
          description="The quiz bank you're looking for doesn't exist or has been deleted."
          actionLabel="Go Back"
          onAction={() => navigate("/admin/quiz-banks")}
        />
      </div>
    );
  }

  // Questions table columns
  const questionColumns = [
    {
      key: "question_text",
      header: "Question",
      render: (_, question) => (
        <div
          className="text-sm max-w-2xl truncate"
          dangerouslySetInnerHTML={{ __html: question.question_text }}
        />
      ),
    },
    {
      key: "question_type",
      header: "Type",
      render: (_, question) => (
        <Badge variant="outline">{question.question_type}</Badge>
      ),
    },
    {
      key: "difficulty",
      header: "Difficulty",
      render: (_, question) => {
        const variants = {
          easy: "success",
          medium: "warning",
          hard: "danger",
        };
        return (
          <Badge
            variant={
              variants[question.difficulty?.toLowerCase()] || "secondary"
            }
          >
            {question.difficulty}
          </Badge>
        );
      },
    },
    {
      key: "topic_name",
      header: "Topic",
      render: (_, question) => (
        <span className="text-sm text-gray-600">
          {question.topic_name || "N/A"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, question) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/admin/questions/${question.question_id}`)}
            title="View Question"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveQuestion(question)}
            title="Remove from Quiz Bank"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>{quizBank.title}</span>
            <StatusBadge status={quizBank.status || "draft"} size="md" />
          </div>
        }
        subtitle={quizBank.description || "No description provided"}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Send className="w-4 h-4" />}
              onClick={() => setIsPublishModalOpen(true)}
              disabled={!questions || questions.length === 0}
            >
              Publish Quiz
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit2 className="w-4 h-4" />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Details
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate("/admin/quiz-banks")}
            >
              Back to Quiz Banks
            </Button>
          </div>
        }
      />

      {/* Quiz Bank Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoItem
              icon={FileQuestion}
              label="Total Questions"
              value={quizBank.question_count || 0}
            />
            <InfoItem
              icon={BookOpen}
              label="Times Used"
              value={quizBank.times_used || 0}
            />
            <InfoItem
              icon={Calendar}
              label="Created"
              value={formatDate(quizBank.created_at)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
              <p className="text-sm text-gray-500 mt-1">
                {questions.length} question(s) in this quiz bank
              </p>
            </div>
            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() =>
                navigate(`/admin/quiz-banks/${quizBankId}/add-questions`)
              }
            >
              Add Questions
            </Button>
          </div>

          {questionsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : questions.length === 0 ? (
            <EmptyState
              icon={FileQuestion}
              title="No questions yet"
              description="Add questions to this quiz bank to get started"
              actionLabel="Add Questions"
              onAction={() =>
                navigate(`/admin/quiz-banks/${quizBankId}/add-questions`)
              }
            />
          ) : (
            <DataTable
              data={questions}
              columns={questionColumns}
              rowKey="question_id"
              emptyMessage="No questions found"
            />
          )}
        </CardContent>
      </Card>

      {/* Remove Question Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedQuestion(null);
        }}
        onConfirm={handleConfirmRemove}
        title="Remove Question"
        message="Are you sure you want to remove this question from the quiz bank? The question itself will not be deleted from the question bank."
        confirmText="Remove"
        confirmVariant="danger"
        isLoading={removeQuestionMutation.isPending}
      />

      {/* Edit Quiz Bank Modal */}
      <EditQuizBankModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        quizBank={quizBank}
        onSuccess={() => {
          setIsEditModalOpen(false);
          refetchQuizBank();
        }}
      />

      {/* Publish Quiz Modal */}
      <PublishQuizModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        quizBank={quizBank}
      />
    </div>
  );
};

export default QuizBankDetails;
