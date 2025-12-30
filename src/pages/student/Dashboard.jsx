/**
 * Student Dashboard Page
 * Comprehensive dashboard merging best features from modern educational platforms
 * Based on screenshots: Schedule, Courses, and Dashboard views
 */

import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Calendar,
  BookOpen,
  Users,
  ArrowRight,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Bell,
  Filter,
  Download,
  Plus,
  MoreVertical,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRecentGroups, useAvailableQuizzes } from "@/hooks/queries/useStudentDashboard";
import { useMyGroups } from "@/hooks/queries/useGroupQueries";
import { useQuery } from "@tanstack/react-query";
import { getGroups } from "@/services/group.service";
import { getQuizzes, getQuizAttempts } from "@/services/quiz.service";
import { SearchBar } from "@/components/shared/SearchBar";
import { ProgressCard } from "@/components/shared/ProgressCard";
import { QuizCard } from "@/components/shared/QuizCard";
import { GroupCard } from "@/components/shared/GroupCard";
import { ActivityStats } from "@/components/shared/ActivityStats";
import { GrassBackground } from "@/components/shared/GrassBackground";
import { LineChartComponent } from "@/components/charts/LineChartComponent";
import { BarChartComponent } from "@/components/charts/BarChartComponent";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { Spinner } from "@/components/ui";
import { cn } from "@/utils/cn";
import toast from "react-hot-toast";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: recentGroups, isLoading: groupsLoading } = useRecentGroups(4);
  const { data: availableQuizzes, isLoading: quizzesLoading } = useAvailableQuizzes(50);
  const { data: myGroupsData } = useMyGroups();
  const myGroups = myGroupsData || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, in_progress, completed
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const scrollRef = useRef(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch all groups for search (including public groups)
  const { data: allGroupsData, isLoading: groupsSearchLoading } = useQuery({
    queryKey: ["all-groups-search", debouncedSearchQuery],
    queryFn: () => getGroups({ 
      group_type: "public", 
      limit: 100,
      search: debouncedSearchQuery || undefined 
    }),
    enabled: debouncedSearchQuery.trim().length > 0,
    staleTime: 2 * 60 * 1000,
  });

  const allGroups = allGroupsData?.groups || allGroupsData?.items || [];

  // Fetch all quizzes for the user (from all groups)
  const { data: allQuizzesData, isLoading: allQuizzesLoading } = useQuery({
    queryKey: ["all-quizzes-dashboard"],
    queryFn: () => getQuizzes({ limit: 100 }),
    staleTime: 2 * 60 * 1000,
  });

  const allQuizzes = allQuizzesData?.quizzes || allQuizzesData?.items || [];

  // Calculate dashboard statistics
  const dashboardStats = useMemo(() => {
    // Calculate completed attempts (would need to fetch all attempts)
    const completedAttempts = 0; // TODO: Fetch from backend
    
    // Calculate learning hours (sum of all attempt times)
    const learningHours = 0; // TODO: Fetch from backend
    
    // Calculate average score
    const averageScore = 0; // TODO: Fetch from backend
    
    // Calculate progress percentage (quizzes completed / total available)
    const totalQuizzes = allQuizzes.length;
    const completedQuizzes = 0; // TODO: Calculate from attempts
    const progressPercentage = totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0;

    return {
      completedAttempts,
      learningHours,
      averageScore,
      progressPercentage,
      totalQuizzes,
      completedQuizzes,
    };
  }, [allQuizzes]);

  // Filter quizzes by status
  const filteredQuizzesByStatus = useMemo(() => {
    const now = new Date();
    return {
      upcoming: allQuizzes.filter((quiz) => {
        const startTime = quiz.start_time ? new Date(quiz.start_time) : null;
        return startTime && startTime > now;
      }),
      in_progress: allQuizzes.filter((quiz) => {
        const startTime = quiz.start_time ? new Date(quiz.start_time) : null;
        const endTime = quiz.end_time ? new Date(quiz.end_time) : null;
        return startTime && startTime <= now && (!endTime || endTime > now);
      }),
      completed: allQuizzes.filter((quiz) => {
        const endTime = quiz.end_time ? new Date(quiz.end_time) : null;
        return endTime && endTime <= now;
      }),
    };
  }, [allQuizzes]);

  const currentTabQuizzes = filteredQuizzesByStatus[activeTab] || [];

  const handleSearch = (query) => {
    if (query.trim().length > 0) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleSuggestionClick = () => {
    setShowSearchResults(false);
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Filter quizzes based on search query
  const queryForFiltering = searchQuery.trim().length > 0 ? searchQuery : debouncedSearchQuery;
  
  const filteredQuizzes = (availableQuizzes || []).filter((quiz) =>
    queryForFiltering
      ? quiz.title?.toLowerCase().includes(queryForFiltering.toLowerCase())
      : true
  );

  // Combine my groups and public groups, then filter
  const myGroupsList = myGroups || [];
  const myGroupIds = new Set(myGroupsList.map((g) => g.group_id || g.id));
  
  const publicGroups = (allGroups || []).filter((g) => !myGroupIds.has(g.group_id || g.id));
  
  const filteredGroups = queryForFiltering
    ? [
        ...myGroupsList.filter((group) =>
          group.name?.toLowerCase().includes(queryForFiltering.toLowerCase()) ||
          group.description?.toLowerCase().includes(queryForFiltering.toLowerCase())
        ),
        ...publicGroups.filter((group) =>
          group.name?.toLowerCase().includes(queryForFiltering.toLowerCase()) ||
          group.description?.toLowerCase().includes(queryForFiltering.toLowerCase())
        )
      ]
    : [];

  const hasSearchResults = filteredQuizzes.length > 0 || filteredGroups.length > 0;

  // Prepare suggestions for autocomplete
  const queryLower = (searchQuery || "").toLowerCase().trim();
  
  const sortByRelevance = (items, getTitle) => {
    return [...items].sort((a, b) => {
      const titleA = getTitle(a).toLowerCase();
      const titleB = getTitle(b).toLowerCase();
      
      const aStarts = titleA.startsWith(queryLower);
      const bStarts = titleB.startsWith(queryLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      const aIndex = titleA.indexOf(queryLower);
      const bIndex = titleB.indexOf(queryLower);
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      return titleA.length - titleB.length;
    });
  };

  const sortedQuizzes = sortByRelevance(filteredQuizzes, (q) => q.title || "");
  const sortedGroups = sortByRelevance(filteredGroups, (g) => g.name || "");

  const searchSuggestions = searchQuery.trim().length > 0 ? [
    ...sortedQuizzes.slice(0, 4).map((quiz) => ({
      type: "quiz",
      id: quiz.quiz_id || quiz.id,
      title: quiz.title,
      total_questions: quiz.total_questions,
      time_limit_minutes: quiz.time_limit_minutes,
    })),
    ...sortedGroups.slice(0, 4).map((group) => ({
      type: "group",
      id: group.group_id || group.id,
      name: group.name,
      member_count: group.member_count,
      quiz_count: group.quiz_count,
    }))
  ] : [];

  // Format time helper
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Get current date info for calendar
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const currentDay = currentDate.getDate();

  // Mock notifications (TODO: Fetch from backend)
  const notifications = [
    { id: 1, type: "info", title: "Portal Maintenance", message: "Scheduled maintenance on March 15", time: "2 hours ago", icon: "P" },
    { id: 2, type: "success", title: "New Quiz Available", message: "Behavioral Economics quiz is now available", time: "5 hours ago", icon: "Q" },
  ];

  // Mock upcoming quizzes for "ONGOING NOW" and "UP NEXT" sections
  const ongoingQuizzes = filteredQuizzesByStatus.in_progress.slice(0, 2);
  const upcomingQuizzes = filteredQuizzesByStatus.upcoming.slice(0, 3);

  // Mock chart data (will be replaced with real data from backend)
  const learningHoursData = useMemo(() => {
    return [
      { name: "Mon", value: 2.5 },
      { name: "Tue", value: 3.0 },
      { name: "Wed", value: 2.0 },
      { name: "Thu", value: 4.0 },
      { name: "Fri", value: 3.5 },
      { name: "Sat", value: 5.0 },
      { name: "Sun", value: 4.5 },
    ];
  }, []);

  const progressTrendData = useMemo(() => {
    return [
      { name: "Week 1", value: 45 },
      { name: "Week 2", value: 52 },
      { name: "Week 3", value: 58 },
      { name: "Week 4", value: 65 },
      { name: "Week 5", value: 72 },
      { name: "Week 6", value: 78 },
    ];
  }, []);

  const scoreDistributionData = useMemo(() => {
    return [
      { name: "Excellent (90-100%)", value: 25 },
      { name: "Good (70-89%)", value: 45 },
      { name: "Average (50-69%)", value: 20 },
      { name: "Needs Improvement (<50%)", value: 10 },
    ];
  }, []);

  return (
    <div className="space-y-6 relative">
      {/* Grass Background */}
      <GrassBackground />
      
      {/* Search Bar */}
      <div className="mb-6 relative z-10">
        <SearchBar
          placeholder="Search quizzes, groups, and more..."
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value);
          }}
          onSearch={handleSearch}
          onFilterClick={() => {
            if (searchQuery.trim().length > 0) {
              setShowSearchResults(true);
            } else {
              navigate("/exams");
            }
          }}
          suggestions={searchSuggestions}
          onSuggestionClick={handleSuggestionClick}
        />
      </div>

      {/* Search Results */}
      {showSearchResults && debouncedSearchQuery.trim().length > 0 && (
        <div className="space-y-6">
          {(groupsSearchLoading || quizzesLoading) ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4">
                <Spinner size="lg" />
                <p className="text-sm text-gray-500 font-medium">Searching...</p>
          </div>
        </div>
          ) : hasSearchResults ? (
            <>
              {filteredQuizzes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-accent-primary" />
                      Quizzes ({filteredQuizzes.length})
                    </h3>
              <button
                      onClick={() => navigate(`/exams?search=${encodeURIComponent(searchQuery)}`)}
                      className="text-sm text-purple-600 hover:text-violet-600 font-semibold transition-colors duration-200 hover:underline"
                    >
                      View All
              </button>
            </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredQuizzes.slice(0, 6).map((quiz) => (
              <QuizCard
                        key={quiz.quiz_id || quiz.id}
                quiz={quiz}
                category={quiz.group_id ? "GROUP" : "PUBLIC"}
                instructor={quiz.instructor || null}
                progress={quiz.progress || 0}
              />
            ))}
          </div>
        </div>
      )}

              {filteredGroups.length > 0 && (
          <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-accent-primary" />
                      Groups ({filteredGroups.length})
            </h3>
          <button
                      onClick={() => navigate(`/groups?search=${encodeURIComponent(searchQuery)}`)}
                      className="text-sm text-purple-600 hover:text-violet-600 font-semibold transition-colors duration-200 hover:underline"
          >
                      View All
          </button>
        </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredGroups.slice(0, 6).map((group) => {
                      const groupId = group.group_id || group.id;
                      const isJoined = myGroupIds.has(groupId);
                      return (
                        <GroupCard
                          key={groupId}
                          group={group}
                          isJoined={isJoined}
                          onView={(id) => navigate(`/groups/${id}`)}
                          onJoin={(id) => navigate(`/groups/${id}`)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border-2 border-gray-200 shadow-lg">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
                <Search className="w-12 h-12 text-gray-400" />
            </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
              <p className="text-sm text-gray-600 font-medium mb-6">
                Try searching with different keywords
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchResults(false);
                }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Dashboard Content */}
      {!showSearchResults && (
        <>
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {/* Completed Attempts */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{dashboardStats.completedAttempts}</h3>
              <p className="text-sm text-gray-600 font-medium">Completed Attempts</p>
            </div>

            {/* Learning Hours */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-violet-200 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{dashboardStats.learningHours}h</h3>
              <p className="text-sm text-gray-600 font-medium">Learning Hours</p>
            </div>

            {/* Average Score */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-indigo-200 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {dashboardStats.averageScore > 0 ? `${dashboardStats.averageScore}%` : "N/A"}
              </h3>
              <p className="text-sm text-gray-600 font-medium">Average Score</p>
            </div>

            {/* Progress */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-fuchsia-200 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-fuchsia-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{dashboardStats.progressPercentage}%</h3>
              <p className="text-sm text-gray-600 font-medium">Overall Progress</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
            {/* Learning Hours Chart */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-purple-200 shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Learning Hours This Week
              </h3>
              <BarChartComponent
                data={learningHoursData}
                color="#8b5cf6"
                height={200}
                showGrid={true}
              />
            </div>

            {/* Progress Trend Chart */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-violet-200 shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                Progress Trend
              </h3>
              <LineChartComponent
                data={progressTrendData}
                color="#7c3aed"
                height={200}
                showGrid={true}
              />
            </div>

            {/* Score Distribution Chart */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-indigo-200 shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Score Distribution
              </h3>
              <PieChartComponent
                data={scoreDistributionData}
                height={200}
                innerRadius={40}
                outerRadius={80}
                showLegend={false}
              />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
            {/* Left Column - Classes/Quizzes */}
            <div className="lg:col-span-2 space-y-6">
              {/* Ongoing Now & Up Next */}
              {(ongoingQuizzes.length > 0 || upcomingQuizzes.length > 0) && (
                <div className="space-y-4">
                  {/* Ongoing Now */}
                  {ongoingQuizzes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">ONGOING NOW</h3>
                      <div className="space-y-3">
                        {ongoingQuizzes.map((quiz) => (
                          <div
                            key={quiz.quiz_id || quiz.id}
                            className="bg-white/90 backdrop-blur-sm rounded-xl border-2 border-purple-300 p-5 shadow-xl hover:shadow-2xl transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-purple-600 font-bold text-sm">{quiz.title}</span>
                                </div>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <p className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {quiz.start_time && quiz.end_time 
                                      ? `${formatTime(quiz.start_time)} - ${formatTime(quiz.end_time)}`
                                      : "No time limit"}
                                  </p>
                                  {quiz.group_id && (
                                    <p className="flex items-center gap-2">
                                      <Users className="w-4 h-4" />
                                      Group Quiz
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => navigate(`/exams/${quiz.quiz_id || quiz.id}`)}
                                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-sm font-semibold rounded-lg hover:from-purple-600 hover:to-violet-700 transition-all shadow-md hover:shadow-lg"
                                >
                                  JOIN
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Up Next */}
                  {upcomingQuizzes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">UP NEXT</h3>
                      <div className="space-y-3">
                        {upcomingQuizzes.map((quiz) => (
                          <div
                            key={quiz.quiz_id || quiz.id}
                            className="bg-white/90 backdrop-blur-sm rounded-xl border-2 border-violet-300 p-5 shadow-xl hover:shadow-2xl transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-violet-600 font-bold text-sm">{quiz.title}</span>
                                </div>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <p className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {quiz.start_time && quiz.end_time 
                                      ? `${formatTime(quiz.start_time)} - ${formatTime(quiz.end_time)}`
                                      : "No time limit"}
                                  </p>
                                  {quiz.start_time && (
                                    <p className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      Starts: {formatDate(quiz.start_time)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => navigate(`/exams/${quiz.quiz_id || quiz.id}`)}
                                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-violet-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                              >
                                ADD REMINDER
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Happening Later Today */}
              {filteredQuizzesByStatus.upcoming.length > 3 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">HAPPENING LATER TODAY</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredQuizzesByStatus.upcoming.slice(3, 5).map((quiz) => (
                      <div
                        key={quiz.quiz_id || quiz.id}
                        className="bg-white/90 backdrop-blur-sm rounded-xl border-2 border-purple-200 p-4 shadow-xl hover:shadow-2xl transition-all duration-200"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-purple-600 font-bold text-sm">{quiz.title}</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {quiz.start_time && quiz.end_time 
                            ? `${formatTime(quiz.start_time)} - ${formatTime(quiz.end_time)}`
                            : "No time limit"}
                        </p>
                      </div>
                    ))}
                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-4 flex items-center justify-center hover:border-accent-primary transition-colors cursor-pointer">
                      <Plus className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border-2 border-purple-200 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                  <button className="text-sm text-accent-primary hover:underline font-semibold">
                    View notifications
                  </button>
                </div>
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-yellow-600 font-bold text-xs">{notif.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                        <p className="text-xs text-gray-600">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Virtual Class Attendance / Quiz Completion */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border-2 border-violet-200 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Quiz Completion</h3>
                  <button className="text-sm text-accent-primary hover:underline font-semibold">
                    View history
                  </button>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-sm font-bold text-gray-900">{dashboardStats.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-violet-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${dashboardStats.progressPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {allQuizzes.slice(0, 2).map((quiz) => (
                    <div key={quiz.quiz_id || quiz.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <span className="text-sm font-medium text-gray-700">{quiz.title}</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-gray-600">Completed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Calendar & Courses */}
            <div className="space-y-6">
              {/* Calendar */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border-2 border-purple-200 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Calendar</h3>
                  <button className="text-sm text-accent-primary hover:underline font-semibold">
                    View schedule
                  </button>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-800">{currentMonth}</h4>
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                    <div key={`day-header-${index}`} className="text-center text-xs font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i + 1;
                    const isToday = day === currentDay;
                  return (
                      <div
                        key={i}
                        className={cn(
                          "aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors",
                          isToday
                            ? "bg-purple-500 text-white font-bold"
                            : "hover:bg-purple-50 text-gray-700"
                        )}
                      >
                        {day <= 31 ? day : ""}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Courses */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border-2 border-violet-200 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Courses</h3>
                  <button className="text-sm text-accent-primary hover:underline font-semibold">
                    View courses
                  </button>
                </div>
                {myGroups.length > 0 ? (
                  <div className="space-y-3">
                    {myGroups.slice(0, 2).map((group) => (
                      <div
                        key={group.group_id || group.id}
                        className="p-4 rounded-lg border-2 border-gray-200 hover:border-accent-primary transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">{group.name}</h4>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">
                          {group.quiz_count || 0} quizzes available
                        </p>
                        <button
                          onClick={() => navigate(`/groups/${group.group_id || group.id}`)}
                          className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-sm font-semibold rounded-lg hover:from-purple-600 hover:to-violet-700 transition-all shadow-md hover:shadow-lg"
                        >
                          VIEW COURSEWARE
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="text-sm font-semibold text-red-900">No Courses Yet</p>
                    </div>
                    <p className="text-xs text-red-700">
                      You haven't joined any groups yet. Join a group to access quizzes.
                    </p>
                  </div>
          )}
        </div>
      </div>
          </div>

          {/* Recommended Quizzes */}
          {availableQuizzes && availableQuizzes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Recommended for you</h3>
                  <p className="text-sm text-gray-500">Based on your learning progress</p>
                </div>
                <button
                  onClick={() => navigate("/exams")}
                  className="text-sm text-accent-primary hover:text-accent-secondary font-semibold transition-colors duration-200 hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableQuizzes.slice(0, 3).map((quiz) => (
                  <div
                    key={quiz.quiz_id || quiz.id}
                    className="bg-white/90 backdrop-blur-sm rounded-xl border-2 border-purple-200 p-6 shadow-xl hover:shadow-2xl transition-all duration-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {quiz.group_id ? "GROUP" : "PUBLIC"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {quiz.total_questions || 0} questions
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{quiz.title}</h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {quiz.description || "Test your knowledge with this comprehensive quiz"}
                    </p>
                    <button
                      onClick={() => navigate(`/exams/${quiz.quiz_id || quiz.id}`)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-violet-700 transition-all shadow-md hover:shadow-lg"
                    >
                      Learn more
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Loading States */}
      {(quizzesLoading || allQuizzesLoading) && !showSearchResults && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
            <p className="text-sm text-gray-500 font-medium">Loading dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
