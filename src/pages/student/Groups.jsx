/**
 * Groups Page
 * Modern groups page with statistics, filtering, and enhanced cards
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getGroups, getMyGroups, createJoinRequest } from "@/services/group.service";
import { Spinner } from "@/components/ui";
import { SearchBar } from "@/components/shared/SearchBar";
import { GroupCard } from "@/components/shared/GroupCard";
import { DashboardStatsCard, StatsGrid } from "@/components/shared/StatsCards";
import { SortDropdown } from "@/components/shared/SortDropdown";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { FilterBar, FilterGroup } from "@/components/shared/FilterBar";
import { Users, BookOpen, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";

export const Groups = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial tab from URL parameter, default to "all"
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "mygroups" ? "my-groups" : "all";
  
  const [activeTab, setActiveTab] = useState(initialTab); // "all" or "my-groups"
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all, class, study_group, cohort
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive
  const [sortBy, setSortBy] = useState("name"); // name, members, quizzes, date
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  // Update URL when tab changes via user interaction
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams);
    if (tab === "my-groups") {
      newParams.set("tab", "mygroups");
    } else {
      newParams.delete("tab");
    }
    setSearchParams(newParams, { replace: true });
  };

  // Sync tab state with URL parameter when URL changes externally (browser back/forward)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const expectedTab = tabParam === "mygroups" ? "my-groups" : "all";
    // Only update if different to avoid unnecessary re-renders
    if (activeTab !== expectedTab) {
      setActiveTab(expectedTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Fetch user's joined groups
  const { data: myGroups, isLoading: loadingMy } = useQuery({
    queryKey: ["my-groups"],
    queryFn: getMyGroups,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch available public groups (not joined)
  const { data: publicGroupsData, isLoading: loadingAvailable } = useQuery({
    queryKey: ["public-groups", searchQuery],
    queryFn: () => {
      const params = { group_type: "public", limit: 100 };
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      return getGroups(params);
    },
    staleTime: 2 * 60 * 1000,
  });

  // Filter out groups user is already a member of
  const availableGroups = useMemo(() => {
    if (!publicGroupsData?.groups || !myGroups) return publicGroupsData?.groups || [];
    const myGroupIds = new Set(myGroups.map((g) => g.group_id));
    return publicGroupsData.groups.filter((g) => !myGroupIds.has(g.group_id));
  }, [publicGroupsData, myGroups]);

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: (groupId) => createJoinRequest({ group_id: groupId }),
    onSuccess: () => {
      toast.success("Successfully joined the group!");
      queryClient.invalidateQueries(["my-groups"]);
      queryClient.invalidateQueries(["available-groups"]);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to join group");
    },
  });

  const handleJoinGroup = (groupId) => {
    joinGroupMutation.mutate(groupId);
  };

  const handleViewGroup = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const groups = myGroups || [];
    const activeGroups = groups.filter((g) => g.status === "active").length;
    const totalQuizzes = groups.reduce((sum, g) => sum + (g.quiz_count || 0), 0);
    return {
      totalGroups: groups.length,
      activeGroups,
      totalQuizzes,
    };
  }, [myGroups]);

  // Filter and sort groups
  const filteredAndSortedGroups = useMemo(() => {
    const groups = activeTab === "all" ? (availableGroups || []) : (myGroups || []);
    const myGroupIds = new Set((myGroups || []).map((g) => g.group_id || g.id));

    let filtered = groups.filter((group) => {
      // Type filter
      if (typeFilter !== "all" && group.group_type !== typeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && group.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery && !group.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "members":
          return (b.member_count || 0) - (a.member_count || 0);
        case "quizzes":
          return (b.quiz_count || 0) - (a.quiz_count || 0);
        case "date":
          const dateA = new Date(a.created_at || a.joined_at || 0);
          const dateB = new Date(b.created_at || b.joined_at || 0);
          return dateB - dateA;
        case "name":
        default:
          return (a.name || "").localeCompare(b.name || "");
      }
    });

    return filtered.map((group) => ({
      ...group,
      isJoined: myGroupIds.has(group.group_id || group.id),
    }));
  }, [activeTab, availableGroups, myGroups, typeFilter, statusFilter, searchQuery, sortBy]);

  const isLoading = activeTab === "all" ? loadingAvailable : loadingMy;
  const activeFiltersCount = [
    typeFilter !== "all",
    statusFilter !== "all",
    searchQuery !== "",
  ].filter(Boolean).length;

  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "members", label: "Members" },
    { value: "quizzes", label: "Quizzes" },
    { value: "date", label: "Date" },
  ];

  const handleClearFilters = () => {
    setTypeFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Study Groups</h1>
        <p className="text-gray-600">
          Join groups to access quizzes and study materials
        </p>
      </div>

      {/* Statistics - Only show for My Groups */}
      {activeTab === "my-groups" && (
        <StatsGrid>
          <DashboardStatsCard
            title="Total Groups"
            value={stats.totalGroups}
            icon={Users}
          />
          <DashboardStatsCard
            title="Active Groups"
            value={stats.activeGroups}
            icon={TrendingUp}
          />
          <DashboardStatsCard
            title="Total Quizzes"
            value={stats.totalQuizzes}
            icon={BookOpen}
          />
        </StatsGrid>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => handleTabChange("all")}
          className={`px-4 md:px-6 py-3 font-semibold text-sm border-b-2 -mb-0.5 transition-colors whitespace-nowrap ${
            activeTab === "all"
              ? "border-accent-primary text-accent-primary"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Browse All Groups
        </button>
        <button
          onClick={() => handleTabChange("my-groups")}
          className={`px-4 md:px-6 py-3 font-semibold text-sm border-b-2 -mb-0.5 transition-colors whitespace-nowrap ${
            activeTab === "my-groups"
              ? "border-accent-primary text-accent-primary"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          My Groups ({myGroups?.length || 0})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <SearchBar
          placeholder="Search groups by name..."
          onSearch={setSearchQuery}
          className="w-full"
        />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <FilterBar
              activeFiltersCount={activeFiltersCount}
              onClearAll={handleClearFilters}
              className="flex-1 min-w-0"
            >
            <FilterGroup label="Type">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              >
                <option value="all">All Types</option>
                <option value="class">Class</option>
                <option value="study_group">Study Group</option>
                <option value="cohort">Cohort</option>
              </select>
            </FilterGroup>

            {activeTab === "my-groups" && (
              <FilterGroup label="Status">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </FilterGroup>
            )}
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

      {/* Groups List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filteredAndSortedGroups.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeTab === "all" ? "No groups found" : "No groups yet"}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {activeTab === "all"
              ? activeFiltersCount > 0
                ? "Try adjusting your filters"
                : "No public groups available at the moment"
              : "Browse and join groups to get started"}
          </p>
          {activeTab === "my-groups" && (
            <button
              onClick={() => handleTabChange("all")}
              className="px-6 py-2 bg-accent-primary text-white font-semibold rounded-lg hover:bg-accent-secondary transition-colors"
            >
              Browse Groups
            </button>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredAndSortedGroups.length} group{filteredAndSortedGroups.length !== 1 ? "s" : ""}
            </p>
          </div>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedGroups.map((group) => (
                <GroupCard
                  key={group.group_id || group.id}
                  group={group}
                  isJoined={group.isJoined}
                  onJoin={handleJoinGroup}
                  onView={handleViewGroup}
                  isLoading={joinGroupMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedGroups.map((group) => (
                <GroupCard
                  key={group.group_id || group.id}
                  group={group}
                  isJoined={group.isJoined}
                  onJoin={handleJoinGroup}
                  onView={handleViewGroup}
                  isLoading={joinGroupMutation.isPending}
                  className="max-w-full"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Groups;
