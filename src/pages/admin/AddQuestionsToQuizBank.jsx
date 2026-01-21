/**
 * Add Questions to Quiz Bank Page
 * Browse and select questions to add to a quiz bank
 */

import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Filter,
  BookOpen,
  FileQuestion,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  useQuizBankQuestions,
  useAddQuestionsToQuizBankMutation,
  useQuizBank,
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

export function AddQuestionsToQuizBank() {
  const { quizBankId } = useParams();
  const navigate = useNavigate();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [topicId, setTopicId] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const pageSize = 20;

  // Selection state
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Fetch quiz bank details
  const { data: quizBank } = useQuizBank(quizBankId);

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

  // Build query params
  const queryParams = useMemo(() => {
    const params = {
      skip: (page - 1) * pageSize,
      limit: pageSize,
    };

    if (topicId) params.topic_id = topicId;
    if (questionType) params.question_type = questionType;
    if (searchQuery) params.search = searchQuery;

    return params;
  }, [searchQuery, topicId, questionType, page]);

  // Fetch available questions
  const { data: questionsData, isLoading: questionsLoading } =
    useQuestions(queryParams);
  const addQuestionsMutation = useAddQuestionsToQuizBankMutation();

  const questions = useMemo(() => {
    return questionsData?.items || questionsData || [];
  }, [questionsData]);

  const totalCount = questionsData?.total || questions.length || 0;

  // Filter out questions already in quiz bank for display
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
          <div className="min-w-0 flex-1">
            <div
              className="text-sm text-gray-900 break-words"
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
    questionType,
  ].filter(Boolean).length;

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setTopicId("");
    setQuestionType("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Add Questions to ${quizBank?.title || "Quiz Bank"}`}
        subtitle="Browse and select questions to add to this quiz bank"
        actions={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(`/quiz-banks/${quizBankId}`)}
          >
            Back to Quiz Bank
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Available
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {availableQuestions.length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileQuestion className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Already Added
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {existingQuestions.length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Selected
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {selectedQuestions.length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Circle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                >
                  Clear
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
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
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  value={topicId}
                  onChange={(e) => {
                    setTopicId(e.target.value);
                    setPage(1);
                  }}
                  options={topicOptions}
                />

                <Select
                  value={questionType}
                  onChange={(e) => {
                    setQuestionType(e.target.value);
                    setPage(1);
                  }}
                  options={QUESTION_TYPE_OPTIONS}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card>
        <CardContent className="p-6">
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
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {(page - 1) * pageSize + 1} to{" "}
                    {Math.min(page * pageSize, totalCount)} of {totalCount}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {page} of {Math.ceil(totalCount / pageSize)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(totalCount / pageSize)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {selectedQuestions.length > 0 && (
            <span>
              {selectedQuestions.length} question(s) selected
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="ml-2"
              >
                Clear Selection
              </Button>
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/quiz-banks/${quizBankId}`)}
          >
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
    </div>
  );
}

export default AddQuestionsToQuizBank;
