/**
 * Groups Page - Website Style
 * Modern groups page matching Home page design
 */

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getGroups,
  getMyGroups,
  joinPublicGroup,
} from "@/services/group.service";
import { Spinner } from "@/components/ui";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  Users,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Bell,
  Search,
  Grid3x3,
  List,
  Globe,
  Lock,
  ChevronRight,
  Filter,
  X,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/utils/cn";

export const Groups = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial tab from URL parameter, default to "all"
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "mygroups" ? "my-groups" : "all";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [showJoinRequestModal, setShowJoinRequestModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Update URL when tab changes
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

  // Sync tab state with URL parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const expectedTab = tabParam === "mygroups" ? "my-groups" : "all";
    if (activeTab !== expectedTab) {
      setActiveTab(expectedTab);
    }
  }, [searchParams, activeTab]);

  // Check for joinRequest success parameter
  useEffect(() => {
    const joinRequestParam = searchParams.get("joinRequest");
    if (joinRequestParam === "success") {
      setShowJoinRequestModal(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("joinRequest");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams, setShowJoinRequestModal]);

  const handleCloseJoinRequestModal = () => {
    setShowJoinRequestModal(false);
  };

  // Fetch user's joined groups
  const { data: myGroups, isLoading: loadingMy } = useQuery({
    queryKey: ["my-groups"],
    queryFn: getMyGroups,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch available public groups
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
    if (!publicGroupsData?.groups || !myGroups)
      return publicGroupsData?.groups || [];
    const myGroupIds = new Set(myGroups.map((g) => g.group_id));
    return publicGroupsData.groups.filter((g) => !myGroupIds.has(g.group_id));
  }, [publicGroupsData, myGroups]);

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId) => {
      return joinPublicGroup(groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["my-groups"]);
      queryClient.invalidateQueries(["public-groups"]);
      toast.success("Successfully joined the group!");
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
    const totalQuizzes = groups.reduce(
      (sum, g) => sum + (g.quiz_count || 0),
      0
    );
    return {
      totalGroups: groups.length,
      activeGroups,
      totalQuizzes,
    };
  }, [myGroups]);

  // Filter and sort groups
  const filteredAndSortedGroups = useMemo(() => {
    const groups = activeTab === "all" ? availableGroups || [] : myGroups || [];
    const myGroupIds = new Set((myGroups || []).map((g) => g.group_id || g.id));

    let filtered = groups.filter((group) => {
      if (typeFilter !== "all" && group.group_type !== typeFilter) {
        return false;
      }
      if (statusFilter !== "all" && group.status !== statusFilter) {
        return false;
      }
      if (
        searchQuery &&
        !group.name?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "members":
          return (b.member_count || 0) - (a.member_count || 0);
        case "quizzes":
          return (b.quiz_count || 0) - (a.quiz_count || 0);
        case "date": {
          const dateA = new Date(a.created_at || a.joined_at || 0);
          const dateB = new Date(b.created_at || b.joined_at || 0);
          return dateB - dateA;
        }
        case "name":
        default:
          return (a.name || "").localeCompare(b.name || "");
      }
    });

    return filtered.map((group) => ({
      ...group,
      isJoined: myGroupIds.has(group.group_id || group.id),
    }));
  }, [
    activeTab,
    availableGroups,
    myGroups,
    typeFilter,
    statusFilter,
    searchQuery,
    sortBy,
  ]);

  const isLoading = activeTab === "all" ? loadingAvailable : loadingMy;
  const activeFiltersCount = [
    typeFilter !== "all",
    statusFilter !== "all",
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setTypeFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <p className="text-emerald-600 font-semibold mb-2">
                Collaborative Learning
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Study Groups
              </h1>
              <p className="text-lg text-gray-600 mb-6 max-w-xl">
                Connect with fellow learners, share resources, and achieve your
                certification goals together in collaborative study groups.
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
                  <Globe className="w-5 h-5" />
                  Browse All Groups
                </button>
                <button
                  onClick={() => handleTabChange("my-groups")}
                  className={cn(
                    "inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors",
                    activeTab === "my-groups"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Users className="w-5 h-5" />
                  My Groups
                  {myGroups?.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-white/20 rounded-full">
                      {myGroups.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            {activeTab === "my-groups" && (
              <div className="flex flex-wrap gap-8 lg:gap-12">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">
                    {stats.totalGroups}
                  </div>
                  <div className="text-sm text-gray-600">Total Groups</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600">
                    {stats.activeGroups}
                  </div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500">
                    {stats.totalQuizzes}
                  </div>
                  <div className="text-sm text-gray-600">Total Quizzes</div>
                </div>
              </div>
            )}
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
                placeholder="Search groups..."
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

            {/* Filters and View Toggle */}
            <div className="flex items-center gap-3">
              {/* Filter Button */}
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

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              >
                <option value="name">Sort by Name</option>
                <option value="members">Sort by Members</option>
                <option value="quizzes">Sort by Quizzes</option>
                <option value="date">Sort by Date</option>
              </select>

              {/* View Toggle */}
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
                      { value: "class", label: "Class" },
                      { value: "study_group", label: "Study Group" },
                      { value: "cohort", label: "Cohort" },
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

                {activeTab === "my-groups" && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Status:
                    </span>
                    <div className="flex gap-2">
                      {[
                        { value: "all", label: "All" },
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
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
                )}

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
            : `${filteredAndSortedGroups.length} group${
                filteredAndSortedGroups.length !== 1 ? "s" : ""
              } found`}
        </p>
      </section>

      {/* Groups Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-medium">
                Loading groups...
              </p>
            </div>
          </div>
        ) : filteredAndSortedGroups.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === "all" ? "No groups found" : "No groups yet"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {activeTab === "all"
                ? activeFiltersCount > 0
                  ? "Try adjusting your filters to find more groups"
                  : "No public groups available at the moment"
                : "Browse and join groups to get started with collaborative learning"}
            </p>
            {activeTab === "my-groups" && (
              <button
                onClick={() => handleTabChange("all")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Browse Groups
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedGroups.map((group) => (
              <GroupCardModern
                key={group.group_id || group.id}
                group={group}
                onJoin={() => handleJoinGroup(group.group_id || group.id)}
                onView={() => handleViewGroup(group.group_id || group.id)}
                isLoading={joinGroupMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedGroups.map((group) => (
              <GroupListItem
                key={group.group_id || group.id}
                group={group}
                onJoin={() => handleJoinGroup(group.group_id || group.id)}
                onView={() => handleViewGroup(group.group_id || group.id)}
                isLoading={joinGroupMutation.isPending}
              />
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      {activeTab === "all" && availableGroups.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-emerald-600 rounded-xl p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2 text-white">
                  Ready to Learn Together?
                </h2>
                <p className="text-white/90">
                  Join a study group today and accelerate your learning journey
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center px-6 py-2 bg-white/10 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {availableGroups.length}
                  </div>
                  <div className="text-xs text-white/80">Available Groups</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Join Request Success Modal */}
      <Modal
        isOpen={showJoinRequestModal}
        onClose={handleCloseJoinRequestModal}
        title="Join Request Submitted"
        size="md"
        closeOnOverlay={true}
      >
        <ModalBody>
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Join Request Sent Successfully
              </h3>
              <p className="text-sm text-gray-600">
                You have successfully sent a join request. Please wait for
                approval from the group administrator.
              </p>
              <div className="flex items-start gap-2 mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <Bell className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-900 text-left">
                  You will be notified once your request is approved or
                  rejected.
                </p>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleCloseJoinRequestModal} className="w-full">
            Got it
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

// Modern Group Card Component (Grid View)
const GroupCardModern = ({ group, onJoin, onView, isLoading }) => {
  const isPublic = group.group_type === "public";
  const memberCount = group.member_count || 0;
  const quizCount = group.quiz_count || 0;

  return (
    <div
      onClick={onView}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer group"
    >
      {/* Header */}
      <div className="h-24 bg-gradient-to-br from-emerald-500 to-teal-600 relative">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-md">
            {group.group_type === "class"
              ? "Class"
              : group.group_type === "study_group"
              ? "Study Group"
              : "Cohort"}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          {isPublic ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium text-gray-600">
              <Globe className="w-3 h-3" />
              Public
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium text-gray-600">
              <Lock className="w-3 h-3" />
              Private
            </div>
          )}
        </div>

        {group.isJoined && (
          <div className="absolute bottom-3 right-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white rounded-md text-xs font-medium">
              <CheckCircle className="w-3 h-3" />
              Joined
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
          {group.name}
        </h3>

        {group.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {group.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{memberCount}</div>
              <div className="text-xs text-gray-500">Members</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{quizCount}</div>
              <div className="text-xs text-gray-500">Quizzes</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4">
          {group.isJoined ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="w-full py-2.5 text-emerald-600 font-medium text-sm rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            >
              View Group
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onJoin();
              }}
              disabled={isLoading}
              className="w-full py-2.5 bg-emerald-600 text-white font-medium text-sm rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Joining..." : "Join Group"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Group List Item Component (List View)
const GroupListItem = ({ group, onJoin, onView, isLoading }) => {
  const isPublic = group.group_type === "public";
  const memberCount = group.member_count || 0;
  const quizCount = group.quiz_count || 0;

  return (
    <div
      onClick={onView}
      className="flex items-center gap-6 p-5 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
    >
      {/* Avatar */}
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
        {group.name?.[0]?.toUpperCase() || "G"}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {group.name}
          </h3>
          <span
            className={cn(
              "px-2 py-0.5 text-xs font-medium rounded-full",
              isPublic
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-600"
            )}
          >
            {isPublic ? "Public" : "Private"}
          </span>
          {group.status === "active" && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Active
            </span>
          )}
          {group.isJoined && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
              <CheckCircle className="w-3 h-3" />
              Joined
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 line-clamp-1 mb-2">
          {group.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {memberCount} members
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {quizCount} quizzes
          </span>
        </div>
      </div>

      {/* Action */}
      {!group.isJoined && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onJoin();
          }}
          disabled={isLoading}
          className="px-6 py-2.5 bg-emerald-600 text-white font-medium text-sm rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 shrink-0"
        >
          {isLoading ? "Joining..." : "Join Group"}
        </button>
      )}

      {group.isJoined && (
        <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
      )}
    </div>
  );
};

export default Groups;
