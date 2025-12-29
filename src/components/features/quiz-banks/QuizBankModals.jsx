/**
 * Quiz Bank Modal Components
 * Modals for creating and editing quiz banks
 */

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/Modal";
import {
  useCreateQuizBankMutation,
  useUpdateQuizBankMutation,
} from "@/hooks/queries/useQuizBankQueries";
import { useQuizBanks } from "@/hooks/queries/useQuizBankQueries";
import { mergeQuizBanks } from "@/services/quizBank.service";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Search, Check, FileQuestion } from "lucide-react";

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

/**
 * Create Quiz Bank Selection Modal
 * Shows options to create new or merge existing quiz banks
 */
export const CreateQuizBankSelectionModal = ({
  isOpen,
  onClose,
  onCreateNew,
  onMerge,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Quiz Bank" size="sm">
      <ModalBody>
        <div className="space-y-3">
          <button
            onClick={() => {
              onClose();
              onCreateNew();
            }}
            className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="font-medium text-gray-900">Create New Group</div>
            <div className="text-sm text-gray-500 mt-1">
              Create a new quiz bank from scratch
            </div>
          </button>
          <button
            onClick={() => {
              onClose();
              onMerge();
            }}
            className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="font-medium text-gray-900">Merge Group</div>
            <div className="text-sm text-gray-500 mt-1">
              Combine multiple quiz banks into one
            </div>
          </button>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

/**
 * Merge Quiz Banks Modal
 * Allows selecting multiple quiz banks to merge into a new one
 */
export const MergeQuizBankModal = ({ isOpen, onClose, onSuccess }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuizBankIds, setSelectedQuizBankIds] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Fetch all quiz banks for selection (max limit is 100 per backend)
  const { data: quizBanksData, isLoading } = useQuizBanks({ limit: 100 });
  const quizBanks = useMemo(() => {
    return quizBanksData?.items || quizBanksData || [];
  }, [quizBanksData]);

  // Filter quiz banks based on search
  const filteredQuizBanks = useMemo(() => {
    if (!searchQuery) return quizBanks;
    const query = searchQuery.toLowerCase();
    return quizBanks.filter(
      (qb) =>
        qb.title?.toLowerCase().includes(query) ||
        qb.description?.toLowerCase().includes(query)
    );
  }, [quizBanks, searchQuery]);

  // Merge mutation
  const mergeMutation = useMutation({
    mutationFn: (data) => mergeQuizBanks(data),
    onSuccess: () => {
      toast.success("Quiz banks merged successfully");
      // Reset form and state
      reset();
      setSelectedQuizBankIds([]);
      setSearchQuery("");
      // Close modal first
      onClose();
      // Then trigger success callback (which will refetch data)
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to merge quiz banks");
    },
  });

  const toggleQuizBankSelection = (quizBankId) => {
    setSelectedQuizBankIds((prev) =>
      prev.includes(quizBankId)
        ? prev.filter((id) => id !== quizBankId)
        : [...prev, quizBankId]
    );
  };

  const onSubmit = async (data) => {
    if (selectedQuizBankIds.length < 2) {
      toast.error("Please select at least 2 quiz banks to merge");
      return;
    }

    await mergeMutation.mutateAsync({
      quiz_bank_ids: selectedQuizBankIds,
      title: data.title,
      description: data.description || null,
    });
  };

  const handleClose = () => {
    if (mergeMutation.isPending) return; // Prevent closing during mutation
    reset();
    setSelectedQuizBankIds([]);
    setSearchQuery("");
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Merge Quiz Banks" 
      size="lg"
      closeOnOverlay={!mergeMutation.isPending}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <ModalBody>
          {/* Title */}
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
              placeholder="Enter title for merged quiz bank"
              error={errors.title?.message}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register("description")}
              placeholder="Enter description (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Quiz Banks to Merge <span className="text-red-500">*</span>
              {selectedQuizBankIds.length > 0 && (
                <span className="text-gray-500 font-normal ml-2">
                  ({selectedQuizBankIds.length} selected)
                </span>
              )}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search quiz banks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Quiz Banks List */}
          <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto p-2">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading quiz banks...</div>
            ) : filteredQuizBanks.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? "No quiz banks found matching your search" : "No quiz banks available"}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredQuizBanks.map((quizBank) => {
                  const isSelected = selectedQuizBankIds.includes(quizBank.quiz_bank_id);
                  return (
                    <button
                      key={quizBank.quiz_bank_id}
                      type="button"
                      onClick={() => toggleQuizBankSelection(quizBank.quiz_bank_id)}
                      className={`w-full p-2 text-left hover:bg-gray-50 transition-colors rounded-md border ${
                        isSelected 
                          ? "bg-blue-50 border-blue-200 border-l-4 border-l-blue-500" 
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <FileQuestion className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {quizBank.title}
                              </span>
                            </div>
                            {quizBank.description && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                {quizBank.description}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 flex-shrink-0">
                            {quizBank.question_count || 0} questions
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedQuizBankIds.length < 2 && (
            <p className="text-sm text-red-500">
              Please select at least 2 quiz banks to merge
            </p>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={mergeMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={mergeMutation.isPending}
            disabled={selectedQuizBankIds.length < 2}
          >
            Merge Quiz Banks
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
