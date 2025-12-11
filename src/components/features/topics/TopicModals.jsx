/**
 * Topic Modal Components
 * Modals for creating and editing topics
 */

import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import {
  useCreateTopicMutation,
  useUpdateTopicMutation,
} from "@/hooks/queries/useTopicQueries";
import toast from "react-hot-toast";

const DOMAIN_OPTIONS = [
  { value: "People", label: "People" },
  { value: "Process", label: "Process" },
  { value: "Business Environment", label: "Business Environment" },
];

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

/**
 * Create Topic Modal
 */
export const CreateTopicModal = ({ isOpen, onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      is_active: "true",
    },
  });

  const createMutation = useCreateTopicMutation();

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        is_active: data.is_active === "true",
      };
      await createMutation.mutateAsync(payload);
      toast.success("Topic created successfully");
      reset();
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || "Failed to create topic");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Topic">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topic Name <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("name", {
              required: "Topic name is required",
              maxLength: {
                value: 200,
                message: "Name must be less than 200 characters",
              },
            })}
            placeholder="e.g., Agile Practices, Risk Management"
            error={errors.name?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PMP Domain <span className="text-red-500">*</span>
          </label>
          <select
            {...register("domain", { required: "Domain is required" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a domain</option>
            {DOMAIN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.domain && (
            <p className="mt-1 text-sm text-red-600">{errors.domain.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register("description")}
            placeholder="Brief description of this topic"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            {...register("is_active")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" loading={createMutation.isPending}>
            Create Topic
          </Button>
        </div>
      </form>
    </Modal>
  );
};

/**
 * Edit Topic Modal
 */
export const EditTopicModal = ({ isOpen, onClose, topic, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Reset form when topic or modal state changes
  React.useEffect(() => {
    if (topic && isOpen) {
      reset({
        name: topic.name || "",
        description: topic.description || "",
        domain: topic.domain || "",
        is_active:
          topic.is_active !== undefined ? String(topic.is_active) : "true",
      });
    }
  }, [topic, isOpen, reset]);

  const updateMutation = useUpdateTopicMutation();

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        is_active: data.is_active === "true",
      };
      await updateMutation.mutateAsync({
        topicId: topic.topic_id,
        data: payload,
      });
      toast.success("Topic updated successfully");
      reset();
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || "Failed to update topic");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Topic">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topic Name <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("name", {
              required: "Topic name is required",
              maxLength: {
                value: 200,
                message: "Name must be less than 200 characters",
              },
            })}
            placeholder="e.g., Agile Practices, Risk Management"
            error={errors.name?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PMP Domain <span className="text-red-500">*</span>
          </label>
          <select
            {...register("domain", { required: "Domain is required" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a domain</option>
            {DOMAIN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.domain && (
            <p className="mt-1 text-sm text-red-600">{errors.domain.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register("description")}
            placeholder="Brief description of this topic"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            {...register("is_active")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" loading={updateMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

/**
 * View Topic Modal
 */
export const ViewTopicModal = ({ isOpen, onClose, topic }) => {
  if (!topic) return null;

  const domainColors = {
    People: "bg-blue-100 text-blue-800 border-blue-200",
    Process: "bg-green-100 text-green-800 border-green-200",
    "Business Environment": "bg-purple-100 text-purple-800 border-purple-200",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Topic Details" size="lg">
      <div className="space-y-6">
        {/* Header with status */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {topic.name}
            </h2>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                  domainColors[topic.domain] ||
                  "bg-gray-100 text-gray-800 border-gray-200"
                }`}
              >
                {topic.domain}
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  topic.is_active
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-gray-100 text-gray-800 border border-gray-200"
                }`}
              >
                {topic.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {topic.description && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Description
            </h3>
            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {topic.description}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Questions</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {topic.question_count || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Additional Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Topic ID:</span>
              <span className="font-mono text-xs text-gray-700">
                {topic.topic_id}
              </span>
            </div>
            {topic.created_at && (
              <div className="flex justify-between">
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-700">
                  {new Date(topic.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
            {topic.updated_at && (
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated:</span>
                <span className="text-gray-700">
                  {new Date(topic.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
