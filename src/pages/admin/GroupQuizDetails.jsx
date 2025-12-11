/**
 * Group Quiz Details Page
 * Shows quiz details, statistics, leaderboard, and all attempts for a specific quiz in a group
 */

import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  Trophy,
  Users,
  TrendingUp,
  Clock,
  Target,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useQuiz, useQuizStats, useQuizLeaderboard, useAllQuizAttempts } from "@/hooks/queries/useQuizQueries";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { DataTable } from "@/components/shared/DataTable";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";

/**
 * Format date for display
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/**
 * Format duration
 */
const formatDuration = (seconds) => {
  if (!seconds) return "N/A";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

/**
 * Stat Card Component
 */
const StatCard = ({ icon: Icon, label, value, color = "blue" }) => (
  <Card className="p-6">
    <div className="flex items-center gap-4">
      <div className={`p-3 bg-${color}-500/10 rounded-lg`}>
        <Icon className={`w-6 h-6 text-${color}-500`} />
      </div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  </Card>
);

export const GroupQuizDetails = () => {
  const { groupId, quizId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch data
  const { data: quiz, isLoading: quizLoading } = useQuiz(quizId);
  const { data: stats, isLoading: statsLoading } = useQuizStats(quizId);
  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuizLeaderboard(quizId, 20);
  const { data: attemptsData, isLoading: attemptsLoading } = useAllQuizAttempts(quizId);

  const isLoading = quizLoading || statsLoading;

  // Leaderboard columns
  const leaderboardColumns = [
    {
      key: "rank",
      header: "Rank",
      render: (_, entry) => (
        <div className="flex items-center gap-2">
          {entry.rank <= 3 && (
            <Trophy 
              className={`w-5 h-5 ${
                entry.rank === 1 ? 'text-yellow-500' : 
                entry.rank === 2 ? 'text-gray-400' : 
                'text-orange-600'
              }`} 
            />
          )}
          <span className="font-semibold text-white">#{entry.rank}</span>
        </div>
      ),
    },
    {
      key: "user",
      header: "Student",
      render: (_, entry) => (
        <div>
          <p className="font-medium text-white">{entry.full_name || entry.user_id}</p>
          <p className="text-sm text-gray-400">{entry.email || ""}</p>
        </div>
      ),
    },
    {
      key: "best_score",
      header: "Best Score",
      render: (_, entry) => (
        <Badge variant={entry.best_score >= 70 ? "success" : "error"} size="md">
          {entry.best_score?.toFixed(1)}%
        </Badge>
      ),
    },
    {
      key: "best_time",
      header: "Time",
      render: (_, entry) => (
        <span className="text-sm text-gray-300">
          {formatDuration(entry.best_time_seconds)}
        </span>
      ),
    },
  ];

  // Attempts by user columns
  const attemptsColumns = [
    {
      key: "user",
      header: "Student",
      render: (_, userAttempt) => (
        <div>
          <p className="font-medium text-white">
            {userAttempt.full_name || userAttempt.user_id}
          </p>
          <p className="text-sm text-gray-400">{userAttempt.email || ""}</p>
        </div>
      ),
    },
    {
      key: "total_attempts",
      header: "Attempts",
      render: (_, userAttempt) => (
        <span className="text-sm text-gray-300">{userAttempt.total_attempts}</span>
      ),
    },
    {
      key: "completed",
      header: "Completed",
      render: (_, userAttempt) => (
        <span className="text-sm text-gray-300">{userAttempt.completed_attempts}</span>
      ),
    },
    {
      key: "best_score",
      header: "Best Score",
      render: (_, userAttempt) => (
        <Badge 
          variant={userAttempt.best_score >= 70 ? "success" : "error"} 
          size="sm"
        >
          {userAttempt.best_score?.toFixed(1) || "N/A"}%
        </Badge>
      ),
    },
    {
      key: "avg_score",
      header: "Avg Score",
      render: (_, userAttempt) => (
        <span className="text-sm text-gray-300">
          {userAttempt.average_score?.toFixed(1) || "N/A"}%
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (_, userAttempt) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            // Could expand to show individual attempts
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  // Individual attempts columns (when expanded)
  const individualAttemptsColumns = [
    {
      key: "attempt_number",
      header: "#",
      render: (_, attempt) => (
        <span className="font-semibold text-white">#{attempt.attempt_number}</span>
      ),
    },
    {
      key: "started_at",
      header: "Started",
      render: (_, attempt) => (
        <span className="text-sm text-gray-400">{formatDate(attempt.started_at)}</span>
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
        <span className="text-sm text-gray-300">
          {attempt.correct_answers}/{attempt.total_questions}
        </span>
      ),
    },
    {
      key: "time",
      header: "Time",
      render: (_, attempt) => (
        <span className="text-sm text-gray-300">
          {formatDuration(attempt.total_time_seconds)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (_, attempt) => (
        attempt.status === "submitted" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/groups/${groupId}/quiz/${quizId}/attempt/${attempt.attempt_id}`);
            }}
          >
            Review
          </Button>
        )
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={quiz?.quiz_title || quiz?.title || "Quiz Details"}
        description={quiz?.description || "View quiz statistics and student performance"}
        actions={
          <Button
            variant="secondary"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(`/admin/groups/${groupId}`)}
          >
            Back to Group
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Participants"
          value={attemptsData?.total_users || stats?.total_participants || 0}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Attempts"
          value={attemptsData?.total_attempts || stats?.total_attempts || 0}
          color="green"
        />
        <StatCard
          icon={Target}
          label="Average Score"
          value={`${stats?.average_score?.toFixed(1) || 0}%`}
          color="purple"
        />
        <StatCard
          icon={CheckCircle}
          label="Completion Rate"
          value={`${stats?.completion_rate?.toFixed(1) || 0}%`}
          color="yellow"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="attempts">All Attempts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quiz Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Time Limit</p>
                <p className="text-white font-medium">
                  {quiz?.time_limit_minutes ? `${quiz.time_limit_minutes} minutes` : "Unlimited"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Passing Score</p>
                <p className="text-white font-medium">{quiz?.passing_score || 70}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Questions</p>
                <p className="text-white font-medium">{quiz?.total_questions || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Max Attempts</p>
                <p className="text-white font-medium">
                  {quiz?.max_attempts || "Unlimited"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Published At</p>
                <p className="text-white font-medium">{formatDate(quiz?.published_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <Badge variant={quiz?.status === "active" ? "success" : "default"}>
                  {quiz?.status || "unknown"}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Top 5 Leaderboard Preview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Top Performers</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("leaderboard")}
              >
                View All
              </Button>
            </div>
            {leaderboardLoading ? (
              <Spinner />
            ) : leaderboardData?.leaderboard?.length > 0 ? (
              <DataTable
                columns={leaderboardColumns}
                data={leaderboardData.leaderboard.slice(0, 5)}
                paginated={false}
              />
            ) : (
              <EmptyState
                icon={Trophy}
                title="No scores yet"
                description="No students have completed this quiz yet"
              />
            )}
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Leaderboard - Top Scores
            </h3>
            {leaderboardLoading ? (
              <Spinner />
            ) : leaderboardData?.leaderboard?.length > 0 ? (
              <DataTable
                columns={leaderboardColumns}
                data={leaderboardData.leaderboard}
                paginated={true}
                pageSize={10}
              />
            ) : (
              <EmptyState
                icon={Trophy}
                title="No scores yet"
                description="No students have completed this quiz yet"
              />
            )}
          </Card>
        </TabsContent>

        {/* All Attempts Tab */}
        <TabsContent value="attempts">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              All Attempts by Student
            </h3>
            {attemptsLoading ? (
              <Spinner />
            ) : attemptsData?.user_attempts?.length > 0 ? (
              <DataTable
                columns={attemptsColumns}
                data={attemptsData.user_attempts}
                paginated={true}
                pageSize={10}
              />
            ) : (
              <EmptyState
                icon={Users}
                title="No attempts yet"
                description="No students have attempted this quiz yet"
              />
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupQuizDetails;
