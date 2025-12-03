/**
 * Notification React Query Hooks
 * Custom hooks for notification management operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as notificationService from "@/services/notification.service";
import { queryKeys } from "@/lib/query-client";
import { useAuthStore } from "@/stores/auth.store";
import { TOKEN_KEYS, getStorageItem } from "@/constants/storage.constants";

/**
 * Helper to check if user has a valid token
 * More reliable than just checking isAuthenticated from store
 */
const hasValidToken = () => {
  const token = getStorageItem(TOKEN_KEYS.ACCESS_TOKEN);
  return !!token;
};

/**
 * Get notifications with filters query hook
 * @param {Object} filters - Query filters (skip, limit, unread_only)
 * @param {Object} options - Query options
 */
export const useNotifications = (filters = {}, options = {}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  // Only fetch when authenticated, not loading, has token, and enabled
  const canFetch = isAuthenticated && !isLoading && hasValidToken() && (options.enabled !== false);
  
  return useQuery({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: () => notificationService.getNotifications(filters),
    staleTime: 30 * 1000, // 30 seconds - notifications need fresher data
    keepPreviousData: true,
    enabled: canFetch,
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch notifications";
      console.error(errorMessage); // Don't show toast for notifications fetch
    },
    ...options,
  });
};

/**
 * Get unread notification count query hook
 * Used for notification bell badge
 * @param {Object} options - Query options
 */
export const useUnreadNotificationCount = (options = {}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  // Only fetch when authenticated, not loading, and has token
  const canFetch = isAuthenticated && !isLoading && hasValidToken();
  
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const response = await notificationService.getNotifications({
        unread_only: true,
        limit: 100, // Get up to 100 unread
      });
      // Return count from response
      return response?.total || response?.length || 0;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: canFetch ? 60 * 1000 : false, // Refetch every minute only when authenticated
    enabled: canFetch,
    onError: (error) => {
      console.error("Failed to fetch unread count:", error.message);
    },
    ...options,
  });
};

/**
 * Get notification by ID query hook
 * @param {string} notificationId - Notification ID
 * @param {Object} options - Query options
 */
export const useNotification = (notificationId, options = {}) => {
  return useQuery({
    queryKey: ["notification", notificationId],
    queryFn: () => notificationService.getNotificationById(notificationId),
    enabled: !!notificationId,
    staleTime: 1 * 60 * 1000, // 1 minute
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch notification";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * Mark notification as read mutation hook
 */
export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) =>
      notificationService.markAsRead(notificationId),
    onSuccess: (_, notificationId) => {
      // Update the specific notification in cache if it exists
      queryClient.setQueryData(["notification", notificationId], (old) => {
        if (old) {
          return { ...old, read: true, read_at: new Date().toISOString() };
        }
        return old;
      });

      // Invalidate notifications list
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });

      // Invalidate unread count
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount(),
      });
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to mark notification as read.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Mark all notifications as read mutation hook
 */
export const useMarkAllAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });

      // Invalidate unread count
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount(),
      });

      toast.success("All notifications marked as read");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to mark all notifications as read.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Delete notification mutation hook
 */
export const useDeleteNotificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) =>
      notificationService.deleteNotification(notificationId),
    onSuccess: (_, notificationId) => {
      // Remove notification from cache
      queryClient.removeQueries({
        queryKey: ["notification", notificationId],
      });

      // Invalidate notifications list
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });

      // Invalidate unread count
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount(),
      });

      toast.success("Notification deleted");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to delete notification. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export default {
  useNotifications,
  useUnreadNotificationCount,
  useNotification,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
};
