/**
 * Admin Exam Details Page
 * View exam details, statistics, leaderboard, and attempts
 */

import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Trophy,
  Users,
  Calendar,
  BarChart3,
  Award,
  TrendingUp,
  Edit2,
  Target,
  CheckCircle,
  PlayCircle,
  XCircle,
  CheckSquare,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  getQuizById,
  getQuizStats,
  getQuizLeaderboard,
  getAllQuizAttempts,
  updateQuizStatus,
  deleteQuiz,
  getQuizQuestions,
  getQuizTopics,
  getFailedQuestions,
} from "@/services/quiz.service";

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (seconds) => {
  if (!seconds) return "N/A";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const StatCard = ({ icon: Icon, label, value, color = "blue" }) => {
  const colorClasses = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
    green: { bg: "bg-green-500/10", text: "text-green-500" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-500" },
    yellow: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
  };
  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 ${classes.bg} rounded-lg`}>
          <Icon className={`w-6 h-6 ${classes.text}`} />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );
};

export default function ExamDetails() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || "overview");
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [statusDialog, setStatusDialog] = useState({ isOpen: false, status: null });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);
  const [questionPage, setQuestionPage] = useState(1);
  const [questionPageSize] = useState(10);
  const [questionFilters, setQuestionFilters] = useState({
    topic_id: "",
    question_type: "",
    sort_order: "asc",
  });

  const { data: exam, isLoading: loadingExam } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => getQuizById(examId),
    enabled: !!examId,
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["exam-stats", examId],
    queryFn: () => getQuizStats(examId),
    enabled: !!examId,
  });

  const { data: failedQuestions, isLoading: loadingFailedQuestions } = useQuery({
    queryKey: ["exam-failed-questions", examId],
    queryFn: () => getFailedQuestions(examId, 10),
    enabled: !!examId && activeTab === "overview",
  });

  const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery({
    queryKey: ["exam-leaderboard", examId],
    queryFn: () => getQuizLeaderboard(examId, 20),
    enabled: !!examId && activeTab === "leaderboard",
  });

  const { data: attemptsData, isLoading: loadingAttempts } = useQuery({
    queryKey: ["exam-attempts", examId],
    queryFn: () => getAllQuizAttempts(examId),
    enabled: !!examId && activeTab === "attempts",
  });

  const { data: questions, isLoading: loadingQuestions } = useQuery({
    queryKey: ["exam-questions", examId, questionPage, questionFilters],
    queryFn: () => {
      const params = {
        skip: (questionPage - 1) * questionPageSize,
        limit: questionPageSize,
        sort_order: questionFilters.sort_order,
      };
      // Only add filters if they have values
      if (questionFilters.topic_id) params.topic_id = questionFilters.topic_id;
      if (questionFilters.question_type) params.question_type = questionFilters.question_type;
      return getQuizQuestions(examId, params);
    },
    enabled: !!examId && activeTab === "questions",
  });

  const { data: topics } = useQuery({
    queryKey: ["exam-topics", examId],
    queryFn: () => getQuizTopics(examId),
    enabled: !!examId && activeTab === "questions",
  });

  const questionCount = questions?.total || 0;
  const questionItems = questions?.items || [];

  const statusMutation = useMutation({
    mutationFn: ({ status }) => updateQuizStatus(examId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["exam", examId]);
      toast.success("Exam status updated successfully");
      setStatusDialog({ isOpen: false, status: null });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update status");
      setStatusDialog({ isOpen: false, status: null });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteQuiz(examId),
    onSuccess: () => {
      toast.success("Exam deleted successfully");
      navigate("/exams");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete exam");
      setDeleteDialog(false);
    },
  });

  // Close dropdown on click outside
  useEffect(() => {
    if (!isStatusDropdownOpen) return;

    const handleClickOutside = (event) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setIsStatusDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isStatusDropdownOpen]);

  const handleStatusChange = (status) => {
    setStatusDialog({ isOpen: true, status });
  };

  const confirmStatusChange = () => {
    statusMutation.mutate({ status: statusDialog.status });
  };

  const handleDelete = () => {
    setDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
  };

  const leaderboardColumns = [
    {
      key: "rank",
      header: "Rank",
      render: (_, entry) => (
        <div className="flex items-center gap-2">
          {entry.rank <= 3 && (
            <Trophy
              className={`w-5 h-5 ${
                entry.rank === 1 ? "text-yellow-500" :
                entry.rank === 2 ? "text-gray-400" :
                "text-orange-600"
              }`}
            />
          )}
          <span className="font-semibold text-gray-900">#{entry.rank}</span>
        </div>
      ),
    },
    {
      key: "user",
      header: "Student",
      render: (_, entry) => (
        <div>
          <p className="font-medium text-gray-900">{entry.full_name || entry.first_name + " " + entry.last_name}</p>
          <p className="text-sm text-gray-600">{entry.email}</p>
        </div>
      ),
    },
    {
      key: "score",
      header: "Score",
      render: (_, entry) => (
        <Badge variant={entry.best_score >= 70 ? "success" : "error"} size="md">
          {entry.best_score?.toFixed(1)}%
        </Badge>
      ),
    },
    {
      key: "time",
      header: "Time",
      render: (_, entry) => (
        <span className="text-sm text-gray-700">{formatDuration(entry.best_time_seconds)}</span>
      ),
    },
  ];

  const individualAttemptsColumns = [
    {
      key: "started_at",
      header: "Started",
      render: (_, attempt) => (
        <span className="text-sm text-gray-600">{formatDate(attempt.started_at)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, attempt) => (
        <Badge
          variant={attempt.status === "submitted" ? "success" : "warning"}
          size="sm"
        >
          {attempt.status}
        </Badge>
      ),
    },
    {
      key: "score",
      header: "Score",
      render: (_, attempt) => (
        <Badge
          variant={attempt.score >= 70 ? "success" : "error"}
          size="sm"
        >
          {attempt.score?.toFixed(1) || "N/A"}%
        </Badge>
      ),
    },
    {
      key: "correct",
      header: "Correct",
      render: (_, attempt) => (
        <span className="text-sm text-gray-700">
          {attempt.correct_answers}/{attempt.total_questions}
        </span>
      ),
    },
    {
      key: "time",
      header: "Time",
      render: (_, attempt) => (
        <span className="text-sm text-gray-700">
          {formatDuration(attempt.total_time_seconds)}
        </span>
      ),
    },
    {
      key: "feedback",
      header: "Feedback",
      render: (_, attempt) => (
        attempt.feedback ? (
          <Badge variant="info" size="sm">
            Yes
          </Badge>
        ) : (
          <span className="text-xs text-gray-400">No</span>
        )
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, attempt) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/exams/${examId}/attempt/${attempt.attempt_id}`);
          }}
        >
          Review
        </Button>
      ),
    },
  ];

  // Add onRowClick to navigate to attempt details
  const handleAttemptRowClick = (attempt) => {
    navigate(`/admin/exams/${examId}/attempt/${attempt.attempt_id}`);
  };

  if (loadingExam) {
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
          <Button onClick={() => navigate("/exams")} className="mt-4">
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "questions", label: "Questions", icon: Target },
    { id: "leaderboard", label: "Leaderboard", icon: Award },
    { id: "attempts", label: "All Attempts", icon: Users },
  ];

  const handleStatusSelect = (newStatus) => {
    setIsStatusDropdownOpen(false);
    if (newStatus !== exam?.status) {
      setStatusDialog({ isOpen: true, status: newStatus });
    }
  };

  const statusOptions = [
    {
      value: "active",
      label: "Active",
      icon: PlayCircle,
      description: "Exam is active and available for students to take.",
    },
    {
      value: "completed",
      label: "Completed",
      icon: CheckSquare,
      description: "Exam is completed. No new attempts allowed.",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      icon: XCircle,
      description: "Exam is cancelled. No new attempts allowed.",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Exam Management - Detail"
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate("/admin/exams")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Exams
            </Button>
            {user?.role === "admin" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/admin/exams/${examId}/edit`)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <div className="relative inline-block" ref={statusDropdownRef}>
                  <Button
                    variant="outline"
                    disabled={statusMutation.isPending}
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  >
                    Mark as
                    <ChevronDown
                      className={`w-4 h-4 ml-2 transition-transform ${
                        isStatusDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                  {isStatusDropdownOpen && (
                    <div className="absolute right-0 z-50 mt-1.5 min-w-[300px] bg-white rounded-lg shadow-lg border border-gray-200/80 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      {statusOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleStatusSelect(option.value)}
                            disabled={
                              exam.status === option.value ||
                              statusMutation.isPending
                            }
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left text-sm transition-colors ${
                              exam.status === option.value ||
                              statusMutation.isPending
                                ? "text-gray-400 cursor-not-allowed opacity-50"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {Icon && (
                              <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex flex-col flex-1">
                              <span className="font-medium">{option.label}</span>
                              <span className="text-xs text-gray-500 mt-0.5">
                                {option.description}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {(attemptsData?.total_attempts || 0) === 0 && (
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </>
            )}
          </div>
        }
      />

      {/* Exam Title and Description Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">{exam.title}</h1>
          {exam.description && (
            <div
              className="text-base text-gray-700 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: exam.description }}
            />
          )}
        </div>
      </Card>


      {loadingStats ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Participants"
            value={stats?.total_participants || 0}
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Attempts"
            value={stats?.total_attempts || 0}
            color="green"
          />
          <StatCard
            icon={Target}
            label="Average Score"
            value={`${stats?.avg_score?.toFixed(1) || 0}%`}
            color="purple"
          />
          <StatCard
            icon={CheckCircle}
            label="Pass Rate"
            value={`${stats?.pass_rate?.toFixed(1) || 0}%`}
            color="yellow"
          />
        </div>
      )}

      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Exam Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant={exam.status === "active" ? "success" : "default"}>
                    {exam.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Questions</p>
                  <p className="font-medium">{exam.total_questions}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time Limit</p>
                  <p className="font-medium">
                    {exam.time_limit_minutes ? `${exam.time_limit_minutes} min` : "No limit"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Passing Score</p>
                  <p className="font-medium">{exam.passing_score}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Max Attempts</p>
                  <p className="font-medium">{exam.max_attempts || "Unlimited"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Max Questions (Practice)</p>
                  <p className="font-medium">{exam.max_questions_practice || "Unlimited"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Max Questions (Exam)</p>
                  <p className="font-medium">{exam.max_questions_exam || "Unlimited"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Group Name</p>
                  <p className="font-medium">{exam.group_name || "N/A"}</p>
                </div>
              </div>
            </Card>

            {exam.scheduling_enabled && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Schedule</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Starts At</p>
                    <p className="font-medium">{formatDate(exam.starts_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ends At</p>
                    <p className="font-medium">{formatDate(exam.ends_at)}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Most Failed Questions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Most Failed Questions
              </h3>
              {loadingFailedQuestions ? (
                <Spinner />
              ) : failedQuestions?.questions?.length > 0 ? (
                <div className="space-y-3">
                  {failedQuestions.questions.map((q, idx) => (
                    <div key={q.question_id} className="p-4 border border-gray-200 rounded-lg hover:border-red-200 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-sm font-bold text-red-600">#{idx + 1}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900 mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: q.question_text }} />
                          <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-600">Failure Rate:</span>
                              <Badge variant="error" size="sm">
                                {q.failure_rate?.toFixed(1)}%
                              </Badge>
                            </div>
                            <div className="text-gray-500">
                              {q.total_attempts} attempt{q.total_attempts !== 1 ? 's' : ''}
                            </div>
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
              ) : (
                <p className="text-sm text-gray-500">No data available yet. Questions will appear here once students start taking the exam.</p>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">Published</h3>
              </div>
              <p className="text-sm">{formatDate(exam.published_at)}</p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Top Performers</h3>
              {loadingLeaderboard ? (
                <Spinner />
              ) : leaderboard?.leaderboard?.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.leaderboard.slice(0, 3).map((entry) => (
                    <div key={entry.user_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy
                          className={`w-4 h-4 ${
                            entry.rank === 1 ? "text-yellow-500" :
                            entry.rank === 2 ? "text-gray-400" :
                            "text-orange-600"
                          }`}
                        />
                        <span className="text-sm">{entry.full_name || entry.first_name}</span>
                      </div>
                      <span className="font-bold">{entry.best_score?.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No scores yet</p>
              )}
            </Card>
          </div>
        </div>
      )}

      {activeTab === "leaderboard" && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Leaderboard - Top Scores
          </h3>
          {loadingLeaderboard ? (
            <Spinner />
          ) : leaderboard?.leaderboard?.length > 0 ? (
            <DataTable
              columns={leaderboardColumns}
              data={leaderboard.leaderboard}
              paginated={true}
            />
          ) : (
            <EmptyState
              icon={Trophy}
              title="No scores yet"
              description="No students have completed this exam yet"
            />
          )}
        </Card>
      )}

      {activeTab === "questions" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Quiz Questions ({questionCount})
            </h3>
            <Button
              onClick={() => navigate(`/exams/${examId}/questions/manage`)}
            >
              Manage Questions
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic
              </label>
              <select
                value={questionFilters.topic_id}
                onChange={(e) => {
                  setQuestionFilters({ ...questionFilters, topic_id: e.target.value });
                  setQuestionPage(1);
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
                value={questionFilters.question_type}
                onChange={(e) => {
                  setQuestionFilters({ ...questionFilters, question_type: e.target.value });
                  setQuestionPage(1);
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
                value={questionFilters.sort_order}
                onChange={(e) => {
                  setQuestionFilters({ ...questionFilters, sort_order: e.target.value });
                  setQuestionPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="asc">Oldest First</option>
                <option value="desc">Newest First</option>
              </select>
            </div>
          </div>

          {loadingQuestions ? (
            <Spinner />
          ) : questionItems.length > 0 ? (
            <>
              <div className="space-y-2">
                {questionItems.map((q, idx) => (
                  <div key={q.quiz_question_id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-gray-500">
                        #{(questionPage - 1) * questionPageSize + idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-900">{q.question_text}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="default" size="sm">{q.question_type}</Badge>
                          {q.topic_name && <Badge variant="secondary" size="sm">{q.topic_name}</Badge>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {questionCount > questionPageSize && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {(questionPage - 1) * questionPageSize + 1} to{" "}
                    {Math.min(questionPage * questionPageSize, questionCount)} of {questionCount}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuestionPage(questionPage - 1)}
                      disabled={questionPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuestionPage(questionPage + 1)}
                      disabled={questionPage * questionPageSize >= questionCount}
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
              icon={Target}
              title="No questions"
              description="This quiz has no questions yet"
            />
          )}
        </Card>
      )}

      {activeTab === "attempts" && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            All Attempts by Student
          </h3>
          {loadingAttempts ? (
            <Spinner />
          ) : attemptsData?.user_attempts?.length > 0 ? (
            <div className="space-y-4">
              {attemptsData.user_attempts.map((userAttempt) => (
                <div key={userAttempt.user_id} className="space-y-2">
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          {userAttempt.full_name || userAttempt.user_id}
                        </p>
                        <p className="text-sm text-gray-600">{userAttempt.email || ""}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Attempts</p>
                        <p className="text-gray-900 font-medium">{userAttempt.total_attempts}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Completed</p>
                        <p className="text-gray-900 font-medium">{userAttempt.completed_attempts}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Best</p>
                        <Badge
                          variant={userAttempt.best_score >= 70 ? "success" : "error"}
                          size="sm"
                        >
                          {userAttempt.best_score?.toFixed(1) || "N/A"}%
                        </Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Avg</p>
                        <p className="text-gray-900 font-medium">
                          {userAttempt.average_score?.toFixed(1) || "N/A"}%
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedUserId(
                          expandedUserId === userAttempt.user_id ? null : userAttempt.user_id
                        )
                      }
                    >
                      {expandedUserId === userAttempt.user_id ? "Hide" : "View"} Details
                    </Button>
                  </div>
                  {expandedUserId === userAttempt.user_id && userAttempt.attempts && (
                    <div className="ml-4 pl-4 border-l-2 border-gray-300">
                      <DataTable
                        columns={individualAttemptsColumns}
                        data={userAttempt.attempts}
                        paginated={true}
                        onRowClick={handleAttemptRowClick}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No attempts yet"
              description="No students have attempted this exam yet"
            />
          )}
        </Card>
      )}

      {/* Status Change Confirmation */}
      <ConfirmDialog
        isOpen={statusDialog.isOpen}
        onClose={() => {
          setStatusDialog({ isOpen: false, status: null });
        }}
        onConfirm={confirmStatusChange}
        title="Change Exam Status"
        message={
          <>
            Are you sure you want to change the exam status to{" "}
            <strong>"{statusDialog.status}"</strong>?
            {statusDialog.status && (
              <>
                <br />
                <span className="text-sm text-gray-600 mt-2 block">
                  {statusOptions.find((opt) => opt.value === statusDialog.status)
                    ?.description || ""}
                </span>
              </>
            )}
          </>
        }
        confirmText="Change Status"
        confirmVariant="primary"
        isLoading={statusMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Exam"
        message={`Are you sure you want to delete "${exam?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
