/**
 * Group Quizzes Tab Component
 * Displays quizzes assigned to a group
 */

import { useState, useEffect } from "react";
import { FileQuestion, Plus, Search } from "lucide-react";
import { useGroupQuizzes } from "@/hooks/queries/useGroupQueries";
import { useQuizBanks } from "@/hooks/queries/useQuizBankQueries";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/Card";
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

/**
 * Format date range
 */
const formatDateRange = (startDate, endDate) => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/**
 * Get mode badge variant
 */
const getModeBadgeVariant = (mode) => {
  const modeMap = {
    practice: "info",
    timed: "warning",
    exam: "error",
    study: "success",
  };
  return modeMap[mode?.toLowerCase()] || "default";
};

export const GroupQuizzesTab = ({ groupId }) => {
  const [isSelectQuizBankOpen, setIsSelectQuizBankOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedQuizBank, setSelectedQuizBank] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch group quizzes
  const { data: quizzesData, isLoading, refetch, isError, error } = useGroupQuizzes(groupId);

  // Fetch quiz banks for selection
  const { data: quizBanksData, isLoading: quizBanksLoading } = useQuizBanks(
    { search: searchQuery },
    { enabled: isSelectQuizBankOpen }
  );

  // Refetch data when tab becomes active
  useEffect(() => {
    if (groupId) {
      refetch();
    }
  }, [groupId, refetch]);

  // Extract quizzes array - handle different response structures
  const quizzes = Array.isArray(quizzesData)
    ? quizzesData
    : quizzesData?.items || quizzesData?.quizzes || [];
  const quizBanks = quizBanksData?.items || quizBanksData || [];

  // Debug logging
  useEffect(() => {
    console.log('GroupQuizzesTab - Raw data:', quizzesData);
    console.log('GroupQuizzesTab - Extracted quizzes:', quizzes);
    console.log('GroupQuizzesTab - Loading:', isLoading);
    console.log('GroupQuizzesTab - Error:', error);
  }, [quizzesData, quizzes, isLoading, error]);

  // Handle quiz bank selection
  const handleSelectQuizBank = (quizBank) => {
    setSelectedQuizBank(quizBank);
    setIsSelectQuizBankOpen(false);
    setIsPublishModalOpen(true);
  };

  // Table columns
  const columns = [
    {
      key: "title",
      header: "Quiz Title",
      render: (_, quiz) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <FileQuestion className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {quiz.title || quiz.name || "Untitled Quiz"}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-[200px]">
              {quiz.description || "No description"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "mode",
      header: "Mode",
      render: (_, quiz) => (
        <Badge variant={getModeBadgeVariant(quiz.mode)} size="sm">
          {(quiz.mode || "practice").charAt(0).toUpperCase() +
            (quiz.mode || "practice").slice(1)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, quiz) => (
        <StatusBadge status={quiz.status || "draft"} size="sm" />
      ),
    },
    {
      key: "attempts",
      header: "Attempts",
      render: (_, quiz) => (
        <span className="text-sm text-gray-300">
          {quiz.attempt_count || quiz.attempts || 0}
        </span>
      ),
    },
    {
      key: "dates",
      header: "Available Dates",
      render: (_, quiz) => (
        <span className="text-sm text-gray-400">
          {formatDateRange(
            quiz.start_date || quiz.available_from,
            quiz.end_date || quiz.available_until
          )}
        </span>
      ),
    },
  ];

  if (!isLoading && quizzes.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsSelectQuizBankOpen(true)}
          >
            Publish Quiz to Group
          </Button>
        </div>
        <EmptyState
          icon={FileQuestion}
          title="No quizzes yet"
          description="No quizzes have been assigned to this group."
          actionLabel="Publish Quiz"
          onAction={() => setIsSelectQuizBankOpen(true)}
        />

        {/* Quiz Bank Selection Modal */}
        <Modal
          isOpen={isSelectQuizBankOpen}
          onClose={() => {
            setIsSelectQuizBankOpen(false);
            setSearchQuery("");
          }}
          title="Select Quiz Bank to Publish"
          size="lg"
        >
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search quiz banks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {quizBanksLoading ? (
                <p className="text-center text-gray-500 py-4">Loading quiz banks...</p>
              ) : quizBanks.length === 0 ? (
                <EmptyState
                  icon={FileQuestion}
                  title="No quiz banks found"
                  description="Create a quiz bank first before publishing."
                />
              ) : (
                quizBanks.map((bank) => (
                  <button
                    key={bank.quiz_bank_id}
                    onClick={() => handleSelectQuizBank(bank)}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                    disabled={!bank.question_count || bank.question_count === 0}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{bank.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{bank.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {bank.question_count || 0} questions
                        </p>
                      </div>
                      {(!bank.question_count || bank.question_count === 0) && (
                        <Badge variant="warning" size="sm">No Questions</Badge>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setIsSelectQuizBankOpen(false);
                setSearchQuery("");
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>

        {/* Publish Quiz Modal */}
        <PublishQuizModal
          isOpen={isPublishModalOpen}
          onClose={() => {
            setIsPublishModalOpen(false);
            setSelectedQuizBank(null);
          }}
          quizBank={selectedQuizBank}
          preselectedGroupId={groupId}
        />
      </Card>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsSelectQuizBankOpen(true)}
        >
          Publish Quiz to Group
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={quizzes}
        loading={isLoading}
        emptyMessage="No quizzes"
        emptyDescription="No quizzes have been assigned to this group."
        emptyIcon={FileQuestion}
        paginated={true}
        pageSize={10}
        sortable={true}
      />

      {/* Quiz Bank Selection Modal */}
      <Modal
        isOpen={isSelectQuizBankOpen}
        onClose={() => {
          setIsSelectQuizBankOpen(false);
          setSearchQuery("");
        }}
        title="Select Quiz Bank to Publish"
        size="lg"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search quiz banks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {quizBanksLoading ? (
              <p className="text-center text-gray-500 py-4">Loading quiz banks...</p>
            ) : quizBanks.length === 0 ? (
              <EmptyState
                icon={FileQuestion}
                title="No quiz banks found"
                description="Create a quiz bank first before publishing."
              />
            ) : (
              quizBanks.map((bank) => (
                <button
                  key={bank.quiz_bank_id}
                  onClick={() => handleSelectQuizBank(bank)}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  disabled={!bank.question_count || bank.question_count === 0}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{bank.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{bank.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {bank.question_count || 0} questions
                      </p>
                    </div>
                    {(!bank.question_count || bank.question_count === 0) && (
                      <Badge variant="warning" size="sm">No Questions</Badge>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => {
              setIsSelectQuizBankOpen(false);
              setSearchQuery("");
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Publish Quiz Modal */}
      <PublishQuizModal
        isOpen={isPublishModalOpen}
        onClose={() => {
          setIsPublishModalOpen(false);
          setSelectedQuizBank(null);
        }}
        quizBank={selectedQuizBank}
        preselectedGroupId={groupId}
      />
    </>
  );
};

export default GroupQuizzesTab;
