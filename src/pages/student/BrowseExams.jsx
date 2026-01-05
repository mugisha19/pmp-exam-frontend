/**
 * BrowseExams Page
 * Catalog/marketplace view for all available exams - Modern design matching Home/Groups
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getQuizzes } from "@/services/quiz.service";
import { analyticsService } from "@/services/analytics.service";
import { useAuthStore } from "@/stores/auth.store";
import { ExamCard } from "@/components/shared/ExamCard";
import {
  Search,
  Grid3x3,
  List,
  BookOpen,
  Trophy,
  Clock,
  TrendingUp,
  Filter,
  X,
  ChevronRight,
  ArrowRight,
  Play,
  CheckCircle,
  Star,
  Zap,
  Users,
  Calendar,
  Target,
} from "lucide-react";
import { cn } from "@/utils/cn";

export const BrowseExams = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const activeTab = searchParams.get("type") || "all";

  // Fetch all quizzes
  const { data: quizzesData, isLoading } = useQuery({
    queryKey: ["browse-quizzes"],
    queryFn: () => getQuizzes({ limit: 100 }),
    staleTime: 2 * 60 * 1000,
  });

  const allQuizzes = quizzesData?.quizzes || quizzesData?.items || [];

  // Fetch all attempts using analytics service
  const { data: attemptsData } = useQuery({
    queryKey: ["student-performance-browse", user?.user_id],
    queryFn: async () => {
      try {
        const response = await analyticsService.getStudentPerformance(
          user?.user_id,
          "all"
        );
        // Convert attempts array to a map by quiz_id
        const attemptsMap = {};
        (response.attempts || []).forEach((att) => {
          if (!attemptsMap[att.quiz_id]) {
            attemptsMap[att.quiz_id] = [];
          }
          attemptsMap[att.quiz_id].push(att);
        });
        return attemptsMap;
      } catch (error) {
        console.error("Error fetching attempts:", error);
        return {};
      }
    },
    enabled: !!user?.user_id,
  });

  // Calculate stats
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

    const freeExams = allQuizzes.filter((q) => !q.is_premium).length;
    const groupExams = allQuizzes.filter((q) => q.group_id).length;

    return {
      total: allQuizzes.length,
      active,
      freeExams,
      groupExams,
    };
  }, [allQuizzes]);

  // Handle tab change
  const handleTabChange = (tab) => {
    const newParams = new URLSearchParams(searchParams);
    if (tab === "all") {
      newParams.delete("type");
    } else {
      newParams.set("type", tab);
    }
    setSearchParams(newParams);
  };

  // Filtered quizzes
  const filteredQuizzes = useMemo(() => {
    let filtered = [...allQuizzes];

    // Tab filter
    if (activeTab === "free") {
      filtered = filtered.filter((q) => !q.is_premium);
    } else if (activeTab === "group") {
      filtered = filtered.filter((q) => q.group_id);
    } else if (activeTab === "active") {
      const now = new Date();
      filtered = filtered.filter((q) => {
        if (q.status === "cancelled") return false;
        if (q.scheduling_enabled && q.starts_at && q.ends_at) {
          const start = new Date(q.starts_at);
          const end = new Date(q.ends_at);
          return now >= start && now <= end;
        }
        return q.is_available || q.status === "active";
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.title?.toLowerCase().includes(query) ||
          q.description?.toLowerCase().includes(query)
      );
    }

    // Difficulty filter
    if (difficultyFilter !== "all") {
      filtered = filtered.filter((q) => q.difficulty === difficultyFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter(
          (q) => q.is_available || q.status === "active"
        );
      } else if (statusFilter === "scheduled") {
        filtered = filtered.filter((q) => q.scheduling_enabled);
      }
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((q) => q.quiz_type === typeFilter);
    }

    // Sort
    if (sortBy === "popular") {
      // Sort by most attempts (popularity)
      filtered.sort((a, b) => {
        const aAttempts = attemptsData?.[a.quiz_id || a.id]?.length || 0;
        const bAttempts = attemptsData?.[b.quiz_id || b.id]?.length || 0;
        return bAttempts - aAttempts;
      });
    } else if (sortBy === "newest") {
      filtered.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    } else if (sortBy === "title") {
      filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "difficulty") {
      const diffOrder = { easy: 1, medium: 2, hard: 3 };
      filtered.sort(
        (a, b) =>
          (diffOrder[a.difficulty] || 2) - (diffOrder[b.difficulty] || 2)
      );
    }

    return filtered;
  }, [
    allQuizzes,
    activeTab,
    searchQuery,
    difficultyFilter,
    statusFilter,
    typeFilter,
    sortBy,
    attemptsData,
  ]);

  const activeFiltersCount = [
    difficultyFilter !== "all",
    statusFilter !== "all",
    typeFilter !== "all",
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setDifficultyFilter("all");
    setStatusFilter("all");
    setTypeFilter("all");
    setSearchQuery("");
  };

  const handleViewExam = (quizId) => {
    navigate(`/exams/${quizId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <p className="text-[#FF5100] font-semibold mb-2">
                Exam Catalog
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Browse Exams
              </h1>
              <p className="text-lg text-gray-600 mb-6 max-w-xl">
                Discover practice exams, mock tests, and quizzes to help you
                prepare for your PMP certification and beyond.
              </p>
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
                  {stats.freeExams}
                </div>
                <div className="text-sm text-gray-600">Free Exams</div>
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
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:border-[#6EC1E4] focus:ring-2 focus:ring-[#6EC1E4]/20 focus:outline-none"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="title">Title A-Z</option>
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
              <div className="flex flex-wrap items-center gap-6">
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Status:
                  </span>
                  <div className="flex gap-2">
                    {[
                      { value: "all", label: "All" },
                      { value: "active", label: "Active" },
                      { value: "scheduled", label: "Scheduled" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setStatusFilter(option.value)}
                        className={cn(
                          "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
                          statusFilter === option.value
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
          {isLoading
            ? "Loading..."
            : `${filteredQuizzes.length} exam${
                filteredQuizzes.length !== 1 ? "s" : ""
              } found`}
        </p>
      </section>

      {/* Exams Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[rgba(255,81,0,0.2)] border-t-[#FF5100] rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-medium">
                Loading exams...
              </p>
            </div>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No exams found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {activeFiltersCount > 0 || searchQuery
                ? "Try adjusting your filters or search query"
                : "No exams available at the moment"}
            </p>
            {(activeFiltersCount > 0 || searchQuery) && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF5100] text-white font-semibold rounded-lg hover:bg-[#E64800] transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => {
              const quizId = quiz.quiz_id || quiz.id;
              const attempts = attemptsData?.[quizId] || [];
              const bestScore =
                attempts.length > 0
                  ? Math.max(...attempts.map((a) => a.score || 0))
                  : null;

              return (
                <ExamCard
                  key={quizId}
                  quiz={quiz}
                  bestScore={bestScore}
                  attemptCount={attempts.length}
                  onClick={() => handleViewExam(quizId)}
                  variant="grid"
                />
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuizzes.map((quiz) => {
              const quizId = quiz.quiz_id || quiz.id;
              const attempts = attemptsData?.[quizId] || [];
              const bestScore =
                attempts.length > 0
                  ? Math.max(...attempts.map((a) => a.score || 0))
                  : null;

              return (
                <ExamCard
                  key={quizId}
                  quiz={quiz}
                  bestScore={bestScore}
                  attemptCount={attempts.length}
                  onClick={() => handleViewExam(quizId)}
                  variant="list"
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Featured Section */}
      {stats.active > 0 && (
        <section className="bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-[#FF5100]" />
              <h2 className="text-2xl font-bold text-gray-900">
                Available Right Now
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              These exams are currently active and ready for you to take
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredQuizzes
                .filter((q) => q.is_available || q.status === "active")
                .slice(0, 4)
                .map((quiz) => {
                  const quizId = quiz.quiz_id || quiz.id;
                  return (
                    <div
                      key={quizId}
                      onClick={() => handleViewExam(quizId)}
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

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[#FF5100] rounded-xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-white" />
                <span className="text-sm font-medium text-white/90">
                  Start Your Journey
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">
                Ready to Test Your Knowledge?
              </h2>
              <p className="text-white/90">
                Choose an exam and start practicing today. Track your progress
                and improve your scores.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center px-6 py-3 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {stats.total}
                </div>
                <div className="text-xs text-white/80">Available Exams</div>
              </div>
              <button
                onClick={() => navigate("/my-learning")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#6EC1E4] font-semibold rounded-lg hover:bg-gray-50 transition-colors shrink-0"
              >
                My Learning
                <ArrowRight className="w-5 h-5 text-[#6EC1E4]" />
              </button>
            </div>
          </div>
        </div>
      </section>

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
    </div>
  );
};

export default BrowseExams;



