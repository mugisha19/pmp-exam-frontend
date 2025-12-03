/**
 * View Members Modal
 * Modal to view group members with search and role filtering
 */

import { useState, useMemo } from "react";
import { Users, Search, UserMinus, Crown, Shield, User } from "lucide-react";
import {
  useGroupMembers,
  useRemoveMemberMutation,
} from "@/hooks/queries/useGroupQueries";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

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
 * Get role icon
 */
const getRoleIcon = (role) => {
  const roleIcons = {
    owner: Crown,
    admin: Shield,
    instructor: Shield,
    member: User,
  };
  return roleIcons[role?.toLowerCase()] || User;
};

/**
 * Get role badge variant
 */
const getRoleBadgeVariant = (role) => {
  const roleMap = {
    owner: "success",
    admin: "primary",
    instructor: "info",
    member: "secondary",
  };
  return roleMap[role?.toLowerCase()] || "secondary";
};

export const ViewMembersModal = ({ isOpen, onClose, group }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Fetch group members
  const {
    data: membersData,
    isLoading,
    refetch,
  } = useGroupMembers(group?.group_id, {
    enabled: isOpen && !!group?.group_id,
  });

  // Remove mutation
  const removeMemberMutation = useRemoveMemberMutation();

  // Extract members array - handle various response formats
  const members = useMemo(() => {
    if (!membersData) return [];
    if (Array.isArray(membersData)) return membersData;
    if (Array.isArray(membersData?.items)) return membersData.items;
    if (Array.isArray(membersData?.members)) return membersData.members;
    if (Array.isArray(membersData?.data)) return membersData.data;
    return [];
  }, [membersData]);

  // Filter members by search
  const filteredMembers = useMemo(() => {
    if (!Array.isArray(members)) return [];
    if (!searchQuery.trim()) return members;

    const query = searchQuery.toLowerCase();
    return members.filter((member) => {
      const user = member.user || member;
      const fullName = `${user.first_name || ""} ${
        user.last_name || ""
      }`.toLowerCase();
      const email = (user.email || "").toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
  }, [members, searchQuery]);

  // Handle remove member
  const handleRemove = (member) => {
    setSelectedMember(member);
    setRemoveDialogOpen(true);
  };

  const confirmRemove = async () => {
    if (selectedMember && group) {
      try {
        await removeMemberMutation.mutateAsync({
          groupId: group.group_id,
          userId:
            selectedMember.user_id ||
            selectedMember.user?.user_id ||
            selectedMember.id,
        });
        setRemoveDialogOpen(false);
        setSelectedMember(null);
        refetch();
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  // Reset state when modal closes
  const handleClose = () => {
    setSearchQuery("");
    setSelectedMember(null);
    setRemoveDialogOpen(false);
    onClose();
  };

  if (!group) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Group Members"
        size="lg"
      >
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search members by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Member Count */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {filteredMembers.length} member
              {filteredMembers.length !== 1 ? "s" : ""}
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
            <span className="text-gray-500">Total: {members.length}</span>
          </div>

          {/* Members List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchQuery
                    ? "No members match your search"
                    : "No members in this group"}
                </p>
              </div>
            ) : (
              filteredMembers.map((member) => {
                const user = member.user || member;
                const role = member.group_role || member.role || "member";
                const isOwner = role.toLowerCase() === "owner";
                const RoleIcon = getRoleIcon(role);

                return (
                  <div
                    key={member.user_id || member.id || user.user_id || user.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* Member Info */}
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={user.avatar_url || user.profile_picture}
                        alt={`${user.first_name} ${user.last_name}`}
                        size="md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </span>
                          <Badge variant={getRoleBadgeVariant(role)} size="sm">
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Joined{" "}
                          {formatDate(member.joined_at || member.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Remove Button */}
                    {!isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(member)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Remove Confirmation Dialog */}
      <ConfirmDialog
        isOpen={removeDialogOpen}
        onClose={() => {
          setRemoveDialogOpen(false);
          setSelectedMember(null);
        }}
        onConfirm={confirmRemove}
        title="Remove Member"
        message={`Are you sure you want to remove ${
          selectedMember?.user?.first_name ||
          selectedMember?.first_name ||
          "this member"
        } from "${group.name}"? This action cannot be undone.`}
        confirmText="Remove"
        confirmVariant="danger"
        isLoading={removeMemberMutation.isPending}
      />
    </>
  );
};

export default ViewMembersModal;
