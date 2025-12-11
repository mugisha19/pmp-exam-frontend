/**
 * Group Members Tab Component
 * Displays and manages group members
 */

import { useState, useEffect } from "react";
import { UserMinus, Users } from "lucide-react";
import {
  useGroupMembers,
  useRemoveMemberMutation,
} from "@/hooks/queries/useGroupQueries";
import { DataTable } from "@/components/shared/DataTable";
import { UserCell } from "@/components/shared/UserCell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/Card";

/**
 * Format date for display
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "Unknown";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Get role badge variant
 */
const getRoleBadgeVariant = (role) => {
  const roleMap = {
    admin: "primary",
    instructor: "info",
    member: "default",
    owner: "success",
  };
  return roleMap[role?.toLowerCase()] || "default";
};

export const GroupMembersTab = ({ groupId }) => {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Fetch group members
  const { data: membersData, isLoading, refetch, isError, error } = useGroupMembers(groupId);

  // Refetch data when tab becomes active
  useEffect(() => {
    if (groupId) {
      refetch();
    }
  }, [groupId, refetch]);

  // Remove mutation
  const removeMemberMutation = useRemoveMemberMutation();

  // Extract members array - handle different response structures
  const members = Array.isArray(membersData) 
    ? membersData 
    : membersData?.items || membersData?.members || [];

  // Debug logging
  useEffect(() => {
    console.log('GroupMembersTab - Raw data:', membersData);
    console.log('GroupMembersTab - Extracted members:', members);
    console.log('GroupMembersTab - Loading:', isLoading);
    console.log('GroupMembersTab - Error:', error);
  }, [membersData, members, isLoading, error]);

  // Handle remove
  const handleRemove = (member) => {
    setSelectedMember(member);
    setRemoveDialogOpen(true);
  };

  const confirmRemove = async () => {
    if (selectedMember) {
      await removeMemberMutation.mutateAsync({
        groupId,
        userId: selectedMember.user_id || selectedMember.id,
      });
      setRemoveDialogOpen(false);
      setSelectedMember(null);
    }
  };

  // Table columns
  const columns = [
    {
      key: "user",
      header: "Member",
      render: (_, member) => (
        <UserCell 
          user={{
            first_name: member.first_name,
            last_name: member.last_name,
            email: member.email,
            user_id: member.user_id,
          }} 
          showEmail 
        />
      ),
    },
    {
      key: "role",
      header: "Role in Group",
      render: (_, member) => (
        <Badge
          variant={getRoleBadgeVariant(member.group_role || member.role)}
          size="sm"
        >
          {(member.group_role || member.role || "member")
            .charAt(0)
            .toUpperCase() +
            (member.group_role || member.role || "member").slice(1)}
        </Badge>
      ),
    },
    {
      key: "joined_at",
      header: "Joined Date",
      render: (_, member) => (
        <span className="text-sm text-gray-400">
          {formatDate(member.joined_at || member.created_at)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      sortable: false,
      render: (_, member) => {
        // Don't allow removing owner/admin
        const isOwner =
          member.group_role === "owner" || member.role === "owner";
        if (isOwner) return null;

        return (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<UserMinus className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleRemove(member);
            }}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            Remove
          </Button>
        );
      },
    },
  ];

  if (!isLoading && members.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={Users}
          title="No members yet"
          description="This group doesn't have any members yet."
        />
      </Card>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={members}
        loading={isLoading}
        emptyMessage="No members"
        emptyDescription="This group doesn't have any members yet."
        emptyIcon={Users}
        paginated={true}
        pageSize={10}
        sortable={true}
      />

      {/* Remove Confirmation */}
      <ConfirmDialog
        isOpen={removeDialogOpen}
        onClose={() => {
          setRemoveDialogOpen(false);
          setSelectedMember(null);
        }}
        onConfirm={confirmRemove}
        title="Remove Member"
        message={`Are you sure you want to remove ${
          selectedMember?.first_name ||
          selectedMember?.email?.split("@")[0] ||
          "this member"
        } from this group?`}
        confirmText="Remove"
        variant="danger"
        loading={removeMemberMutation.isPending}
      />
    </>
  );
};

export default GroupMembersTab;
