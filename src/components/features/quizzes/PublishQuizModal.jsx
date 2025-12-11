/**
 * Publish Quiz Modal
 * Modal for publishing quiz banks to groups or publicly
 */

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Globe, Users, Calendar, Clock, Target, Settings } from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import {
  usePublishToGroupMutation,
  usePublishPublicMutation,
} from "@/hooks/queries/useQuizQueries";
import { useGroups } from "@/hooks/queries/useGroupQueries";

// Validation schema
const publishSchema = z.object({
  publish_type: z.enum(["group", "public"], {
    required_error: "Please select a publish type",
  }),
  group_ids: z.array(z.string()).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  quiz_mode: z.enum(["practice", "exam"]),
  time_limit_minutes: z.number().min(1).max(480).optional().nullable(),
  passing_score: z.number().min(0).max(100).default(70),
  shuffle_questions: z.boolean().default(true),
  shuffle_options: z.boolean().default(true),
  show_results_immediately: z.boolean().default(true),
  max_attempts: z.number().min(1).optional().nullable(),
  use_all_questions: z.boolean().default(true),
  subset_count: z.number().min(1).optional().nullable(),
  starts_at: z.string().optional().nullable(),
  ends_at: z.string().optional().nullable(),
}).refine(
  (data) => {
    if (data.publish_type === "group") {
      return data.group_ids && data.group_ids.length > 0;
    }
    return true;
  },
  {
    message: "Please select at least one group",
    path: ["group_ids"],
  }
).refine(
  (data) => {
    if (data.quiz_mode === "exam") {
      return !!data.time_limit_minutes;
    }
    return true;
  },
  {
    message: "Time limit is required for exam mode",
    path: ["time_limit_minutes"],
  }
);

export const PublishQuizModal = ({ isOpen, onClose, quizBank }) => {
  const [publishType, setPublishType] = useState("group");
  const [selectedGroups, setSelectedGroups] = useState([]);
  
  const publishToGroupMutation = usePublishToGroupMutation();
  const publishPublicMutation = usePublishPublicMutation();
  
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
      publish_type: "group",
      quiz_mode: "practice",
      passing_score: 70,
      shuffle_questions: true,
      shuffle_options: true,
      show_results_immediately: true,
      use_all_questions: true,
    },
  });

  const quizMode = watch("quiz_mode");
  const useAllQuestions = watch("use_all_questions");

  const onSubmit = async (data) => {
    try {
      const publishData = {
        quiz_bank_id: quizBank.quiz_bank_id,
        title: data.title || quizBank.title,
        description: data.description || quizBank.description,
        quiz_mode: data.quiz_mode,
        time_limit_minutes: data.time_limit_minutes || null,
        passing_score: data.passing_score,
        shuffle_questions: data.shuffle_questions,
        shuffle_options: data.shuffle_options,
        show_results_immediately: data.show_results_immediately,
        max_attempts: data.max_attempts || null,
        use_all_questions: data.use_all_questions,
        subset_count: data.use_all_questions ? null : data.subset_count,
        starts_at: data.starts_at || null,
        ends_at: data.ends_at || null,
      };

      if (data.publish_type === "group") {
        await publishToGroupMutation.mutateAsync({
          ...publishData,
          group_ids: data.group_ids,
        });
      } else {
        await publishPublicMutation.mutateAsync(publishData);
      }

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

        {/* Publish Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Publish To <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                publishType === "group"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                value="group"
                {...register("publish_type")}
                onChange={(e) => setPublishType(e.target.value)}
                className="hidden"
              />
              <Users
                className={`w-5 h-5 ${
                  publishType === "group" ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <div>
                <p className="font-medium text-gray-900">Groups</p>
                <p className="text-xs text-gray-500">Select specific groups</p>
              </div>
            </label>
            <label
              className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                publishType === "public"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                value="public"
                {...register("publish_type")}
                onChange={(e) => setPublishType(e.target.value)}
                className="hidden"
              />
              <Globe
                className={`w-5 h-5 ${
                  publishType === "public" ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <div>
                <p className="font-medium text-gray-900">Public</p>
                <p className="text-xs text-gray-500">Available to all users</p>
              </div>
            </label>
          </div>
        </div>

        {/* Group Selection (only show if publish_type is group) */}
        {publishType === "group" && (
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

        {/* Quiz Settings */}
        <div className="grid grid-cols-2 gap-4">
          {/* Quiz Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quiz Mode <span className="text-red-500">*</span>
            </label>
            <select
              {...register("quiz_mode")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="practice">Practice</option>
              <option value="exam">Exam</option>
            </select>
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Limit (minutes) {quizMode === "exam" && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="number"
              {...register("time_limit_minutes", { valueAsNumber: true })}
              placeholder="e.g., 60"
              error={errors.time_limit_minutes?.message}
              leftIcon={<Clock className="w-4 h-4" />}
            />
          </div>

          {/* Passing Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passing Score (%)
            </label>
            <Input
              type="number"
              {...register("passing_score", { valueAsNumber: true })}
              placeholder="70"
              error={errors.passing_score?.message}
              leftIcon={<Target className="w-4 h-4" />}
            />
          </div>

          {/* Max Attempts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Attempts
            </label>
            <Input
              type="number"
              {...register("max_attempts", { valueAsNumber: true })}
              placeholder="Unlimited"
              error={errors.max_attempts?.message}
            />
          </div>
        </div>

        {/* Question Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="use_all_questions"
              {...register("use_all_questions")}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="use_all_questions" className="text-sm font-medium text-gray-700">
              Use all questions ({quizBank.question_count} questions)
            </label>
          </div>

          {!useAllQuestions && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Questions
              </label>
              <Input
                type="number"
                {...register("subset_count", { valueAsNumber: true })}
                placeholder={`Max ${quizBank.question_count}`}
                error={errors.subset_count?.message}
              />
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Quiz Options
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="shuffle_questions"
                {...register("shuffle_questions")}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="shuffle_questions" className="text-sm text-gray-700">
                Shuffle questions
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="shuffle_options"
                {...register("shuffle_options")}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="shuffle_options" className="text-sm text-gray-700">
                Shuffle answer options
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show_results_immediately"
                {...register("show_results_immediately")}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="show_results_immediately" className="text-sm text-gray-700">
                Show results immediately after completion
              </label>
            </div>
          </div>
        </div>

        {/* Scheduling (Optional) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date/Time (Optional)
            </label>
            <Input
              type="datetime-local"
              {...register("starts_at")}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date/Time (Optional)
            </label>
            <Input
              type="datetime-local"
              {...register("ends_at")}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Footer */}
        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting || publishToGroupMutation.isPending || publishPublicMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || publishToGroupMutation.isPending || publishPublicMutation.isPending}
          >
            Publish Quiz
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default PublishQuizModal;
