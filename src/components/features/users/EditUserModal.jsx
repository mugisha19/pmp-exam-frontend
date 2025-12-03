/**
 * Edit User Modal
 * Modal form for editing user profile information
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import { useUpdateUserMutation } from "@/hooks/queries/useUserQueries";
import { updateUserSchema } from "@/schemas/user.schema";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/shared/UserCell";

export const EditUserModal = ({ isOpen, onClose, user }) => {
  const updateUserMutation = useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      avatar_url: "",
    },
  });

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        avatar_url: user.avatar_url || "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    if (!user) return;

    try {
      // Only send changed fields
      const updates = {};
      if (data.first_name !== user.first_name)
        updates.first_name = data.first_name;
      if (data.last_name !== user.last_name) updates.last_name = data.last_name;
      if (data.avatar_url !== (user.avatar_url || "")) {
        updates.avatar_url = data.avatar_url || null;
      }

      if (Object.keys(updates).length === 0) {
        onClose();
        return;
      }

      await updateUserMutation.mutateAsync({
        userId: user.user_id || user.id,
        userData: updates,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit User" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* User Preview */}
        <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl">
          <UserAvatar user={user} size="lg" />
          <div>
            <p className="text-gray-900 font-medium">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* First Name */}
        <Input
          label="First Name"
          placeholder="John"
          error={errors.first_name?.message}
          {...register("first_name")}
        />

        {/* Last Name */}
        <Input
          label="Last Name"
          placeholder="Doe"
          error={errors.last_name?.message}
          {...register("last_name")}
        />

        {/* Avatar URL */}
        <Input
          label="Avatar URL"
          placeholder="https://example.com/avatar.jpg"
          helperText="Enter a URL for the user's profile picture (optional)"
          error={errors.avatar_url?.message}
          {...register("avatar_url")}
        />

        {/* Footer */}
        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting || updateUserMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || updateUserMutation.isPending}
            disabled={!isDirty}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default EditUserModal;
