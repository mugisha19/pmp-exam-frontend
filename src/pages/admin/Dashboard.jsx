/**
 * Admin Dashboard Page
 * Main dashboard for administrators with stats, recent activity, and quick actions
 */

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  GraduationCap,
  UsersRound,
  BookOpen,
  UserPlus,
  Folder,
  Edit,
  Activity,
  TrendingUp,
  ArrowUpRight,
  CheckCircle,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { useAdminDashboardData } from "@/hooks/queries/useAdminDashboard";
import { useAnalyticsDashboard } from "@/hooks/queries/useAnalyticsQueries";
import analyticsService from "@/services/analytics.service";
import { useAuthStore } from "@/stores/auth.store";
import { ROLES } from "@/constants/roles.constants";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatsCard } from "@/components/shared/StatsCard";
import { DataTable } from "@/components/shared/DataTable";
import { UserCell } from "@/components/shared/UserCell";
import {
  LineChartComponent,
  BarChartComponent,
  PieChartComponent,
  AreaChartComponent,
} from "@/components/charts";
import { cn } from "@/utils/cn";

/**
 * Format relative time
 */
const formatRelativeTime = (dateString) => {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
};

/**
 * Format date for display
 */
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
};

/**
 * Activity type configuration
 */
const activityConfig = {
  user_created: {
    icon: UserPlus,
    color: "bg-green-100 text-green-600",
    badge: "New User",
    badgeColor: "bg-green-100 text-green-600",
  },
  user_updated: {
    icon: Edit,
    color: "bg-blue-100 text-blue-600",
    badge: "Updated",
    badgeColor: "bg-blue-100 text-blue-600",
  },
  group_created: {
    icon: Folder,
    color: "bg-purple-100 text-purple-600",
    badge: "New Group",
    badgeColor: "bg-purple-100 text-purple-600",
  },
  default: {
    icon: Activity,
    color: "bg-gray-100 text-gray-600",
    badge: "System",
    badgeColor: "bg-gray-100 text-gray-600",
  },
};

/**
 * Stats Card Component - Matches the screenshot design
 */
const DashboardStatsCard = ({
  icon: Icon,
  iconBg,
  title,
  value,
  loading,
  onClick,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-200" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-7 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:border-gray-200"
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            iconBg
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value?.toLocaleString() || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Activity Item Component
 */
const ActivityItem = ({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  badge,
  badgeColor,
  time,
}) => (
  <div className="flex items-center gap-3 py-3">
    <div
      className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
        iconColor
      )}
    >
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
    <div className="flex-shrink-0 text-right">
      <span
        className={cn(
          "inline-block px-2.5 py-1 rounded-full text-xs font-medium",
          badgeColor
        )}
      >
        {badge}
      </span>
    </div>
  </div>
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isInstructor = user?.role === ROLES.INSTRUCTOR;
  const [dateRange, setDateRange] = useState("30");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [attemptsData, setAttemptsData] = useState([]);

  const { stats, recentUsers, recentGroups, activity, queries } =
    useAdminDashboardData();

  // Calculate days for analytics API
  const days = useMemo(() => {
    if (dateRange === "custom") return 30;
    return parseInt(dateRange);
  }, [dateRange]);

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } =
    useAnalyticsDashboard(days);

  // Fetch attempts by day
  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const result = await analyticsService.getAttemptsByDay(days);
        const formatted = result.data.map((item) => ({
          name: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          value: item.attempts,
        }));
        setAttemptsData(formatted);
      } catch (error) {
        console.error("Failed to fetch attempts:", error);
        setAttemptsData([]);
      }
    };
    fetchAttempts();
  }, [days]);

  // Date range options
  const DATE_RANGES = [
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" },
  ];

  const selectedRangeLabel =
    DATE_RANGES.find((r) => r.value === dateRange)?.label || "Last 30 days";

  // Analytics stats
  const analyticsStats = useMemo(() => {
    if (analytics) {
      return {
        newUsers: analytics.new_users || 0,
        quizzesCompleted: analytics.quizzes_completed || 0,
        averageScore: analytics.average_score || 0,
        activeUsers: analytics.active_users || 0,
      };
    }
    return {
      newUsers: 0,
      quizzesCompleted: 0,
      averageScore: 0,
      activeUsers: 0,
    };
  }, [analytics]);

  // Top performers
  const topPerformers = useMemo(() => {
    if (analytics?.top_performers?.length > 0) {
      return analytics.top_performers.map((p) => ({
        id: p.id,
        user: {
          name:
            p.first_name && p.last_name
              ? `${p.first_name} ${p.last_name}`
              : `User ${p.user_id?.slice(0, 8) || "Unknown"}`,
          email: p.email || "",
          avatar: p.avatar,
        },
        quizzes_taken: p.quizzes_taken || 0,
        avg_score: p.avg_score || 0,
        best_score: p.best_score || 0,
      }));
    }
    return [];
  }, [analytics]);

  // Topic performance data for charts
  const topicPerformanceData = useMemo(() => {
    if (analytics?.topic_performance?.length > 0) {
      return analytics.topic_performance.map((t) => ({
        name:
          t.topic_name?.length > 15
            ? t.topic_name.substring(0, 15) + "..."
            : t.topic_name,
        value: t.accuracy || 0,
        fullName: t.topic_name,
        questions: t.total_questions,
      }));
    }
    return [];
  }, [analytics]);

  // Strengths data (topics with high accuracy)
  const strengthsData = useMemo(() => {
    if (analytics?.strengths?.length > 0) {
      return analytics.strengths.map((t) => ({
        name:
          t.topic_name?.length > 20
            ? t.topic_name.substring(0, 20) + "..."
            : t.topic_name,
        value: t.accuracy || 0,
        fullName: t.topic_name,
        questions: t.total_questions,
      }));
    }
    return [];
  }, [analytics]);

  // Areas to improve (topics with low accuracy)
  const needsImprovementData = useMemo(() => {
    if (analytics?.needs_improvement?.length > 0) {
      return analytics.needs_improvement.map((t) => ({
        name:
          t.topic_name?.length > 20
            ? t.topic_name.substring(0, 20) + "..."
            : t.topic_name,
        value: t.accuracy || 0,
        fullName: t.topic_name,
        questions: t.total_questions,
      }));
    }
    return [];
  }, [analytics]);

  // Group performance data
  const groupPerformanceData = useMemo(() => {
    if (analytics?.group_performance?.length > 0) {
      return analytics.group_performance.map((g) => ({
        name:
          g.group_name?.length > 15
            ? g.group_name.substring(0, 15) + "..."
            : g.group_name || "Unknown",
        value: g.average_score || 0,
        fullName: g.group_name || "Unknown Group",
        attempts: g.total_attempts,
        members: g.active_members,
        passRate: g.pass_rate,
      }));
    }
    return [];
  }, [analytics]);

  const performersColumns = [
    {
      key: "user",
      label: "User",
      render: (_, row) => (
        <UserCell
          name={row.user?.name || "Unknown"}
          email={row.user?.email || ""}
          avatar={row.user?.avatar}
        />
      ),
    },
    {
      key: "quizzes_taken",
      label: "Quizzes",
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: "avg_score",
      label: "Avg Score",
      render: (value) => (
        <span className="font-medium">{value?.toFixed(1)}%</span>
      ),
    },
    {
      key: "best_score",
      label: "Best",
      render: (value) => (
        <span className="font-medium text-blue-600">{value?.toFixed(1)}%</span>
      ),
    },
  ];

  // Stats cards configuration matching the screenshot style
  const statsCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      iconBg: "bg-blue-50 text-blue-600",
      onClick: !isInstructor ? () => navigate("/users") : undefined,
    },
    {
      title: "Instructors",
      value: stats?.totalInstructors || 0,
      icon: GraduationCap,
      iconBg: "bg-emerald-50 text-emerald-600",
      onClick: !isInstructor ? () => navigate("/users?role=instructor") : undefined,
    },
    {
      title: "Students",
      value: stats?.totalStudents || 0,
      icon: BookOpen,
      iconBg: "bg-cyan-50 text-cyan-600",
      onClick: !isInstructor ? () => navigate("/users?role=student") : undefined,
    },
    {
      title: "Active Groups",
      value: stats?.activeGroups || 0,
      icon: UsersRound,
      iconBg: "bg-orange-50 text-orange-600",
      onClick: () => navigate("/groups"),
    },
  ];

  // Generate activity from recent users and groups
  const displayActivity = useMemo(() => {
    const activities = [];

    // Add recent users
    if (recentUsers?.length > 0) {
      recentUsers.slice(0, 3).forEach((user) => {
        activities.push({
          type: "user_created",
          title:
            `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
            user.email,
          subtitle: user.email,
          timestamp: user.created_at,
        });
      });
    }

    // Add recent groups
    if (recentGroups?.length > 0) {
      recentGroups.slice(0, 2).forEach((group) => {
        activities.push({
          type: "group_created",
          title: group.name,
          subtitle: group.description || "No description",
          timestamp: group.created_at,
        });
      });
    }

    // Sort by timestamp (most recent first) and limit to 4
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 4);
  }, [recentUsers, recentGroups]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <DashboardStatsCard
            key={card.title}
            icon={card.icon}
            iconBg={card.iconBg}
            title={card.title}
            value={card.value}
            loading={queries.stats.isLoading}
            onClick={card.onClick}
          />
        ))}
      </div>

      {/* Analytics Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Analytics Overview
        </h2>
        <div className="relative">
          <button
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
          >
            <Calendar className="w-4 h-4" />
            {selectedRangeLabel}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showDateDropdown ? "rotate-180" : ""
              }`}
            />
          </button>
          {showDateDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDateDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-xl z-20 py-1">
                {DATE_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => {
                      setDateRange(range.value);
                      setShowDateDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                      dateRange === range.value
                        ? "text-blue-600 bg-blue-50"
                        : ""
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <LineChartComponent
            title="Quiz Attempts by Day"
            data={attemptsData}
            color="#3b82f6"
            height={280}
          />
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <BarChartComponent
            title="Quiz Attempts"
            data={attemptsData}
            color="#10b981"
            height={280}
          />
        </div>
      </div>

      {/* Topic Performance & Strengths/Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Excellent Performance - Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Excellent Performance (Strengths)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strengthsData.length > 0 ? (
              <BarChartComponent
                data={strengthsData}
                color="#22c55e"
                height={220}
              />
            ) : (
              <div className="flex items-center justify-center h-[220px] text-gray-500 text-sm">
                No topic data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Areas to Improve */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            {needsImprovementData.length > 0 ? (
              <BarChartComponent
                data={needsImprovementData}
                color="#f97316"
                height={220}
              />
            ) : (
              <div className="flex items-center justify-center h-[220px] text-gray-500 text-sm">
                No improvement areas identified
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Group Performance & Topic Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Group Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <UsersRound className="w-4 h-4 text-purple-500" />
              Group Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {groupPerformanceData.length > 0 ? (
              <BarChartComponent
                data={groupPerformanceData}
                color="#8b5cf6"
                height={220}
              />
            ) : (
              <div className="flex items-center justify-center h-[220px] text-gray-500 text-sm">
                No group data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Topic Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Topic Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topicPerformanceData.length > 0 ? (
              <BarChartComponent
                data={topicPerformanceData}
                color="#3b82f6"
                height={220}
              />
            ) : (
              <div className="flex items-center justify-center h-[220px] text-gray-500 text-sm">
                No topic data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={performersColumns}
              data={topPerformers}
              isLoading={analyticsLoading}
              emptyMessage="No data"
              paginated={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Recent Activity & Users - Hidden for instructors */}
      {!isInstructor && (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              Recent Activity
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              onClick={() => navigate("/users")}
            >
              See All
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {queries.recentUsers?.isLoading ||
            queries.recentGroups?.isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={`activity-skeleton-${i}`}
                    className="flex items-center gap-3 py-3 animate-pulse"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16" />
                  </div>
                ))}
              </div>
            ) : displayActivity?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {displayActivity.map((item, index) => {
                  const config =
                    activityConfig[item.type] || activityConfig.default;
                  return (
                    <ActivityItem
                      key={`${item.type}-${item.timestamp}-${index}`}
                      icon={config.icon}
                      iconColor={config.color}
                      title={item.title || item.message}
                      subtitle={
                        item.subtitle ||
                        formatDate(item.timestamp || item.created_at)
                      }
                      badge={config.badge}
                      badgeColor={config.badgeColor}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Activity}
                title="No recent activity"
                description="Activity will appear here."
                className="py-8"
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Users Table */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              Recent Users
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              onClick={() => navigate("/users")}
            >
              See All
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {queries.recentUsers.isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={`user-skeleton-${i}`}
                    className="flex items-center gap-4 py-3 animate-pulse"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20" />
                  </div>
                ))}
              </div>
            ) : recentUsers?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentUsers.slice(0, 5).map((user) => (
                      <tr
                        key={user.user_id || user.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/users/${user.user_id || user.id}`)}
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                              {(
                                user.first_name?.[0] ||
                                user.email?.[0] ||
                                "U"
                              ).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {`${user.first_name || ""} ${
                                  user.last_name || ""
                                }`.trim() || "Unnamed User"}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <RoleBadge role={user.role} size="sm" />
                        </td>
                        <td className="py-3 px-2">
                          <StatusBadge
                            status={user.is_active ? "active" : "inactive"}
                            size="sm"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm text-gray-500">
                            {formatDate(user.created_at)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="No users yet"
                description="Users will appear here once they join."
              />
            )}
          </CardContent>
        </Card>
      </div>
      )}

      {/* Recent Groups */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <UsersRound className="w-4 h-4 text-gray-500" />
            Recent Groups
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            onClick={() => navigate("/groups")}
          >
            See All
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {queries.recentGroups.isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Group
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Members
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(3)].map((_, i) => (
                    <tr key={`group-skeleton-${i}`} className="animate-pulse">
                      <td className="py-3 px-2">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                      </td>
                      <td className="py-3 px-2">
                        <div className="h-4 bg-gray-200 rounded w-12" />
                      </td>
                      <td className="py-3 px-2">
                        <div className="h-6 bg-gray-200 rounded w-16" />
                      </td>
                      <td className="py-3 px-2">
                        <div className="h-6 bg-gray-200 rounded w-16" />
                      </td>
                      <td className="py-3 px-2">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : recentGroups?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Group
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Members
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentGroups.slice(0, 5).map((group) => (
                    <tr
                      key={group.group_id || group.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/groups/${group.group_id || group.id}`)}
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
                            <UsersRound className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {group.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                              {group.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-gray-900 font-medium">
                          {group.member_count || 0}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                          {group.group_type?.replace("_", " ") || "Class"}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge
                          status={group.status || "active"}
                          size="sm"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-gray-500">
                          {formatDate(group.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={UsersRound}
              title="No groups yet"
              description="Groups will appear here once they are created."
              actionLabel="Create Group"
              onAction={() => navigate("/groups")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
