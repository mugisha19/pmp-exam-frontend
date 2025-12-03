/**
 * Edit Group Modal
 * Modal form for editing an existing group
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UsersRound, Calendar } from "lucide-react";
import { useUpdateGroupMutation } from "@/hooks/queries/useGroupQueries";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// Validation schema
const editGroupSchema = z
  .object({
    name: z
      .string()
      .min(3, "Group name must be at least 3 characters")
      .max(100, "Group name must be less than 100 characters"),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional()
      .nullable(),
    status: z.enum(["active", "inactive", "ended"]),
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

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "ended", label: "Ended" },
];

export const EditGroupModal = ({ isOpen, onClose, group }) => {
  const updateGroupMutation = useUpdateGroupMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(editGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      from_date: "",
      to_date: "",
    },
  });

  // Reset form when group changes
  useEffect(() => {
    if (group) {
      reset({
        name: group.name || "",
        description: group.description || "",
        status: group.status || "active",
        from_date: group.from_date
          ? new Date(group.from_date).toISOString().split("T")[0]
          : "",
        to_date: group.to_date
          ? new Date(group.to_date).toISOString().split("T")[0]
          : "",
      });
    }
  }, [group, reset]);

  const onSubmit = async (data) => {
    if (!group) return;

    try {
      // Convert dates to ISO format
      const updateData = {
        name: data.name,
        description: data.description,
        status: data.status,
        from_date: new Date(data.from_date).toISOString(),
        to_date: new Date(data.to_date).toISOString(),
      };

      await updateGroupMutation.mutateAsync({
        groupId: group.group_id || group.id,
        data: updateData,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update group:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!group) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Group" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Group Preview */}
        <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl">
          <div className="p-3 bg-blue-100 rounded-lg">
            <UsersRound className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-gray-900 font-medium">{group.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={group.group_type === "public" ? "success" : "warning"}
                size="sm"
              >
                {group.group_type}
              </Badge>
              <span className="text-xs text-gray-500">
                {group.member_count || 0} members
              </span>
            </div>
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

        {/* Status */}
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          error={errors.status?.message}
          {...register("status")}
        />

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
            disabled={isSubmitting || updateGroupMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || updateGroupMutation.isPending}
            disabled={!isDirty}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default EditGroupModal;
