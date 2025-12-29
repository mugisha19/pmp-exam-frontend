/**
 * Topic Modal Components
 * Modals for creating and editing topics
 */

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  useCreateTopicMutation,
  useUpdateTopicMutation,
} from "@/hooks/queries/useTopicQueries";
import { useCourses } from "@/hooks/queries/useCourseQueries";
import { useDomains, useDomain } from "@/hooks/queries/useDomainQueries";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

/**
 * Create Topic Modal
 */
export const CreateTopicModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm();

  const createMutation = useCreateTopicMutation();

  // Fetch courses
  const { data: coursesData, isLoading: coursesLoading } = useCourses({
    is_active: true,
  });

  // Fetch domains filtered by selected course
  const { data: domainsData, isLoading: domainsLoading } = useDomains({
    course_id: selectedCourseId || undefined,
    is_active: true,
  });

  const courses = coursesData?.items || [];
  const domains = domainsData?.items || [];

  // Watch course_id to update selectedCourseId
  const courseId = watch("course_id");

  // Get register handlers for course_id
  const courseIdRegister = register("course_id", {
    required: "Course is required",
  });

  // Update selectedCourseId when course_id changes
  useEffect(() => {
    if (courseId) {
      setSelectedCourseId(courseId);
      // Reset domain when course changes
      setValue("domain_id", "");
    } else {
      setSelectedCourseId("");
      setValue("domain_id", "");
    }
  }, [courseId, setValue]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedCourseId("");
      setShowConfirmDialog(false);
      setPendingFormData(null);
    }
  }, [isOpen, reset]);

  const createTopic = async (data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || null,
      };

      // If domain is provided, use domain_id, otherwise use course_id
      if (data.domain_id && data.domain_id !== "") {
        payload.domain_id = data.domain_id;
      } else {
        payload.course_id = data.course_id;
      }

      await createMutation.mutateAsync(payload);
      toast.success("Topic created successfully");
      reset();
      setSelectedCourseId("");
      setShowConfirmDialog(false);
      setPendingFormData(null);
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || "Failed to create topic");
    }
  };

  const onSubmit = async (data) => {
    if (!data.course_id || data.course_id === "") {
      toast.error("Please select a course");
      return;
    }

    // If domain is not selected, show confirmation dialog
    if (!data.domain_id || data.domain_id === "") {
      setPendingFormData(data);
      setShowConfirmDialog(true);
      return;
    }

    // If domain is selected, create topic directly
    await createTopic(data);
  };

  const handleConfirmCreate = async () => {
    if (pendingFormData) {
      await createTopic(pendingFormData);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedCourseId("");
    setShowConfirmDialog(false);
    setPendingFormData(null);
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

        {/* Course Selection - Required First */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course <span className="text-red-500">*</span>
          </label>
          <Select
            {...courseIdRegister}
            value={courseId || ""}
            onChange={(e) => {
              courseIdRegister.onChange(e); // Call register's onChange
              setSelectedCourseId(e.target.value);
              setValue("domain_id", ""); // Reset domain when course changes
            }}
            options={courses.map((course) => ({
              value: course.course_id,
              label: course.name,
            }))}
            placeholder={coursesLoading ? "Loading courses..." : "Select a course"}
            disabled={coursesLoading}
            error={errors.course_id?.message}
          />
          {errors.course_id && (
            <p className="mt-1 text-sm text-red-600">
              {errors.course_id.message}
            </p>
          )}
        </div>

        {/* Domain Selection - Filtered by Course (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Domain <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <Select
            {...register("domain_id")}
            options={domains.map((domain) => ({
              value: domain.domain_id,
              label: domain.name,
            }))}
            placeholder={
              !selectedCourseId
                ? "Please select a course first"
                : domainsLoading
                ? "Loading domains..."
                : domains.length === 0
                ? "No domains available (optional)"
                : "Select a domain (optional)"
            }
            disabled={domainsLoading || !selectedCourseId}
            error={errors.domain_id?.message}
          />
          
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

      {/* Confirmation Dialog for Creating Topic without Domain */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setPendingFormData(null);
        }}
        onConfirm={handleConfirmCreate}
        title="Create Topic Without Domain?"
        message={
          pendingFormData
            ? `You are about to create the topic "${pendingFormData.name}" with only the course "${courses.find((c) => c.course_id === pendingFormData.course_id)?.name || "selected course"}" (no domain). Some courses may not have domains. Are you sure you want to proceed?`
            : "You are about to create a topic with only a course (no domain). Some courses may not have domains. Are you sure you want to proceed?"
        }
        confirmText="Yes, Create Topic"
        cancelText="Cancel"
        variant="warning"
        loading={createMutation.isPending}
      />
    </Modal>
  );
};

/**
 * Edit Topic Modal
 */
export const EditTopicModal = ({ isOpen, onClose, topic, onSuccess }) => {
  const [parentType, setParentType] = useState("course");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm();

  // Fetch courses and domains
  const { data: coursesData, isLoading: coursesLoading } = useCourses({
    is_active: true,
  });
  const { data: domainsData, isLoading: domainsLoading } = useDomains({
    course_id: selectedCourseId || undefined,
    is_active: true,
  });

  // Fetch domain if topic has domain_id to get its course_id
  const { data: topicDomain } = useDomain(topic?.domain_id, {
    enabled: !!topic?.domain_id && isOpen,
  });

  const courses = coursesData?.items || [];
  const domains = domainsData?.items || [];

  // Watch course_id and domain_id
  const courseId = watch("course_id");
  const domainId = watch("domain_id");

  // Reset form when topic or modal state changes
  React.useEffect(() => {
    if (topic && isOpen) {
      const initialParentType = topic.domain_id ? "domain" : "course";
      setParentType(initialParentType);
      
      // If topic has domain_id, get course_id from the domain
      if (topic.domain_id && topicDomain) {
        setSelectedCourseId(topicDomain.course_id || "");
      } else if (topic.course_id) {
        setSelectedCourseId(topic.course_id);
      } else {
        setSelectedCourseId("");
      }

      reset({
        name: topic.name || "",
        description: topic.description || "",
        course_id: topicDomain?.course_id || topic.course_id || "",
        domain_id: topic.domain_id || "",
        is_active:
          topic.is_active !== undefined ? String(topic.is_active) : "true",
      });
    }
  }, [topic, topicDomain, isOpen, reset]);

  // Update selectedCourseId when course_id changes
  useEffect(() => {
    if (courseId) {
      setSelectedCourseId(courseId);
    } else {
      setSelectedCourseId("");
    }
  }, [courseId]);

  // Reset domain when course changes or parent type changes
  useEffect(() => {
    if (parentType === "course") {
      setValue("domain_id", "");
    } else {
      setValue("course_id", "");
    }
  }, [parentType, setValue]);

  const updateMutation = useUpdateTopicMutation();

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || null,
        is_active: data.is_active === "true",
      };

      if (parentType === "course") {
        if (!data.course_id) {
          toast.error("Please select a course");
          return;
        }
        payload.course_id = data.course_id;
        payload.domain_id = null;
      } else {
        if (!data.domain_id) {
          toast.error("Please select a domain");
          return;
        }
        payload.domain_id = data.domain_id;
        payload.course_id = null;
      }

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
    setParentType("course");
    setSelectedCourseId("");
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

        {/* Parent Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Belongs To <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4 mb-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="course"
                checked={parentType === "course"}
                onChange={(e) => setParentType(e.target.value)}
                className="mr-2"
              />
              <span>Course</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="domain"
                checked={parentType === "domain"}
                onChange={(e) => setParentType(e.target.value)}
                className="mr-2"
              />
              <span>Domain</span>
            </label>
          </div>

          {parentType === "course" ? (
            <div>
              <select
                {...register("course_id", {
                  required: "Course is required",
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={coursesLoading}
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.name}
                  </option>
                ))}
              </select>
              {errors.course_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.course_id.message}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {/* Course selector for domain-based topics */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Course (to filter domains)
                </label>
                <select
                  {...register("course_id")}
                  onChange={(e) => {
                    setValue("course_id", e.target.value);
                    setSelectedCourseId(e.target.value);
                    setValue("domain_id", ""); // Reset domain when course changes
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={coursesLoading}
                >
                  <option value="">All courses</option>
                  {courses.map((course) => (
                    <option key={course.course_id} value={course.course_id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Domain selector */}
              <div>
                <select
                  {...register("domain_id", {
                    required: "Domain is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={domainsLoading}
                >
                  <option value="">
                    {domainsLoading ? "Loading domains..." : "Select a domain"}
                  </option>
                  {domains.map((domain) => (
                    <option key={domain.domain_id} value={domain.domain_id}>
                      {domain.name}
                    </option>
                  ))}
                </select>
                {errors.domain_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.domain_id.message}
                  </p>
                )}
              </div>
            </div>
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
