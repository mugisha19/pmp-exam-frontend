/**
 * Add Questions to Quiz Bank Modal
 * Browse and select questions to add to a quiz bank
 */

import { useState, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Filter,
  BookOpen,
  FileQuestion,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable } from "@/components/shared/DataTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  useQuizBankQuestions,
  useAddQuestionsToQuizBankMutation,
} from "@/hooks/queries/useQuizBankQueries";
import { useQuestions } from "@/hooks/queries/useQuestionQueries";
import { useTopics } from "@/hooks/queries/useTopicQueries";

const QUESTION_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "multiple_response", label: "Multiple Response" },
  { value: "true_false", label: "True/False" },
  { value: "matching", label: "Matching" },
];

const DIFFICULTY_OPTIONS = [
  { value: "", label: "All Difficulties" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const DOMAIN_OPTIONS = [
  { value: "", label: "All Domains" },
  { value: "People", label: "People" },
  { value: "Process", label: "Process" },
  { value: "Business Environment", label: "Business Environment" },
];

export function AddQuestionsModal({ isOpen, onClose, quizBankId, onSuccess }) {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [topicId, setTopicId] = useState("");
  const [domain, setDomain] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const pageSize = 20;

  // Selection state
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Fetch existing questions in quiz bank
  const { data: existingQuestionsData } = useQuizBankQuestions(quizBankId);
  const existingQuestions = useMemo(() => {
    return existingQuestionsData?.items || existingQuestionsData || [];
  }, [existingQuestionsData]);
  const existingQuestionIds = useMemo(
    () => new Set(existingQuestions.map((q) => q.question_id)),
    [existingQuestions]
  );

  // Fetch topics for filter dropdown
  const { data: topicsData } = useTopics();
  const topics = useMemo(() => {
    return topicsData?.items || topicsData || [];
  }, [topicsData]);

  // Build query params - include exclude_quiz_bank_id to filter server-side
  const queryParams = useMemo(() => {
    const params = {
      skip: (page - 1) * pageSize,
      limit: pageSize,
    };

    // Exclude questions already in this quiz bank (server-side filtering)
    if (quizBankId) {
      params.exclude_quiz_bank_id = quizBankId;
    }

    if (topicId) params.topic_id = topicId;
    if (domain) params.domain = domain;
    if (difficulty) params.difficulty = difficulty;
    if (questionType) params.question_type = questionType;
    if (status) params.status = status;
    if (searchQuery) params.search = searchQuery;

    return params;
  }, [searchQuery, topicId, domain, difficulty, questionType, status, page, quizBankId]);

  // Fetch available questions (filtered server-side)
  const { data: questionsData, isLoading: questionsLoading } =
    useQuestions(queryParams);
  const addQuestionsMutation = useAddQuestionsToQuizBankMutation();

  const questions = useMemo(() => {
    return questionsData?.items || questionsData || [];
  }, [questionsData]);

  // Use total from API since server-side filtering is now done
  const totalCount = questionsData?.total || questions.length || 0;

  // Questions are already filtered server-side, but keep client-side filter as fallback
  const availableQuestions = useMemo(() => {
    return questions.filter((q) => !existingQuestionIds.has(q.question_id));
  }, [questions, existingQuestionIds]);

  // Selection handlers
  const handleToggleSelection = useCallback((questionId) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedQuestions.length === availableQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(availableQuestions.map((q) => q.question_id));
    }
  }, [availableQuestions, selectedQuestions.length]);

  const clearSelection = useCallback(() => {
    setSelectedQuestions([]);
  }, []);

  // Add questions handler
  const handleAddQuestions = async () => {
    if (selectedQuestions.length === 0) {
      toast.error("Please select at least one question");
      return;
    }

    try {
      await addQuestionsMutation.mutateAsync({
        quizBankId,
        questionIds: selectedQuestions,
      });
      setSelectedQuestions([]);
      // Don't close modal - let user continue adding more questions
      // The queries will auto-refetch due to invalidation in the mutation
      onSuccess?.();
    } catch (error) {
      // Error toast is already handled by the mutation
    }
  };

  // Topic options for filter
  const topicOptions = useMemo(() => {
    return [
      { value: "", label: "All Topics" },
      ...topics.map((topic) => ({
        value: topic.topic_id,
        label: topic.name,
      })),
    ];
  }, [topics]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        key: "selection",
        header: () => (
          <button
            onClick={handleSelectAll}
            className="flex items-center justify-center w-full"
          >
            {selectedQuestions.length === availableQuestions.length &&
            availableQuestions.length > 0 ? (
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
          </button>
        ),
        render: (_, question) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleSelection(question.question_id);
            }}
            className="flex items-center justify-center w-full"
          >
            {selectedQuestions.includes(question.question_id) ? (
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
          </button>
        ),
      },
      {
        key: "question_text",
        header: "Question",
        render: (_, question) => (
          <div className="max-w-2xl">
            <div
              className="text-sm text-gray-900 line-clamp-2"
              dangerouslySetInnerHTML={{
                __html: question?.question_text || "",
              }}
            />
          </div>
        ),
      },
      {
        key: "topic_name",
        header: "Topic",
        sortable: true,
        render: (_, question) => (
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{question?.topic_name || "N/A"}</span>
          </div>
        ),
      },
      {
        key: "question_type",
        header: "Type",
        sortable: true,
        render: (_, question) => {
          const typeLabels = {
            multiple_choice: "Multiple Choice",
            multiple_response: "Multiple Response",
            true_false: "True/False",
            matching: "Matching",
          };
          return (
            <Badge variant="outline">
              {typeLabels[question?.question_type] || question?.question_type}
            </Badge>
          );
        },
      },
      {
        key: "difficulty",
        header: "Difficulty",
        sortable: true,
        render: (_, question) => {
          const variants = {
            easy: "success",
            medium: "warning",
            hard: "danger",
          };
          return (
            <Badge
              variant={
                variants[question?.difficulty?.toLowerCase()] || "secondary"
              }
            >
              {question?.difficulty}
            </Badge>
          );
        },
      },
    ],
    [
      selectedQuestions,
      availableQuestions,
      handleSelectAll,
      handleToggleSelection,
    ]
  );

  // Count active filters
  const activeFiltersCount = [
    searchQuery,
    topicId,
    domain,
    difficulty,
    questionType,
    status,
  ].filter(Boolean).length;

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setTopicId("");
    setDomain("");
    setDifficulty("");
    setQuestionType("");
    setStatus("");
    setPage(1);
  };

  // Reset state when modal closes
  const handleClose = () => {
    setSelectedQuestions([]);
    setSearchQuery("");
    setTopicId("");
    setDomain("");
    setDifficulty("");
    setQuestionType("");
    setStatus("");
    setPage(1);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Questions to Quiz Bank"
      size="xl"
    >
      <div className="space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Available
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {availableQuestions.length}
                  </p>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileQuestion className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Already Added
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {existingQuestions.length}
                  </p>
                </div>
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Selected
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {selectedQuestions.length}
                  </p>
                </div>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Circle className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <h3 className="text-xs font-semibold text-gray-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs h-7 px-2"
                  >
                    Clear
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-7 px-2"
                >
                  {showFilters ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9 h-9 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                  <Select
                    value={topicId}
                    onChange={(e) => {
                      setTopicId(e.target.value);
                      setPage(1);
                    }}
                    options={topicOptions}
                    className="text-sm"
                  />

                  <Select
                    value={domain}
                    onChange={(e) => {
                      setDomain(e.target.value);
                      setPage(1);
                    }}
                    options={DOMAIN_OPTIONS}
                    className="text-sm"
                  />

                  <Select
                    value={questionType}
                    onChange={(e) => {
                      setQuestionType(e.target.value);
                      setPage(1);
                    }}
                    options={QUESTION_TYPE_OPTIONS}
                    className="text-sm"
                  />

                  <Select
                    value={difficulty}
                    onChange={(e) => {
                      setDifficulty(e.target.value);
                      setPage(1);
                    }}
                    options={DIFFICULTY_OPTIONS}
                    className="text-sm"
                  />

                  <Select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setPage(1);
                    }}
                    options={STATUS_OPTIONS}
                    className="text-sm"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions Table */}
        <div className="max-h-96 overflow-y-auto">
          {availableQuestions.length === 0 && !questionsLoading ? (
            <EmptyState
              icon={Filter}
              title="No questions available"
              description={
                existingQuestionIds.size > 0
                  ? "All matching questions are already in this quiz bank. Try adjusting your filters."
                  : "No questions match your filters. Try adjusting your search criteria."
              }
              actionLabel="Clear Filters"
              onAction={clearAllFilters}
            />
          ) : (
            <>
              <DataTable
                data={availableQuestions}
                columns={columns}
                loading={questionsLoading}
                rowKey="question_id"
                paginated={false}
                onRowClick={(question) =>
                  handleToggleSelection(question.question_id)
                }
                emptyMessage="No questions found"
              />

              {/* Pagination Controls */}
              {totalCount > pageSize && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-xs text-gray-600">
                    Showing {(page - 1) * pageSize + 1} to{" "}
                    {Math.min(page * pageSize, totalCount)} of {totalCount}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="text-xs h-7 px-2"
                    >
                      Prev
                    </Button>
                    <span className="text-xs text-gray-600">
                      Page {page} of {Math.ceil(totalCount / pageSize)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(totalCount / pageSize)}
                      className="text-xs h-7 px-2"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddQuestions}
            loading={addQuestionsMutation.isPending}
            disabled={selectedQuestions.length === 0}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add {selectedQuestions.length > 0 ? `${selectedQuestions.length} ` : ""}Question{selectedQuestions.length !== 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    </Modal>
  );
}


