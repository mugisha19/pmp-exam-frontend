/**
 * Admin Group Details Page
 * View detailed group information with tabs for members, quizzes, and join requests
 */

import { useState, useRef, useEffect } from "react";
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
  PlayCircle,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth.store";
import { useGroup } from "@/hooks/queries/useGroupQueries";
import { useUser } from "@/hooks/queries/useUserQueries";
import * as groupService from "@/services/group.service";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
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
import { AddMemberModal } from "@/components/features/groups/AddMemberModal";

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
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("members");
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [statusDialog, setStatusDialog] = useState({ isOpen: false, status: null });
  const statusDropdownRef = useRef(null);

  // Frontend URL from environment variable
  const frontendUrl =
    import.meta.env.VITE_FRONTEND_URL || window.location.origin;

  // Fetch group details
  const { data: group, isLoading, isError, error, refetch: refetchGroup } = useGroup(groupId);

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: ({ status }) => groupService.updateGroup(groupId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["group", groupId]);
      queryClient.invalidateQueries(["groups"]);
      toast.success("Group status updated successfully");
      setStatusDialog({ isOpen: false, status: null });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update group status");
      setStatusDialog({ isOpen: false, status: null });
    },
  });

  // Close dropdown on click outside
  useEffect(() => {
    if (!isStatusDropdownOpen) return;

    const handleClickOutside = (event) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setIsStatusDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isStatusDropdownOpen]);

  const handleStatusSelect = (newStatus) => {
    setIsStatusDropdownOpen(false);
    if (newStatus !== group?.status) {
      setStatusDialog({ isOpen: true, status: newStatus });
    }
  };

  const confirmStatusChange = () => {
    statusMutation.mutate({ status: statusDialog.status });
  };

  const statusOptions = [
    {
      value: "active",
      label: "Active",
      icon: PlayCircle,
      description: "Group is active and members can access quizzes and resources.",
    },
    {
      value: "disabled",
      label: "Disabled",
      icon: XCircle,
      description: "Group is disabled. Members cannot access quizzes or join the group.",
    },
  ];

  // Fetch creator information
  const { data: creator } = useUser(group?.created_by, {
    enabled: !!group?.created_by,
  });

  // Generate invite link mutation
  const generateInviteMutation = useMutation({
    mutationFn: () => groupService.generateInviteLink(groupId),
    onSuccess: async (data) => {
      // Backend returns invite_token, construct full URL with frontend base URL
      const inviteLink = `${frontendUrl}/join-group?token=${data.invite_token}`;

      let copied = false;

      // Try to copy to clipboard using modern API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(inviteLink);
          copied = true;
        } catch (err) {
          // Fallback to execCommand if clipboard API fails
        }
      }

      // Fallback method if clipboard API not available or failed
      if (!copied) {
        const textArea = document.createElement("textarea");
        textArea.value = inviteLink;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          copied = document.execCommand("copy");
        } catch (err) {
          copied = false;
        }

        document.body.removeChild(textArea);
      }

      // Show success toast only once
      if (copied) {
        toast.success("Invite link copied to clipboard!");
      } else {
        toast.error("Failed to copy link to clipboard");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate invite link");
    },
  });

  // Handle copy invite link
  const handleCopyInviteLink = () => {
    if (!generateInviteMutation.isPending) {
      generateInviteMutation.mutate();
    }
  };

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
          onClick={() => navigate("/groups")}
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
          onAction={() => navigate("/groups")}
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
          onClick={() => navigate("/groups")}
        >
          Back to Groups
        </Button>
        <EmptyState
          icon={Users}
          title="Group not found"
          description="The group you're looking for doesn't exist or has been deleted."
          actionLabel="Go Back"
          onAction={() => navigate("/groups")}
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
        subtitle={group.description ? (group.description.length > 100 ? `${group.description.substring(0, 100)}...` : group.description) : "No description provided"}
        actions={
          <div className="flex items-center gap-2">
            {user?.role === "admin" && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<UserPlus className="w-4 h-4" />}
                  onClick={() => setIsAddMemberModalOpen(true)}
                >
                  Add Member
                </Button>
                {isPrivateGroup && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Copy className="w-4 h-4" />}
                    onClick={handleCopyInviteLink}
                    loading={generateInviteMutation.isPending}
                  >
                    Copy Invite Link
                  </Button>
                )}
                <div className="relative inline-block" ref={statusDropdownRef}>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={statusMutation.isPending}
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  >
                    Mark as
                    <ChevronDown
                      className={`w-4 h-4 ml-2 transition-transform ${
                        isStatusDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                  {isStatusDropdownOpen && (
                    <div className="absolute right-0 z-50 mt-1.5 min-w-[300px] bg-white rounded-lg shadow-lg border border-gray-200/80 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      {statusOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleStatusSelect(option.value)}
                            disabled={
                              group.status === option.value ||
                              statusMutation.isPending
                            }
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left text-sm transition-colors ${
                              group.status === option.value ||
                              statusMutation.isPending
                                ? "text-gray-400 cursor-not-allowed opacity-50"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {Icon && (
                              <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex flex-col flex-1">
                              <span className="font-medium">{option.label}</span>
                              <span className="text-xs text-gray-500 mt-0.5">
                                {option.description}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate("/groups")}
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
        <TabsList>
          <TabsTrigger value="members">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Members
            </div>
          </TabsTrigger>
          <TabsTrigger value="quizzes">
            <div className="flex items-center gap-2">
              <FileQuestion className="w-4 h-4" />
              Quizzes
            </div>
          </TabsTrigger>
          {user?.role === "admin" && isPrivateGroup && (
            <TabsTrigger value="requests">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Join Requests
              </div>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members">
          <GroupMembersTab groupId={groupId} />
        </TabsContent>

        <TabsContent value="quizzes">
          <GroupQuizzesTab groupId={groupId} />
        </TabsContent>

        {isPrivateGroup && (
          <TabsContent value="requests">
            <JoinRequestsTab groupId={groupId} />
          </TabsContent>
        )}
      </Tabs>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        group={group}
        onSuccess={() => {
          setIsAddMemberModalOpen(false);
          refetchGroup();
        }}
      />

      {/* Status Change Confirmation */}
      <ConfirmDialog
        isOpen={statusDialog.isOpen}
        onClose={() => {
          setStatusDialog({ isOpen: false, status: null });
        }}
        onConfirm={confirmStatusChange}
        title="Change Group Status"
        message={
          <>
            Are you sure you want to change the group status to{" "}
            <strong>"{statusDialog.status}"</strong>?
            {statusDialog.status && (
              <>
                <br />
                <span className="text-sm text-gray-600 mt-2 block">
                  {statusOptions.find((opt) => opt.value === statusDialog.status)
                    ?.description || ""}
                </span>
              </>
            )}
          </>
        }
        confirmText="Change Status"
        variant="info"
        loading={statusMutation.isPending}
      />
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
