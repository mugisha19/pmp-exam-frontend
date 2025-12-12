import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getAvailableGroups, getMyGroups, createJoinRequest } from "@/services/group.service";
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

  // Fetch available public groups (not joined)
  const { data: availableGroups, isLoading: loadingAvailable } = useQuery({
    queryKey: ["available-groups", searchQuery],
    queryFn: () => getAvailableGroups({ search: searchQuery, limit: 50 }),
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
      queryClient.invalidateQueries(["available-groups"]);
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

  const isLoading = activeTab === "all" ? loadingAvailable : loadingMy;
  const displayGroups = activeTab === "all" ? (availableGroups || []) : (myGroups || []);
  const myGroupIds = new Set(myGroups?.map((g) => g.group_id) || []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border-2 border-gray-300 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Study Groups</h1>
        <p className="text-gray-600">
          Join groups to access quizzes and study materials
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-300">
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Browse Groups
          </button>
          <button
            onClick={() => setActiveTab("my-groups")}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === "my-groups"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            My Groups ({myGroups?.length || 0})
          </button>
        </div>
      </div>

      {/* Search Bar - Only show on "Browse Groups" tab */}
      {activeTab === "all" && (
        <div className="bg-white border border-gray-300 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Groups List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : displayGroups.length === 0 ? (
        <div className="text-center py-12 bg-white border-2 border-gray-300 p-8">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {activeTab === "all" ? "No groups found" : "You haven't joined any groups yet"}
          </h3>
          <p className="text-sm text-gray-600">
            {activeTab === "all"
              ? "Try adjusting your search criteria"
              : "Browse public groups and join to get started"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayGroups.map((group) => {
            const groupId = group.id || group.group_id;
            const isJoined = myGroupIds.has(groupId);
            const isPublic = group.group_type === "public";

            return (
              <div
                key={groupId}
                className="bg-white border border-gray-300 p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">
                        {group.name}
                      </h3>
                      {isJoined && (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isPublic ? (
                        <Globe className="w-3 h-3 text-green-600" />
                      ) : (
                        <Lock className="w-3 h-3 text-gray-600" />
                      )}
                      <span className="text-xs text-gray-600">
                        {isPublic ? "Public" : "Private"}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-4 line-clamp-2 pl-15">
                  {group.description || "No description available"}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  {/* Group Stats */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {group.member_count || 0}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {group.quiz_count || 0}
                    </span>
                  </div>
                  {/* Created Date */}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(group.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                  {isJoined ? (
                    <button
                      onClick={() => handleViewGroup(groupId)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
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
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Groups;
