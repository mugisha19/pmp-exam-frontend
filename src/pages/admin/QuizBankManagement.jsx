/**
 * Admin Quiz Bank Management Page
 * Manage quiz bank templates with questions
 */

import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  FileQuestion,
  Calendar,
  X,
  BookOpen,
  Send,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/stores/auth.store";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  useQuizBanks,
  useDeleteQuizBankMutation,
} from "@/hooks/queries/useQuizBankQueries";
import {
  CreateQuizBankModal,
  CreateQuizBankSelectionModal,
  MergeQuizBankModal,
} from "@/components/features/quiz-banks";
import { PublishQuizModal } from "@/components/features/quizzes/PublishQuizModal";

/**
 * Format date for display
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function QuizBankManagement() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Selection state
  const [selectedQuizBanks, setSelectedQuizBanks] = useState([]);

  // Modal states
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedQuizBank, setSelectedQuizBank] = useState(null);

  // Build query params
  const queryParams = useMemo(() => {
    const params = {
      skip: (page - 1) * pageSize,
      limit: pageSize,
    };

    if (searchQuery) params.search = searchQuery;

    return params;
  }, [searchQuery, page, pageSize]);

  // Fetch quiz banks
  const { data: quizBanksData, isLoading, refetch } = useQuizBanks(queryParams);
  const deleteQuizBankMutation = useDeleteQuizBankMutation();

  const quizBanks = useMemo(() => {
    return quizBanksData?.items || quizBanksData || [];
  }, [quizBanksData]);

  const totalCount = quizBanksData?.total || 0;

  // Selection handlers
  const handleSelectQuizBank = useCallback((quizBankId, isSelected) => {
    setSelectedQuizBanks((prev) =>
      isSelected
        ? [...prev, quizBankId]
        : prev.filter((id) => id !== quizBankId)
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedQuizBanks([]);
  }, []);

  const getSelectedQuizBank = useCallback(() => {
    if (selectedQuizBanks.length !== 1) return null;
    return quizBanks.find((qb) => qb.quiz_bank_id === selectedQuizBanks[0]);
  }, [selectedQuizBanks, quizBanks]);

  // CRUD handlers
  const handleCreateQuizBank = useCallback(() => {
    setIsSelectionModalOpen(true);
  }, []);

  const handleCreateNew = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleMerge = useCallback(() => {
    setIsMergeModalOpen(true);
  }, []);

  const handleEditQuizBank = useCallback((quizBank) => {
    navigate(`/quiz-banks/${quizBank.quiz_bank_id}`);
  }, [navigate]);

  const handlePublishQuizBank = useCallback((quizBank) => {
    setSelectedQuizBank(quizBank);
    setIsPublishModalOpen(true);
  }, []);

  const handleDeleteQuizBank = useCallback((quizBank) => {
    setSelectedQuizBank(quizBank);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedQuizBank) return;

    try {
      await deleteQuizBankMutation.mutateAsync(selectedQuizBank.quiz_bank_id);
      toast.success("Quiz bank deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedQuizBank(null);
      clearSelection();
      refetch();
    } catch (error) {
      const message =
        typeof error === "object"
          ? error.message || JSON.stringify(error)
          : error;
      toast.error(`Failed to delete quiz bank: ${message}`);
    }
  }, [selectedQuizBank, deleteQuizBankMutation, clearSelection, refetch]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedQuizBanks.length === 0) return;

    try {
      await Promise.all(
        selectedQuizBanks.map((quizBankId) =>
          deleteQuizBankMutation.mutateAsync(quizBankId)
        )
      );
      toast.success(
        `Deleted ${selectedQuizBanks.length} quiz bank(s) successfully`
      );
      clearSelection();
      refetch();
    } catch (error) {
      const message =
        typeof error === "object"
          ? error.message || JSON.stringify(error)
          : error;
      toast.error(`Failed to delete quiz banks: ${message}`);
    }
  }, [selectedQuizBanks, deleteQuizBankMutation, clearSelection, refetch]);

  const handleViewQuizBank = useCallback(
    (quizBank) => {
      navigate(`/quiz-banks/${quizBank.quiz_bank_id}`);
    },
    [navigate]
  );

  // Modal close handlers
  const handleCreateModalClose = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedQuizBank(null);
  }, []);

  // Success handlers for modals
  const handleCreateSuccess = useCallback(() => {
    setIsCreateModalOpen(false);
    refetch();
  }, [refetch]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        key: "title",
        header: "Quiz Bank Title",
        sortable: true,
        render: (_, quizBank) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{quizBank?.title}</span>
            {quizBank?.description && (
              <span className="text-sm text-gray-500 truncate max-w-md">
                {quizBank.description}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "question_count",
        header: "Questions",
        sortable: true,
        render: (_, quizBank) => (
          <div className="flex items-center gap-2">
            <FileQuestion className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{quizBank?.question_count || 0}</span>
          </div>
        ),
      },
      {
        key: "created_at",
        header: "Created",
        sortable: true,
        render: (_, quizBank) => (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatDate(quizBank?.created_at)}</span>
          </div>
        ),
      },
    ],
    []
  );

  // Filters UI
  const filtersUI = (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search quiz banks..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-9"
            size="sm"
          />
        </div>
      </div>
    </div>
  );

  // Selection actions bar
  const selectionBar = selectedQuizBanks.length > 0 && (
    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-600">
          {selectedQuizBanks.length} quiz bank
          {selectedQuizBanks.length !== 1 ? "s" : ""} selected
        </span>
        <button
          onClick={clearSelection}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Single selection actions */}
        {selectedQuizBanks.length === 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewQuizBank(getSelectedQuizBank())}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditQuizBank(getSelectedQuizBank())}
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handlePublishQuizBank(getSelectedQuizBank())}
              disabled={!getSelectedQuizBank()?.question_count || getSelectedQuizBank()?.question_count === 0}
            >
              <Send className="w-4 h-4 mr-1" />
              Publish
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteQuizBank(getSelectedQuizBank())}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </>
        )}

        {/* Bulk delete action */}
        {selectedQuizBanks.length > 1 && (
          <Button variant="danger" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete ({selectedQuizBanks.length})
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <PageHeader
        title="Quiz Bank Management"
        subtitle="Manage quiz bank templates and their questions"
        actions={
          (user?.role === "admin" || user?.role === "instructor") && (
            <Button onClick={handleCreateQuizBank}>
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz Bank
            </Button>
          )
        }
      />

      {filtersUI}

      {selectionBar}

      <DataTable
        data={quizBanks}
        columns={columns}
        loading={isLoading}
        rowKey="quiz_bank_id"
        paginated={true}
        pageSize={pageSize}
        currentPage={page}
        totalPages={Math.ceil(totalCount / pageSize)}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        emptyMessage="No quiz banks found"
        onRowClick={(quizBank) => {
          navigate(`/quiz-banks/${quizBank.quiz_bank_id}`);
        }}
      />

      {/* Create Quiz Bank Selection Modal */}
      <CreateQuizBankSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onCreateNew={handleCreateNew}
        onMerge={handleMerge}
      />

      {/* Create Quiz Bank Modal */}
      <CreateQuizBankModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        onSuccess={handleCreateSuccess}
      />

      {/* Merge Quiz Banks Modal */}
      <MergeQuizBankModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Publish Quiz Modal */}
      <PublishQuizModal
        isOpen={isPublishModalOpen}
        onClose={() => {
          setIsPublishModalOpen(false);
          setSelectedQuizBank(null);
        }}
        quizBank={selectedQuizBank}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedQuizBank(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Quiz Bank"
        message={`Are you sure you want to delete "${selectedQuizBank?.title}"? This action cannot be undone and will remove all questions from this quiz bank.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={deleteQuizBankMutation.isPending}
      />
    </div>
  );
}
