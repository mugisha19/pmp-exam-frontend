/**
 * Admin Quiz Bank Details Page
 * View and manage questions in a quiz bank template
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  FileQuestion,
  Plus,
  Calendar,
  Edit2,
  Send,
  Trash2,
} from "lucide-react";
import {
  useQuizBank,
  useQuizBankQuestions,
  useDeleteQuizBankMutation,
} from "@/hooks/queries/useQuizBankQueries";
import { queryKeys } from "@/lib/query-client";
import { useAuthStore } from "@/stores/auth.store";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EditQuizBankModal, AddQuestionsModal } from "@/components/features/quiz-banks";
import { PublishQuizModal } from "@/components/features/quizzes/PublishQuizModal";
import toast from "react-hot-toast";

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
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isAddQuestionsModalOpen, setIsAddQuestionsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteQuizBankMutation = useDeleteQuizBankMutation();

  // Fetch quiz bank details
  const {
    data: quizBank,
    isLoading,
    isError,
    error,
    refetch: refetchQuizBank,
  } = useQuizBank(quizBankId, {
    retry: false, // Don't retry on errors
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists
  });

  // Fetch questions
  const {
    data: questionsData,
    isLoading: questionsLoading,
    refetch: refetchQuestions,
  } = useQuizBankQuestions(quizBankId, {
    retry: false, // Don't retry on errors
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists
  });

  const questions = questionsData?.items || questionsData || [];

  const handleDelete = async () => {
    try {
      // Cancel any ongoing queries before deletion
      // Note: The mutation will also cancel queries, but we do it here too for extra safety
      queryClient.cancelQueries({
        queryKey: queryKeys.quizBanks.detail(quizBankId),
      });
      queryClient.cancelQueries({
        queryKey: ["quiz-bank-questions", quizBankId],
      });

      await deleteQuizBankMutation.mutateAsync(quizBankId);
      // Navigate immediately to prevent further queries
      navigate("/quiz-banks");
    } catch (error) {
      const message =
        typeof error === "object"
          ? error.message || JSON.stringify(error)
          : error;
      toast.error(`Failed to delete quiz bank: ${message}`);
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
          onClick={() => navigate("/quiz-banks")}
        >
          Back to Quiz Banks
        </Button>
        <EmptyState
          icon={FileQuestion}
          title="Error loading quiz bank"
          description={error?.message || "Failed to load quiz bank details"}
          actionLabel="Go Back"
          onAction={() => navigate("/quiz-banks")}
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
          onClick={() => navigate("/quiz-banks")}
        >
          Back to Quiz Banks
        </Button>
        <EmptyState
          icon={FileQuestion}
          title="Quiz bank not found"
          description="The quiz bank you're looking for doesn't exist or has been deleted."
          actionLabel="Go Back"
          onAction={() => navigate("/quiz-banks")}
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
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={quizBank.title}
        subtitle={quizBank.description || "No description provided"}
        actions={
          <div className="flex items-center gap-2">
            {user?.role === "admin" && (
              <>
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
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={deleteQuizBankMutation.isPending}
                >
                  Delete
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate("/quiz-banks")}
            >
              Back to Quiz Banks
            </Button>
          </div>
        }
      />

      {/* Quiz Bank Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              icon={FileQuestion}
              label="Total Questions"
              value={quizBank.question_count || 0}
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
            {user?.role === "admin" && (
              <Button
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsAddQuestionsModalOpen(true)}
              >
                Add Questions
              </Button>
            )}
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
              description={user?.role === "admin" ? "Add questions to this quiz bank to get started" : "This quiz bank has no questions yet"}
              actionLabel={user?.role === "admin" ? "Add Questions" : undefined}
              onAction={user?.role === "admin" ? () =>
                navigate(`/quiz-banks/${quizBankId}/add-questions`)
              : undefined}
            />
          ) : (
            <DataTable
              data={questions}
              columns={questionColumns}
              rowKey="question_id"
              emptyMessage="No questions found"
              paginated={true}
              onRowClick={(question) => {
                navigate(`/questions/${question.question_id}`);
              }}
            />
          )}
        </CardContent>
      </Card>

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

      {/* Add Questions Modal */}
      <AddQuestionsModal
        isOpen={isAddQuestionsModalOpen}
        onClose={() => setIsAddQuestionsModalOpen(false)}
        quizBankId={quizBankId}
        onSuccess={() => {
          setIsAddQuestionsModalOpen(false);
          refetchQuestions();
          refetchQuizBank();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Quiz Bank"
        message={`Are you sure you want to delete "${quizBank?.title}"? This action cannot be undone and will remove all questions from this quiz bank.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteQuizBankMutation.isPending}
      />
    </div>
  );
};

export default QuizBankDetails;
