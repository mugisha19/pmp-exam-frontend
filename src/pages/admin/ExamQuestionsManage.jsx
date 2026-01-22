/**
 * Quiz Questions Management Page
 * Manage questions in a published quiz (add/edit/delete)
 */

import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui";
import { PageHeader } from "@/components/shared/PageHeader";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  getQuizById,
  getQuizQuestions,
  getQuizTopics,
  addQuestionToQuiz,
  updateQuizQuestion,
  deleteQuizQuestion,
} from "@/services/quiz.service";
import { getQuestions } from "@/services/question.service";

export default function ExamQuestionsManage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, question: null });
  const [editDialog, setEditDialog] = useState({ isOpen: false, question: null });
  const [editUnlocked, setEditUnlocked] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [addDialog, setAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState({
    topic_id: "",
    question_type: "",
    sort_order: "asc",
  });
  const [showFilters, setShowFilters] = useState(true);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [availablePage, setAvailablePage] = useState(1);
  const availablePageSize = 20;

  const { data: exam, isLoading: loadingExam } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => getQuizById(examId),
    enabled: !!examId,
  });

  const { data: questionsData, isLoading: loadingQuestions } = useQuery({
    queryKey: ["exam-questions", examId, page, filters],
    queryFn: () => {
      const params = {
        skip: (page - 1) * pageSize,
        limit: pageSize,
        sort_order: filters.sort_order,
      };
      if (filters.topic_id) params.topic_id = filters.topic_id;
      if (filters.question_type) params.question_type = filters.question_type;
      return getQuizQuestions(examId, params);
    },
    enabled: !!examId,
  });

  const { data: topics } = useQuery({
    queryKey: ["exam-topics", examId],
    queryFn: () => getQuizTopics(examId),
    enabled: !!examId,
  });

  const questions = questionsData?.items || [];
  const totalQuestions = questionsData?.total || 0;

  const { data: availableQuestions, isLoading: loadingAvailable } = useQuery({
    queryKey: ["available-questions", searchTerm, examId, availablePage],
    queryFn: () => {
      const params = {
        search: searchTerm,
        exclude_quiz_id: examId,
        skip: (availablePage - 1) * availablePageSize,
        limit: availablePageSize,
      };
      return getQuestions(params);
    },
    enabled: addDialog,
  });

  const availableItems = availableQuestions?.items || [];
  const availableTotal = availableQuestions?.total || 0;

  const addMutation = useMutation({
    mutationFn: (questionId) => addQuestionToQuiz(examId, questionId),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["exam-questions", examId]);
      queryClient.invalidateQueries(["exam", examId]);
      queryClient.invalidateQueries(["exam-topics", examId]);
      if (data.note) {
        toast(data.note, { duration: 5000, icon: "ℹ️" });
      }
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to add question");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ quizQuestionId, data }) => updateQuizQuestion(examId, quizQuestionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["exam-questions", examId]);
      queryClient.invalidateQueries(["exam", examId]);
      toast.success("Question updated successfully");
      setEditDialog({ isOpen: false, question: null });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update question");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (quizQuestionId) => deleteQuizQuestion(examId, quizQuestionId),
    onSuccess: () => {
      queryClient.invalidateQueries(["exam-questions", examId]);
      queryClient.invalidateQueries(["exam", examId]);
      queryClient.invalidateQueries(["exam-topics", examId]);
      toast.success("Question deleted successfully");
      setDeleteDialog({ isOpen: false, question: null });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete question");
      setDeleteDialog({ isOpen: false, question: null });
    },
  });

  const handleEdit = (question) => {
    setEditDialog({ isOpen: true, question });
    setEditUnlocked(false);
    setQuestionText(question.question_text || "");
  };

  const handleUpdateQuestion = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    let updatedOptions = editDialog.question.options;
    let updatedCorrectAnswer = editDialog.question.correct_answer;
    
    // If editing answers is unlocked, update options and correct answer
    if (editUnlocked) {
      const questionType = editDialog.question.question_type;
      
      if (questionType === "multiple_choice" || questionType === "multiple_response" || questionType === "true_false") {
        // Update options from form
        updatedOptions = editDialog.question.options.map((opt, idx) => {
          const text = formData.get(`option_${idx}_text`);
          const explanation = formData.get(`option_${idx}_explanation`);
          let isCorrect = false;
          
          if (questionType === "multiple_response") {
            // For multiple response, check checkbox directly from form element
            const checkbox = form.elements[`option_${idx}_correct`];
            isCorrect = checkbox ? checkbox.checked : false;
          } else {
            // For multiple choice and true/false, check which radio is selected
            const selectedOption = formData.get("correct_option");
            isCorrect = selectedOption === String(idx);
          }
          
          return { ...opt, text, explanation, is_correct: isCorrect };
        });
        
        // Update correct answer based on type
        if (questionType === "multiple_choice" || questionType === "true_false") {
          const correctOpt = updatedOptions.find(opt => opt.is_correct);
          updatedCorrectAnswer = correctOpt ? correctOpt.id : null;
        } else {
          updatedCorrectAnswer = updatedOptions.filter(opt => opt.is_correct).map(opt => opt.id);
        }
      } else if (questionType === "matching") {
        // For matching questions, update pairs and correct matches
        const leftItems = editDialog.question.options.left_items || [];
        const rightItems = editDialog.question.options.right_items || [];
        
        const updatedLeftItems = leftItems.map((item, idx) => ({
          ...item,
          text: formData.get(`left_${idx}_text`)
        }));
        
        const updatedRightItems = rightItems.map((item, idx) => ({
          ...item,
          text: formData.get(`right_${idx}_text`)
        }));
        
        const correctMatches = leftItems.map((item, idx) => ({
          left_id: item.id,
          right_id: formData.get(`match_${idx}`),
          explanation: formData.get(`match_${idx}_explanation`)
        }));
        
        updatedOptions = {
          left_items: updatedLeftItems,
          right_items: updatedRightItems,
          correct_matches: correctMatches
        };
        updatedCorrectAnswer = correctMatches;
      }
    } else {
      // If not unlocked, only update text and explanations, preserve is_correct
      const questionType = editDialog.question.question_type;
      
      if (questionType === "multiple_choice" || questionType === "multiple_response" || questionType === "true_false") {
        updatedOptions = editDialog.question.options.map((opt, idx) => {
          const text = formData.get(`option_${idx}_text`);
          const explanation = formData.get(`option_${idx}_explanation`);
          return { ...opt, text, explanation }; // Keep original is_correct
        });
      } else if (questionType === "matching") {
        const leftItems = editDialog.question.options.left_items || [];
        const rightItems = editDialog.question.options.right_items || [];
        
        const updatedLeftItems = leftItems.map((item, idx) => ({
          ...item,
          text: formData.get(`left_${idx}_text`)
        }));
        
        const updatedRightItems = rightItems.map((item, idx) => ({
          ...item,
          text: formData.get(`right_${idx}_text`)
        }));
        
        updatedOptions = {
          left_items: updatedLeftItems,
          right_items: updatedRightItems,
          correct_matches: editDialog.question.options.correct_matches // Keep original
        };
      }
    }
    
    const data = {
      question_text: questionText,
      image_url: formData.get("image_url") || null,
      difficulty: formData.get("difficulty"),
      topic_id: formData.get("topic_id"),
      options: updatedOptions,
      correct_answer: updatedCorrectAnswer,
    };
    
    updateMutation.mutate({ quizQuestionId: editDialog.question.quiz_question_id, data });
  };

  const handleDelete = (question) => {
    setDeleteDialog({ isOpen: true, question });
  };

  const confirmDelete = () => {
    deleteMutation.mutate(deleteDialog.question.quiz_question_id);
  };

  const handleToggleSelection = useCallback((questionId) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedQuestions.length === availableItems.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(availableItems.map((q) => q.question_id));
    }
  }, [availableItems, selectedQuestions.length]);

  const clearSelection = useCallback(() => {
    setSelectedQuestions([]);
  }, []);

  const handleAddQuestion = async () => {
    if (selectedQuestions.length === 0) {
      toast.error("Please select at least one question");
      return;
    }

    try {
      for (const questionId of selectedQuestions) {
        await addMutation.mutateAsync(questionId);
      }
      toast.success(`Successfully added ${selectedQuestions.length} question(s)`);
      setSelectedQuestions([]);
      setAddDialog(false);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const activeFiltersCount = [searchTerm].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearchTerm("");
    setAvailablePage(1);
  };

  if (loadingExam || loadingQuestions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Exam not found</p>
          <Button onClick={() => navigate("/admin/exams")} className="mt-4">
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={`Manage Questions - ${exam.title}`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate(`/exams/${examId}?tab=questions`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Exam
            </Button>
            <Button onClick={() => setAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        }
      />

      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>New questions will only appear in NEW attempts</li>
              <li>Editing questions affects attempt reviews</li>
              <li>Cannot delete questions if answers exist</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic
            </label>
            <select
              value={filters.topic_id}
              onChange={(e) => {
                setFilters({ ...filters, topic_id: e.target.value });
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Topics</option>
              {topics?.map((topic) => (
                <option key={topic.topic_id} value={topic.topic_id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Type
            </label>
            <select
              value={filters.question_type}
              onChange={(e) => {
                setFilters({ ...filters, question_type: e.target.value });
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="multiple_response">Multiple Response</option>
              <option value="true_false">True/False</option>
              <option value="matching">Matching</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort Order
            </label>
            <select
              value={filters.sort_order}
              onChange={(e) => {
                setFilters({ ...filters, sort_order: e.target.value });
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="asc">Oldest First</option>
              <option value="desc">Newest First</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Questions ({totalQuestions})
          </h3>
        </div>

        {questions.length > 0 ? (
          <>
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={q.quiz_question_id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <span className="font-semibold text-gray-500 text-lg">
                      #{(page - 1) * pageSize + idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-gray-900 mb-2 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: q.question_text }} />
                      <div className="flex gap-2">
                        <Badge variant="default" size="sm">
                          {q.question_type}
                        </Badge>
                        {q.topic_name && (
                          <Badge variant="secondary" size="sm">
                            {q.topic_name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(q)}
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(q)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalQuestions > pageSize && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {(page - 1) * pageSize + 1} to{" "}
                  {Math.min(page * pageSize, totalQuestions)} of {totalQuestions}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page * pageSize >= totalQuestions}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={Search}
            title="No questions"
            description="This quiz has no questions yet. Add questions from the question bank."
            action={
              <Button onClick={() => setAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            }
          />
        )}
      </Card>

      {/* Add Question Dialog */}
      {addDialog && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Add Questions from Question Bank</h2>
                <button
                  onClick={() => {
                    setAddDialog(false);
                    setSelectedQuestions([]);
                    setSearchTerm("");
                    setAvailablePage(1);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Search and Filters */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">Search</h3>
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {activeFiltersCount} active
                      </Badge>
                    )}
                  </div>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search questions by text..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setAvailablePage(1);
                    }}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </Card>

              {/* Selection Bar */}
              {selectedQuestions.length > 0 && (
                <Card className="p-4 border-blue-200 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">
                          {selectedQuestions.length} question{selectedQuestions.length !== 1 ? "s" : ""} selected
                        </p>
                        <button
                          onClick={clearSelection}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Clear selection
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Questions List */}
              {loadingAvailable ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : availableItems.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {availableItems.map((q) => (
                      <div
                        key={q.question_id}
                        onClick={() => handleToggleSelection(q.question_id)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSelection(q.question_id);
                            }}
                            className="flex-shrink-0 mt-1"
                          >
                            {selectedQuestions.includes(q.question_id) ? (
                              <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="text-sm text-gray-900 mb-2 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: q.question_text }} />
                            <div className="flex gap-2">
                              <Badge variant="default" size="sm">
                                {q.question_type}
                              </Badge>
                              {q.difficulty && (
                                <Badge variant="info" size="sm">
                                  {q.difficulty}
                                </Badge>
                              )}
                              {q.topic_name && (
                                <Badge variant="secondary" size="sm">
                                  {q.topic_name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {availableTotal > availablePageSize && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        Showing {(availablePage - 1) * availablePageSize + 1} to{" "}
                        {Math.min(availablePage * availablePageSize, availableTotal)} of {availableTotal}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAvailablePage(availablePage - 1)}
                          disabled={availablePage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <span className="text-sm text-gray-600 flex items-center">
                          Page {availablePage} of {Math.ceil(availableTotal / availablePageSize)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAvailablePage(availablePage + 1)}
                          disabled={availablePage >= Math.ceil(availableTotal / availablePageSize)}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  icon={Search}
                  title="No questions available"
                  description={searchTerm ? "No questions match your search. Try different keywords." : "All questions from the question bank are already added to this quiz."}
                />
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setAddDialog(false);
                  setSelectedQuestions([]);
                  setSearchTerm("");
                  setAvailablePage(1);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddQuestion}
                disabled={selectedQuestions.length === 0 || addMutation.isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add {selectedQuestions.length > 0 ? `(${selectedQuestions.length})` : ""}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Dialog */}
      {editDialog.isOpen && editDialog.question && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Edit Question</h2>
                <button
                  onClick={() => setEditDialog({ isOpen: false, question: null })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateQuestion}>
              <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text
                  </label>
                  <RichTextEditor
                    value={questionText}
                    onChange={setQuestionText}
                    placeholder="Enter question text..."
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    defaultValue={editDialog.question.image_url || ""}
                    placeholder="https://example.com/image.png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    defaultValue={editDialog.question.difficulty || "medium"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Topic */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic
                  </label>
                  <select
                    name="topic_id"
                    defaultValue={editDialog.question.topic_id}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {topics?.map((topic) => (
                      <option key={topic.topic_id} value={topic.topic_id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Answer Editing Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Answer Options
                    </label>
                    {!editUnlocked && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditUnlocked(true)}
                      >
                        Unlock to Edit Answers
                      </Button>
                    )}
                    {editUnlocked && (
                      <Badge variant="warning">Editing Unlocked</Badge>
                    )}
                  </div>

                  {(editDialog.question.question_type === "multiple_choice" || 
                    editDialog.question.question_type === "multiple_response" ||
                    editDialog.question.question_type === "true_false") && (
                    <div className="space-y-3">
                      {editDialog.question.options?.map((opt, idx) => (
                        <div key={idx} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-3">
                            <input
                              type={editDialog.question.question_type === "multiple_response" ? "checkbox" : "radio"}
                              name={editDialog.question.question_type === "multiple_response" ? `option_${idx}_correct` : "correct_option"}
                              value={idx}
                              defaultChecked={opt.is_correct}
                              disabled={!editUnlocked}
                              className="w-4 h-4"
                            />
                            <input
                              type="text"
                              name={`option_${idx}_text`}
                              defaultValue={opt.text}
                              disabled={!editUnlocked}
                              placeholder={`Option ${idx + 1}`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                            />
                          </div>
                          <textarea
                            name={`option_${idx}_explanation`}
                            defaultValue={opt.explanation || ""}
                            disabled={!editUnlocked}
                            placeholder="Explanation for this option (optional)"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {editDialog.question.question_type === "matching" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Left Items</h4>
                          <div className="space-y-2">
                            {editDialog.question.options?.left_items?.map((item, idx) => (
                              <input
                                key={idx}
                                type="text"
                                name={`left_${idx}_text`}
                                defaultValue={item.text}
                                disabled={!editUnlocked}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Right Items</h4>
                          <div className="space-y-2">
                            {editDialog.question.options?.right_items?.map((item, idx) => (
                              <input
                                key={idx}
                                type="text"
                                name={`right_${idx}_text`}
                                defaultValue={item.text}
                                disabled={!editUnlocked}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {editUnlocked && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Correct Matches</h4>
                          <div className="space-y-3">
                            {editDialog.question.options?.left_items?.map((leftItem, idx) => {
                              const currentMatch = editDialog.question.options?.correct_matches?.find(m => m.left_id === leftItem.id);
                              return (
                                <div key={idx} className="border rounded-lg p-3 space-y-2">
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600 w-1/3">{leftItem.text}</span>
                                    <span className="text-gray-400">→</span>
                                    <select
                                      name={`match_${idx}`}
                                      defaultValue={currentMatch?.right_id}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                      {editDialog.question.options?.right_items?.map((rightItem) => (
                                        <option key={rightItem.id} value={rightItem.id}>
                                          {rightItem.text}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <textarea
                                    name={`match_${idx}_explanation`}
                                    defaultValue={currentMatch?.explanation || ""}
                                    placeholder="Explanation for this match (optional)"
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Warning:</p>
                      <p>Updating this question will affect future attempts and reviews. Historical scores remain unchanged.</p>
                      {editUnlocked && (
                        <p className="mt-2 font-semibold">Editing answers will change how future attempts are graded!</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditDialog({ isOpen: false, question: null })}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Updating..." : "Update Question"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, question: null })}
        onConfirm={confirmDelete}
        title="Delete Question"
        message={
          <>
            Are you sure you want to delete this question?
            <br />
            <span className="text-sm text-gray-600 mt-2 block">
              This action cannot be undone if no answers exist for this question.
            </span>
          </>
        }
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
