/**
 * My Exams Page
 * Modern exams page with statistics, attempt history, and enhanced features
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getQuizzes } from "@/services/quiz.service";
import { useQuizAttemptsBatch } from "@/hooks/queries/useQuizAttemptsBatch";
import { Spinner } from "@/components/ui";
import { SearchBar } from "@/components/shared/SearchBar";
import { QuizCardEnhanced } from "@/components/shared/QuizCardEnhanced";
import { DashboardStatsCard, StatsGrid } from "@/components/shared/StatsCards";
import { SortDropdown } from "@/components/shared/SortDropdown";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { FilterBar, FilterGroup } from "@/components/shared/FilterBar";
import {
  BookOpen,
  Clock,
  Trophy,
  Play,
  CheckCircle,
  Calendar,
  TrendingUp,
} from "lucide-react";

export const MyExams = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, scheduled, completed, cancelled
  const [typeFilter, setTypeFilter] = useState("all"); // all, public, group
  const [dateFilter, setDateFilter] = useState("all"); // all, upcoming, past
  const [sortBy, setSortBy] = useState("date"); // date, title, attempts, score
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  // Fetch available quizzes
  const { data: quizzesData, isLoading: loadingQuizzes } = useQuery({
    queryKey: ["student-quizzes"],
    queryFn: () => getQuizzes(),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const allQuizzes = quizzesData?.quizzes || quizzesData?.items || [];

  // Fetch attempts for quizzes (limited to first 20 to avoid too many requests)
  const quizIds = allQuizzes.slice(0, 20).map((q) => q.quiz_id || q.id).filter(Boolean);
  const { attemptsMap } = useQuizAttemptsBatch(quizIds, { enabled: quizIds.length > 0 });

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

    const scheduled = allQuizzes.filter((q) => {
      if (q.scheduling_enabled && q.starts_at) {
        const start = new Date(q.starts_at);
        return now < start;
      }
      return false;
    }).length;

    const completed = allQuizzes.filter((q) => q.status === "completed").length;

    return {
      total: allQuizzes.length,
      active,
      scheduled,
      completed,
    };
  }, [allQuizzes]);

  // Filter and sort quizzes
  const filteredAndSortedQuizzes = useMemo(() => {
    const now = new Date();

    let filtered = allQuizzes.filter((quiz) => {
      // Search filter
      if (searchQuery && !quiz.title?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Type filter
      if (typeFilter !== "all") {
        const isPublicQuiz = quiz.is_public && !quiz.group_id;
        const isGroupQuiz = quiz.group_id;
        if (typeFilter === "public" && !isPublicQuiz) return false;
        if (typeFilter === "group" && !isGroupQuiz) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "cancelled" && quiz.status !== "cancelled") return false;
        if (statusFilter === "completed" && quiz.status !== "completed") return false;
        
        if (statusFilter === "active") {
          if (quiz.status === "cancelled" || quiz.status === "completed") return false;
          if (quiz.scheduling_enabled && quiz.starts_at && quiz.ends_at) {
            const start = new Date(quiz.starts_at);
            const end = new Date(quiz.ends_at);
            if (!(now >= start && now <= end)) return false;
          } else if (!quiz.is_available && quiz.status !== "active") {
            return false;
          }
        }

        if (statusFilter === "scheduled") {
          if (!quiz.scheduling_enabled || !quiz.starts_at) return false;
          const start = new Date(quiz.starts_at);
          if (now >= start) return false;
        }
      }

      // Date filter
      if (dateFilter !== "all") {
        if (quiz.scheduling_enabled && quiz.starts_at) {
          const start = new Date(quiz.starts_at);
          if (dateFilter === "upcoming" && now >= start) return false;
          if (dateFilter === "past" && now < start) return false;
        } else {
          // For quizzes without scheduling, use created_at or status
          if (dateFilter === "upcoming") return false;
          if (dateFilter === "past" && quiz.status !== "completed") return false;
        }
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "attempts":
          // Would need attempt data - placeholder
          return 0;
        case "score":
          // Would need attempt data - placeholder
          return 0;
        case "date":
        default:
          const dateA = new Date(a.starts_at || a.created_at || 0);
          const dateB = new Date(b.starts_at || b.created_at || 0);
          return dateB - dateA;
      }
    });

    return filtered;
  }, [allQuizzes, searchQuery, statusFilter, typeFilter, dateFilter, sortBy]);

  const activeFiltersCount = [
    statusFilter !== "all",
    typeFilter !== "all",
    dateFilter !== "all",
    searchQuery !== "",
  ].filter(Boolean).length;

  const sortOptions = [
    { value: "date", label: "Date" },
    { value: "title", label: "Title" },
  ];

  const handleClearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setDateFilter("all");
    setSearchQuery("");
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/exams/${quizId}`);
  };

  const handleViewQuiz = (quizId) => {
    navigate(`/exams/${quizId}`);
  };

  const handleViewAttempts = (quizId) => {
    navigate(`/exams/${quizId}?tab=attempts`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b-2 border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">My Exams</h1>
        <p className="text-gray-600 font-medium text-sm">
          View and take all available quizzes from your groups and public quizzes
        </p>
      </div>

      {/* Statistics */}
      <StatsGrid>
        <DashboardStatsCard
          title="Total Quizzes"
          value={stats.total}
          icon={BookOpen}
        />
        <DashboardStatsCard
          title="Active Now"
          value={stats.active}
          icon={Play}
          subtitle="Available to take"
        />
        <DashboardStatsCard
          title="Scheduled"
          value={stats.scheduled}
          icon={Calendar}
          subtitle="Upcoming quizzes"
        />
        <DashboardStatsCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          subtitle="Finished quizzes"
        />
      </StatsGrid>

      {/* Search and Filters */}
      <div className="space-y-4">
        <SearchBar
          placeholder="Search quizzes..."
          onSearch={setSearchQuery}
          className="w-full"
        />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <FilterBar
            activeFiltersCount={activeFiltersCount}
            onClearAll={handleClearFilters}
            className="flex-1 min-w-0"
          >
            <FilterGroup label="Status">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200 hover:border-teal-300 shadow-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </FilterGroup>

            <FilterGroup label="Type">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200 hover:border-teal-300 shadow-sm"
              >
                <option value="all">All Types</option>
                <option value="public">Public</option>
                <option value="group">Group</option>
              </select>
            </FilterGroup>

            <FilterGroup label="Date">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200 hover:border-teal-300 shadow-sm"
              >
                <option value="all">All Time</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </FilterGroup>
          </FilterBar>

          <div className="flex items-center gap-3 flex-shrink-0">
            <SortDropdown
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
            />
            <ViewToggle view={viewMode} onChange={setViewMode} />
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      {loadingQuizzes ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500 font-medium">Loading quizzes...</p>
          </div>
        </div>
      ) : filteredAndSortedQuizzes.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border-2 border-gray-200 shadow-lg">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No quizzes found
          </h3>
          <p className="text-sm text-gray-600 font-medium">
            {activeFiltersCount > 0
              ? "Try adjusting your filters"
              : "No quizzes are available at the moment"}
          </p>
        </div>
      ) : (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-100">
            <p className="text-sm font-semibold text-gray-700">
              Showing <span className="text-teal-600 font-semibold">{filteredAndSortedQuizzes.length}</span> of <span className="font-semibold">{allQuizzes.length}</span> quiz
              {allQuizzes.length !== 1 ? "zes" : ""}
            </p>
            <p className="text-sm font-semibold text-gray-700">
              <span className="text-green-600 font-bold">
                {filteredAndSortedQuizzes.filter((q) => {
                  const now = new Date();
                  if (q.scheduling_enabled && q.starts_at && q.ends_at) {
                    const start = new Date(q.starts_at);
                    const end = new Date(q.ends_at);
                    return now >= start && now <= end && q.status !== "cancelled" && q.status !== "completed";
                  }
                  return q.is_available && q.status !== "cancelled" && q.status !== "completed";
                }).length}
              </span> available to take now
            </p>
          </div>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedQuizzes.map((quiz) => {
                const quizId = quiz.quiz_id || quiz.id;
                const attemptInfo = attemptsMap[quizId] || null;
                return (
                  <QuizCardEnhanced
                    key={quizId}
                    quiz={quiz}
                    attemptInfo={attemptInfo}
                    onStart={handleStartQuiz}
                    onView={handleViewQuiz}
                    onViewAttempts={handleViewAttempts}
                    view="grid"
                  />
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedQuizzes.map((quiz) => {
                const quizId = quiz.quiz_id || quiz.id;
                const attemptInfo = attemptsMap[quizId] || null;
                return (
                  <QuizCardEnhanced
                    key={quizId}
                    quiz={quiz}
                    attemptInfo={attemptInfo}
                    onStart={handleStartQuiz}
                    onView={handleViewQuiz}
                    onViewAttempts={handleViewAttempts}
                    view="list"
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyExams;
