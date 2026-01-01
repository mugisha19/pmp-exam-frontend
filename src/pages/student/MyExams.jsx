/**
 * My Learning Page - Website Style
 * Modern learning page matching Home/Groups design
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getQuizzes } from "@/services/quiz.service";
import { useQuizAttemptsBatch } from "@/hooks/queries/useQuizAttemptsBatch";
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

    const completed = allQuizzes.filter((q) => q.status === "completed").length;

    // Calculate average score from attempts
    let totalScore = 0;
    let scoreCount = 0;
    Object.values(attemptsMap || {}).forEach((attemptInfo) => {
      const attempts = Array.isArray(attemptInfo?.attempts)
        ? attemptInfo.attempts
        : Array.isArray(attemptInfo)
        ? attemptInfo
        : [];
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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <p className="text-emerald-600 font-semibold mb-2">
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
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
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
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
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
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
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
                <div className="text-4xl font-bold text-emerald-600">
                  {stats.active}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
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
                <span className="text-sm font-semibold text-emerald-600">
                  {stats.total > 0
                    ? Math.round((stats.completed / stats.total) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
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
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-emerald-600" />
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
      <section className="border-b border-gray-200 bg-white sticky top-0 z-10">
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
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
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
                    ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-emerald-600 text-white rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
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
                            ? "bg-emerald-100 text-emerald-700"
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
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
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
              const attempts = attemptInfo?.attempts || [];
              const bestScore =
                attempts.length > 0
                  ? Math.max(...attempts.map((a) => a.score || 0))
                  : null;

              return (
                <ExamCardModern
                  key={quizId}
                  quiz={quiz}
                  bestScore={bestScore}
                  attemptCount={attempts.length}
                  onClick={() => handleStartQuiz(quizId)}
                />
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedQuizzes.map((quiz) => {
              const quizId = quiz.quiz_id || quiz.id;
              const attemptInfo = attemptsMap[quizId] || null;
              const attempts = attemptInfo?.attempts || [];
              const bestScore =
                attempts.length > 0
                  ? Math.max(...attempts.map((a) => a.score || 0))
                  : null;

              return (
                <ExamListItem
                  key={quizId}
                  quiz={quiz}
                  bestScore={bestScore}
                  attemptCount={attempts.length}
                  onClick={() => handleStartQuiz(quizId)}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      {activeTab === "in-progress" && stats.active > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-emerald-600 rounded-xl p-8 text-white">
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
              <button
                onClick={() => navigate("/browse")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shrink-0"
              >
                Browse More Exams
                <ArrowRight className="w-5 h-5 text-emerald-600" />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

// Modern Exam Card Component (Grid View)
const ExamCardModern = ({ quiz, bestScore, attemptCount, onClick }) => {
  const isCompleted = quiz.status === "completed";
  const isActive = quiz.is_available || quiz.status === "active";

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer group flex flex-col"
    >
      {/* Header */}
      <div className="h-24 bg-linear-to-br from-emerald-500 to-teal-600 relative">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {isCompleted ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-md text-xs font-medium">
              <CheckCircle className="w-3 h-3" />
              Completed
            </div>
          ) : isActive ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium text-emerald-600">
              <Play className="w-3 h-3" />
              Active
            </div>
          ) : null}
        </div>

        {/* Best Score */}
        {bestScore !== null && (
          <div className="absolute bottom-3 left-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-semibold text-gray-700">
              <Trophy className="w-3 h-3 text-orange-500" />
              Best: {bestScore}%
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col h-full">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
          {quiz.title}
        </h3>

        {quiz.description && (
          <div
            className="text-sm text-gray-600 line-clamp-2 mb-4"
            dangerouslySetInnerHTML={{ __html: quiz.description }}
          />
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {quiz.total_questions || 0}
              </div>
              <div className="text-xs text-gray-500">Questions</div>
            </div>
          </div>

          {quiz.time_limit_minutes && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  {quiz.time_limit_minutes}
                </div>
                <div className="text-xs text-gray-500">Minutes</div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto pt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-full py-2.5 bg-emerald-600 text-white font-medium text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
          >
            {attemptCount > 0 ? "Continue" : "Start Exam"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Exam List Item Component (List View)
const ExamListItem = ({ quiz, bestScore, attemptCount, onClick }) => {
  const isCompleted = quiz.status === "completed";
  const isActive = quiz.is_available || quiz.status === "active";

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-6 p-5 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
    >
      {/* Avatar */}
      <div className="w-16 h-16 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0">
        <BookOpen className="w-7 h-7" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {quiz.title}
          </h3>
          {isCompleted && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              <CheckCircle className="w-3 h-3" />
              Completed
            </span>
          )}
          {isActive && !isCompleted && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {quiz.total_questions || 0} questions
          </span>
          {quiz.time_limit_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {quiz.time_limit_minutes} min
            </span>
          )}
          {bestScore !== null && (
            <span className="flex items-center gap-1 text-orange-600 font-semibold">
              <Trophy className="w-4 h-4" />
              Best: {bestScore}%
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="px-6 py-2.5 bg-emerald-600 text-white font-medium text-sm rounded-lg hover:bg-emerald-700 transition-colors shrink-0"
      >
        {attemptCount > 0 ? "Continue" : "Start"}
      </button>
    </div>
  );
};

export default MyExams;
