/**
 * Quiz Bank Modal Components
 * Modals for creating and editing quiz banks
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  useCreateQuizBankMutation,
  useUpdateQuizBankMutation,
} from "@/hooks/queries/useQuizBankQueries";
import toast from "react-hot-toast";

/**
 * Create Quiz Bank Modal
 */
export const CreateQuizBankModal = ({ isOpen, onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const createMutation = useCreateQuizBankMutation();

  const onSubmit = async (data) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Quiz bank created successfully");
      reset();
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || "Failed to create quiz bank");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Quiz Bank">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("title", {
              required: "Title is required",
              maxLength: {
                value: 300,
                message: "Title must be less than 300 characters",
              },
            })}
            placeholder="Enter quiz bank title"
            error={errors.title?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register("description")}
            placeholder="Enter quiz bank description (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
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
            Create Quiz Bank
          </Button>
        </div>
      </form>
    </Modal>
  );
};

/**
 * Edit Quiz Bank Modal
 */
export const EditQuizBankModal = ({ isOpen, onClose, quizBank, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const updateMutation = useUpdateQuizBankMutation();

  // Reset form when quiz bank data changes
  useEffect(() => {
    if (quizBank) {
      reset({
        title: quizBank.title || "",
        description: quizBank.description || "",
      });
    }
  }, [quizBank, reset]);

  const onSubmit = async (data) => {
    try {
      await updateMutation.mutateAsync({
        quizBankId: quizBank.quiz_bank_id,
        data,
      });
      toast.success("Quiz bank updated successfully");
      reset();
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || "Failed to update quiz bank");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Quiz Bank">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("title", {
              required: "Title is required",
              maxLength: {
                value: 300,
                message: "Title must be less than 300 characters",
              },
            })}
            placeholder="Enter quiz bank title"
            error={errors.title?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register("description")}
            placeholder="Enter quiz bank description (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
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
