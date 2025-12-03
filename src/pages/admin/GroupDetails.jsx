/**
 * Admin Group Details Page
 * View detailed group information with tabs for members, quizzes, and join requests
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  FileQuestion,
  UserPlus,
  Calendar,
  Clock,
  Globe,
  Lock,
  User,
} from "lucide-react";
import { useGroup } from "@/hooks/queries/useGroupQueries";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { GroupMembersTab } from "@/components/features/groups/GroupMembersTab";
import { GroupQuizzesTab } from "@/components/features/groups/GroupQuizzesTab";
import { JoinRequestsTab } from "@/components/features/groups/JoinRequestsTab";

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

export const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("members");

  // Fetch group details
  const { data: group, isLoading, isError, error } = useGroup(groupId);

  // Check if group is private (for showing join requests tab)
  const isPrivateGroup =
    group?.group_type === "private" || group?.type === "private";

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton width={40} height={40} className="rounded-lg" />
          <div className="space-y-2">
            <Skeleton width={200} height={28} />
            <Skeleton width={150} height={16} />
          </div>
        </div>
        <Skeleton height={200} className="rounded-xl" />
        <Skeleton height={400} className="rounded-xl" />
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
          onClick={() => navigate("/admin/groups")}
        >
          Back to Groups
        </Button>
        <EmptyState
          icon={Users}
          title="Failed to load group"
          description={
            error?.message ||
            "An error occurred while loading the group details."
          }
          actionLabel="Go Back"
          onAction={() => navigate("/admin/groups")}
        />
      </div>
    );
  }

  // Not found state
  if (!group) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate("/admin/groups")}
        >
          Back to Groups
        </Button>
        <EmptyState
          icon={Users}
          title="Group not found"
          description="The group you're looking for doesn't exist or has been deleted."
          actionLabel="Go Back"
          onAction={() => navigate("/admin/groups")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Back Button */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>{group.name}</span>
            <StatusBadge status={group.status || "active"} size="md" />
          </div>
        }
        subtitle={group.description || "No description provided"}
        actions={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate("/admin/groups")}
          >
            Back to Groups
          </Button>
        }
      />

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

            {/* Created By */}
            <InfoItem
              icon={User}
              label="Created By"
              value={
                group.created_by_name ||
                group.creator?.first_name ||
                group.owner?.first_name ||
                "Unknown"
              }
            />

            {/* Created At */}
            <InfoItem
              icon={Calendar}
              label="Created At"
              value={formatDateTime(group.created_at)}
            />

            {/* Start Date */}
            <InfoItem
              icon={Calendar}
              label="Start Date"
              value={formatDate(group.start_date)}
            />

            {/* End Date */}
            <InfoItem
              icon={Calendar}
              label="End Date"
              value={formatDate(group.end_date)}
            />

            {/* Member Count */}
            <InfoItem
              icon={Users}
              label="Members"
              value={
                <span>
                  <span className="text-gray-900 font-medium">
                    {group.member_count || 0}
                  </span>
                  <span className="text-gray-500">
                    {" "}
                    / {group.max_members || "∞"}
                  </span>
                </span>
              }
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {({ value, onValueChange }) => (
          <>
            <TabsList>
              <TabsTrigger
                value="members"
                activeValue={value}
                onValueChange={onValueChange}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Members
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="quizzes"
                activeValue={value}
                onValueChange={onValueChange}
              >
                <div className="flex items-center gap-2">
                  <FileQuestion className="w-4 h-4" />
                  Quizzes
                </div>
              </TabsTrigger>
              {isPrivateGroup && (
                <TabsTrigger
                  value="requests"
                  activeValue={value}
                  onValueChange={onValueChange}
                >
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Join Requests
                  </div>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="members" activeValue={value}>
              <GroupMembersTab groupId={groupId} />
            </TabsContent>

            <TabsContent value="quizzes" activeValue={value}>
              <GroupQuizzesTab groupId={groupId} />
            </TabsContent>

            {isPrivateGroup && (
              <TabsContent value="requests" activeValue={value}>
                <JoinRequestsTab groupId={groupId} />
              </TabsContent>
            )}
          </>
        )}
      </Tabs>
    </div>
  );
};

/**
 * Info Item Component
 */
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-gray-100 rounded-lg">
      <Icon className="w-4 h-4 text-gray-500" />
    </div>
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="text-sm text-gray-700">{value}</div>
    </div>
  </div>
);

export default GroupDetails;
