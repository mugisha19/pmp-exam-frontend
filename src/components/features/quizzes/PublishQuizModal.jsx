/**
 * Publish Quiz Modal
 * Modal for publishing quiz banks to groups
 */

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, Calendar, Clock, Target, Settings } from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Button } from "@/components/ui/Button";
import {
  usePublishToGroupMutation,
} from "@/hooks/queries/useQuizQueries";
import { useGroups } from "@/hooks/queries/useGroupQueries";

// Validation schema matching PublishToGroupRequest
const publishSchema = z.object({
  group_ids: z.array(z.string()).min(1, "Please select at least one group"),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  time_limit_minutes: z.union([z.number().min(1).max(480), z.nan(), z.undefined()]).optional().nullable().transform(val => (isNaN(val) || val === undefined) ? null : val),
  passing_score: z.number().min(0).max(100).default(70),
  max_questions_practice: z.union([z.number().min(0), z.nan(), z.undefined()]).optional().nullable().transform(val => (isNaN(val) || val === undefined) ? null : val),
  max_questions_exam: z.union([z.number().min(0), z.nan(), z.undefined()]).optional().nullable().transform(val => (isNaN(val) || val === undefined) ? null : val),
  max_attempts: z.union([z.number().min(1), z.nan(), z.undefined()]).optional().nullable().transform(val => (isNaN(val) || val === undefined) ? null : val),
  pause_after_questions: z.union([z.number().min(0), z.nan(), z.undefined()]).optional().nullable().transform(val => (isNaN(val) || val === undefined) ? null : val),
  pause_duration_minutes: z.union([z.number().min(0).max(60), z.nan(), z.undefined()]).optional().nullable().transform(val => (isNaN(val) || val === undefined) ? null : val),
  scheduling_enabled: z.boolean().default(false),
  starts_at: z.string().optional().nullable(),
  ends_at: z.string().optional().nullable(),
});

export const PublishQuizModal = ({ isOpen, onClose, quizBank, preselectedGroupId = null }) => {
  const [selectedGroups, setSelectedGroups] = useState([]);
  
  const publishToGroupMutation = usePublishToGroupMutation();
  
  // Fetch groups for selection
  const { data: groupsData } = useGroups({}, { enabled: isOpen });
  const groups = groupsData?.groups || [];

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(publishSchema),
    defaultValues: {
      passing_score: 70,
      scheduling_enabled: false,
      group_ids: preselectedGroupId ? [preselectedGroupId] : [],
    },
  });

  const schedulingEnabled = watch("scheduling_enabled");

  const onSubmit = async (data) => {
    try {
      const publishData = {
        quiz_bank_id: quizBank.quiz_bank_id,
        group_ids: data.group_ids,
        title: data.title || null,
        description: data.description || null,
        time_limit_minutes: data.time_limit_minutes || null,
        passing_score: data.passing_score,
        max_questions_practice: data.max_questions_practice || null,
        max_questions_exam: data.max_questions_exam || null,
        max_attempts: data.max_attempts || null,
        pause_after_questions: data.pause_after_questions || null,
        pause_duration_minutes: data.pause_duration_minutes || null,
        scheduling_enabled: data.scheduling_enabled,
        starts_at: data.scheduling_enabled && data.starts_at ? data.starts_at : null,
        ends_at: data.scheduling_enabled && data.ends_at ? data.ends_at : null,
      };

      await publishToGroupMutation.mutateAsync(publishData);

      reset();
      onClose();
    } catch (error) {
      console.error("Failed to publish quiz:", error);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedGroups([]);
    onClose();
  };

  if (!quizBank) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Publish Quiz" size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Quiz Bank Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900">{quizBank.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{quizBank.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            {quizBank.question_count} questions available
          </p>
        </div>


        {/* Show selected group when preselected */}
        {preselectedGroupId && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Publishing to Group</p>
                <p className="text-xs text-gray-600">
                  {groups.find(g => g.group_id === preselectedGroupId)?.name || "Selected Group"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Group Selection (only show if no preselected group) */}
        {!preselectedGroupId && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Groups <span className="text-red-500">*</span>
            </label>
            <Controller
              name="group_ids"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  multiple
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    field.onChange(selected);
                    setSelectedGroups(selected);
                  }}
                >
                  {groups.map((group) => (
                    <option key={group.group_id} value={group.group_id}>
                      {group.name} ({group.member_count} members)
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.group_ids && (
              <p className="text-sm text-red-500">{errors.group_ids.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Hold Ctrl/Cmd to select multiple groups
            </p>
          </div>
        )}

        {/* Title and Description (Optional) */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title (Optional)
            </label>
            <Input
              {...register("title")}
              placeholder={quizBank.title || "Enter quiz title"}
              error={errors.title?.message}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use quiz bank title
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ""}
                  onChange={(content) => {
                    // Store HTML content, or null if empty (only whitespace/tags)
                    const plainText = content.replace(/<[^>]*>/g, "").trim();
                    field.onChange(plainText ? content : null);
                  }}
                  placeholder={quizBank.description || "Enter quiz description"}
                  error={errors.description?.message}
                />
              )}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use quiz bank description
            </p>
          </div>
        </div>

        {/* Quiz Settings */}
        <div className="grid grid-cols-2 gap-4">
          {/* Time Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Limit (minutes)
            </label>
            <Input
              type="number"
              {...register("time_limit_minutes", { valueAsNumber: true })}
              placeholder="e.g., 60 (1-480)"
              error={errors.time_limit_minutes?.message}
              leftIcon={<Clock className="w-4 h-4" />}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for no time limit
            </p>
          </div>

          {/* Passing Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passing Score (%) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              {...register("passing_score", { valueAsNumber: true })}
              placeholder="70"
              error={errors.passing_score?.message}
              leftIcon={<Target className="w-4 h-4" />}
            />
            <p className="text-xs text-gray-500 mt-1">
              Default: 70%
            </p>
          </div>

          {/* Max Attempts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Attempts (Optional)
            </label>
            <Input
              type="number"
              {...register("max_attempts", { valueAsNumber: true })}
              placeholder="None (Infinite)"
              error={errors.max_attempts?.message}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for unlimited attempts
            </p>
          </div>
        </div>

        {/* Max Questions for Practice and Exam */}
        <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Question Limits (Optional)
          </h4>
          <p className="text-xs text-gray-600 mb-3">
            Set maximum number of questions for practice and exam modes. Leave empty to use all questions.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Questions (Practice Mode)
              </label>
              <Input
                type="number"
                {...register("max_questions_practice", { valueAsNumber: true })}
                placeholder={`Max ${quizBank.question_count} (leave empty for all)`}
                error={errors.max_questions_practice?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Questions (Exam Mode)
              </label>
              <Input
                type="number"
                {...register("max_questions_exam", { valueAsNumber: true })}
                placeholder={`Max ${quizBank.question_count} (leave empty for all)`}
                error={errors.max_questions_exam?.message}
              />
            </div>
          </div>
        </div>

        {/* Pause Settings */}
        <div className="space-y-3 bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            Pause Settings
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pause After Questions
              </label>
              <Input
                type="number"
                {...register("pause_after_questions", { valueAsNumber: true })}
                placeholder="e.g., 10 (0 = no auto-pause)"
                error={errors.pause_after_questions?.message}
              />
              <p className="text-xs text-gray-500 mt-1">
                Student can pause after answering this many questions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pause Duration (minutes)
              </label>
              <Input
                type="number"
                {...register("pause_duration_minutes", { valueAsNumber: true })}
                placeholder="e.g., 5 (max 60)"
                error={errors.pause_duration_minutes?.message}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum time allowed for each pause break
              </p>
            </div>
          </div>
        </div>

        {/* Scheduling */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="scheduling_enabled"
              {...register("scheduling_enabled")}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="scheduling_enabled" className="text-sm font-medium text-gray-700">
              Enable Scheduling <span className="text-red-500">*</span>
            </label>
          </div>

          {schedulingEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date/Time
                </label>
                <Input
                  type="datetime-local"
                  {...register("starts_at")}
                  leftIcon={<Calendar className="w-4 h-4" />}
                  error={errors.starts_at?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date/Time
                </label>
                <Input
                  type="datetime-local"
                  {...register("ends_at")}
                  leftIcon={<Calendar className="w-4 h-4" />}
                  error={errors.ends_at?.message}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting || publishToGroupMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || publishToGroupMutation.isPending}
          >
            Publish Quiz
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default PublishQuizModal;
