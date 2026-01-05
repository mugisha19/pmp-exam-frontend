/**
 * Topic Details Page
 * View and edit a specific topic
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  BookOpen,
  Calendar,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useTopic,
  useDeleteTopicMutation,
} from "@/hooks/queries/useTopicQueries";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EditTopicModal } from "@/components/features/topics";

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
 * Info item component
 */
const InfoItem = ({ icon: IconComponent, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-gray-100 rounded-lg">
      <IconComponent className="w-5 h-5 text-gray-600" />
    </div>
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  </div>
);

export const TopicDetails = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch topic details
  const {
    data: topic,
    isLoading,
    isError,
    error,
    refetch,
  } = useTopic(topicId);
  const deleteTopicMutation = useDeleteTopicMutation();

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteTopicMutation.mutateAsync(topicId);
      toast.success("Topic deleted successfully");
      navigate("/topics");
    } catch (error) {
      toast.error(error.message || "Failed to delete topic");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
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
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <EmptyState
          icon={BookOpen}
          title="Error loading topic"
          description={error?.message || "Failed to load topic details"}
          actionLabel="Go Back"
          onAction={() => navigate(-1)}
        />
      </div>
    );
  }

  // Not found state
  if (!topic) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <EmptyState
          icon={BookOpen}
          title="Topic not found"
          description="The topic you're looking for doesn't exist or has been deleted."
          actionLabel="Go Back"
          onAction={() => navigate(-1)}
        />
      </div>
    );
  }

  const domainColors = {
    People: "bg-blue-100 text-blue-800 border-blue-200",
    Process: "bg-green-100 text-green-800 border-green-200",
    "Business Environment": "bg-purple-100 text-purple-800 border-purple-200",
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={topic.name}
        subtitle="View and manage topic information"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit2 className="w-4 h-4" />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Topic
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate("/topics")}
            >
              Go Back
            </Button>
          </div>
        }
      />

      {/* Topic Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {topic.name}
              </h2>
              {topic.domain && (
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                      domainColors[topic.domain] ||
                      "bg-gray-100 text-gray-800 border-gray-200"
                    }`}
                  >
                    {topic.domain}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topic.course_id && (
              <InfoItem
                icon={BookOpen}
                label="Course"
                value={topic.course?.name || "Unknown Course"}
              />
            )}
            {topic.domain_id && (
              <InfoItem
                icon={Tag}
                label="Domain"
                value={topic.domain?.name || "Unknown Domain"}
              />
            )}
            <InfoItem
              icon={Calendar}
              label="Created"
              value={formatDate(topic.created_at)}
            />
            {topic.updated_at && (
              <InfoItem
                icon={Calendar}
                label="Last Updated"
                value={formatDate(topic.updated_at)}
              />
            )}
            <InfoItem
              icon={BookOpen}
              label="Questions"
              value={topic.question_count || 0}
            />
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {topic.description && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Description
            </h3>
            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {topic.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Card */}
      <Card>
        <CardContent className="p-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Questions</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {topic.question_count || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Topic"
        message={`Are you sure you want to delete "${topic.name}"? This action cannot be undone and may affect associated questions.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={deleteTopicMutation.isPending}
      />

      {/* Edit Topic Modal */}
      <EditTopicModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        topic={topic}
        onSuccess={() => {
          setIsEditModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default TopicDetails;

