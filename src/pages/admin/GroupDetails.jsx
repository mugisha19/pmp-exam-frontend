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
  Copy,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useGroup } from "@/hooks/queries/useGroupQueries";
import { useUser } from "@/hooks/queries/useUserQueries";
import * as groupService from "@/services/group.service";
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
  const [clickCount, setClickCount] = useState(0);

  // Frontend URL from environment variable
  const frontendUrl =
    import.meta.env.VITE_FRONTEND_URL || window.location.origin;

  // Fetch group details
  const { data: group, isLoading, isError, error } = useGroup(groupId);

  // Fetch creator information
  const { data: creator } = useUser(group?.created_by, {
    enabled: !!group?.created_by,
  });

  // Generate invite link mutation
  const generateInviteMutation = useMutation({
    mutationFn: () => groupService.generateInviteLink(groupId),
    onSuccess: (data) => {
      console.log("=== COPY INVITE LINK DEBUG ===");
      console.log("Backend response:", data);
      console.log("Frontend URL:", frontendUrl);
      console.log("Invite token from backend:", data.invite_token);

      // Backend returns invite_token, construct full URL with frontend base URL
      const inviteLink = `${frontendUrl}/join-group?token=${data.invite_token}`;
      console.log("Constructed full invite link:", inviteLink);
      console.log("Link length:", inviteLink.length);

      // Try to copy to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(inviteLink)
          .then(() => {
            console.log(
              "✅ Successfully copied to clipboard via navigator.clipboard"
            );
            console.log("Copied text:", inviteLink);
            toast.success("Invite link copied to clipboard!");
          })
          .catch((err) => {
            console.error("❌ Failed to copy via navigator.clipboard:", err);
            // Fallback method
            copyToClipboardFallback(inviteLink);
          });
      } else {
        console.warn("navigator.clipboard not available, using fallback");
        copyToClipboardFallback(inviteLink);
      }
    },
    onError: (error) => {
      console.error("Error generating invite link:", error);
      toast.error(error.message || "Failed to generate invite link");
    },
  });

  // Fallback clipboard copy method
  const copyToClipboardFallback = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      console.log("✅ Successfully copied via fallback method");
      console.log("Copied text:", text);
      toast.success("Invite link copied to clipboard!");
    } catch (err) {
      console.error("❌ Fallback copy also failed:", err);
      toast.error("Failed to copy link to clipboard");
    }

    document.body.removeChild(textArea);
  };

  // Handle copy invite link
  const handleCopyInviteLink = () => {
    setClickCount((prev) => prev + 1);
    console.log("🔵 Copy Invite Link button clicked! Count:", clickCount + 1);
    alert(`Button clicked ${clickCount + 1} times!`);
    generateInviteMutation.mutate();
  };

  // Debug: Log group data to see what's available
  if (group) {
    console.log("Group data:", group);
  }

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
          <div className="flex items-center gap-2">
            {isPrivateGroup && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Copy className="w-4 h-4" />}
                onClick={(e) => {
                  console.log("DIRECT ONCLICK FIRED!", e);
                  alert("Direct onClick working!");
                  handleCopyInviteLink();
                }}
                loading={generateInviteMutation.isPending}
              >
                {clickCount > 0 ? `Clicked ${clickCount}x` : "Copy Invite Link"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate("/admin/groups")}
            >
              Back to Groups
            </Button>
          </div>
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
                creator
                  ? `${creator.first_name} ${creator.last_name}`
                  : group.created_by_name ||
                    group.created_by_email ||
                    group.creator?.first_name ||
                    group.owner?.first_name ||
                    "Loading..."
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
              value={
                group.max_members ? (
                  <span>
                    <span className="text-gray-900 font-semibold">
                      {group.member_count || 0}
                    </span>
                    <span className="text-gray-700 font-medium">
                      {" "}
                      / {group.max_members}
                    </span>
                  </span>
                ) : (
                  <span className="text-gray-900 font-semibold">
                    {group.member_count || 0}
                  </span>
                )
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
    <div className="p-2 bg-blue-50 rounded-lg">
      <Icon className="w-4 h-4 text-blue-600" />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-700 mb-1">{label}</p>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  </div>
);

export default GroupDetails;
