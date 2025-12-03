import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  Edit2,
  Trash2,
  UserPlus,
  Link,
  Eye,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/shared/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  CreateGroupModal,
  EditGroupModal,
  AddMemberModal,
  ViewMembersModal,
} from "@/components/features/groups";
import {
  useGroups,
  useDeleteGroupMutation,
} from "@/hooks/queries/useGroupQueries";

const GROUP_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
];

export default function GroupManagement() {
  const navigate = useNavigate();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [groupType, setGroupType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Selection state
  const [selectedGroups, setSelectedGroups] = useState([]);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isViewMembersModalOpen, setIsViewMembersModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Build query params
  const queryParams = useMemo(() => {
    const params = {
      skip: (page - 1) * pageSize,
      limit: pageSize,
    };

    if (searchQuery) params.search = searchQuery;
    if (groupType) params.group_type = groupType;
    if (status) params.status = status;

    return params;
  }, [searchQuery, groupType, status, page, pageSize]);

  // Fetch groups
  const { data: groupsData, isLoading, refetch } = useGroups(queryParams);
  const deleteGroupMutation = useDeleteGroupMutation();

  const groups = useMemo(() => {
    return groupsData?.groups || groupsData?.items || groupsData || [];
  }, [groupsData]);

  // Selection handlers
  const handleSelectGroup = useCallback((groupId, isSelected) => {
    setSelectedGroups((prev) =>
      isSelected ? [...prev, groupId] : prev.filter((id) => id !== groupId)
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedGroups([]);
  }, []);

  // Get selected group object(s)
  const getSelectedGroup = useCallback(() => {
    if (selectedGroups.length === 1) {
      return groups.find((g) => g.group_id === selectedGroups[0]);
    }
    return null;
  }, [selectedGroups, groups]);

  // Action handlers
  const handleCreateGroup = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleEditGroup = useCallback((group) => {
    setSelectedGroup(group);
    setIsEditModalOpen(true);
  }, []);

  const handleAddMember = useCallback((group) => {
    setSelectedGroup(group);
    setIsAddMemberModalOpen(true);
  }, []);

  const handleViewMembers = useCallback((group) => {
    setSelectedGroup(group);
    setIsViewMembersModalOpen(true);
  }, []);

  const handleDeleteGroup = useCallback((group) => {
    setSelectedGroup(group);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedGroup) return;

    try {
      await deleteGroupMutation.mutateAsync(selectedGroup.group_id);
      toast.success("Group deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedGroup(null);
      clearSelection();
      refetch();
    } catch (error) {
      const message =
        typeof error === "object"
          ? error.message || JSON.stringify(error)
          : error;
      toast.error(`Failed to delete group: ${message}`);
    }
  }, [selectedGroup, deleteGroupMutation, clearSelection, refetch]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedGroups.length === 0) return;

    try {
      await Promise.all(
        selectedGroups.map((groupId) =>
          deleteGroupMutation.mutateAsync(groupId)
        )
      );
      toast.success(`Deleted ${selectedGroups.length} group(s) successfully`);
      clearSelection();
      refetch();
    } catch (error) {
      const message =
        typeof error === "object"
          ? error.message || JSON.stringify(error)
          : error;
      toast.error(`Failed to delete groups: ${message}`);
    }
  }, [selectedGroups, deleteGroupMutation, clearSelection, refetch]);

  const handleViewGroup = useCallback(
    (group) => {
      navigate(`/admin/groups/${group.group_id}`);
    },
    [navigate]
  );

  const handleCopyInviteLink = useCallback((group) => {
    if (group.invite_link) {
      navigator.clipboard.writeText(group.invite_link);
      toast.success("Invite link copied to clipboard");
    } else {
      toast.error("No invite link available for this group");
    }
  }, []);

  // Modal close handlers
  const handleCreateModalClose = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedGroup(null);
  }, []);

  const handleAddMemberModalClose = useCallback(() => {
    setIsAddMemberModalOpen(false);
    setSelectedGroup(null);
  }, []);

  const handleViewMembersModalClose = useCallback(() => {
    setIsViewMembersModalOpen(false);
    setSelectedGroup(null);
  }, []);

  // Success handlers for modals
  const handleCreateSuccess = useCallback(() => {
    setIsCreateModalOpen(false);
    refetch();
  }, [refetch]);

  const handleEditSuccess = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedGroup(null);
    clearSelection();
    refetch();
  }, [refetch, clearSelection]);

  const handleAddMemberSuccess = useCallback(() => {
    setIsAddMemberModalOpen(false);
    setSelectedGroup(null);
    refetch();
  }, [refetch]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Group Name",
        sortable: true,
        render: (_, group) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{group?.name}</span>
            {group?.description && (
              <span className="text-sm text-gray-500 truncate max-w-xs">
                {group.description}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "group_type",
        header: "Type",
        sortable: true,
        render: (_, group) => (
          <Badge
            variant={group?.group_type === "public" ? "success" : "warning"}
          >
            {group?.group_type || "N/A"}
          </Badge>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        render: (_, group) => {
          const statusVariant = {
            active: "success",
            inactive: "warning",
            archived: "secondary",
          };
          return (
            <Badge variant={statusVariant[group?.status] || "secondary"}>
              {group?.status || "N/A"}
            </Badge>
          );
        },
      },
      {
        key: "member_count",
        header: "Members",
        sortable: true,
        render: (_, group) => (
          <div className="flex items-center gap-2">
            <Users className="text-gray-400" />
            <span>{group?.member_count || 0}</span>
          </div>
        ),
      },
      {
        key: "dates",
        header: "Duration",
        render: (_, group) => (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="text-gray-400" />
            <span>
              {formatDate(group?.from_date)} - {formatDate(group?.to_date)}
            </span>
          </div>
        ),
      },
      {
        key: "join_method",
        header: "Join Method",
        render: (_, group) => (
          <Badge variant="outline">{group?.join_method || "invite"}</Badge>
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Select
          value={groupType}
          onChange={(e) => {
            setGroupType(e.target.value);
            setPage(1);
          }}
          options={GROUP_TYPE_OPTIONS}
          className="w-36"
        />

        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
          className="w-36"
        />
      </div>
    </div>
  );

  // Selection actions bar
  const selectionBar = selectedGroups.length > 0 && (
    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-600">
          {selectedGroups.length} group{selectedGroups.length !== 1 ? "s" : ""}{" "}
          selected
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
        {selectedGroups.length === 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewGroup(getSelectedGroup())}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditGroup(getSelectedGroup())}
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddMember(getSelectedGroup())}
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Add Member
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewMembers(getSelectedGroup())}
            >
              <Users className="w-4 h-4 mr-1" />
              View Members
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopyInviteLink(getSelectedGroup())}
            >
              <Link className="w-4 h-4 mr-1" />
              Copy Link
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteGroup(getSelectedGroup())}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </>
        )}

        {/* Bulk delete action - only show when multiple selected */}
        {selectedGroups.length > 1 && (
          <Button variant="danger" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete ({selectedGroups.length})
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <PageHeader
        title="Group Management"
        subtitle="Manage groups and their members"
        actions={
          <Button onClick={handleCreateGroup}>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        }
      />

      {filtersUI}

      {selectionBar}

      <DataTable
        data={groups}
        columns={columns}
        loading={isLoading}
        selectable
        selectedRows={selectedGroups}
        onSelectionChange={setSelectedGroups}
        rowKey="group_id"
        paginated={true}
        pageSize={pageSize}
        emptyMessage="No groups found"
        onRowClick={(group) =>
          handleSelectGroup(
            group.group_id,
            !selectedGroups.includes(group.group_id)
          )
        }
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Group Modal */}
      <EditGroupModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        group={selectedGroup}
        onSuccess={handleEditSuccess}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={handleAddMemberModalClose}
        group={selectedGroup}
        onSuccess={handleAddMemberSuccess}
      />

      {/* View Members Modal */}
      <ViewMembersModal
        isOpen={isViewMembersModalOpen}
        onClose={handleViewMembersModalClose}
        group={selectedGroup}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedGroup(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Group"
        message={`Are you sure you want to delete "${selectedGroup?.name}"? This action cannot be undone and will remove all members from the group.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={deleteGroupMutation.isPending}
      />
    </div>
  );
}
