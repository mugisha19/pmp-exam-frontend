/**
 * ActivityStats Component
 * Displays activity statistics with period filtering
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPerformanceDashboard, getPerformanceTrends } from "@/services/analytics.service";
import { DashboardStatsCard, StatsGrid } from "@/components/shared/StatsCards";
import { Spinner } from "@/components/ui";
import { 
  BookOpen, 
  CheckCircle, 
  TrendingUp, 
  Target,
  Calendar,
  BarChart3
} from "lucide-react";
import { cn } from "@/utils/cn";

const PERIOD_OPTIONS = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
  { label: "All Time", value: null },
];

export const ActivityStats = ({ className }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(30); // Default to 30 days

  // Fetch performance dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ["performance-dashboard"],
    queryFn: getPerformanceDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on 404
  });

  // Check if there's an error (excluding 404 which means no data yet)
  const hasError = dashboardError && dashboardError?.status !== 404 && dashboardError?.response?.status !== 404;
  const hasNoData = dashboardData === null && !dashboardLoading && !hasError;

  // Fetch trends data for selected period (only if not "All Time")
  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ["performance-trends", selectedPeriod],
    queryFn: () => getPerformanceTrends(selectedPeriod),
    enabled: selectedPeriod !== null && !hasError,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const isLoading = dashboardLoading || trendsLoading;

  // Calculate period-specific stats from trends
  const periodStats = useMemo(() => {
    if (!trendsData?.trends || trendsData.trends.length === 0) {
      return null;
    }

    const trends = trendsData.trends;
    const totalQuizzes = trends.length;
    const totalQuestions = trends.reduce((sum, t) => sum + (t.questions_answered || 0), 0);
    const avgScore = trends.reduce((sum, t) => sum + (t.avg_score || 0), 0) / totalQuizzes;
    const avgAccuracy = trends.reduce((sum, t) => sum + (t.accuracy || 0), 0) / totalQuizzes;

    return {
      totalQuizzes,
      totalQuestions,
      avgScore: avgScore || 0,
      avgAccuracy: avgAccuracy || 0,
    };
  }, [trendsData]);

  // Get overall stats from dashboard
  const overallStats = dashboardData?.overall_performance;

  // Determine which stats to show (period-specific if available and period selected, otherwise overall)
  const stats = (selectedPeriod !== null && periodStats) ? periodStats : {
    totalQuizzes: overallStats?.total_quizzes_attempted || 0,
    totalQuestions: overallStats?.total_questions_answered || 0,
    avgScore: overallStats?.avg_score || 0,
    avgAccuracy: overallStats?.overall_accuracy || 0,
  };

  const completedQuizzes = overallStats?.total_quizzes_completed || 0;
  const passedQuizzes = overallStats?.total_quizzes_passed || 0;

  // Calculate pass rate
  const passRate = completedQuizzes > 0 
    ? ((passedQuizzes / completedQuizzes) * 100).toFixed(1) 
    : 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Period Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">Activity Statistics</h3>
          <p className="text-sm text-gray-600 font-medium">
            Track your learning progress and performance
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-1.5 shadow-inner border border-gray-200/50">
          {PERIOD_OPTIONS.map((period) => {
            const isSelected = period.value === null 
              ? selectedPeriod === null 
              : selectedPeriod === period.value;
            return (
              <button
                key={period.value || "all"}
                onClick={() => setSelectedPeriod(period.value)}
                className={cn(
                  "px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
                  isSelected
                    ? "bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-md shadow-accent-primary/30 scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                )}
              >
                {period.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : hasNoData || !overallStats ? (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 shadow-lg p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">No Activity Data Yet</h4>
          <p className="text-sm text-gray-600 font-medium max-w-md mx-auto">
            Start taking quizzes to see your activity statistics here.
          </p>
        </div>
      ) : (
        <StatsGrid>
          <DashboardStatsCard
            title="Quizzes Attempted"
            value={stats.totalQuizzes}
            icon={BookOpen}
            subtitle={selectedPeriod !== null ? `Last ${selectedPeriod} days` : "All time"}
          />
          <DashboardStatsCard
            title="Quizzes Completed"
            value={completedQuizzes}
            icon={CheckCircle}
            subtitle={`${passRate}% pass rate`}
            trend={
              passRate > 0
                ? {
                    value: parseFloat(passRate),
                    label: "pass rate",
                  }
                : null
            }
          />
          <DashboardStatsCard
            title="Average Score"
            value={`${stats.avgScore.toFixed(1)}%`}
            icon={TrendingUp}
            subtitle={stats.avgScore >= 70 ? "Great job!" : "Keep practicing"}
            trend={
              stats.avgScore > 0
                ? {
                    value: stats.avgScore,
                    label: "average",
                  }
                : null
            }
          />
          <DashboardStatsCard
            title="Questions Answered"
            value={stats.totalQuestions}
            icon={BarChart3}
            subtitle={`${stats.avgAccuracy.toFixed(1)}% accuracy`}
          />
        </StatsGrid>
      )}

      {/* Additional Info */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          <div className="bg-gradient-to-br from-white to-green-50/30 rounded-xl border-2 border-green-100 shadow-md hover:shadow-lg transition-all duration-200 p-5 hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-sm">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Highest Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overallStats.highest_score?.toFixed(1) || "0"}%
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl border-2 border-blue-100 shadow-md hover:shadow-lg transition-all duration-200 p-5 hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Longest Streak</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overallStats.longest_streak_days || 0} days
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-xl border-2 border-purple-100 shadow-md hover:shadow-lg transition-all duration-200 p-5 hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-sm">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Improvement Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overallStats.improvement_rate?.toFixed(1) || "0"}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityStats;

