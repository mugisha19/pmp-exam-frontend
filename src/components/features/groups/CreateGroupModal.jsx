/**
 * Create Group Modal
 * Modal form for creating a new group
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UsersRound, Globe, Lock, Calendar } from "lucide-react";
import { useCreateGroupMutation } from "@/hooks/queries/useGroupQueries";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

// Validation schema
const createGroupSchema = z
  .object({
    name: z
      .string()
      .min(3, "Group name must be at least 3 characters")
      .max(100, "Group name must be less than 100 characters"),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
    group_type: z.enum(["public", "private"], {
      required_error: "Please select a group type",
    }),
    join_method: z.enum(["direct", "link"]).optional(),
    from_date: z.string().min(1, "Start date is required"),
    to_date: z.string().min(1, "End date is required"),
  })
  .refine(
    (data) => {
      const from = new Date(data.from_date);
      const to = new Date(data.to_date);
      return to > from;
    },
    {
      message: "End date must be after start date",
      path: ["to_date"],
    }
  );

const GROUP_TYPE_OPTIONS = [
  { value: "public", label: "Public - Anyone can join" },
  { value: "private", label: "Private - Invite only" },
];

const JOIN_METHOD_OPTIONS = [
  { value: "direct", label: "Direct - Accept requests directly" },
  { value: "link", label: "Link - Join via invite link" },
];

export const CreateGroupModal = ({ isOpen, onClose }) => {
  const createGroupMutation = useCreateGroupMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      group_type: "public",
      join_method: "direct",
      from_date: new Date().toISOString().split("T")[0],
      to_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
  });

  const groupType = watch("group_type");

  const onSubmit = async (data) => {
    try {
      // Convert dates to ISO format
      const groupData = {
        ...data,
        from_date: new Date(data.from_date).toISOString(),
        to_date: new Date(data.to_date).toISOString(),
      };

      // Remove join_method for public groups
      if (groupData.group_type === "public") {
        delete groupData.join_method;
      }

      await createGroupMutation.mutateAsync(groupData);
      reset();
      onClose();
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Group" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Group Icon */}
        <div className="flex justify-center">
          <div className="p-4 bg-blue-100 rounded-full">
            <UsersRound className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Group Name */}
        <Input
          label="Group Name"
          placeholder="Enter group name"
          error={errors.name?.message}
          {...register("name")}
        />

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Describe the purpose of this group..."
          rows={3}
          error={errors.description?.message}
          {...register("description")}
        />

        {/* Group Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Group Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                groupType === "public"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                value="public"
                {...register("group_type")}
                className="hidden"
              />
              <Globe
                className={`w-5 h-5 ${
                  groupType === "public" ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <div>
                <p className="font-medium text-gray-900">Public</p>
                <p className="text-xs text-gray-500">Anyone can join</p>
              </div>
            </label>
            <label
              className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                groupType === "private"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                value="private"
                {...register("group_type")}
                className="hidden"
              />
              <Lock
                className={`w-5 h-5 ${
                  groupType === "private" ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <div>
                <p className="font-medium text-gray-900">Private</p>
                <p className="text-xs text-gray-500">Invite only</p>
              </div>
            </label>
          </div>
          {errors.group_type && (
            <p className="text-sm text-red-500">{errors.group_type.message}</p>
          )}
        </div>

        {/* Join Method (only for private groups) */}
        {groupType === "private" && (
          <Select
            label="Join Method"
            options={JOIN_METHOD_OPTIONS}
            error={errors.join_method?.message}
            {...register("join_method")}
          />
        )}

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Start Date"
            leftIcon={<Calendar className="w-4 h-4" />}
            error={errors.from_date?.message}
            {...register("from_date")}
          />
          <Input
            type="date"
            label="End Date"
            leftIcon={<Calendar className="w-4 h-4" />}
            error={errors.to_date?.message}
            {...register("to_date")}
          />
        </div>

        {/* Footer */}
        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting || createGroupMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || createGroupMutation.isPending}
          >
            Create Group
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default CreateGroupModal;
