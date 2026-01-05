/**
 * Analytics Page
 * Comprehensive student performance analytics with charts
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { analyticsService } from "@/services/analytics.service";
import { LineChartComponent } from "@/components/charts/LineChartComponent";
import { BarChartComponent } from "@/components/charts/BarChartComponent";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { RadarChartComponent } from "@/components/charts/RadarChartComponent";
import {
  TrendingUp,
  Target,
  Clock,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle,
  XCircle,
  Trophy,
  Users,
  Activity,
  Calendar,
  Zap,
} from "lucide-react";
import { cn } from "@/utils/cn";

export const Analytics = () => {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState("all");

  // Fetch student performance data
  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ["student-performance", user?.user_id, timeRange],
    queryFn: () =>
      analyticsService.getStudentPerformance(user?.user_id, timeRange),
    enabled: !!user?.user_id,
  });

  // Fetch topic performance
  const { data: topicData, isLoading: topicLoading } = useQuery({
    queryKey: ["student-topics", user?.user_id],
    queryFn: () => analyticsService.getStudentTopicPerformance(user?.user_id),
    enabled: !!user?.user_id,
  });

  // Fetch quiz-specific stats
  const { data: quizStatsData, isLoading: quizStatsLoading } = useQuery({
    queryKey: ["student-quiz-stats", user?.user_id, timeRange],
    queryFn: () =>
      analyticsService.getStudentQuizSpecific(user?.user_id, timeRange),
    enabled: !!user?.user_id,
  });

  // Fetch recent activity
  const { data: recentActivityData, isLoading: activityLoading } = useQuery({
    queryKey: ["student-recent-activity", user?.user_id],
    queryFn: () => analyticsService.getStudentRecentActivity(user?.user_id),
    enabled: !!user?.user_id,
  });

  // Fetch group comparison
  const { data: groupComparisonData, isLoading: groupComparisonLoading } = useQuery({
    queryKey: ["student-group-comparison", user?.user_id],
    queryFn: async () => {
      try {
        const data = await analyticsService.getStudentGroupComparison(user?.user_id);
        return data;
      } catch (error) {
        console.error('Group comparison error:', error);
        return null;
      }
    },
    enabled: !!user?.user_id,
  });

  const isLoading =
    performanceLoading || topicLoading || quizStatsLoading || activityLoading;

  // Process chart data
  const scoresTrendData = useMemo(() => {
    if (!quizStatsData?.quiz_stats) return [];
    return quizStatsData.quiz_stats.slice(0, 10).map((quiz) => ({
      name: quiz.quiz_title?.substring(0, 15) || "Quiz",
      score: Math.round(quiz.best_score || 0),
    }));
  }, [quizStatsData]);

  // Topic performance chart data
  const topicChartData = useMemo(() => {
    if (!topicData?.topics) return [];
    return topicData.topics.slice(0, 8).map((topic) => ({
      name: topic.topic_name || topic.name || topic.topic || "Unknown Topic",
      mastery: Math.round(topic.accuracy || 0),
    }));
  }, [topicData]);

  // Strongest and weakest topics
  const { strongestTopics, weakestTopics } = useMemo(() => {
    if (!topicData?.topics || topicData.topics.length === 0) {
      return { strongestTopics: [], weakestTopics: [] };
    }

    const sortedTopics = [...topicData.topics]
      .filter((t) => t.total_questions > 0)
      .sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0));

    return {
      strongestTopics: sortedTopics.slice(0, 5),
      weakestTopics: sortedTopics.slice(-5).reverse(),
    };
  }, [topicData]);

  // Performance distribution pie chart
  const performanceDistribution = useMemo(() => {
    if (!performanceData) return [];

    const { total_attempts = 0, total_passed = 0 } = performanceData;
    const failed = total_attempts - total_passed;

    return [
      { name: "Passed", value: total_passed },
      { name: "Failed", value: failed > 0 ? failed : 0 },
    ].filter((item) => item.value > 0);
  }, [performanceData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[rgba(255,81,0,0.2)] border-t-[#FF5100] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[rgba(255,81,0,0.1)] rounded-lg">
                  <BarChart3 className="w-6 h-6 text-[#FF5100]" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Performance Analytics
                </h1>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl">
                Track your progress, identify strengths, and discover areas for
                improvement
              </p>
            </div>

            {/* Time Range Filter */}
            <div className="flex gap-2">
              {[
                { label: "All Time", value: "all" },
                { label: "This Year", value: "year" },
                { label: "This Month", value: "month" },
                { label: "7 Days", value: "7days" },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    timeRange === range.value
                      ? "bg-[#FF5100] text-white shadow-sm"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {performanceData?.total_attempts || 0}
                </div>
                <div className="text-sm text-gray-500 mt-1">Total Attempts</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Activity className="w-4 h-4" />
              <span>
                {performanceData?.attempts?.length || 0} quiz sessions
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[rgba(110,193,228,0.2)] rounded-lg">
                <Target className="w-6 h-6 text-[#6EC1E4]" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#6EC1E4]">
                  {Math.round(performanceData?.average_score || 0)}%
                </div>
                <div className="text-sm text-gray-500 mt-1">Average Score</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>
                {Math.round(performanceData?.pass_rate || 0)}% pass rate
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {Math.round(
                    (performanceData?.attempts?.reduce(
                      (sum, a) => sum + (a.time_spent_minutes || 0),
                      0
                    ) || 0) / 60
                  )}
                  h
                </div>
                <div className="text-sm text-gray-500 mt-1">Study Time</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {Math.round(
                  (performanceData?.attempts?.reduce(
                    (sum, a) => sum + (a.time_spent_minutes || 0),
                    0
                  ) || 0) % 60
                )}
                m total
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#6EC1E4]">
                  {performanceData?.total_passed || 0}
                </div>
                <div className="text-sm text-gray-500 mt-1">Quizzes Passed</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <CheckCircle className="w-4 h-4" />
              <span>
                {performanceData?.attempts?.reduce(
                  (sum, a) => sum + (a.correct_answers || 0),
                  0
                ) || 0}{" "}
                correct answers
              </span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Quiz Performance Trend
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Your scores across recent quizzes
                </p>
              </div>
              <Zap className="w-6 h-6 text-[#6EC1E4]" />
            </div>
            <LineChartComponent
              data={scoresTrendData}
              dataKey="score"
              xAxisKey="name"
              color="#10b981"
              height={300}
              showGrid={true}
            />
          </div>

          {/* Performance Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Pass/Fail Distribution
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Your overall performance breakdown
                </p>
              </div>
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            {performanceDistribution.length > 0 ? (
              <PieChartComponent
                data={performanceDistribution}
                dataKey="value"
                nameKey="name"
                height={280}
                showLegend={true}
                innerRadius={70}
                outerRadius={110}
                title=""
              />
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No data available yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Topic Mastery */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Topic Mastery Overview</h2>
              <p className="text-sm text-gray-500 mt-1">
                Your performance across different knowledge areas
              </p>
            </div>
            <Target className="w-6 h-6 text-blue-600" />
          </div>

          {topicData?.topics && topicData.topics.length > 0 ? (
            <div className="space-y-6">
              {/* Mastery Legend */}
              <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#6EC1E4]" />
                  <span className="text-sm text-gray-700">Expert (80-100%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500" />
                  <span className="text-sm text-gray-700">Proficient (60-79%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-500" />
                  <span className="text-sm text-gray-700">Developing (40-59%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500" />
                  <span className="text-sm text-gray-700">Needs Work (&lt;40%)</span>
                </div>
              </div>

              {/* Horizontal Bar Chart Visualization */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Topic Mastery Comparison</h3>
                {topicChartData.length > 0 ? (
                  <BarChartComponent
                    data={topicChartData}
                    dataKey="mastery"
                    xAxisKey="name"
                    color="#3b82f6"
                    height={400}
                    showGrid={true}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Not enough data to display chart</p>
                  </div>
                )}
              </div>

              {/* Horizontal Progress Bars */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Detailed Topic Breakdown</h3>
                {topicData.topics.slice(0, 10).map((topic, index) => {
                  const mastery = Math.round(topic.accuracy || 0);
                  const getMasteryColor = (score) => {
                    if (score >= 80) return { bg: 'bg-[#6EC1E4]', text: 'text-[#6EC1E4]', light: 'bg-[rgba(110,193,228,0.2)]' };
                    if (score >= 60) return { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-100' };
                    if (score >= 40) return { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-100' };
                    return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-100' };
                  };
                  const getMasteryLabel = (score) => {
                    if (score >= 80) return 'Expert';
                    if (score >= 60) return 'Proficient';
                    if (score >= 40) return 'Developing';
                    return 'Needs Work';
                  };
                  const colors = getMasteryColor(mastery);
                  const label = getMasteryLabel(mastery);

                  return (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base font-bold text-gray-900">{topic.topic_name || topic.name || topic.topic || 'Unknown Topic'}</span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors.light} ${colors.text}`}>
                              {label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {topic.correct_answers || 0} correct out of {topic.total_questions || 0} questions
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className={`text-2xl font-bold ${colors.text}`}>{mastery}%</div>
                        </div>
                      </div>
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full ${colors.bg} rounded-full transition-all duration-500`}
                          style={{ width: `${mastery}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              <div className="text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No topic data available yet</p>
                <p className="text-sm mt-2">Complete some quizzes to see your topic mastery</p>
              </div>
            </div>
          )}
        </div>

        {/* Topic Details & Group Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Topics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Strongest Topics
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Topics where you excel the most
                </p>
              </div>
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="space-y-3">
              {strongestTopics.length > 0 ? (
                strongestTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-[rgba(110,193,228,0.1)] rounded-lg border border-[rgba(110,193,228,0.3)]"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-[#6EC1E4] flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-base">
                          {topic.topic_name || topic.name || 'Unknown Topic'}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                          <span>{topic.correct_answers || 0}/{topic.total_questions || 0} correct</span>
                          <span>•</span>
                          <span>{topic.total_questions || 0} questions attempted</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="text-2xl font-bold text-[#6EC1E4]">
                        {Math.round(topic.accuracy || 0)}%
                      </div>
                      <div className="text-xs text-[#6EC1E4] font-medium">accuracy</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No topic data yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Weakest Topics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Areas to Improve
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Topics that need more practice
                </p>
              </div>
              <Target className="w-6 h-6 text-red-500" />
            </div>
            <div className="space-y-3">
              {weakestTopics.length > 0 ? (
                weakestTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-base">
                          {topic.topic_name || topic.name || 'Unknown Topic'}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                          <span>{topic.correct_answers || 0}/{topic.total_questions || 0} correct</span>
                          <span>•</span>
                          <span>{topic.total_questions || 0} questions attempted</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(topic.accuracy || 0)}%
                      </div>
                      <div className="text-xs text-orange-600 font-medium">accuracy</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No topic data yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Group Comparison */}
        {groupComparisonData && groupComparisonData.total_students > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Group Performance
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  How you compare to your peers
                </p>
              </div>
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-sm text-gray-600 mb-1">Your Rank</div>
                <div className="text-3xl font-bold text-blue-600">
                  #{groupComparisonData.rank || "N/A"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  out of {groupComparisonData.total_students || 0} students
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <div className="text-sm text-gray-600 mb-1">Percentile</div>
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round(groupComparisonData.percentile || 0)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Top {100 - Math.round(groupComparisonData.percentile || 0)}%
                  of class
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-sm text-gray-600 mb-1">
                  vs. Group Average
                </div>
                <div className="text-3xl font-bold text-[#6EC1E4]">
                  {groupComparisonData?.user_average >
                  groupComparisonData?.group_average
                    ? "+"
                    : ""}
                  {Math.round(
                    (groupComparisonData?.user_average || 0) -
                      (groupComparisonData?.group_average || 0)
                  )}
                  %
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Group avg:{" "}
                  {Math.round(groupComparisonData?.group_average || 0)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <Activity className="w-6 h-6 text-gray-600" />
          </div>
          <div className="space-y-3">
            {recentActivityData?.last_7_days?.attempts &&
            recentActivityData.last_7_days.attempts.length > 0 ? (
              recentActivityData.last_7_days.attempts
                .slice(0, 5)
                .map((attempt, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          attempt.score >= 60 ? "bg-secondary-100" : "bg-red-100"
                        )}
                      >
                        {attempt.score >= 60 ? (
                          <CheckCircle className="w-5 h-5 text-secondary-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {attempt.quiz_title || "Quiz"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(attempt.submitted_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={cn(
                          "text-xl font-bold",
                          attempt.score >= 60
                            ? "text-secondary-600"
                            : "text-red-600"
                        )}
                      >
                        {Math.round(attempt.score)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {attempt.correct_answers}/{attempt.total_questions}{" "}
                        correct
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;



