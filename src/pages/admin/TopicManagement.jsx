/**
 * Admin Topic Management Page
 * Manage topics that organize questions by PMP domains
 */

import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  X,
  Eye,
  Filter,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  useTopics,
  useDeleteTopicMutation,
} from "@/hooks/queries/useTopicQueries";
import { CreateTopicModal } from "@/components/features/topics";

const DOMAIN_OPTIONS = [
  { value: "", label: "All Domains" },
  { value: "People", label: "People" },
  { value: "Process", label: "Process" },
  { value: "Business Environment", label: "Business Environment" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default function TopicManagement() {
  const navigate = useNavigate();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Selection state
  const [selectedTopics, setSelectedTopics] = useState([]);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Build query params
  const queryParams = useMemo(() => {
    const params = {
      skip: (page - 1) * pageSize,
      limit: pageSize,
    };

    if (domain) params.domain = domain;
    if (isActive !== "") params.is_active = isActive === "true";

    return params;
  }, [domain, isActive, page]);

  // Fetch topics
  const { data: topicsData, isLoading, refetch } = useTopics(queryParams);
  const deleteTopicMutation = useDeleteTopicMutation();

  const topics = useMemo(() => {
    const items = topicsData?.items || topicsData || [];
    // Client-side search filter
    if (searchQuery) {
      return items.filter(
        (topic) =>
          topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return items;
  }, [topicsData, searchQuery]);

  // Selection handlers
  const handleSelectTopic = useCallback((topicId, isSelected) => {
    setSelectedTopics((prev) =>
      isSelected ? [...prev, topicId] : prev.filter((id) => id !== topicId)
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTopics([]);
  }, []);

  const getSelectedTopic = useCallback(() => {
    if (selectedTopics.length !== 1) return null;
    return topics.find((t) => t.topic_id === selectedTopics[0]);
  }, [selectedTopics, topics]);

  // CRUD handlers
  const handleCreateTopic = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleViewTopic = useCallback((topic) => {
    navigate(`/topics/${topic.topic_id}`);
  }, [navigate]);

  const handleEditTopic = useCallback((topic) => {
    navigate(`/topics/${topic.topic_id}`);
  }, [navigate]);

  const handleDeleteTopic = useCallback((topic) => {
    setSelectedTopic(topic);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedTopic) return;

    await deleteTopicMutation.mutateAsync(selectedTopic.topic_id);
    setIsDeleteDialogOpen(false);
    setSelectedTopic(null);
    clearSelection();
    refetch();
  }, [selectedTopic, deleteTopicMutation, clearSelection, refetch]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedTopics.length === 0) return;

    await Promise.all(
      selectedTopics.map((topicId) =>
        deleteTopicMutation.mutateAsync(topicId)
      )
    );
    clearSelection();
    refetch();
  }, [selectedTopics, deleteTopicMutation, clearSelection, refetch]);

  // Modal handlers
  const handleCreateModalClose = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    setIsCreateModalOpen(false);
    refetch();
  }, [refetch]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Topic Name",
        sortable: true,
        render: (_, topic) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{topic?.name}</span>
            {topic?.description && (
              <span className="text-sm text-gray-500 truncate max-w-lg">
                {topic.description}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "domain",
        header: "PMP Domain",
        sortable: true,
        render: (_, topic) => {
          const domainColors = {
            People: "bg-blue-100 text-blue-800",
            Process: "bg-green-100 text-green-800",
            "Business Environment": "bg-purple-100 text-purple-800",
          };
          const domainName = topic?.domain;
          
          if (!domainName) {
            return (
              <Badge className="bg-gray-100 text-gray-500">
                N/A
              </Badge>
            );
          }
          
          return (
            <Badge
              className={
                domainColors[domainName] || "bg-gray-100 text-gray-800"
              }
            >
              {domainName}
            </Badge>
          );
        },
      },
      {
        key: "question_count",
        header: "Questions",
        sortable: true,
        render: (_, topic) => (
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{topic?.question_count || 0}</span>
          </div>
        ),
      },
    ],
    [navigate, handleDeleteTopic]
  );

  // Calculate active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (domain) count++;
    if (isActive) count++;
    return count;
  }, [searchQuery, domain, isActive]);

  const [showFilters, setShowFilters] = useState(true);

  const handleClearFilters = () => {
    setSearchQuery("");
    setDomain("");
    setIsActive("");
    setPage(1);
  };

  // Filters UI
  const filtersUI = (
    <div className="bg-white rounded-lg border border-gray-200 mb-6">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
            {activeFilterCount > 0 && (
              <Badge variant="primary" className="text-xs">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs"
              >
                Clear all
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide" : "Show"}
            </Button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="p-4 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by topic name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              size="sm"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Domain
              </label>
              <Select
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  setPage(1);
                }}
                options={DOMAIN_OPTIONS}
                className="w-full"
                size="sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={isActive}
                onChange={(e) => {
                  setIsActive(e.target.value);
                  setPage(1);
                }}
                options={STATUS_OPTIONS}
                className="w-full"
                size="sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Selection actions bar
  const selectionBar = selectedTopics.length > 0 && (
    <div className="flex items-center justify-between bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
          {selectedTopics.length}
        </div>
        <span className="text-sm font-semibold text-gray-900">
          {selectedTopics.length} topic{selectedTopics.length !== 1 ? "s" : ""}{" "}
          selected
        </span>
        <button
          onClick={clearSelection}
          className="text-gray-500 hover:text-gray-700 p-1 hover:bg-blue-100 rounded transition-colors"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {selectedTopics.length === 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const topic = getSelectedTopic();
                if (topic) navigate(`/topics/${topic.topic_id}`);
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const topic = getSelectedTopic();
                if (topic) navigate(`/topics/${topic.topic_id}`);
              }}
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteTopic(getSelectedTopic())}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </>
        )}

        {selectedTopics.length > 1 && (
          <Button variant="danger" size="sm" onClick={handleBulkDelete} loading={deleteTopicMutation.isPending}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete ({selectedTopics.length})
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Topic Management"
        subtitle="Manage topics to organize questions by PMP domains"
        actions={
          <Button onClick={handleCreateTopic} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Create Topic
          </Button>
        }
      />

      {filtersUI}

      {selectionBar}

      <DataTable
        data={topics}
        columns={columns}
        loading={isLoading}
        rowKey="topic_id"
        paginated={true}
        emptyMessage="No topics found"
        onRowClick={(topic) => {
          navigate(`/topics/${topic.topic_id}`);
        }}
      />

      {/* Create Topic Modal */}
      <CreateTopicModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        onSuccess={handleCreateSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedTopic(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Topic"
        message={`Are you sure you want to delete "${selectedTopic?.name}"? This action cannot be undone and may affect associated questions.`}
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleteTopicMutation.isPending}
      />
    </div>
  );
}
