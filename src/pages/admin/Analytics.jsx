/**
 * Admin Analytics Page
 * Display platform analytics with stats, charts, and performance tables
 * TODO: Integrate recharts library for actual charts
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
import { ChartPlaceholder } from "@/components/charts";
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

  // Calculate date range for API (reserved for future use with real API)
  const _dateParams = useMemo(() => {
    if (dateRange === "custom") {
      // For custom, we'd need a date picker - using 30 days as default
      return { days: 30 };
    }
    return { days: parseInt(dateRange) };
  }, [dateRange]);

  // Fetch analytics data
  const { data: analytics, isLoading } = useAnalyticsDashboard();

  // Mock data for demonstration (will be replaced with actual API data)
  const statsData = useMemo(() => {
    if (analytics) {
      return {
        newUsers: analytics.new_users || 0,
        quizzesCompleted: analytics.quizzes_completed || 0,
        averageScore: analytics.average_score || 0,
        activeUsers: analytics.active_users || 0,
      };
    }
    // Fallback mock data
    return {
      newUsers: 156,
      quizzesCompleted: 1243,
      averageScore: 72.5,
      activeUsers: 89,
    };
  }, [analytics]);

  // Mock top performers data
  const topPerformers = useMemo(() => {
    if (analytics?.top_performers) {
      return analytics.top_performers;
    }
    return [
      {
        id: 1,
        user: { name: "John Smith", email: "john@example.com", avatar: null },
        quizzes_taken: 45,
        avg_score: 94.2,
        best_score: 100,
      },
      {
        id: 2,
        user: {
          name: "Sarah Johnson",
          email: "sarah@example.com",
          avatar: null,
        },
        quizzes_taken: 38,
        avg_score: 91.8,
        best_score: 98,
      },
      {
        id: 3,
        user: {
          name: "Michael Chen",
          email: "michael@example.com",
          avatar: null,
        },
        quizzes_taken: 42,
        avg_score: 89.5,
        best_score: 97,
      },
      {
        id: 4,
        user: { name: "Emily Davis", email: "emily@example.com", avatar: null },
        quizzes_taken: 35,
        avg_score: 88.3,
        best_score: 96,
      },
      {
        id: 5,
        user: {
          name: "David Wilson",
          email: "david@example.com",
          avatar: null,
        },
        quizzes_taken: 30,
        avg_score: 87.1,
        best_score: 95,
      },
    ];
  }, [analytics]);

  // Mock most active groups data
  const activeGroups = useMemo(() => {
    if (analytics?.active_groups) {
      return analytics.active_groups;
    }
    return [
      {
        id: 1,
        name: "PMP Prep 2024",
        members: 45,
        quizzes: 12,
        completions: 387,
      },
      {
        id: 2,
        name: "Advanced Project Management",
        members: 32,
        quizzes: 8,
        completions: 256,
      },
      {
        id: 3,
        name: "Agile Practitioners",
        members: 28,
        quizzes: 10,
        completions: 198,
      },
      {
        id: 4,
        name: "Risk Management Focus",
        members: 22,
        quizzes: 6,
        completions: 132,
      },
      {
        id: 5,
        name: "Quality Management",
        members: 18,
        quizzes: 5,
        completions: 90,
      },
    ];
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
        <span className="text-blue-400 font-medium">{value}%</span>
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
          trend={{ value: 12, isPositive: true }}
          iconColor="text-blue-400"
          iconBgColor="bg-blue-500/10"
        />
        <StatsCard
          title="Quizzes Completed"
          value={statsData.quizzesCompleted.toLocaleString()}
          subtitle={`In ${selectedRangeLabel.toLowerCase()}`}
          icon={CheckCircle}
          trend={{ value: 8, isPositive: true }}
          iconColor="text-emerald-400"
          iconBgColor="bg-emerald-500/10"
        />
        <StatsCard
          title="Average Score"
          value={`${statsData.averageScore}%`}
          subtitle="Across all quizzes"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
          iconColor="text-amber-400"
          iconBgColor="bg-amber-500/10"
        />
        <StatsCard
          title="Active Users"
          value={statsData.activeUsers}
          subtitle="Currently active"
          icon={Activity}
          trend={{ value: 5, isPositive: true }}
          iconColor="text-teal-600"
          iconBgColor="bg-teal-500/10"
        />
      </div>

      {/* Charts Section */}
      {/* TODO: Integrate recharts library for actual charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder
          title="User Registrations"
          type="line"
          height="h-72"
          showMockData={true}
        />
        <ChartPlaceholder
          title="Quiz Completions"
          type="bar"
          height="h-72"
          showMockData={true}
        />
        <ChartPlaceholder
          title="Score Distribution"
          type="pie"
          height="h-72"
          showMockData={true}
        />
        <ChartPlaceholder
          title="Domain Performance"
          type="area"
          height="h-72"
          showMockData={true}
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
          />
        </div>
      </div>
    </div>
  );
}

export default Analytics;
