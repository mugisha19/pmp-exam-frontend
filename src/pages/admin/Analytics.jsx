/**
 * Admin Analytics Page
 * Display platform analytics with stats, charts, and performance tables
 */

import { useState, useMemo } from "react";
import {
  Users,
  CheckCircle,
  TrendingUp,
  Activity,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { DataTable } from "@/components/shared/DataTable";
import {
  LineChartComponent,
  BarChartComponent,
  PieChartComponent,
  AreaChartComponent,
} from "@/components/charts";
import { UserCell } from "@/components/shared/UserCell";
import { useAnalyticsDashboard } from "@/hooks/queries/useAnalyticsQueries";

// Date range options
const DATE_RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "custom", label: "Custom range" },
];

export function Analytics() {
  const [dateRange, setDateRange] = useState("30");
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  // Calculate days for API
  const days = useMemo(() => {
    if (dateRange === "custom") {
      return 30; // Default for custom
    }
    return parseInt(dateRange);
  }, [dateRange]);

  // Fetch analytics data with days parameter
  const { data: analytics, isLoading, isError } = useAnalyticsDashboard(days);

  // Stats data from API or fallback
  const statsData = useMemo(() => {
    if (analytics) {
      return {
        newUsers: analytics.new_users || 0,
        quizzesCompleted: analytics.quizzes_completed || 0,
        averageScore: analytics.average_score || 0,
        activeUsers: analytics.active_users || 0,
      };
    }
    // Fallback when API fails or loading
    return {
      newUsers: 0,
      quizzesCompleted: 0,
      averageScore: 0,
      activeUsers: 0,
    };
  }, [analytics]);

  // Top performers from API or fallback
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

  // Active groups from API or fallback
  const activeGroups = useMemo(() => {
    if (analytics?.active_groups?.length > 0) {
      return analytics.active_groups;
    }
    return [];
  }, [analytics]);

  // Top performers table columns
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
      label: "Quizzes Taken",
      render: (value) => (
        <span className="text-gray-900 font-medium">{value}</span>
      ),
    },
    {
      key: "avg_score",
      label: "Avg Score",
      render: (value) => (
        <span
          className={`font-medium ${
            value >= 80
              ? "text-emerald-400"
              : value >= 60
              ? "text-amber-400"
              : "text-red-400"
          }`}
        >
          {value?.toFixed(1)}%
        </span>
      ),
    },
    {
      key: "best_score",
      label: "Best Score",
      render: (value) => (
        <span className="text-blue-400 font-medium">{value?.toFixed(1)}%</span>
      ),
    },
  ];

  // Active groups table columns
  const groupsColumns = [
    {
      key: "name",
      label: "Group",
      render: (value) => (
        <span className="text-gray-900 font-medium">{value}</span>
      ),
    },
    {
      key: "members",
      label: "Members",
      render: (value) => <span className="text-gray-700">{value}</span>,
    },
    {
      key: "quizzes",
      label: "Quizzes",
      render: (value) => <span className="text-gray-700">{value}</span>,
    },
    {
      key: "completions",
      label: "Completions",
      render: (value) => (
        <span className="text-emerald-400 font-medium">{value}</span>
      ),
    },
  ];

  const selectedRangeLabel =
    DATE_RANGES.find((r) => r.value === dateRange)?.label || "Last 30 days";

  return (
    <div className="p-6 space-y-6">
      {/* Header with Date Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Analytics"
          subtitle="Platform performance metrics and insights"
        />

        {/* Date Range Picker */}
        <div className="relative">
          <button
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{selectedRangeLabel}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
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
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1">
                {DATE_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => {
                      setDateRange(range.value);
                      setShowDateDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                      dateRange === range.value
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700"
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="New Users"
          value={statsData.newUsers}
          subtitle={`In ${selectedRangeLabel.toLowerCase()}`}
          icon={Users}
          trend={12}
          iconColor="text-blue-400"
          iconBgColor="bg-blue-500/10"
        />
        <StatsCard
          title="Quizzes Completed"
          value={statsData.quizzesCompleted.toLocaleString()}
          subtitle={`In ${selectedRangeLabel.toLowerCase()}`}
          icon={CheckCircle}
          trend={8}
          iconColor="text-emerald-400"
          iconBgColor="bg-emerald-500/10"
        />
        <StatsCard
          title="Average Score"
          value={`${statsData.averageScore}%`}
          subtitle="Across all quizzes"
          icon={TrendingUp}
          trend={3}
          iconColor="text-amber-400"
          iconBgColor="bg-amber-500/10"
        />
        <StatsCard
          title="Active Users"
          value={statsData.activeUsers}
          subtitle="Currently active"
          icon={Activity}
          trend={5}
          iconColor="text-teal-600"
          iconBgColor="bg-teal-500/10"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartComponent
          title="User Registrations"
          color="#3b82f6"
          height={280}
        />
        <BarChartComponent
          title="Quiz Completions"
          color="#10b981"
          height={280}
        />
        <PieChartComponent title="Score Distribution" height={280} />
        <AreaChartComponent
          title="Domain Performance"
          height={280}
          horizontal={true}
        />
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performers
          </h3>
          <DataTable
            columns={performersColumns}
            data={topPerformers}
            isLoading={isLoading}
            emptyMessage="No performance data available"
            paginated={true}
          />
        </div>

        {/* Most Active Groups */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Most Active Groups
          </h3>
          <DataTable
            columns={groupsColumns}
            data={activeGroups}
            isLoading={isLoading}
            emptyMessage="No group activity data available"
            paginated={true}
          />
        </div>
      </div>
    </div>
  );
}

export default Analytics;
