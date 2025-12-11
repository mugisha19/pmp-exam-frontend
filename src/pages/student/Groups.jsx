import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getGroups, getMyGroups, createJoinRequest } from "@/services/group.service";
import { Spinner } from "@/components/ui";
import {
  Users,
  Search,
  UserPlus,
  Lock,
  Globe,
  CheckCircle,
  ArrowRight,
  Calendar,
  BookOpen,
} from "lucide-react";
import { toast } from "react-hot-toast";

export const Groups = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all"); // "all" or "my-groups"
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all public groups
  const { data: allGroupsData, isLoading: loadingAll } = useQuery({
    queryKey: ["groups", "public", searchQuery],
    queryFn: () => getGroups({ search: searchQuery, limit: 50 }),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch user's joined groups
  const { data: myGroups, isLoading: loadingMy } = useQuery({
    queryKey: ["my-groups"],
    queryFn: getMyGroups,
    staleTime: 2 * 60 * 1000,
  });

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: (groupId) => createJoinRequest({ group_id: groupId }),
    onSuccess: () => {
      toast.success("Successfully joined the group!");
      queryClient.invalidateQueries(["my-groups"]);
      queryClient.invalidateQueries(["groups"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to join group");
    },
  });

  const handleJoinGroup = (groupId) => {
    joinGroupMutation.mutate(groupId);
  };

  const handleViewGroup = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  // Filter out private groups from all groups and exclude already joined
  const myGroupIds = new Set(myGroups?.map((g) => g.group_id) || []);
  
  // Handle both array response and items response
  const allGroupsList = Array.isArray(allGroupsData) ? allGroupsData : (allGroupsData?.items || []);
  const publicGroups = allGroupsList.filter(
    (group) => group.group_type === "public" && !myGroupIds.has(group.id || group.group_id)
  ) || [];

  const isLoading = activeTab === "all" ? loadingAll : loadingMy;
  const displayGroups = activeTab === "all" ? publicGroups : (myGroups || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Groups</h1>
          <p className="text-gray-600 mt-1">
            Join groups to access quizzes and study materials
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "all"
              ? "text-blue-600 border-blue-600"
              : "text-gray-600 border-transparent hover:text-gray-900"
          }`}
        >
          Browse Groups
        </button>
        <button
          onClick={() => setActiveTab("my-groups")}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "my-groups"
              ? "text-blue-600 border-blue-600"
              : "text-gray-600 border-transparent hover:text-gray-900"
          }`}
        >
          My Groups
        </button>
      </div>

      {/* Search Bar - Only show on "Browse Groups" tab */}
      {activeTab === "all" && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Groups List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : displayGroups.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeTab === "all" ? "No groups found" : "You haven't joined any groups yet"}
          </h3>
          <p className="text-gray-600">
            {activeTab === "all"
              ? "Try adjusting your search criteria"
              : "Browse public groups and join to get started"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayGroups.map((group) => {
            const groupId = group.id || group.group_id;
            const isJoined = myGroupIds.has(groupId);
            const isPublic = group.group_type === "public";

            return (
              <div
                key={groupId}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Group Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {isPublic ? (
                          <Globe className="w-4 h-4 text-green-600" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-600" />
                        )}
                        <span className="text-xs font-medium text-gray-600 uppercase">
                          {isPublic ? "Public" : "Private"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {group.name}
                      </h3>
                    </div>
                    {isJoined && (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {group.description || "No description available"}
                  </p>

                  {/* Group Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{group.member_count || 0} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{group.quiz_count || 0} quizzes</span>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Created {new Date(group.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isJoined ? (
                      <button
                        onClick={() => handleViewGroup(groupId)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        View Group
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        {isPublic && (
                          <button
                            onClick={() => handleJoinGroup(groupId)}
                            disabled={joinGroupMutation.isPending}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          > className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {joinGroupMutation.isPending ? (
                              <Spinner size="sm" />
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4" />
                                Join Group
                              </>
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Groups;
