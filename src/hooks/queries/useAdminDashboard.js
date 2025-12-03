/**
 * Admin Dashboard React Query Hooks
 * Custom hooks for admin dashboard data fetching
 */

import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as userService from "@/services/user.service";
import * as groupService from "@/services/group.service";
import { queryKeys } from "@/lib/query-client";

/**
 * Get dashboard statistics
 * Aggregates data from multiple services
 */
export const useAdminDashboardStats = (options = {}) => {
  return useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: async () => {
      // Fetch data in parallel
      const [usersData, groupsData] = await Promise.all([
        userService.getUsers({ limit: 1 }), // Just to get total count
        groupService.getGroups({ limit: 1, status: "active" }),
      ]);

      // Extract counts - adjust based on actual API response structure
      const totalUsers = usersData?.total || usersData?.items?.length || 0;
      const totalGroups = groupsData?.total || groupsData?.items?.length || 0;

      // Calculate role-based counts if available
      const instructorCount = usersData?.role_counts?.instructor || 0;
      const studentCount =
        usersData?.role_counts?.student || totalUsers - instructorCount;

      return {
        totalUsers,
        totalInstructors: instructorCount,
        totalStudents: studentCount,
        activeGroups: totalGroups,
        activeQuizzes: 0, // Will be populated when quiz stats are available
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      console.error("Failed to fetch dashboard stats:", error);
      toast.error("Failed to load dashboard statistics");
    },
    ...options,
  });
};

/**
 * Get recent users for dashboard
 */
export const useRecentUsers = (limit = 5, options = {}) => {
  return useQuery({
    queryKey: queryKeys.users.list({ limit, sort: "-created_at" }),
    queryFn: () =>
      userService.getUsers({
        limit,
        skip: 0,
        sort: "-created_at", // Most recent first
      }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => data?.items || data || [],
    onError: (error) => {
      console.error("Failed to fetch recent users:", error);
    },
    ...options,
  });
};

/**
 * Get recent groups for dashboard
 */
export const useRecentGroups = (limit = 5, options = {}) => {
  return useQuery({
    queryKey: queryKeys.groups.list({ limit, sort: "-created_at" }),
    queryFn: () =>
      groupService.getGroups({
        limit,
        skip: 0,
        sort: "-created_at", // Most recent first
      }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => data?.items || data || [],
    onError: (error) => {
      console.error("Failed to fetch recent groups:", error);
    },
    ...options,
  });
};

/**
 * Get platform activity/analytics for dashboard
 * Note: This is a placeholder that returns empty data until
 * a dedicated admin analytics endpoint is available
 */
export const usePlatformActivity = (options = {}) => {
  return useQuery({
    queryKey: ["admin", "dashboard", "activity"],
    queryFn: async () => {
      // Return empty array - analytics endpoint not yet implemented
      // TODO: Implement when admin analytics API is available
      return [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

/**
 * Combined hook for all dashboard data
 */
export const useAdminDashboardData = () => {
  const stats = useAdminDashboardStats();
  const recentUsers = useRecentUsers(5);
  const recentGroups = useRecentGroups(5);
  const activity = usePlatformActivity();

  const isLoading =
    stats.isLoading ||
    recentUsers.isLoading ||
    recentGroups.isLoading ||
    activity.isLoading;

  const isError = stats.isError && recentUsers.isError && recentGroups.isError;

  const refetchAll = () => {
    stats.refetch();
    recentUsers.refetch();
    recentGroups.refetch();
    activity.refetch();
  };

  return {
    stats: stats.data,
    recentUsers: recentUsers.data,
    recentGroups: recentGroups.data,
    activity: activity.data,
    isLoading,
    isError,
    refetchAll,
    queries: {
      stats,
      recentUsers,
      recentGroups,
      activity,
    },
  };
};

export default {
  useAdminDashboardStats,
  useRecentUsers,
  useRecentGroups,
  usePlatformActivity,
  useAdminDashboardData,
};
