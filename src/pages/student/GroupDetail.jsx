/**
 * Student Group Details Page
 * View detailed group information and quizzes
 */

import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  FileQuestion,
  Globe,
  Lock,
} from "lucide-react";
import { useGroup, useGroupQuizzes } from "@/hooks/queries/useGroupQueries";
import StudentLayout from "@/components/layouts/StudentLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Format date for display
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "Not set";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Format date with time
 */
const formatDateTime = (dateStr) => {
  if (!dateStr) return "Unknown";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  // Fetch group details
  const { data: group, isLoading, isError, error } = useGroup(groupId);

  // Fetch group quizzes
  const { data: quizzes, isLoading: quizzesLoading } = useGroupQuizzes(groupId);

  const isPrivateGroup =
    group?.group_type === "private" || group?.type === "private";

  // Loading state
  if (isLoading) {
    return (
      <StudentLayout title="Loading...">
        <div className="space-y-6">
          <Skeleton height={40} className="w-48" />
          <Skeleton height={200} className="rounded-xl" />
          <Skeleton height={400} className="rounded-xl" />
        </div>
      </StudentLayout>
    );
  }

  // Error state
  if (isError || !group) {
    return (
      <StudentLayout title="Group Not Found">
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate("/student/groups")}
          >
            Back to My Groups
          </Button>
          <EmptyState
            icon={Users}
            title="Group not found"
            description={
              error?.message ||
              "This group doesn't exist or you don't have access to it."
            }
            actionLabel="Go Back"
            onAction={() => navigate("/student/groups")}
          />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout
      title={group.name}
      subtitle={group.description || "No description provided"}
      actions={
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate("/student/groups")}
        >
          Back to My Groups
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Group Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Type */}
              <InfoItem
                icon={isPrivateGroup ? Lock : Globe}
                label="Type"
                value={
                  <Badge
                    variant={isPrivateGroup ? "warning" : "success"}
                    size="sm"
                  >
                    {isPrivateGroup ? "Private" : "Public"}
                  </Badge>
                }
              />

              {/* Status */}
              <InfoItem
                icon={Clock}
                label="Status"
                value={
                  <StatusBadge status={group.status || "active"} size="sm" />
                }
              />

              {/* Start Date */}
              <InfoItem
                icon={Calendar}
                label="Start Date"
                value={formatDate(group.from_date || group.start_date)}
              />

              {/* End Date */}
              <InfoItem
                icon={Calendar}
                label="End Date"
                value={formatDate(group.to_date || group.end_date)}
              />

              {/* Member Count */}
              <InfoItem
                icon={Users}
                label="Members"
                value={group.member_count || 0}
              />

              {/* Quiz Count */}
              <InfoItem
                icon={FileQuestion}
                label="Quizzes"
                value={group.quiz_count || 0}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quizzes Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Group Quizzes
            </h3>

            {quizzesLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height={80} />
                ))}
              </div>
            )}

            {!quizzesLoading && (!quizzes || quizzes.length === 0) && (
              <EmptyState
                icon={FileQuestion}
                title="No quizzes available"
                description="There are no quizzes assigned to this group yet."
                size="sm"
              />
            )}

            {!quizzesLoading && quizzes && quizzes.length > 0 && (
              <div className="space-y-3">
                {quizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.quiz_id}
                    quiz={quiz}
                    onClick={() => navigate(`/student/quizzes/${quiz.quiz_id}`)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
};

/**
 * Info Item Component
 */
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-blue-50 rounded-lg">
      <Icon className="w-4 h-4 text-blue-600" />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-700 mb-1">{label}</p>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  </div>
);

/**
 * Quiz Card Component
 */
const QuizCard = ({ quiz, onClick }) => {
  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{quiz.title}</h4>
          {quiz.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {quiz.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {quiz.duration_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {quiz.duration_minutes} min
              </span>
            )}
            {quiz.total_questions && (
              <span className="flex items-center gap-1">
                <FileQuestion className="w-3 h-3" />
                {quiz.total_questions} questions
              </span>
            )}
            {quiz.scheduled_at && (
              <span>Scheduled: {formatDateTime(quiz.scheduled_at)}</span>
            )}
          </div>
        </div>
        {quiz.status && <StatusBadge status={quiz.status} size="sm" />}
      </div>
    </div>
  );
};

export default GroupDetail;
