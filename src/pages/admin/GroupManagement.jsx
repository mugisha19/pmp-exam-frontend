/**
 * Admin Group Management Page
 * Comprehensive group management with filtering and CRUD operations
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RefreshCcw,
  UsersRound,
  Eye,
  Trash2,
  MoreVertical,
  X,
  Globe,
  Lock,
  Calendar,
} from "lucide-react";
import {
  useGroups,
  useDeleteGroupMutation,
} from "@/hooks/queries/useGroupQueries";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { cn } from "@/utils/cn";

// Items per page options
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Filter options
const TYPE_FILTER_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "ended", label: "Ended" },
];

/**
 * Format date range for timeline display
 */
const formatDateRange = (startDate, endDate) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

export const GroupManagement = () => {
  const navigate = useNavigate();

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Build query params
  const queryParams = useMemo(
    () => ({
      skip: (page - 1) * pageSize,
      limit: pageSize,
      ...(searchQuery && { search: searchQuery }),
      ...(typeFilter && { group_type: typeFilter }),
      ...(statusFilter && { status: statusFilter }),
    }),
    [page, pageSize, searchQuery, typeFilter, statusFilter]
  );

  // Fetch groups
  const {
    data: groupsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGroups(queryParams);

  // Mutations
  const deleteGroupMutation = useDeleteGroupMutation();

  // Extract data
  const groups = groupsData?.items || groupsData || [];
  const totalItems = groupsData?.total || groups.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Reset page when filters change
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleTypeFilterChange = (value) => {
    setTypeFilter(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("");
    setStatusFilter("");
    setPage(1);
  };

  // Action handlers
  const handleViewDetails = (group) => {
    navigate(`/admin/groups/${group.id}`);
  };

  const handleDelete = (group) => {
    setSelectedGroup(group);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedGroup) {
      await deleteGroupMutation.mutateAsync(selectedGroup.id);
      setDeleteDialogOpen(false);
      setSelectedGroup(null);
    }
  };

  // Table columns
  const columns = [
    {
      key: "name",
      header: "Group Name",
      render: (_, group) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <UsersRound className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{group.name}</p>
            <p className="text-xs text-gray-500 truncate max-w-[200px]">
              {group.description || "No description"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "group_type",
      header: "Type",
      render: (_, group) => <TypeBadge type={group.group_type || group.type} />,
    },
    {
      key: "status",
      header: "Status",
      render: (_, group) => (
        <StatusBadge status={group.status || "active"} size="sm" />
      ),
    },
    {
      key: "members",
      header: "Members",
      render: (_, group) => (
        <span className="text-sm text-gray-700">
          {group.member_count || 0} / {group.max_members || "∞"}
        </span>
      ),
    },
    {
      key: "quizzes",
      header: "Quizzes",
      render: (_, group) => (
        <span className="text-sm text-gray-700">{group.quiz_count || 0}</span>
      ),
    },
    {
      key: "created_by",
      header: "Created By",
      render: (_, group) => (
        <span className="text-sm text-gray-700">
          {group.created_by_name ||
            group.creator?.first_name ||
            group.owner?.first_name ||
            "Unknown"}
        </span>
      ),
    },
    {
      key: "timeline",
      header: "Timeline",
      render: (_, group) => (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          {formatDateRange(group.start_date, group.end_date)}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "80px",
      sortable: false,
      render: (_, group) => (
        <ActionMenu
          group={group}
          onViewDetails={() => handleViewDetails(group)}
          onDelete={() => handleDelete(group)}
        />
      ),
    },
  ];

  // Check if any filters are active
  const hasActiveFilters = searchQuery || typeFilter || statusFilter;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Groups"
        subtitle="Manage all platform groups and their members"
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCcw className="w-4 h-4" />}
            onClick={() => refetch()}
            loading={isLoading}
          >
            Refresh
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search by group name..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                size="sm"
              />
            </div>

            {/* Type Filter */}
            <div className="w-full lg:w-48">
              <Select
                value={typeFilter}
                onChange={(e) => handleTypeFilterChange(e.target.value)}
                options={TYPE_FILTER_OPTIONS}
                placeholder="All Types"
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

      {/* Groups Table */}
      <DataTable
        columns={columns}
        data={groups}
        loading={isLoading}
        emptyMessage={hasActiveFilters ? "No matching groups" : "No groups yet"}
        emptyDescription={
          hasActiveFilters
            ? "Try adjusting your filters to find what you're looking for."
            : "Groups will appear here once they are created."
        }
        emptyIcon={UsersRound}
        onRowClick={handleViewDetails}
        paginated={false}
        sortable={true}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Rows per page:</span>
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedGroup(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Group"
        message={`Are you sure you want to delete "${selectedGroup?.name}"? This will remove all members and cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteGroupMutation.isPending}
      />
    </div>
  );
};

/**
 * Type Badge Component
 */
const TypeBadge = ({ type }) => {
  const normalizedType = type?.toLowerCase() || "public";
  const isPublic = normalizedType === "public";

  return (
    <Badge
      variant={isPublic ? "success" : "warning"}
      size="sm"
      className="gap-1"
    >
      {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
      {isPublic ? "Public" : "Private"}
    </Badge>
  );
};

/**
 * Action Menu Component
 */
const ActionMenu = ({ onViewDetails, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { label: "View Details", icon: Eye, onClick: onViewDetails },
    { label: "Delete", icon: Trash2, onClick: onDelete, danger: true },
  ];

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                    action.danger
                      ? "text-red-600 hover:bg-red-50"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default GroupManagement;
