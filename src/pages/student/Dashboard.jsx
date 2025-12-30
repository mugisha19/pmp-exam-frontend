/**
 * Student Dashboard Page
 * Modern course platform design
 */

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { useRecentGroups, useAvailableQuizzes } from "@/hooks/queries/useStudentDashboard";
import { useMyGroups } from "@/hooks/queries/useGroupQueries";
import { useQuery } from "@tanstack/react-query";
import { getGroups } from "@/services/group.service";
import { SearchBar } from "@/components/shared/SearchBar";
import { ProgressCard } from "@/components/shared/ProgressCard";
import { QuizCard } from "@/components/shared/QuizCard";
import { GroupCard } from "@/components/shared/GroupCard";
import { ActivityStats } from "@/components/shared/ActivityStats";
import { Spinner } from "@/components/ui";
import { cn } from "@/utils/cn";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: recentGroups, isLoading: groupsLoading } = useRecentGroups(4);
  const { data: availableQuizzes, isLoading: quizzesLoading } = useAvailableQuizzes(10);
  const { data: myGroups } = useMyGroups();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
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

  const allGroups = allGroupsData?.groups || [];

  // Progress data - to be fetched from API
  const progressData = [];

  const handleSearch = (query) => {
    // Only show search results when user explicitly submits (Enter key or filter button)
    // Not when just typing - that's handled by onChange
    if (query.trim().length > 0) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleSuggestionClick = () => {
    // When user clicks a suggestion, it navigates directly
    // Don't show search results - just navigate
    // The navigation happens in SearchBar component
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

  // Filter quizzes based on search query (use immediate query for suggestions, debounced for results)
  const queryForFiltering = searchQuery.trim().length > 0 ? searchQuery : debouncedSearchQuery;
  
  const filteredQuizzes = availableQuizzes?.filter((quiz) =>
    queryForFiltering
      ? quiz.title?.toLowerCase().includes(queryForFiltering.toLowerCase())
      : true
  ) || [];

  // Combine my groups and public groups, then filter
  const myGroupsList = myGroups || [];
  const myGroupIds = new Set(myGroupsList.map((g) => g.group_id || g.id));
  
  // Filter public groups to exclude ones user is already in
  const publicGroups = allGroups.filter((g) => !myGroupIds.has(g.group_id || g.id));
  
  // Combine and filter based on search
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

  // Only show search results section when explicitly triggered (not just while typing)
  const hasSearchResults = filteredQuizzes.length > 0 || filteredGroups.length > 0;

  // Prepare suggestions for autocomplete (top 4 quizzes + top 4 groups)
  // Sort by relevance: exact matches first, then partial matches
  const queryLower = (searchQuery || "").toLowerCase().trim();
  
  const sortByRelevance = (items, getTitle) => {
    return [...items].sort((a, b) => {
      const titleA = getTitle(a).toLowerCase();
      const titleB = getTitle(b).toLowerCase();
      
      // Exact match at start gets highest priority
      const aStarts = titleA.startsWith(queryLower);
      const bStarts = titleB.startsWith(queryLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      // Then exact match anywhere
      const aExact = titleA === queryLower;
      const bExact = titleB === queryLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then by position of match
      const aIndex = titleA.indexOf(queryLower);
      const bIndex = titleB.indexOf(queryLower);
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // Finally by length (shorter names first)
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

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar
          placeholder="Search quizzes, groups, and more..."
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value);
            // Don't show search results while typing, only show suggestions dropdown
            // Keep dashboard content visible
          }}
          onSearch={handleSearch}
          onFilterClick={() => {
            // When filter clicked, show search results
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

      {/* Search Results - Only show when user explicitly searches or clicks suggestion */}
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
              {/* Quizzes Results */}
              {filteredQuizzes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-accent-primary" />
                      Quizzes ({filteredQuizzes.length})
                    </h3>
                    <button
                      onClick={() => navigate(`/exams?search=${encodeURIComponent(searchQuery)}`)}
                      className="text-sm text-accent-primary hover:text-accent-secondary font-semibold transition-colors duration-200 hover:underline"
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

              {/* Groups Results */}
              {filteredGroups.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-accent-primary" />
                      Groups ({filteredGroups.length})
                    </h3>
                    <button
                      onClick={() => navigate(`/groups?search=${encodeURIComponent(searchQuery)}`)}
                      className="text-sm text-accent-primary hover:text-accent-secondary font-semibold transition-colors duration-200 hover:underline"
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
                className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-bold rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      )}

      {/* Activity Statistics - Hide when searching */}
      {!showSearchResults && <ActivityStats />}

      {/* Promotional Banner - Hide when searching */}
      {!showSearchResults && (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-primary via-accent-primary to-accent-secondary p-10 text-white shadow-2xl shadow-accent-primary/25 transition-all duration-300 hover:shadow-accent-primary/30">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-3 tracking-tight">
            Sharpen Your Skills With Professional Online Courses
          </h2>
          <p className="text-white/95 mb-6 text-lg leading-relaxed max-w-2xl">
            Master PMP concepts and ace your certification exam with our comprehensive course materials
          </p>
          <button
            onClick={() => navigate("/exams")}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-accent-primary font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Play className="w-5 h-5" />
            Join Now
          </button>
        </div>
        {/* Enhanced decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-2xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-xl" />
      </div>
      )}

      {/* Course Progress Cards */}
      {progressData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {progressData.map((course, index) => (
              <ProgressCard
                key={index}
                title={course.title}
                completed={course.completed}
                total={course.total}
                onClick={() => navigate("/exams")}
              />
            ))}
          </div>
        </div>
      )}

      {/* Continue Watching Section - Hide when searching */}
      {!showSearchResults && !quizzesLoading && availableQuizzes && availableQuizzes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Continue Practice</h3>
              <p className="text-sm text-gray-500">Pick up where you left off</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={scrollLeft}
                className="p-2.5 rounded-xl border-2 border-gray-200 hover:border-accent-primary hover:bg-accent-primary/5 transition-all duration-200 hover:shadow-md"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 hover:text-accent-primary transition-colors" />
              </button>
              <button
                onClick={scrollRight}
                className="p-2.5 rounded-xl border-2 border-gray-200 hover:border-accent-primary hover:bg-accent-primary/5 transition-all duration-200 hover:shadow-md"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 hover:text-accent-primary transition-colors" />
              </button>
            </div>
          </div>
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-6 -mx-4 px-4 scroll-smooth"
          >
            {availableQuizzes.slice(0, 6).map((quiz, index) => (
              <QuizCard
                key={quiz.quiz_id || quiz.id || index}
                quiz={quiz}
                category={quiz.group_id ? "GROUP" : "PUBLIC"}
                instructor={quiz.instructor || null}
                progress={quiz.progress || 0}
              />
            ))}
          </div>
        </div>
      )}


      {/* Loading States */}
      {quizzesLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500 font-medium">Loading quizzes...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
