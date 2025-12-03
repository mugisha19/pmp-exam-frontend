/**
 * Admin User Management Page
 * Comprehensive user management with filtering, bulk actions, and CRUD operations
 */

import { useState, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  UserCog,
  Key,
  Shield,
  Users,
  RefreshCcw,
  CheckSquare,
  X,
} from "lucide-react";
import {
  useUsers,
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
  useResendCredentialsMutation,
} from "@/hooks/queries/useUserQueries";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { FilterBar } from "@/components/shared/FilterBar";
import { UserCell } from "@/components/shared/UserCell";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { AddUserModal } from "@/components/features/users/AddUserModal";
import { EditUserModal } from "@/components/features/users/EditUserModal";
import { ChangeRoleModal } from "@/components/features/users/ChangeRoleModal";
import { ChangeStatusModal } from "@/components/features/users/ChangeStatusModal";
import { ROLE_OPTIONS, STATUS_OPTIONS } from "@/schemas/user.schema";

// Items per page options
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Filter options
const ROLE_FILTER_OPTIONS = [
  { value: "", label: "All Roles" },
  ...ROLE_OPTIONS,
];

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Status" },
  ...STATUS_OPTIONS,
];

export const UserManagement = () => {
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Selection state
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [changeRoleModalOpen, setChangeRoleModalOpen] = useState(false);
  const [changeStatusModalOpen, setChangeStatusModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Build query params
  const queryParams = useMemo(
    () => ({
      page: page,
      per_page: pageSize,
      ...(searchQuery && { search: searchQuery }),
      ...(roleFilter && { role: roleFilter }),
      ...(statusFilter && { active: statusFilter === "active" }),
    }),
    [page, pageSize, searchQuery, roleFilter, statusFilter]
  );

  // Fetch users
  const {
    data: usersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useUsers(queryParams);

  // Mutations
  const deleteUserMutation = useDeleteUserMutation();
  const updateStatusMutation = useUpdateUserStatusMutation();
  const resendCredentialsMutation = useResendCredentialsMutation();

  // Extract data - wrapped in useMemo to prevent useCallback dependency issues
  const users = useMemo(() => {
    return usersData?.users || usersData?.items || [];
  }, [usersData]);
  const totalItems = usersData?.total || users.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Reset page when filters change
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleRoleFilterChange = (value) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("");
    setStatusFilter("");
    setPage(1);
  };

  // Selection handler for DataTable
  const handleSelectionChange = useCallback((newSelection) => {
    setSelectedUsers(newSelection);
  }, []);

  // Action handlers
  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleChangeRole = (user) => {
    setSelectedUser(user);
    setChangeRoleModalOpen(true);
  };

  const _handleChangeStatus = (user) => {
    setSelectedUser(user);
    setChangeStatusModalOpen(true);
  };

  const _handleDelete = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const _handleResendCredentials = async (user) => {
    await resendCredentialsMutation.mutateAsync(user.id);
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      await deleteUserMutation.mutateAsync(selectedUser.id);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    // TODO: Implement bulk delete when API supports it
    for (const userId of selectedUsers) {
      await deleteUserMutation.mutateAsync(userId);
    }
    setSelectedUsers([]);
  };

  const handleBulkActivate = async () => {
    for (const userId of selectedUsers) {
      await updateStatusMutation.mutateAsync({ userId, active: true });
    }
    setSelectedUsers([]);
  };

  const handleBulkDeactivate = async () => {
    for (const userId of selectedUsers) {
      await updateStatusMutation.mutateAsync({ userId, active: false });
    }
    setSelectedUsers([]);
  };

  // Close modals
  // Helper to close all modals (reserved for future use)
  const _closeAllModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setChangeRoleModalOpen(false);
    setChangeStatusModalOpen(false);
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  // Table columns
  const columns = [
    {
      key: "user",
      header: "User",
      render: (_, row) => <UserCell user={row} showEmail />,
    },
    {
      key: "role",
      header: "Role",
      render: (_, row) => <RoleBadge role={row?.role} />,
    },
    {
      key: "status",
      header: "Status",
      render: (_, row) => (
        <StatusBadge status={row?.active ? "active" : "inactive"} />
      ),
    },
    {
      key: "created_at",
      header: "Joined",
      render: (value, row) =>
        row?.created_at ? new Date(row.created_at).toLocaleDateString() : "N/A",
    },
  ];

  // Check if any filters are active
  const hasActiveFilters = searchQuery || roleFilter || statusFilter;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="User Management"
        subtitle="Manage all platform users, roles, and permissions"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCcw className="w-4 h-4" />}
              onClick={() => refetch()}
              loading={isLoading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setAddModalOpen(true)}
            >
              Add User
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                size="sm"
              />
            </div>

            {/* Role Filter */}
            <div className="w-full lg:w-48">
              <Select
                value={roleFilter}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
                options={ROLE_FILTER_OPTIONS}
                placeholder="All Roles"
                size="sm"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                options={STATUS_FILTER_OPTIONS}
                placeholder="All Status"
                size="sm"
              />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<X className="w-4 h-4" />}
                onClick={clearFilters}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span className="text-gray-900 font-medium">
              {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""}{" "}
              selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Edit - only when single user selected */}
            {selectedUsers.length === 1 && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Edit className="w-4 h-4" />}
                onClick={() => {
                  const user = users.find(
                    (u) => u.user_id === selectedUsers[0]
                  );
                  if (user) handleEdit(user);
                }}
              >
                Edit
              </Button>
            )}
            {/* Change Role - only when single user selected */}
            {selectedUsers.length === 1 && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Shield className="w-4 h-4" />}
                onClick={() => {
                  const user = users.find(
                    (u) => u.user_id === selectedUsers[0]
                  );
                  if (user) handleChangeRole(user);
                }}
              >
                Change Role
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={handleBulkActivate}>
              Activate
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleBulkDeactivate}
            >
              Deactivate
            </Button>
            <Button variant="danger" size="sm" onClick={handleBulkDelete}>
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedUsers([])}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <Card className="overflow-visible">
        <CardContent className="p-0 overflow-visible">
          {isLoading ? (
            <div className="p-8">
              <TableSkeleton rows={pageSize} />
            </div>
          ) : isError ? (
            <div className="p-8">
              <EmptyState
                icon={Users}
                title="Error loading users"
                description={
                  error?.message || "Failed to load users. Please try again."
                }
                actionLabel="Retry"
                onAction={() => refetch()}
              />
            </div>
          ) : users.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Users}
                title={hasActiveFilters ? "No matching users" : "No users yet"}
                description={
                  hasActiveFilters
                    ? "Try adjusting your filters to find what you're looking for."
                    : "Users will appear here once they join the platform."
                }
                actionLabel={hasActiveFilters ? "Clear Filters" : "Add User"}
                onAction={
                  hasActiveFilters ? clearFilters : () => setAddModalOpen(true)
                }
              />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={users}
              selectable
              selectedRows={selectedUsers}
              onSelectionChange={handleSelectionChange}
              rowKey="user_id"
              paginated={false}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Rows per page:</span>
            <Select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              options={PAGE_SIZE_OPTIONS.map((size) => ({
                value: size,
                label: String(size),
              }))}
              className="w-20"
              size="sm"
            />
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={totalItems}
            itemsPerPage={pageSize}
          />
        </div>
      )}

      {/* Modals */}
      <AddUserModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      <EditUserModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      <ChangeRoleModal
        isOpen={changeRoleModalOpen}
        onClose={() => {
          setChangeRoleModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      <ChangeStatusModal
        isOpen={changeStatusModalOpen}
        onClose={() => {
          setChangeStatusModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.first_name} ${selectedUser?.last_name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteUserMutation.isPending}
      />
    </div>
  );
};

/**
 * Action Menu Component
 */

/**
 * Table Skeleton Component
 */
const TableSkeleton = ({ rows = 10 }) => (
  <div className="space-y-3">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
        <div className="w-6 h-6 bg-gray-200 rounded" />
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-20" />
        <div className="h-6 bg-gray-200 rounded w-16" />
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
    ))}
  </div>
);

export default UserManagement;
