/**
 * Instructor Dashboard Page
 * Overview of instructor's questions, quizzes, groups, and recent activity
 */

import { Link } from "react-router-dom";
import {
  HelpCircle,
  Library,
  FileText,
  Users,
  Plus,
  ArrowRight,
  Clock,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UserCell } from "@/components/shared/UserCell";
import { useAuthStore } from "@/stores/auth.store";
import {
  useInstructorStats,
  useInstructorActiveQuizzes,
  useRecentStudentActivity,
} from "@/hooks/queries/useInstructorDashboard";

// Quick action items
const QUICK_ACTIONS = [
  {
    label: "Create Question",
    icon: HelpCircle,
    href: "/instructor/questions/new",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    label: "Create Quiz Bank",
    icon: Library,
    href: "/instructor/quiz-banks/new",
    color: "text-teal-600",
    bgColor: "bg-teal-500/10",
  },
  {
    label: "Create Quiz",
    icon: FileText,
    href: "/instructor/quizzes/new",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    label: "Create Group",
    icon: Users,
    href: "/instructor/groups",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
];

// Mock data for demonstration (static to avoid Date.now() in render)
const MOCK_ACTIVE_QUIZZES = [
  {
    id: 1,
    title: "PMP Process Groups",
    group_name: "PMP Prep 2024",
    status: "active",
    attempts: 23,
    total_assigned: 45,
    end_time: "2024-12-20T12:00:00.000Z",
  },
  {
    id: 2,
    title: "Risk Management Basics",
    group_name: "Risk Focus Group",
    status: "active",
    attempts: 12,
    total_assigned: 28,
    end_time: "2024-12-22T12:00:00.000Z",
  },
  {
    id: 3,
    title: "Agile Methodology",
    group_name: "Agile Practitioners",
    status: "active",
    attempts: 8,
    total_assigned: 32,
    end_time: "2024-12-24T12:00:00.000Z",
  },
];

const MOCK_RECENT_ACTIVITY = [
  {
    id: 1,
    student: { name: "John Smith", email: "john@example.com", avatar: null },
    quiz_title: "PMP Process Groups",
    score: 85,
    completed_at: "2024-12-15T10:45:00.000Z",
  },
  {
    id: 2,
    student: {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      avatar: null,
    },
    quiz_title: "Risk Management Basics",
    score: 92,
    completed_at: "2024-12-15T10:15:00.000Z",
  },
  {
    id: 3,
    student: {
      name: "Michael Chen",
      email: "michael@example.com",
      avatar: null,
    },
    quiz_title: "Agile Methodology",
    score: 78,
    completed_at: "2024-12-15T09:00:00.000Z",
  },
  {
    id: 4,
    student: {
      name: "Emily Davis",
      email: "emily@example.com",
      avatar: null,
    },
    quiz_title: "PMP Process Groups",
    score: 88,
    completed_at: "2024-12-15T07:00:00.000Z",
  },
];

export function Dashboard() {
  const { user } = useAuthStore();

  // Fetch dashboard data
  const { stats, isLoading: statsLoading } = useInstructorStats();
  const { data: activeQuizzes, isLoading: quizzesLoading } =
    useInstructorActiveQuizzes(5);
  const { data: recentActivity, isLoading: activityLoading } =
    useRecentStudentActivity(5);

  const displayQuizzes =
    activeQuizzes?.length > 0 ? activeQuizzes : MOCK_ACTIVE_QUIZZES;
  const displayActivity =
    recentActivity?.length > 0 ? recentActivity : MOCK_RECENT_ACTIVITY;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${
          user?.first_name || "Instructor"
        }! Here's your teaching overview.`}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="My Questions"
              value={stats.questions}
              subtitle="In question bank"
              icon={HelpCircle}
              iconColor="text-blue-400"
              iconBgColor="bg-blue-500/10"
            />
            <StatsCard
              title="Quiz Banks"
              value={stats.quizBanks}
              subtitle="Templates created"
              icon={Library}
              iconColor="text-teal-600"
              iconBgColor="bg-teal-500/10"
            />
            <StatsCard
              title="Active Quizzes"
              value={stats.activeQuizzes}
              subtitle="Currently running"
              icon={FileText}
              iconColor="text-emerald-400"
              iconBgColor="bg-emerald-500/10"
            />
            <StatsCard
              title="My Groups"
              value={stats.groups}
              subtitle="Groups managed"
              icon={Users}
              iconColor="text-amber-400"
              iconBgColor="bg-amber-500/10"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              to={action.href}
              className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-colors group"
            >
              <div className={`p-3 rounded-lg ${action.bgColor}`}>
                <action.icon className={`w-6 h-6 ${action.color}`} />
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 text-center">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Quizzes */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              My Active Quizzes
            </h2>
            <Link
              to="/instructor/quizzes"
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {quizzesLoading ? (
            <div className="space-y-3">
              <QuizItemSkeleton />
              <QuizItemSkeleton />
              <QuizItemSkeleton />
            </div>
          ) : displayQuizzes.length === 0 ? (
            <EmptyState
              icon={FileText}
              message="No active quizzes"
              action={
                <Link to="/instructor/quizzes/new">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Quiz
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {displayQuizzes.map((quiz) => (
                <ActiveQuizItem key={quiz.id} quiz={quiz} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Student Activity */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Student Activity
            </h2>
            <Link
              to="/instructor/analytics"
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {activityLoading ? (
            <div className="space-y-3">
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
            </div>
          ) : displayActivity.length === 0 ? (
            <EmptyState icon={TrendingUp} message="No recent activity" />
          ) : (
            <div className="space-y-3">
              {displayActivity.map((activity) => (
                <StudentActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Active Quiz Item Component
function ActiveQuizItem({ quiz }) {
  const deadline = quiz.end_time
    ? formatDistanceToNow(new Date(quiz.end_time), { addSuffix: true })
    : "No deadline";

  const progress =
    quiz.total_assigned > 0
      ? Math.round((quiz.attempts / quiz.total_assigned) * 100)
      : 0;

  return (
    <Link
      to={`/instructor/quizzes/${quiz.id}`}
      className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 font-medium truncate">{quiz.title}</h3>
          <p className="text-sm text-gray-500 truncate">{quiz.group_name}</p>
        </div>
        <StatusBadge status={quiz.status} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-gray-500">
          <Target className="w-4 h-4" />
          <span>
            {quiz.attempts}/{quiz.total_assigned} attempts ({progress}%)
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{deadline}</span>
        </div>
      </div>
    </Link>
  );
}

// Student Activity Item Component
function StudentActivityItem({ activity }) {
  const timeAgo = activity.completed_at
    ? formatDistanceToNow(new Date(activity.completed_at), { addSuffix: true })
    : "";

  const scoreColor =
    activity.score >= 80
      ? "text-emerald-400"
      : activity.score >= 60
      ? "text-amber-400"
      : "text-red-400";

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <UserCell
        name={activity.student?.name || "Unknown"}
        email={activity.quiz_title}
        avatar={activity.student?.avatar}
        size="sm"
      />
      <div className="ml-auto text-right">
        <span className={`text-lg font-semibold ${scoreColor}`}>
          {activity.score}%
        </span>
        <p className="text-xs text-gray-500">{timeAgo}</p>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ icon, message, action }) {
  const Icon = icon;
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="p-3 bg-gray-100 rounded-full mb-3">
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-gray-500 text-sm mb-3">{message}</p>
      {action}
    </div>
  );
}

// Loading Skeletons
function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-10 w-10 bg-gray-200 rounded-lg" />
      </div>
      <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-20 bg-gray-200 rounded" />
    </div>
  );
}

function QuizItemSkeleton() {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function ActivityItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 animate-pulse">
      <div className="h-10 w-10 bg-gray-200 rounded-full" />
      <div className="flex-1">
        <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
        <div className="h-3 w-32 bg-gray-200 rounded" />
      </div>
      <div className="text-right">
        <div className="h-6 w-12 bg-gray-200 rounded mb-1" />
        <div className="h-3 w-16 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default Dashboard;
