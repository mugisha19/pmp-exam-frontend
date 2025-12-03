/**
 * Change Status Modal
 * Modal for enabling/disabling a user account
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserCog,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useUpdateUserStatusMutation } from "@/hooks/queries/useUserQueries";
import {
  changeStatusSchema,
  STATUS_OPTIONS,
  USER_STATUS,
} from "@/schemas/user.schema";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UserCell } from "@/components/shared/UserCell";
import { cn } from "@/utils/cn";

// Status descriptions
const STATUS_DESCRIPTIONS = {
  [USER_STATUS.ACTIVE]:
    "User can log in and access all features based on their role.",
  [USER_STATUS.INACTIVE]:
    "User account is disabled. They cannot log in to the platform.",
  [USER_STATUS.PENDING]:
    "User has not completed registration or email verification.",
  [USER_STATUS.SUSPENDED]:
    "User account is suspended due to policy violation or security concerns.",
};

// Status icons
const STATUS_ICONS = {
  [USER_STATUS.ACTIVE]: CheckCircle,
  [USER_STATUS.INACTIVE]: XCircle,
  [USER_STATUS.PENDING]: Clock,
  [USER_STATUS.SUSPENDED]: AlertTriangle,
};

// Status colors for styling
const STATUS_COLORS = {
  [USER_STATUS.ACTIVE]: "green",
  [USER_STATUS.INACTIVE]: "gray",
  [USER_STATUS.PENDING]: "yellow",
  [USER_STATUS.SUSPENDED]: "red",
};

export const ChangeStatusModal = ({ isOpen, onClose, user }) => {
  const updateStatusMutation = useUpdateUserStatusMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changeStatusSchema),
    defaultValues: {
      status: "",
      reason: "",
    },
  });

  const selectedStatus = watch("status");

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      reset({
        status: user.status || USER_STATUS.ACTIVE,
        reason: "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    if (!user) return;

    // Don't submit if status hasn't changed
    if (data.status === (user.status || USER_STATUS.ACTIVE)) {
      onClose();
      return;
    }

    try {
      // Convert status to active boolean
      const active = data.status === USER_STATUS.ACTIVE;
      await updateStatusMutation.mutateAsync({
        userId: user.id,
        active,
        reason: data.reason || "",
      });
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!user) return null;

  const currentStatus = user.status || USER_STATUS.ACTIVE;
  const isStatusChanged = selectedStatus && selectedStatus !== currentStatus;
  const isDeactivating =
    selectedStatus === USER_STATUS.INACTIVE ||
    selectedStatus === USER_STATUS.SUSPENDED;

  const StatusIcon = selectedStatus ? STATUS_ICONS[selectedStatus] : UserCog;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change User Status"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* User Info */}
        <div className="p-4 bg-gray-100 rounded-xl">
          <UserCell user={user} showEmail />
        </div>

        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <span className="text-sm text-gray-500">Current Status</span>
          <StatusBadge status={currentStatus} />
        </div>

        {/* Status Selection */}
        <Select
          label="New Status"
          options={STATUS_OPTIONS.filter(
            (opt) => opt.value !== USER_STATUS.PENDING
          )}
          error={errors.status?.message}
          {...register("status")}
        />

        {/* Status Description */}
        {selectedStatus && (
          <div
            className={cn(
              "p-4 rounded-xl border",
              STATUS_COLORS[selectedStatus] === "green" &&
                "bg-green-50 border-green-200",
              STATUS_COLORS[selectedStatus] === "gray" &&
                "bg-gray-50 border-gray-200",
              STATUS_COLORS[selectedStatus] === "yellow" &&
                "bg-yellow-50 border-yellow-200",
              STATUS_COLORS[selectedStatus] === "red" &&
                "bg-red-50 border-red-200"
            )}
          >
            <div className="flex items-start gap-3">
              <StatusIcon
                className={cn(
                  "w-5 h-5 mt-0.5 flex-shrink-0",
                  STATUS_COLORS[selectedStatus] === "green" && "text-green-600",
                  STATUS_COLORS[selectedStatus] === "gray" && "text-gray-600",
                  STATUS_COLORS[selectedStatus] === "yellow" &&
                    "text-yellow-600",
                  STATUS_COLORS[selectedStatus] === "red" && "text-red-600"
                )}
              />
              <div>
                <p
                  className={cn(
                    "text-sm font-medium capitalize",
                    STATUS_COLORS[selectedStatus] === "green" &&
                      "text-green-700",
                    STATUS_COLORS[selectedStatus] === "gray" && "text-gray-700",
                    STATUS_COLORS[selectedStatus] === "yellow" &&
                      "text-yellow-700",
                    STATUS_COLORS[selectedStatus] === "red" && "text-red-700"
                  )}
                >
                  {selectedStatus} Status
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {STATUS_DESCRIPTIONS[selectedStatus]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning for Deactivation */}
        {isDeactivating && isStatusChanged && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-700 font-medium">
                Account Access Warning
              </p>
              <p className="text-xs text-gray-600 mt-1">
                This user will immediately lose access to the platform. Any
                active sessions will be terminated.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting || updateStatusMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={isDeactivating ? "danger" : "primary"}
            loading={isSubmitting || updateStatusMutation.isPending}
            disabled={!isStatusChanged}
          >
            {isStatusChanged ? "Update Status" : "No Changes"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default ChangeStatusModal;
