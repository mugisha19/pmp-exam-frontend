/**
 * Question Edit Page
 * Edit an existing question
 */

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";

import {
  useQuestion,
  useUpdateQuestionMutation,
} from "@/hooks/queries/useQuestionQueries";
import { useTopics } from "@/hooks/queries/useTopicQueries";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  QuestionTypeSelector,
  QuestionOptionsBuilder,
} from "@/components/features/questions/QuestionForm";

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

const DOMAIN_OPTIONS = [
  { value: "People", label: "People" },
  { value: "Process", label: "Process" },
  { value: "Business Environment", label: "Business Environment" },
];

export const QuestionEdit = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();

  // Fetch question and topics
  const {
    data: question,
    isLoading: questionLoading,
    isError,
  } = useQuestion(questionId);
  const { data: topicsData } = useTopics();
  const updateMutation = useUpdateQuestionMutation();

  const topics = topicsData?.items || topicsData || [];

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      question_text: "",
      question_type: "multiple_choice",
      topic_id: "",
      domain: "",
      difficulty: "medium",
      status: "active",
      options: [
        { text: "", is_correct: false },
        { text: "", is_correct: false },
      ],
      explanation: "",
    },
  });

  const questionType = watch("question_type");

  // Reset form when question data loads
  useEffect(() => {
    if (question && topics.length > 0) {
      reset({
        question_text: question.question_text || "",
        question_type: question.question_type || "multiple_choice",
        topic_id: question.topic_id || "",
        domain: question.domain || "",
        difficulty: question.difficulty || "medium",
        status: question.status || "active",
        options: question.options || [
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ],
        explanation: question.explanation || "",
      });
    }
  }, [question, topics, reset]);

  const onSubmit = async (data) => {
    try {
      await updateMutation.mutateAsync({
        questionId,
        data,
      });
      toast.success("Question updated successfully");
      navigate(`/questions/${questionId}`);
    } catch (error) {
      toast.error(error.message || "Failed to update question");
    }
  };

  const topicOptions = [
    { value: "", label: "Select Topic" },
    ...topics.map((topic) => ({
      value: topic.topic_id,
      label: topic.name,
    })),
  ];

  // Loading state
  if (questionLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error or not found state
  if (isError || !question) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <EmptyState
          title="Question not found"
          description="The question you're trying to edit doesn't exist or has been deleted."
          actionLabel="Go Back"
          onAction={() => navigate(-1)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Edit Question"
        subtitle="Update question details and options"
        actions={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h3>

            <div className="space-y-4">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("question_text", {
                    required: "Question text is required",
                  })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Enter the question text..."
                />
                {errors.question_text && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.question_text.message}
                  </p>
                )}
              </div>

              {/* Question Type & Topic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="question_type"
                    control={control}
                    rules={{ required: "Question type is required" }}
                    render={({ field }) => (
                      <QuestionTypeSelector
                        value={field.value}
                        onChange={field.onChange}
                        options={QUESTION_TYPE_OPTIONS}
                      />
                    )}
                  />
                  {errors.question_type && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.question_type.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic <span className="text-red-500">*</span>
                  </label>
                  <Select
                    {...register("topic_id", { required: "Topic is required" })}
                    options={topicOptions}
                  />
                  {errors.topic_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.topic_id.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Domain, Difficulty & Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain <span className="text-red-500">*</span>
                  </label>
                  <Select
                    {...register("domain", { required: "Domain is required" })}
                    options={DOMAIN_OPTIONS}
                  />
                  {errors.domain && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.domain.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty <span className="text-red-500">*</span>
                  </label>
                  <Select
                    {...register("difficulty", {
                      required: "Difficulty is required",
                    })}
                    options={DIFFICULTY_OPTIONS}
                  />
                  {errors.difficulty && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.difficulty.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <Select
                    {...register("status", { required: "Status is required" })}
                    options={STATUS_OPTIONS}
                  />
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answer Options */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Answer Options
            </h3>
            <Controller
              name="options"
              control={control}
              rules={{
                validate: (value) => {
                  if (!value || value.length < 2) {
                    return "At least 2 options are required";
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <QuestionOptionsBuilder
                  questionType={questionType}
                  options={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.options && (
              <p className="mt-2 text-sm text-red-600">
                {errors.options.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Explanation */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Explanation
            </h3>
            <textarea
              {...register("explanation")}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Provide an explanation for the correct answer..."
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={updateMutation.isPending}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuestionEdit;
