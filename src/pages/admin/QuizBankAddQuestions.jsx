/**
 * Add Questions to Quiz Bank Page
 * Browse and select questions to add to a quiz bank
 */

import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
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

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  useQuizBank,
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

export default function QuizBankAddQuestions() {
  const { quizBankId } = useParams();
  const navigate = useNavigate();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [topicId, setTopicId] = useState("");
  const [domain, setDomain] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [status, setStatus] = useState(""); // Show all statuses by default
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const pageSize = 20;

  // Selection state
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Fetch quiz bank details
  const { data: quizBank, isLoading: quizBankLoading } =
    useQuizBank(quizBankId);

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
    
    // Always include exclude_quiz_bank_id if we have a quizBankId
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

  // Fetch available questions (filtered server-side to exclude questions already in quiz bank)
  const { data: questionsData, isLoading: questionsLoading } =
    useQuestions(queryParams);
  const addQuestionsMutation = useAddQuestionsToQuizBankMutation();

  const questions = useMemo(() => {
    const result = questionsData?.items || questionsData || [];
    return result;
  }, [questionsData]);

  // Use total from API since server-side filtering is now done
  const totalCount = questionsData?.total || questions.length || 0;

  // Questions are already filtered server-side, but keep client-side filter as safety fallback
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
      toast.success(
        `Successfully added ${selectedQuestions.length} question(s) to quiz bank`
      );
      navigate(`/quiz-banks/${quizBankId}`);
    } catch (error) {
      const message =
        typeof error === "object"
          ? error.message || JSON.stringify(error)
          : error;
      toast.error(`Failed to add questions: ${message}`);
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

  // Loading state
  if (quizBankLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Quiz bank not found
  if (!quizBank) {
    return (
      <div className="p-6">
        <EmptyState
          icon={BookOpen}
          title="Quiz bank not found"
          description="The quiz bank you're looking for doesn't exist."
          actionLabel="Go Back"
          onAction={() => navigate("/quiz-banks")}
        />
      </div>
    );
  }

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

  // Stats cards data
  const statsCards = [
    {
      label: "Available Questions",
      value: availableQuestions.length,
      icon: FileQuestion,
      color: "blue",
    },
    {
      label: "Already Added",
      value: existingQuestions.length,
      icon: CheckCircle2,
      color: "green",
    },
    {
      label: "Selected",
      value: selectedQuestions.length,
      icon: Circle,
      color: "purple",
    },
  ];

  // Filters UI
  const filtersUI = (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                leftIcon={<X className="w-4 h-4" />}
              >
                Clear All
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search questions by text..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <Select
                value={topicId}
                onChange={(e) => {
                  setTopicId(e.target.value);
                  setPage(1);
                }}
                options={topicOptions}
              />

              <Select
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  setPage(1);
                }}
                options={DOMAIN_OPTIONS}
              />

              <Select
                value={questionType}
                onChange={(e) => {
                  setQuestionType(e.target.value);
                  setPage(1);
                }}
                options={QUESTION_TYPE_OPTIONS}
              />

              <Select
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value);
                  setPage(1);
                }}
                options={DIFFICULTY_OPTIONS}
              />

              <Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                options={STATUS_OPTIONS}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Selection bar
  const selectionBar = selectedQuestions.length > 0 && (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">
                {selectedQuestions.length} question
                {selectedQuestions.length !== 1 ? "s" : ""} selected
              </p>
              <button
                onClick={clearSelection}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Clear selection
              </button>
            </div>
          </div>

          <Button
            onClick={handleAddQuestions}
            loading={addQuestionsMutation.isPending}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add to Quiz Bank
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={`Add Questions to "${quizBank.title}"`}
        subtitle={`Browse and select questions to add to this quiz bank`}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    stat.color === "blue"
                      ? "bg-blue-100"
                      : stat.color === "green"
                      ? "bg-green-100"
                      : "bg-purple-100"
                  }`}
                >
                  <stat.icon
                    className={`w-6 h-6 ${
                      stat.color === "blue"
                        ? "text-blue-600"
                        : stat.color === "green"
                        ? "text-green-600"
                        : "text-purple-600"
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      {filtersUI}

      {/* Selection Bar */}
      {selectionBar}

      {/* Questions Table */}
      <Card>
        <CardContent className="p-6">
          {availableQuestions.length === 0 && !questionsLoading ? (
            <EmptyState
              icon={Filter}
              title="No questions available"
              description={
                existingQuestionIds.size > 0
                  ? "All matching questions are already in this quiz bank. Try adjusting your filters or create new questions."
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
                  <div className="text-sm text-gray-600">
                    Showing {(page - 1) * pageSize + 1} to{" "}
                    {Math.min(page * pageSize, totalCount)} of {totalCount}{" "}
                    questions
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
    </div>
  );
}
