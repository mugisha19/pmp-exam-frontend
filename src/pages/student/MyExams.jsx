/**
 * My Learning Page - Website Style
 * Modern learning page matching Home/Groups design
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getQuizzes } from "@/services/quiz.service";
import { useQuizAttemptsBatch } from "@/hooks/queries/useQuizAttemptsBatch";
import { ExamCard } from "@/components/shared/ExamCard";
import { ReminderPanel } from "@/components/website/navigation/ReminderPanel";
import {
  BookOpen,
  Clock,
  Trophy,
  Play,
  CheckCircle,
  Search,
  Grid3x3,
  List,
  Filter,
  X,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Target,
} from "lucide-react";
import { cn } from "@/utils/cn";

export const MyExams = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("in-progress");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  // Fetch available quizzes
  const { data: quizzesData, isLoading: loadingQuizzes } = useQuery({
    queryKey: ["student-quizzes"],
    queryFn: () => getQuizzes(),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const allQuizzes = quizzesData?.quizzes || quizzesData?.items || [];

  // Fetch attempts for quizzes
  const quizIds = allQuizzes
    .slice(0, 20)
    .map((q) => q.quiz_id || q.id)
    .filter(Boolean);
  const { attemptsMap } = useQuizAttemptsBatch(quizIds, {
    enabled: quizIds.length > 0,
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const active = allQuizzes.filter((q) => {
      if (q.status === "cancelled") return false;
      if (q.scheduling_enabled && q.starts_at && q.ends_at) {
        const start = new Date(q.starts_at);
        const end = new Date(q.ends_at);
        return now >= start && now <= end;
      }
      return q.is_available || q.status === "active";
    }).length;

    const completed = allQuizzes.filter((q) => {
      const quizId = q.quiz_id || q.id;
      const attemptInfo = attemptsMap[quizId];
      return attemptInfo && attemptInfo.attempts > 0;
    }).length;

    const freeExams = allQuizzes.filter((q) => !q.is_premium).length;

    // Calculate average score from attempts
    let totalScore = 0;
    let scoreCount = 0;
    Object.values(attemptsMap || {}).forEach((attemptInfo) => {
      const attempts = attemptInfo?.data || [];
      attempts.forEach((att) => {
        if (att.score != null) {
          totalScore += att.score;
          scoreCount++;
        }
      });
    });
    const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    return {
      total: allQuizzes.length,
      active,
      completed,
      avgScore,
    };
  }, [allQuizzes, attemptsMap]);

  // Filter and sort quizzes
  const filteredAndSortedQuizzes = useMemo(() => {
    const now = new Date();

    let filtered = allQuizzes.filter((quiz) => {
      if (
        searchQuery &&
        !quiz.title?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (typeFilter !== "all") {
        const isPublicQuiz = quiz.is_public && !quiz.group_id;
        const isGroupQuiz = quiz.group_id;
        if (typeFilter === "public" && !isPublicQuiz) return false;
        if (typeFilter === "group" && !isGroupQuiz) return false;
      }

      if (activeTab === "in-progress") {
        if (quiz.status === "completed" || quiz.status === "cancelled")
          return false;
        if (quiz.scheduling_enabled && quiz.starts_at && quiz.ends_at) {
          const start = new Date(quiz.starts_at);
          const end = new Date(quiz.ends_at);
          if (!(now >= start && now <= end)) return false;
        } else if (!quiz.is_available && quiz.status !== "active") {
          return false;
        }
      } else if (activeTab === "completed") {
        if (quiz.status !== "completed") return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "date":
        default: {
          const dateA = new Date(a.starts_at || a.created_at || 0);
          const dateB = new Date(b.starts_at || b.created_at || 0);
          return dateB - dateA;
        }
      }
    });

    return filtered;
  }, [allQuizzes, searchQuery, typeFilter, activeTab, sortBy]);

  const activeFiltersCount = [typeFilter !== "all"].filter(Boolean).length;

  const handleClearFilters = () => {
    setTypeFilter("all");
    setSearchQuery("");
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/exams/${quizId}`);
  };

  const handleSetReminder = (quizId) => {
    setSelectedQuizId(quizId);
    setReminderOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <p className="text-[#FF5100] font-semibold mb-2">
                Your Progress
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                My Learning
              </h1>
              <p className="text-lg text-gray-600 mb-6 max-w-xl">
                Track your exam progress, review completed quizzes, and continue
                your certification journey.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setActiveTab("in-progress")}
                  className={cn(
                    "inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors",
                    activeTab === "in-progress"
                      ? "bg-[#FF5100] text-white hover:bg-[#E64800]"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Play className="w-5 h-5" />
                  In Progress
                  {stats.active > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-white/20 rounded-full">
                      {stats.active}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={cn(
                    "inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors",
                    activeTab === "completed"
                      ? "bg-[#FF5100] text-white hover:bg-[#E64800]"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <CheckCircle className="w-5 h-5" />
                  Completed
                  {stats.completed > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-white/20 rounded-full">
                      {stats.completed}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("all")}
                  className={cn(
                    "inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors",
                    activeTab === "all"
                      ? "bg-[#FF5100] text-white hover:bg-[#E64800]"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <BookOpen className="w-5 h-5" />
                  All Exams
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-8 lg:gap-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-600">Total Exams</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#FF5100]">
                  {stats.active}
                </div>
                <div className="text-sm text-gray-600">Active Now</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500">
                  {stats.avgScore}%
                </div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Completion Progress
                </span>
                <span className="text-sm font-semibold text-[#6EC1E4]">
                  {stats.total > 0
                    ? Math.round((stats.completed / stats.total) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6EC1E4] rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      stats.total > 0
                        ? Math.round((stats.completed / stats.total) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {stats.completed} of {stats.total} exams completed
              </p>
            </div>

            <div className="flex gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[rgba(110,193,228,0.2)] flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#6EC1E4]" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {stats.completed}
                  </div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {stats.active}
                  </div>
                  <div className="text-xs text-gray-600">Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters Section */}
      <section className="border-b border-gray-200 bg-white sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#FF5100] focus:ring-2 focus:ring-[rgba(255,81,0,0.2)] focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filters and Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg font-medium text-sm transition-colors",
                  showFilters || activeFiltersCount > 0
                    ? "border-[#FF5100] text-[#FF5100] bg-[rgba(255,81,0,0.1)]"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-[#FF5100] text-white rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:border-[#FF5100] focus:ring-2 focus:ring-[rgba(255,81,0,0.2)] focus:outline-none"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>

              <div className="flex items-center p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    viewMode === "list"
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Type:
                  </span>
                  <div className="flex gap-2">
                    {[
                      { value: "all", label: "All" },
                      { value: "public", label: "Public Exams" },
                      { value: "group", label: "Group Exams" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTypeFilter(option.value)}
                        className={cn(
                          "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
                          typeFilter === option.value
                            ? "bg-[rgba(110,193,228,0.15)] text-[#5AAFD0]"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Count */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p className="text-sm text-gray-600">
          {loadingQuizzes
            ? "Loading..."
            : `${filteredAndSortedQuizzes.length} exam${
                filteredAndSortedQuizzes.length !== 1 ? "s" : ""
              } found`}
        </p>
      </section>

      {/* Exams Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loadingQuizzes ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[rgba(255,81,0,0.2)] border-t-[#FF5100] rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-medium">
                Loading exams...
              </p>
            </div>
          </div>
        ) : filteredAndSortedQuizzes.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No exams found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {activeFiltersCount > 0
                ? "Try adjusting your filters to find more exams"
                : activeTab === "in-progress"
                ? "No exams in progress. Browse exams to get started."
                : "No exams available"}
            </p>
            <button
              onClick={() => navigate("/browse")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF5100] text-white font-semibold rounded-lg hover:bg-[#E64800] transition-colors"
            >
              Browse Exams
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedQuizzes.map((quiz) => {
              const quizId = quiz.quiz_id || quiz.id;
              const attemptInfo = attemptsMap[quizId] || null;
              const bestScore = attemptInfo?.best_score;
              const attemptCount = attemptInfo?.attempts || 0;

              return (
                <ExamCard
                  key={quizId}
                  quiz={quiz}
                  bestScore={bestScore}
                  attemptCount={attemptCount}
                  onClick={() => handleStartQuiz(quizId)}
                  onSetReminder={handleSetReminder}
                  variant="grid"
                />
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedQuizzes.map((quiz) => {
              const quizId = quiz.quiz_id || quiz.id;
              const attemptInfo = attemptsMap[quizId] || null;
              const bestScore = attemptInfo?.best_score;
              const attemptCount = attemptInfo?.attempts || 0;

              return (
                <ExamCard
                  key={quizId}
                  quiz={quiz}
                  bestScore={bestScore}
                  attemptCount={attemptCount}
                  onClick={() => handleStartQuiz(quizId)}
                  onSetReminder={handleSetReminder}
                  variant="list"
                />
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      {activeTab === "in-progress" && stats.active > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-[#FF5100] rounded-xl p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2 text-white">
                  Keep Up the Great Work!
                </h2>
                <p className="text-white/90">
                  You have {stats.active} exams in progress. Continue learning
                  to achieve your goals.
                </p>
              </div>
              <div className="text-center px-6 py-3 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {stats.avgScore}%
                </div>
                <div className="text-xs text-white/80">Average Score</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Available Right Now Section */}
      {stats.active > 0 && (
        <section className="bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-3 mb-6">
              <Play className="w-6 h-6 text-[#FF5100]" />
              <h2 className="text-2xl font-bold text-gray-900">
                Available Right Now
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              These exams are currently active and ready for you to take
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredAndSortedQuizzes
                .filter((q) => q.is_available || q.status === "active")
                .slice(0, 4)
                .map((quiz) => {
                  const quizId = quiz.quiz_id || quiz.id;
                  return (
                    <div
                      key={quizId}
                      onClick={() => handleStartQuiz(quizId)}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:border-gray-300 transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[rgba(255,81,0,0.1)] flex items-center justify-center shrink-0">
                        <Play className="w-5 h-5 text-[#FF5100]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate text-sm">
                          {quiz.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {quiz.total_questions || 0} questions
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                    </div>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-[rgba(110,193,228,0.2)] rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-[#6EC1E4]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Comprehensive Exams
              </h3>
              <p className="text-sm text-gray-600">
                Practice with exam-style questions covering all PMP knowledge
                areas and domains.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Track Progress
              </h3>
              <p className="text-sm text-gray-600">
                Monitor your scores, identify weak areas, and track improvement
                over time.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Achieve Success
              </h3>
              <p className="text-sm text-gray-600">
                Build confidence and prepare effectively for your certification
                exam.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reminder Panel */}
      {reminderOpen && (
        <ReminderPanel
          onClose={() => {
            setReminderOpen(false);
            setSelectedQuizId(null);
          }}
          preselectedQuizId={selectedQuizId}
        />
      )}
    </div>
  );
};

export default MyExams;



