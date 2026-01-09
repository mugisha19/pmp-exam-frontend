/**
 * Admin Question Management Page
 * Manage questions with topic linking and various question types
 */

import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FileQuestion,
  X,
  Eye,
  Filter,
  BookOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuthStore } from "@/stores/auth.store";
import {
  useQuestions,
  useDeleteQuestionMutation,
} from "@/hooks/queries/useQuestionQueries";
import { useTopics } from "@/hooks/queries/useTopicQueries";
import { CreateQuestionModal } from "@/components/features/questions";

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
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

const DOMAIN_OPTIONS = [
  { value: "", label: "All Domains" },
  { value: "People", label: "People" },
  { value: "Process", label: "Process" },
  { value: "Business Environment", label: "Business Environment" },
];

export default function QuestionManagement() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [topicId, setTopicId] = useState("");
  const [domain, setDomain] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [showFilters, setShowFilters] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState(new Set());

  // Selection state
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

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
    if (domain) params.domain = domain;
    if (difficulty) params.difficulty = difficulty;
    if (questionType) params.question_type = questionType;
    if (status) params.status = status;
    if (searchQuery) params.search = searchQuery;

    return params;
  }, [searchQuery, topicId, domain, difficulty, questionType, status, page, pageSize]);

  // Fetch questions
  const { data: questionsData, isLoading, refetch } = useQuestions(queryParams);
  const deleteQuestionMutation = useDeleteQuestionMutation();

  const questions = useMemo(() => {
    return questionsData?.items || questionsData || [];
  }, [questionsData]);

  const totalCount = questionsData?.total || 0;

  // Group questions by topic
  const groupedQuestions = useMemo(() => {
    const groups = {};
    questions.forEach(question => {
      const topicName = question.topic_name || "No Topic";
      if (!groups[topicName]) {
        groups[topicName] = [];
      }
      groups[topicName].push(question);
    });
    return groups;
  }, [questions]);

  const toggleTopic = (topicName) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicName)) {
        newSet.delete(topicName);
      } else {
        newSet.add(topicName);
      }
      return newSet;
    });
  };

  // Selection handlers
  const handleSelectQuestion = useCallback((questionId, isSelected) => {
    setSelectedQuestions((prev) =>
      isSelected
        ? [...prev, questionId]
        : prev.filter((id) => id !== questionId)
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedQuestions([]);
  }, []);

  const getSelectedQuestion = useCallback(() => {
    if (selectedQuestions.length !== 1) return null;
    return questions.find((q) => q.question_id === selectedQuestions[0]);
  }, [selectedQuestions, questions]);

  // CRUD handlers
  const handleCreateQuestion = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleViewQuestion = useCallback(
    (question) => {
      navigate(`/questions/${question.question_id}`);
    },
    [navigate]
  );

  const handleEditQuestion = useCallback(
    (question) => {
      navigate(`/questions/${question.question_id}`);
    },
    [navigate]
  );

  const handleDeleteQuestion = useCallback((question) => {
    setSelectedQuestion(question);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedQuestion) return;

    await deleteQuestionMutation.mutateAsync(selectedQuestion.question_id);
    setIsDeleteDialogOpen(false);
    setSelectedQuestion(null);
    clearSelection();
  }, [selectedQuestion, deleteQuestionMutation, clearSelection]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedQuestions.length === 0) return;

    await Promise.all(
      selectedQuestions.map((questionId) =>
        deleteQuestionMutation.mutateAsync(questionId)
      )
    );
    clearSelection();
  }, [selectedQuestions, deleteQuestionMutation, clearSelection]);

  // Modal handlers
  const handleCreateModalClose = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    setIsCreateModalOpen(false);
    refetch();
  }, [refetch]);

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
    []
  );

  // Filters UI
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (topicId) count++;
    if (domain) count++;
    if (questionType) count++;
    if (difficulty) count++;
    if (status) count++;
    return count;
  }, [searchQuery, topicId, domain, questionType, difficulty, status]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setTopicId("");
    setDomain("");
    setQuestionType("");
    setDifficulty("");
    setStatus("");
    setPage(1);
  };

  const totalQuestionsCard = (
    <div className="mb-6">
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl shadow-md p-6 border border-gray-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gray-300 p-4 rounded-xl">
              <FileQuestion className="w-8 h-8 text-gray-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Questions
              </p>
              <p className="text-4xl font-bold text-gray-900">
                {totalCount || 0}
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-xs text-gray-600 font-medium">
                Available questions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const filtersUI = (
    <div className="bg-white rounded-lg border border-gray-200 mb-4">
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <h3 className="text-xs font-semibold text-gray-900">Filters</h3>
            {activeFilterCount > 0 && (
              <Badge variant="primary" className="text-xs px-1.5 py-0.5">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs h-7 px-2"
              >
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-7 px-2 text-xs"
            >
              {showFilters ? "Hide" : "Show"}
            </Button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="p-3 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by question text or explanation..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-9"
              size="sm"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Topic
              </label>
              <Select
                value={topicId}
                onChange={(e) => {
                  setTopicId(e.target.value);
                  setPage(1);
                }}
                options={topicOptions}
                className="w-full"
                size="sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Domain
              </label>
              <Select
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  setPage(1);
                }}
                options={DOMAIN_OPTIONS}
                className="w-full"
                size="sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Type
              </label>
              <Select
                value={questionType}
                onChange={(e) => {
                  setQuestionType(e.target.value);
                  setPage(1);
                }}
                options={QUESTION_TYPE_OPTIONS}
                className="w-full"
                size="sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <Select
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value);
                  setPage(1);
                }}
                options={DIFFICULTY_OPTIONS}
                className="w-full"
                size="sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                options={STATUS_OPTIONS}
                className="w-full"
                size="sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Selection actions bar
  const selectionBar = selectedQuestions.length > 0 && (
    <div className="flex items-center justify-between bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
          {selectedQuestions.length}
        </div>
        <span className="text-sm font-semibold text-gray-900">
          {selectedQuestions.length} question
          {selectedQuestions.length !== 1 ? "s" : ""} selected
        </span>
        <button
          onClick={clearSelection}
          className="text-gray-500 hover:text-gray-700 p-1 hover:bg-blue-100 rounded transition-colors"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {selectedQuestions.length === 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewQuestion(getSelectedQuestion())}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditQuestion(getSelectedQuestion())}
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteQuestion(getSelectedQuestion())}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </>
        )}

        {selectedQuestions.length > 1 && (
          <Button variant="danger" size="sm" onClick={handleBulkDelete} loading={deleteQuestionMutation.isPending}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete ({selectedQuestions.length})
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Question Bank Management"
        subtitle="Manage questions organized by topics for PMP exam preparation"
        actions={
          user?.role === "admin" && (
            <Button onClick={handleCreateQuestion} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Question
            </Button>
          )
        }
      />

      {totalQuestionsCard}

      {filtersUI}

      {selectionBar}

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedQuestions).map(([topicName, topicQuestions]) => {
            const isExpanded = expandedTopics.has(topicName);
            return (
              <div key={topicName} className="border border-gray-200 rounded-lg bg-white shadow-sm">
                <button
                  onClick={() => toggleTopic(topicName)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">{topicName}</span>
                    <Badge variant="default" size="sm">
                      {topicQuestions.length} {topicQuestions.length === 1 ? 'question' : 'questions'}
                    </Badge>
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-gray-200">
                    <DataTable
                      data={topicQuestions}
                      columns={columns}
                      loading={false}
                      rowKey="question_id"
                      paginated={false}
                      emptyMessage="No questions in this topic"
                      onRowClick={(question) => {
                        navigate(`/questions/${question.question_id}`);
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
          {Object.keys(groupedQuestions).length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FileQuestion className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No questions found. Create your first question to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Question Modal */}
      <CreateQuestionModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        onSuccess={handleCreateSuccess}
        topics={topics}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedQuestion(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Question"
        message={`Are you sure you want to delete this question? This action cannot be undone and may affect quiz banks using this question.`}
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleteQuestionMutation.isPending}
      />
    </div>
  );
}
