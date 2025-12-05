/**
 * Question Modals: Create, Edit, and View Question
 * Supports multiple question types with dynamic option handling
 */

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { X, Plus, Trash2, Eye, CheckCircle2 } from "lucide-react";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import {
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
} from "@/hooks/queries/useQuestionQueries";

const QUESTION_TYPE_OPTIONS = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "multiple_response", label: "Multiple Response" },
  { value: "true_false", label: "True/False" },
  { value: "matching", label: "Matching" },
];

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

/**
 * Create Question Modal
 */
export function CreateQuestionModal({
  isOpen,
  onClose,
  onSuccess,
  topics = [],
}) {
  const createMutation = useCreateQuestionMutation();
  const [questionType, setQuestionType] = useState("multiple_choice");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      question_text: "",
      topic_id: "",
      question_type: "multiple_choice",
      difficulty: "medium",
      image_url: "",
      explanation: "",
      options: {
        choices: [
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ],
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options.choices",
  });

  const onSubmit = async (data) => {
    try {
      // Format options based on question type
      let formattedOptions;

      if (
        questionType === "multiple_choice" ||
        questionType === "multiple_response"
      ) {
        // Array format for multiple choice/response
        formattedOptions = data.options.choices.map((choice, idx) => ({
          id: String.fromCharCode(65 + idx), // A, B, C, D...
          text: choice.text,
          is_correct: choice.is_correct || false,
        }));
      } else if (questionType === "true_false") {
        // Array format for true/false with specific IDs
        formattedOptions = [
          {
            id: "true",
            text: "True",
            is_correct: data.options.correct_answer === "true",
          },
          {
            id: "false",
            text: "False",
            is_correct: data.options.correct_answer === "false",
          },
        ];
      } else if (questionType === "matching") {
        // Object format for matching questions
        formattedOptions = {
          left_items: data.options.left_items || [],
          right_items: data.options.right_items || [],
          correct_matches: data.options.correct_matches || [],
        };
      }

      const questionData = {
        question_text: data.question_text,
        topic_id: data.topic_id,
        question_type: questionType,
        difficulty: data.difficulty,
        options: formattedOptions,
        explanation: data.explanation,
        image_url: data.image_url || null,
      };

      await createMutation.mutateAsync(questionData);
      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create question:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleTypeChange = (newType) => {
    setQuestionType(newType);
    setValue("question_type", newType);

    // Reset options based on type
    if (newType === "multiple_choice" || newType === "multiple_response") {
      setValue("options", {
        choices: [
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ],
      });
    } else if (newType === "true_false") {
      setValue("options", { correct_answer: "true" });
    } else if (newType === "matching") {
      setValue("options", {
        left_items: [],
        right_items: [],
        correct_matches: [],
      });
    }
  };

  const topicOptions = topics.map((topic) => ({
    value: topic.topic_id,
    label: topic.name,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Question"
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Topic Selection - Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic <span className="text-red-500">*</span>
          </label>
          <Select
            {...register("topic_id", { required: "Topic is required" })}
            options={[{ value: "", label: "Select a topic" }, ...topicOptions]}
          />
          {errors.topic_id && (
            <p className="text-xs text-red-500 mt-1">
              {errors.topic_id.message}
            </p>
          )}
        </div>

        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Type <span className="text-red-500">*</span>
          </label>
          <Select
            value={questionType}
            onChange={(e) => handleTypeChange(e.target.value)}
            options={QUESTION_TYPE_OPTIONS}
          />
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("question_text", {
              required: "Question text is required",
              minLength: {
                value: 10,
                message: "Question must be at least 10 characters",
              },
            })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your question..."
          />
          {errors.question_text && (
            <p className="text-xs text-red-500 mt-1">
              {errors.question_text.message}
            </p>
          )}
        </div>

        {/* Options based on question type */}
        {(questionType === "multiple_choice" ||
          questionType === "multiple_response") && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Answer Choices <span className="text-red-500">*</span>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ text: "", is_correct: false })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Choice
              </Button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <span className="text-sm font-semibold text-gray-700 min-w-6 mt-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <div className="flex-1">
                    <Input
                      {...register(`options.choices.${index}.text`, {
                        required: "Choice text is required",
                      })}
                      placeholder={`Enter choice ${String.fromCharCode(
                        65 + index
                      )} text...`}
                      className="w-full"
                    />
                    {errors?.options?.choices?.[index]?.text && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.options.choices[index].text.message}
                      </p>
                    )}
                  </div>
                  <Controller
                    name={`options.choices.${index}.is_correct`}
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-2 px-3 py-2 bg-white rounded border border-gray-300 hover:bg-gray-50 cursor-pointer">
                        <input
                          type={
                            questionType === "multiple_choice"
                              ? "radio"
                              : "checkbox"
                          }
                          name={
                            questionType === "multiple_choice"
                              ? "correct_choice"
                              : field.name
                          }
                          checked={field.value || false}
                          onChange={(e) => {
                            if (questionType === "multiple_choice") {
                              // For radio: uncheck all others and check this one
                              fields.forEach((_, i) => {
                                setValue(
                                  `options.choices.${i}.is_correct`,
                                  i === index
                                );
                              });
                            } else {
                              // For checkbox: toggle this one
                              field.onChange(e.target.checked);
                            }
                          }}
                          className="w-4 h-4 text-blue-600"
                        />
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </label>
                    )}
                  />
                  {fields.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {questionType === "true_false" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer <span className="text-red-500">*</span>
            </label>
            <Select
              {...register("options.correct_answer", {
                required: "Please select correct answer",
              })}
              options={[
                { value: "true", label: "True" },
                { value: "false", label: "False" },
              ]}
            />
          </div>
        )}

        {questionType === "matching" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Create items for the left and right columns, then define which
              items match.
            </p>

            {/* Left Items */}
            <Controller
              name="options.left_items"
              control={control}
              defaultValue={[
                { id: "L1", text: "" },
                { id: "L2", text: "" },
              ]}
              rules={{ required: "At least 2 left items required" }}
              render={({ field }) => (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Left Column Items <span className="text-red-500">*</span>
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newItems = [...(field.value || [])];
                        const newId = `L${newItems.length + 1}`;
                        newItems.push({ id: newId, text: "" });
                        field.onChange(newItems);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Left Item
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(field.value || []).map((item, index) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700 min-w-8">
                          {item.id}:
                        </span>
                        <Input
                          value={item.text}
                          onChange={(e) => {
                            const newItems = [...field.value];
                            newItems[index].text = e.target.value;
                            field.onChange(newItems);
                          }}
                          placeholder={`Enter left item ${index + 1}...`}
                          className="flex-1"
                        />
                        {field.value.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newItems = field.value.filter(
                                (_, i) => i !== index
                              );
                              field.onChange(newItems);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            />

            {/* Right Items */}
            <Controller
              name="options.right_items"
              control={control}
              defaultValue={[
                { id: "R1", text: "" },
                { id: "R2", text: "" },
              ]}
              rules={{ required: "At least 2 right items required" }}
              render={({ field }) => (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Right Column Items <span className="text-red-500">*</span>
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newItems = [...(field.value || [])];
                        const newId = `R${newItems.length + 1}`;
                        newItems.push({ id: newId, text: "" });
                        field.onChange(newItems);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Right Item
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(field.value || []).map((item, index) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700 min-w-8">
                          {item.id}:
                        </span>
                        <Input
                          value={item.text}
                          onChange={(e) => {
                            const newItems = [...field.value];
                            newItems[index].text = e.target.value;
                            field.onChange(newItems);
                          }}
                          placeholder={`Enter right item ${index + 1}...`}
                          className="flex-1"
                        />
                        {field.value.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newItems = field.value.filter(
                                (_, i) => i !== index
                              );
                              field.onChange(newItems);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            />

            {/* Correct Matches */}
            <Controller
              name="options.correct_matches"
              control={control}
              defaultValue={[{ left_id: "L1", right_id: "R1" }]}
              rules={{ required: "At least one match required" }}
              render={({ field: matchField }) => (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Correct Matches <span className="text-red-500">*</span>
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newMatches = [...(matchField.value || [])];
                        newMatches.push({ left_id: "", right_id: "" });
                        matchField.onChange(newMatches);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Match
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(matchField.value || []).map((match, index) => (
                      <Controller
                        key={index}
                        name={`options.left_items`}
                        control={control}
                        render={({ field: leftItemsField }) => (
                          <Controller
                            name={`options.right_items`}
                            control={control}
                            render={({ field: rightItemsField }) => (
                              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <Select
                                  value={match.left_id}
                                  onChange={(e) => {
                                    const newMatches = [...matchField.value];
                                    newMatches[index].left_id = e.target.value;
                                    matchField.onChange(newMatches);
                                  }}
                                  options={[
                                    { value: "", label: "Select left item..." },
                                    ...(leftItemsField.value || []).map(
                                      (item) => ({
                                        value: item.id,
                                        label: `${item.id}: ${
                                          item.text || "(empty)"
                                        }`,
                                      })
                                    ),
                                  ]}
                                  className="flex-1"
                                />
                                <span className="text-gray-500">→</span>
                                <Select
                                  value={match.right_id}
                                  onChange={(e) => {
                                    const newMatches = [...matchField.value];
                                    newMatches[index].right_id = e.target.value;
                                    matchField.onChange(newMatches);
                                  }}
                                  options={[
                                    {
                                      value: "",
                                      label: "Select right item...",
                                    },
                                    ...(rightItemsField.value || []).map(
                                      (item) => ({
                                        value: item.id,
                                        label: `${item.id}: ${
                                          item.text || "(empty)"
                                        }`,
                                      })
                                    ),
                                  ]}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newMatches = matchField.value.filter(
                                      (_, i) => i !== index
                                    );
                                    matchField.onChange(newMatches);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            )}
                          />
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            />
          </div>
        )}

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty <span className="text-red-500">*</span>
          </label>
          <Select
            {...register("difficulty", { required: "Difficulty is required" })}
            options={DIFFICULTY_OPTIONS}
            className="w-full"
          />
          {errors.difficulty && (
            <p className="text-xs text-red-500 mt-1">
              {errors.difficulty.message}
            </p>
          )}
        </div>

        {/* Image URL (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL (optional)
          </label>
          <Input
            {...register("image_url")}
            type="url"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Explanation (required) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("explanation", {
              required: "Explanation is required",
              minLength: {
                value: 20,
                message: "Explanation must be at least 20 characters",
              },
            })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Provide an explanation for the correct answer (why it's correct)..."
          />
          {errors.explanation && (
            <p className="text-xs text-red-500 mt-1">
              {errors.explanation.message}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createMutation.isPending}>
            Create Question
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Edit Question Modal
 */
export function EditQuestionModal({
  isOpen,
  onClose,
  question,
  topics = [],
  onSuccess,
}) {
  const updateMutation = useUpdateQuestionMutation();
  const [questionType, setQuestionType] = useState(
    question?.question_type || "multiple_choice"
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "options.choices",
  });

  useEffect(() => {
    if (question && isOpen) {
      const formData = {
        question_text: question.question_text || "",
        topic_id: question.topic_id || "",
        question_type: question.question_type || "multiple_choice",
        difficulty: question.difficulty || "medium",
        image_url: question.image_url || "",
        explanation: question.explanation || "",
      };

      // Handle options based on question type
      if (
        question.question_type === "multiple_choice" ||
        question.question_type === "multiple_response"
      ) {
        // Backend returns options as array directly
        const choices = Array.isArray(question.options) ? question.options : [];
        formData.options = { choices };
        replace(choices);
      } else if (question.question_type === "true_false") {
        // Find which option has is_correct: true
        const correctOption = Array.isArray(question.options)
          ? question.options.find((opt) => opt.is_correct)
          : null;
        formData.options = {
          correct_answer: correctOption?.id || "true",
        };
      } else if (question.question_type === "matching") {
        // For matching, options is an object with left_items, right_items, correct_matches
        formData.options = {
          left_items: question.options?.left_items || [],
          right_items: question.options?.right_items || [],
          correct_matches: question.options?.correct_matches || [],
        };
      }

      // Update question type when modal opens with a question
      // This is intentional to sync UI state with the question being edited
      if (question.question_type !== questionType) {
        setQuestionType(question.question_type);
      }
      reset(formData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, isOpen, reset, replace]);

  const onSubmit = async (data) => {
    try {
      let formattedOptions;

      if (
        questionType === "multiple_choice" ||
        questionType === "multiple_response"
      ) {
        formattedOptions = data.options.choices.map((choice, idx) => ({
          id: choice.id || String.fromCharCode(65 + idx),
          text: choice.text,
          is_correct: choice.is_correct || false,
        }));
      } else if (questionType === "true_false") {
        formattedOptions = [
          {
            id: "true",
            text: "True",
            is_correct: data.options.correct_answer === "true",
          },
          {
            id: "false",
            text: "False",
            is_correct: data.options.correct_answer === "false",
          },
        ];
      } else if (questionType === "matching") {
        formattedOptions = {
          left_items: data.options.left_items || [],
          right_items: data.options.right_items || [],
          correct_matches: data.options.correct_matches || [],
        };
      }

      const questionData = {
        question_text: data.question_text,
        topic_id: data.topic_id,
        question_type: questionType,
        difficulty: data.difficulty,
        options: formattedOptions,
        explanation: data.explanation,
        image_url: data.image_url || null,
      };

      await updateMutation.mutateAsync({
        questionId: question.question_id,
        data: questionData,
      });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update question:", error);
    }
  };

  const topicOptions = topics.map((topic) => ({
    value: topic.topic_id,
    label: topic.name,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Question" size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Topic Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic <span className="text-red-500">*</span>
          </label>
          <Select
            {...register("topic_id", { required: "Topic is required" })}
            options={[{ value: "", label: "Select a topic" }, ...topicOptions]}
          />
          {errors.topic_id && (
            <p className="text-xs text-red-500 mt-1">
              {errors.topic_id.message}
            </p>
          )}
        </div>

        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Type
          </label>
          <Select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            options={QUESTION_TYPE_OPTIONS}
            disabled
          />
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("question_text", {
              required: "Question text is required",
              minLength: {
                value: 10,
                message: "Question must be at least 10 characters",
              },
            })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.question_text && (
            <p className="text-xs text-red-500 mt-1">
              {errors.question_text.message}
            </p>
          )}
        </div>

        {/* Options based on question type */}
        {(questionType === "multiple_choice" ||
          questionType === "multiple_response") && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Answer Choices
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ text: "", is_correct: false })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Choice
              </Button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <span className="text-sm font-semibold text-gray-700 min-w-6 mt-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <div className="flex-1">
                    <Input
                      {...register(`options.choices.${index}.text`, {
                        required: "Choice text is required",
                      })}
                      className="w-full"
                      placeholder={`Enter choice ${String.fromCharCode(
                        65 + index
                      )} text...`}
                    />
                    {errors?.options?.choices?.[index]?.text && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.options.choices[index].text.message}
                      </p>
                    )}
                  </div>
                  <Controller
                    name={`options.choices.${index}.is_correct`}
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-2 px-3 py-2 bg-white rounded border border-gray-300 hover:bg-gray-50 cursor-pointer">
                        <input
                          type={
                            questionType === "multiple_choice"
                              ? "radio"
                              : "checkbox"
                          }
                          name={
                            questionType === "multiple_choice"
                              ? "correct_choice"
                              : field.name
                          }
                          checked={field.value || false}
                          onChange={(e) => {
                            if (questionType === "multiple_choice") {
                              // For radio: uncheck all others and check this one
                              fields.forEach((_, i) => {
                                setValue(
                                  `options.choices.${i}.is_correct`,
                                  i === index
                                );
                              });
                            } else {
                              // For checkbox: toggle this one
                              field.onChange(e.target.checked);
                            }
                          }}
                          className="w-4 h-4 text-blue-600"
                        />
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </label>
                    )}
                  />
                  {fields.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {questionType === "true_false" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer
            </label>
            <Select
              {...register("options.correct_answer")}
              options={[
                { value: "true", label: "True" },
                { value: "false", label: "False" },
              ]}
            />
          </div>
        )}

        {questionType === "matching" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Create items for the left and right columns, then define which
              items match.
            </p>

            {/* Left Items */}
            <Controller
              name="options.left_items"
              control={control}
              rules={{ required: "At least 2 left items required" }}
              render={({ field }) => (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Left Column Items <span className="text-red-500">*</span>
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newItems = [...(field.value || [])];
                        const newId = `L${newItems.length + 1}`;
                        newItems.push({ id: newId, text: "" });
                        field.onChange(newItems);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Left Item
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(field.value || []).map((item, index) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700 min-w-8">
                          {item.id}:
                        </span>
                        <Input
                          value={item.text}
                          onChange={(e) => {
                            const newItems = [...field.value];
                            newItems[index].text = e.target.value;
                            field.onChange(newItems);
                          }}
                          placeholder={`Enter left item ${index + 1}...`}
                          className="flex-1"
                        />
                        {field.value.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newItems = field.value.filter(
                                (_, i) => i !== index
                              );
                              field.onChange(newItems);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            />

            {/* Right Items */}
            <Controller
              name="options.right_items"
              control={control}
              rules={{ required: "At least 2 right items required" }}
              render={({ field }) => (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Right Column Items <span className="text-red-500">*</span>
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newItems = [...(field.value || [])];
                        const newId = `R${newItems.length + 1}`;
                        newItems.push({ id: newId, text: "" });
                        field.onChange(newItems);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Right Item
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(field.value || []).map((item, index) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700 min-w-8">
                          {item.id}:
                        </span>
                        <Input
                          value={item.text}
                          onChange={(e) => {
                            const newItems = [...field.value];
                            newItems[index].text = e.target.value;
                            field.onChange(newItems);
                          }}
                          placeholder={`Enter right item ${index + 1}...`}
                          className="flex-1"
                        />
                        {field.value.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newItems = field.value.filter(
                                (_, i) => i !== index
                              );
                              field.onChange(newItems);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            />

            {/* Correct Matches */}
            <Controller
              name="options.correct_matches"
              control={control}
              rules={{ required: "At least one match required" }}
              render={({ field: matchField }) => (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Correct Matches <span className="text-red-500">*</span>
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newMatches = [...(matchField.value || [])];
                        newMatches.push({ left_id: "", right_id: "" });
                        matchField.onChange(newMatches);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Match
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(matchField.value || []).map((match, index) => (
                      <Controller
                        key={index}
                        name={`options.left_items`}
                        control={control}
                        render={({ field: leftItemsField }) => (
                          <Controller
                            name={`options.right_items`}
                            control={control}
                            render={({ field: rightItemsField }) => (
                              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <Select
                                  value={match.left_id}
                                  onChange={(e) => {
                                    const newMatches = [...matchField.value];
                                    newMatches[index].left_id = e.target.value;
                                    matchField.onChange(newMatches);
                                  }}
                                  options={[
                                    { value: "", label: "Select left item..." },
                                    ...(leftItemsField.value || []).map(
                                      (item) => ({
                                        value: item.id,
                                        label: `${item.id}: ${
                                          item.text || "(empty)"
                                        }`,
                                      })
                                    ),
                                  ]}
                                  className="flex-1"
                                />
                                <span className="text-gray-500">→</span>
                                <Select
                                  value={match.right_id}
                                  onChange={(e) => {
                                    const newMatches = [...matchField.value];
                                    newMatches[index].right_id = e.target.value;
                                    matchField.onChange(newMatches);
                                  }}
                                  options={[
                                    {
                                      value: "",
                                      label: "Select right item...",
                                    },
                                    ...(rightItemsField.value || []).map(
                                      (item) => ({
                                        value: item.id,
                                        label: `${item.id}: ${
                                          item.text || "(empty)"
                                        }`,
                                      })
                                    ),
                                  ]}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newMatches = matchField.value.filter(
                                      (_, i) => i !== index
                                    );
                                    matchField.onChange(newMatches);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            )}
                          />
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            />
          </div>
        )}

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty <span className="text-red-500">*</span>
          </label>
          <Select
            {...register("difficulty", { required: "Difficulty is required" })}
            options={DIFFICULTY_OPTIONS}
            className="w-full"
          />
          {errors.difficulty && (
            <p className="text-xs text-red-500 mt-1">
              {errors.difficulty.message}
            </p>
          )}
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL (optional)
          </label>
          <Input
            {...register("image_url")}
            type="url"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("explanation", {
              required: "Explanation is required",
              minLength: {
                value: 20,
                message: "Explanation must be at least 20 characters",
              },
            })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.explanation && (
            <p className="text-xs text-red-500 mt-1">
              {errors.explanation.message}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={updateMutation.isPending}>
            Update Question
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * View Question Modal (Read-only)
 */
export function ViewQuestionModal({ isOpen, onClose, question }) {
  if (!question) return null;

  const typeLabels = {
    multiple_choice: "Multiple Choice",
    multiple_response: "Multiple Response",
    true_false: "True/False",
    matching: "Matching",
  };

  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="View Question" size="lg">
      <div className="space-y-6">
        {/* Topic and Type */}
        <div className="flex items-center gap-4">
          <Badge variant="outline">{question.topic_name || "No Topic"}</Badge>
          <Badge variant="outline">{typeLabels[question.question_type]}</Badge>
          <Badge
            className={difficultyColors[question.difficulty?.toLowerCase()]}
          >
            {question.difficulty}
          </Badge>
          <Badge
            variant={question.status === "active" ? "success" : "secondary"}
          >
            {question.status}
          </Badge>
        </div>

        {/* Question Text */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Question:</h3>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: question.question_text }}
          />
        </div>

        {/* Image */}
        {question.image_url && (
          <div>
            <img
              src={question.image_url}
              alt="Question"
              className="max-w-full h-auto rounded-lg border"
            />
          </div>
        )}

        {/* Options */}
        {(question.question_type === "multiple_choice" ||
          question.question_type === "multiple_response") && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Choices:</h3>
            <div className="space-y-2">
              {(Array.isArray(question.options) ? question.options : []).map(
                (choice) => (
                  <div
                    key={choice.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      choice.is_correct
                        ? "bg-green-50 border-green-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <span className="font-medium text-gray-700">
                      {choice.id}.
                    </span>
                    <span className="flex-1">{choice.text}</span>
                    {choice.is_correct && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {question.question_type === "true_false" && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Correct Answer:
            </h3>
            <Badge
              variant={(() => {
                const correctOption = Array.isArray(question.options)
                  ? question.options.find((opt) => opt.is_correct)
                  : null;
                return correctOption?.id === "true" ? "success" : "secondary";
              })()}
              className="text-base"
            >
              {(() => {
                const correctOption = Array.isArray(question.options)
                  ? question.options.find((opt) => opt.is_correct)
                  : null;
                return correctOption?.id === "true" ? "True" : "False";
              })()}
            </Badge>
          </div>
        )}

        {question.question_type === "matching" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Left Column Items:
              </h3>
              <div className="space-y-1">
                {question.options?.left_items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                  >
                    <span className="font-semibold text-gray-700 min-w-8">
                      {item.id}:
                    </span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Right Column Items:
              </h3>
              <div className="space-y-1">
                {question.options?.right_items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                  >
                    <span className="font-semibold text-gray-700 min-w-8">
                      {item.id}:
                    </span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Correct Matches:
              </h3>
              <div className="space-y-2">
                {question.options?.correct_matches?.map((match, idx) => {
                  const leftItem = question.options?.left_items?.find(
                    (item) => item.id === match.left_id
                  );
                  const rightItem = question.options?.right_items?.find(
                    (item) => item.id === match.right_id
                  );
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-3 bg-green-50 border border-green-300 rounded-lg"
                    >
                      <span className="font-semibold text-gray-700">
                        {match.left_id}:
                      </span>
                      <span className="flex-1">{leftItem?.text}</span>
                      <span className="text-gray-500">→</span>
                      <span className="font-semibold text-gray-700">
                        {match.right_id}:
                      </span>
                      <span className="flex-1">{rightItem?.text}</span>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Explanation */}
        {question.explanation && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Explanation:
            </h3>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">{question.explanation}</p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Times Used:</span>
              <span className="ml-2 font-medium">
                {question.times_used || 0}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Question ID:</span>
              <span className="ml-2 font-mono text-xs">
                {question.question_id}
              </span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
