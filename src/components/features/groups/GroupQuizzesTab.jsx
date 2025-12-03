/**
 * Group Quizzes Tab Component
 * Displays quizzes assigned to a group
 */

import { FileQuestion } from "lucide-react";
import { useGroupQuizzes } from "@/hooks/queries/useGroupQueries";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/Card";

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
  // Fetch group quizzes
  const { data: quizzesData, isLoading } = useGroupQuizzes(groupId);

  // Extract quizzes array
  const quizzes = quizzesData?.items || quizzesData || [];

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
        <EmptyState
          icon={FileQuestion}
          title="No quizzes yet"
          description="No quizzes have been assigned to this group."
        />
      </Card>
    );
  }

  return (
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
  );
};

export default GroupQuizzesTab;
