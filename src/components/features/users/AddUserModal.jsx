/**
 * Add User Modal
 * Modal form for creating a new user
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useCreateUserMutation } from "@/hooks/queries/useUserQueries";
import { createUserSchema, ROLE_OPTIONS } from "@/schemas/user.schema";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export const AddUserModal = ({ isOpen, onClose }) => {
  const createUserMutation = useCreateUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      role: "student",
    },
  });

  const onSubmit = async (data) => {
    try {
      await createUserMutation.mutateAsync(data);
      reset();
      onClose();
    } catch (error) {
      // Error handled by mutation
      console.error("Failed to create user:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New User" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <UserPlus className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-700 font-medium">
              Welcome credentials will be sent automatically
            </p>
            <p className="text-xs text-gray-500 mt-1">
              The user will receive an email with their login credentials after
              creation.
            </p>
          </div>
        </div>

        {/* Email */}
        <Input
          label="Email Address"
          type="email"
          placeholder="user@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

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

        {/* Role */}
        <Select
          label="Role"
          options={ROLE_OPTIONS}
          error={errors.role?.message}
          {...register("role")}
        />

        {/* Footer */}
        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting || createUserMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || createUserMutation.isPending}
          >
            Create User
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default AddUserModal;
