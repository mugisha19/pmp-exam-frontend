/**
 * Change Role Modal
 * Modal for changing a user's role
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, AlertTriangle } from "lucide-react";
import { useUpdateUserRoleMutation } from "@/hooks/queries/useUserQueries";
import {
  changeRoleSchema,
  ROLE_OPTIONS,
  USER_ROLES,
} from "@/schemas/user.schema";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { UserCell } from "@/components/shared/UserCell";

// Role descriptions for user guidance
const ROLE_DESCRIPTIONS = {
  [USER_ROLES.ADMIN]:
    "Full access to all platform features, user management, and system settings.",
  [USER_ROLES.INSTRUCTOR]:
    "Can create and manage quizzes, groups, and view student performance.",
  [USER_ROLES.STUDENT]:
    "Can take quizzes, join groups, and view personal performance.",
};

export const ChangeRoleModal = ({ isOpen, onClose, user }) => {
  const updateRoleMutation = useUpdateUserRoleMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changeRoleSchema),
    defaultValues: {
      role: "",
      reason: "",
    },
  });

  const selectedRole = watch("role");

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      reset({
        role: user.role || "",
        reason: "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    if (!user) return;

    // Don't submit if role hasn't changed
    if (data.role === user.role) {
      onClose();
      return;
    }

    try {
      await updateRoleMutation.mutateAsync({
        userId: user.user_id || user.id,
        role: data.role,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!user) return null;

  const isRoleChanged = selectedRole && selectedRole !== user.role;
  const isEscalatingToAdmin =
    selectedRole === USER_ROLES.ADMIN && user.role !== USER_ROLES.ADMIN;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change User Role"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* User Info */}
        <div className="p-4 bg-gray-100 rounded-xl">
          <UserCell user={user} showEmail />
        </div>

        {/* Current Role */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <span className="text-sm text-gray-500">Current Role</span>
          <RoleBadge role={user.role} />
        </div>

        {/* New Role Selection */}
        <Select
          label="New Role"
          options={ROLE_OPTIONS}
          error={errors.role?.message}
          {...register("role")}
        />

        {/* Role Description */}
        {selectedRole && (
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {selectedRole} Permissions
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {ROLE_DESCRIPTIONS[selectedRole]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning for Admin Role */}
        {isEscalatingToAdmin && (
          <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-orange-700 font-medium">
                Admin Access Warning
              </p>
              <p className="text-xs text-gray-600 mt-1">
                This user will have full administrative access to the platform,
                including user management and system settings.
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
            disabled={isSubmitting || updateRoleMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={isEscalatingToAdmin ? "danger" : "primary"}
            loading={isSubmitting || updateRoleMutation.isPending}
            disabled={!isRoleChanged}
          >
            {isRoleChanged ? "Change Role" : "No Changes"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default ChangeRoleModal;
