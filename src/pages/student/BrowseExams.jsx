/**
 * BrowseExams Page
 * Catalog/marketplace view for all available exams - Modern design matching Home/Groups
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getQuizzes, getQuizAttempts } from "@/services/quiz.service";
import { useAuthStore } from "@/stores/auth.store";
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

  // Fetch all attempts
  const { data: attemptsData } = useQuery({
    queryKey: ["browse-attempts", user?.user_id],
    queryFn: async () => {
      const attemptsPromises = allQuizzes.slice(0, 20).map(async (quiz) => {
        try {
          const response = await getQuizAttempts(quiz.quiz_id || quiz.id);
          return {
            quizId: quiz.quiz_id || quiz.id,
            attempts: response.attempts || [],
          };
        } catch (error) {
          return { quizId: quiz.quiz_id || quiz.id, attempts: [] };
        }
      });
      const results = await Promise.all(attemptsPromises);
      return results.reduce((acc, { quizId, attempts }) => {
        acc[quizId] = attempts;
        return acc;
      }, {});
    },
    enabled: !!user?.user_id && allQuizzes.length > 0,
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
              <p className="text-emerald-600 font-semibold mb-2">
                Exam Catalog
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Browse Exams
              </h1>
              <p className="text-lg text-gray-600 mb-6 max-w-xl">
                Discover practice exams, mock tests, and quizzes to help you
                prepare for your PMP certification and beyond.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => handleTabChange("all")}
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
                <button
                  onClick={() => handleTabChange("active")}
                  className={cn(
                    "inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors",
                    activeTab === "active"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Zap className="w-5 h-5" />
                  Active Now
                  {stats.active > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-white/20 rounded-full">
                      {stats.active}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleTabChange("free")}
                  className={cn(
                    "inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors",
                    activeTab === "free"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Star className="w-5 h-5" />
                  Free
                </button>
                <button
                  onClick={() => handleTabChange("group")}
                  className={cn(
                    "inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors",
                    activeTab === "group"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Users className="w-5 h-5" />
                  Group
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
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="title">Title A-Z</option>
                <option value="difficulty">Difficulty</option>
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
                {/* Difficulty Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Difficulty:
                  </span>
                  <div className="flex gap-2">
                    {[
                      { value: "all", label: "All" },
                      { value: "easy", label: "Easy" },
                      { value: "medium", label: "Medium" },
                      { value: "hard", label: "Hard" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setDifficultyFilter(option.value)}
                        className={cn(
                          "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
                          difficultyFilter === option.value
                            ? option.value === "easy"
                              ? "bg-green-100 text-green-700"
                              : option.value === "medium"
                              ? "bg-orange-100 text-orange-700"
                              : option.value === "hard"
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

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
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Type:
                  </span>
                  <div className="flex gap-2">
                    {[
                      { value: "all", label: "All" },
                      { value: "practice", label: "Practice" },
                      { value: "mock", label: "Mock Exam" },
                      { value: "quick", label: "Quick Quiz" },
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
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
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
                <BrowseExamCard
                  key={quizId}
                  quiz={quiz}
                  bestScore={bestScore}
                  attemptCount={attempts.length}
                  onClick={() => handleViewExam(quizId)}
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
                <BrowseExamListItem
                  key={quizId}
                  quiz={quiz}
                  bestScore={bestScore}
                  attemptCount={attempts.length}
                  onClick={() => handleViewExam(quizId)}
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
              <Zap className="w-6 h-6 text-emerald-600" />
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
                      <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                        <Play className="w-5 h-5 text-emerald-600" />
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
        <div className="bg-emerald-600 rounded-xl p-8 text-white">
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shrink-0"
              >
                My Learning
                <ArrowRight className="w-5 h-5 text-emerald-600" />
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
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-emerald-600" />
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

// Browse Exam Card Component (Grid View)
const BrowseExamCard = ({ quiz, bestScore, attemptCount, onClick }) => {
  const isActive = quiz.is_available || quiz.status === "active";
  const isPremium = quiz.is_premium;
  const difficulty = quiz.difficulty || "medium";

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case "easy":
        return "bg-green-100 text-green-700";
      case "hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer group flex flex-col"
    >
      {/* Header */}
      <div className="h-32 bg-linear-to-br from-emerald-500 to-teal-600 relative">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />

        {/* Badges Row */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-2 py-1 text-xs font-medium rounded-md capitalize",
                getDifficultyColor(difficulty)
              )}
            >
              {difficulty}
            </span>
            {isPremium && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-md flex items-center gap-1">
                <Star className="w-3 h-3" />
                Premium
              </span>
            )}
          </div>
          {isActive && (
            <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium text-emerald-600">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Active
            </div>
          )}
        </div>

        {/* Quiz Type */}
        {quiz.quiz_type && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 bg-white/80 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-md capitalize">
              {quiz.quiz_type.replace("_", " ")}
            </span>
          </div>
        )}

        {/* Best Score */}
        {bestScore !== null && (
          <div className="absolute bottom-3 right-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-semibold text-gray-700">
              <Trophy className="w-3 h-3 text-orange-500" />
              {bestScore}%
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
          {quiz.title}
        </h3>

        {quiz.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {quiz.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-sm">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">
              {quiz.total_questions || 0}
            </span>
            <span className="text-gray-500">Questions</span>
          </div>

          {quiz.time_limit_minutes && (
            <div className="flex items-center gap-1.5 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-900">
                {quiz.time_limit_minutes}
              </span>
              <span className="text-gray-500">min</span>
            </div>
          )}

          {attemptCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-900">{attemptCount}</span>
              <span className="text-gray-500">Attempts</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="w-full py-2.5 bg-emerald-600 text-white font-medium text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 mt-auto"
        >
          {attemptCount > 0 ? "Continue Exam" : "Start Exam"}
          <Play className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Browse Exam List Item Component (List View)
const BrowseExamListItem = ({ quiz, bestScore, attemptCount, onClick }) => {
  const isActive = quiz.is_available || quiz.status === "active";
  const isPremium = quiz.is_premium;
  const difficulty = quiz.difficulty || "medium";

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case "easy":
        return "bg-green-100 text-green-700";
      case "hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-6 p-5 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
    >
      {/* Avatar */}
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0">
        <BookOpen className="w-7 h-7" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {quiz.title}
          </h3>
          <span
            className={cn(
              "px-2 py-0.5 text-xs font-medium rounded-full capitalize",
              getDifficultyColor(difficulty)
            )}
          >
            {difficulty}
          </span>
          {isPremium && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
              <Star className="w-3 h-3" />
              Premium
            </span>
          )}
          {isActive && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Active
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 line-clamp-1 mb-2">
          {quiz.description}
        </p>

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
          {attemptCount > 0 && (
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {attemptCount} attempts
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
        className="px-6 py-2.5 bg-emerald-600 text-white font-medium text-sm rounded-lg hover:bg-emerald-700 transition-colors shrink-0 flex items-center gap-2"
      >
        {attemptCount > 0 ? "Continue" : "Start"}
        <Play className="w-4 h-4" />
      </button>
    </div>
  );
};

export default BrowseExams;
