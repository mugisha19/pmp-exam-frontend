/**
 * Admin Exam Details Page
 * View, update, stats, and leaderboard for a specific exam
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import { Spinner } from "@/components/ui";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  getQuizById,
  getQuizStats,
  getQuizLeaderboard,
  getAllQuizAttempts,
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

export default function ExamDetails() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch exam details
  const { data: exam, isLoading: loadingExam } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => getQuizById(examId),
    enabled: !!examId,
  });

  // Fetch stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["exam-stats", examId],
    queryFn: () => getQuizStats(examId),
    enabled: !!examId && activeTab === "stats",
  });

  // Fetch leaderboard
  const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery({
    queryKey: ["exam-leaderboard", examId],
    queryFn: () => getQuizLeaderboard(examId, 20),
    enabled: !!examId && activeTab === "leaderboard",
  });

  // Fetch all attempts
  const { data: attemptsData, isLoading: loadingAttempts } = useQuery({
    queryKey: ["exam-attempts", examId],
    queryFn: () => getAllQuizAttempts(examId),
    enabled: !!examId && activeTab === "attempts",
  });

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
          <Button onClick={() => navigate("/admin/exams")} className="mt-4">
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "stats", label: "Statistics", icon: BarChart3 },
    { id: "leaderboard", label: "Leaderboard", icon: Award },
    { id: "attempts", label: "All Attempts", icon: Users },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/exams")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Exams
        </button>

        <PageHeader
          title={exam.title}
          subtitle={exam.description || "Exam details and statistics"}
          actions={
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/exams/${examId}/edit`)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Exam
            </Button>
          }
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
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

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab exam={exam} />}
      {activeTab === "stats" && (
        <StatsTab stats={stats} loading={loadingStats} />
      )}
      {activeTab === "leaderboard" && (
        <LeaderboardTab
          leaderboard={leaderboard?.leaderboard || []}
          loading={loadingLeaderboard}
        />
      )}
      {activeTab === "attempts" && (
        <AttemptsTab
          attempts={attemptsData?.user_attempts || []}
          loading={loadingAttempts}
        />
      )}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ exam }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Info */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Exam Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Quiz Mode</p>
              <p className="font-medium capitalize">{exam.quiz_mode}</p>
            </div>
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
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-medium">
                {exam.is_public && !exam.group_id ? "Public" : "Group"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Shuffle Questions</p>
              <p className="font-medium">{exam.shuffle_questions ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>

        {exam.scheduling_enabled && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
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
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Total Attempts</h3>
          </div>
          <p className="text-3xl font-bold">{exam.total_attempts || 0}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Average Score</h3>
          </div>
          <p className="text-3xl font-bold">
            {exam.avg_score ? `${exam.avg_score.toFixed(1)}%` : "N/A"}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Created</h3>
          </div>
          <p className="text-sm">{formatDate(exam.created_at)}</p>
        </div>
      </div>
    </div>
  );
}

// Stats Tab Component
function StatsTab({ stats, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-12 text-gray-500">No statistics available</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-600">Total Attempts</h3>
        </div>
        <p className="text-3xl font-bold">{stats.total_attempts || 0}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-5 h-5 text-green-600" />
          <h3 className="text-sm font-medium text-gray-600">Pass Rate</h3>
        </div>
        <p className="text-3xl font-bold">
          {stats.pass_rate ? `${stats.pass_rate.toFixed(1)}%` : "0%"}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-medium text-gray-600">Avg Score</h3>
        </div>
        <p className="text-3xl font-bold">
          {stats.average_score ? `${stats.average_score.toFixed(1)}%` : "0%"}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-5 h-5 text-orange-600" />
          <h3 className="text-sm font-medium text-gray-600">Avg Time</h3>
        </div>
        <p className="text-3xl font-bold">
          {stats.average_time_minutes ? `${stats.average_time_minutes.toFixed(0)}m` : "N/A"}
        </p>
      </div>
    </div>
  );
}

// Leaderboard Tab Component
function LeaderboardTab({ leaderboard, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return <div className="text-center py-12 text-gray-500">No attempts yet</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leaderboard.map((entry, index) => (
              <tr key={entry.user_id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {index < 3 && (
                      <Award className={`w-5 h-5 ${
                        index === 0 ? "text-yellow-500" :
                        index === 1 ? "text-gray-400" :
                        "text-orange-600"
                      }`} />
                    )}
                    <span className="font-medium">#{index + 1}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{entry.full_name || entry.first_name + " " + entry.last_name}</p>
                    <p className="text-sm text-gray-500">{entry.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-lg">{entry.score}%</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600">{entry.time_minutes}m</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">{formatDate(entry.submitted_at)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Attempts Tab Component
function AttemptsTab({ attempts, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!attempts || attempts.length === 0) {
    return <div className="text-center py-12 text-gray-500">No attempts yet</div>;
  }

  return (
    <div className="space-y-4">
      {attempts.map((userAttempt) => (
        <div key={userAttempt.user_id} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{userAttempt.full_name || `${userAttempt.first_name} ${userAttempt.last_name}`}</h3>
              <p className="text-sm text-gray-500">{userAttempt.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Best Score</p>
              <p className="text-2xl font-bold text-blue-600">
                {userAttempt.best_score ? `${userAttempt.best_score}%` : "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Total Attempts</p>
              <p className="font-medium">{userAttempt.total_attempts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="font-medium">{userAttempt.completed_attempts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="font-medium">
                {userAttempt.average_score ? `${userAttempt.average_score.toFixed(1)}%` : "N/A"}
              </p>
            </div>
          </div>

          {userAttempt.attempts && userAttempt.attempts.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Attempt History</p>
              <div className="space-y-2">
                {userAttempt.attempts.map((attempt) => (
                  <div key={attempt.attempt_id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Attempt #{attempt.attempt_number}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{attempt.score}%</span>
                      <Badge variant={attempt.status === "submitted" ? "success" : "secondary"}>
                        {attempt.status}
                      </Badge>
                      <span className="text-gray-500">{formatDate(attempt.submitted_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
