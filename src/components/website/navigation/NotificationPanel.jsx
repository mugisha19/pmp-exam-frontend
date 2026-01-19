/**
 * NotificationPanel Component
 * Slide-in panel for notifications
 */

import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Bell, Check, RefreshCw } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  useNotifications,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "@/hooks/queries/useNotificationQueries";
import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "@/stores/auth.store";
import { transformNotificationLink } from "@/utils/notification.utils";

export const NotificationPanel = ({ onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: notificationsData, isLoading, error, refetch } = useNotifications({
    page: 1,
    page_size: 50,
  });

  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();

  const notifications = Array.isArray(notificationsData) 
    ? notificationsData 
    : (notificationsData?.items || []);

  // Get fallback navigation based on notification category or content
  const getNavigationFromCategory = (notification) => {
    const category = notification.category?.toLowerCase();
    const isStudent = user?.role === "student";
    const title = notification.title?.toLowerCase() || "";
    const message = notification.message?.toLowerCase() || "";
    
    // First check specific categories
    switch (category) {
      case "quiz_published":
      case "quiz_created":
      case "quiz_deadline":
      case "quiz_started":
      case "quiz_completed":
      case "quiz_auto_submitted":
      case "results_available":
        return isStudent ? "/my-learning" : "/exams";
      case "group_added":
      case "group_approved":
      case "group_removed":
      case "member_added":
      case "member_removed":
      case "join_request_approved":
      case "join_request_rejected":
      case "group_created":
        return isStudent ? "/my-groups" : "/groups";
      case "pause_started":
      case "pause_ending":
        return isStudent ? "/my-learning" : "/exams";
      case "performance_update":
        return isStudent ? "/my-analytics" : "/analytics";
    }
    
    // For generic "notification" category, try to determine from title/message content
    if (category === "notification" || !category) {
      // Check for group-related content
      if (title.includes("group") || message.includes("group") || 
          title.includes("added to") || title.includes("removed from") ||
          message.includes("added to") || message.includes("removed from") ||
          title.includes("join request") || message.includes("join request")) {
        return isStudent ? "/my-groups" : "/groups";
      }
      
      // Check for quiz-related content
      if (title.includes("quiz") || message.includes("quiz") ||
          title.includes("exam") || message.includes("exam") ||
          title.includes("published") || message.includes("published") ||
          title.includes("deadline") || message.includes("deadline") ||
          title.includes("completed") || message.includes("completed") ||
          title.includes("score") || message.includes("score")) {
        return isStudent ? "/my-learning" : "/exams";
      }
      
      // Check for pause-related content
      if (title.includes("pause") || message.includes("pause") ||
          title.includes("break") || message.includes("break")) {
        return isStudent ? "/my-learning" : "/exams";
      }
    }
    
    // Default: go to home/dashboard
    return isStudent ? "/home" : "/dashboard";
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(
        notification.notification_id || notification.id
      );
    }
    
    let navigationTarget = null;
    
    // Navigate based on link field using the utility function
    if (notification.link && notification.link.trim() !== "" && user) {
      const transformedLink = transformNotificationLink(notification.link, user.role);
      if (transformedLink) {
        navigationTarget = transformedLink;
      }
    }
    
    // Fallback: use entity type if available OR check extra_data for entity IDs
    if (!navigationTarget) {
      const quizId = notification.related_entity_id || 
                     notification.extra_data?.quiz_id || 
                     notification.template_data?.quiz_id;
      const groupId = notification.extra_data?.group_id || 
                      notification.template_data?.group_id;
      
      if (notification.related_entity_type === "quiz" && notification.related_entity_id) {
        navigationTarget = user?.role === "student" 
          ? `/my-exams/${notification.related_entity_id}`
          : `/exams/${notification.related_entity_id}`;
      } else if (notification.related_entity_type === "group" && notification.related_entity_id) {
        navigationTarget = user?.role === "student"
          ? `/my-groups/${notification.related_entity_id}`
          : `/groups/${notification.related_entity_id}`;
      } else if (quizId) {
        // Check if this is a completion/result notification - navigate to the quiz detail
        const title = notification.title?.toLowerCase() || "";
        const category = notification.category?.toLowerCase() || "";
        const attemptId = notification.extra_data?.attempt_id || notification.template_data?.attempt_id;
        
        if ((title.includes("completed") || title.includes("submitted") || 
            category.includes("completed") || category.includes("submitted") ||
            category.includes("results")) && attemptId) {
          // If we have attempt_id, navigate to the attempt review
          navigationTarget = user?.role === "student" 
            ? `/my-exams/${quizId}/attempts/${attemptId}`
            : `/exams/${quizId}`;
        } else {
          // Otherwise navigate to the quiz/exam
          navigationTarget = user?.role === "student" 
            ? `/my-exams/${quizId}`
            : `/exams/${quizId}`;
        }
      } else if (groupId) {
        navigationTarget = user?.role === "student"
          ? `/my-groups/${groupId}`
          : `/groups/${groupId}`;
      }
    }
    
    // Final fallback: navigate based on category
    if (!navigationTarget) {
      navigationTarget = getNavigationFromCategory(notification);
    }
    
    // Close the panel first
    onClose();
    
    // Then navigate after a short delay to ensure panel is closed
    if (navigationTarget) {
      setTimeout(() => {
        navigate(navigationTarget);
      }, 100);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleRefresh = () => {
    refetch();
  };

  const getNotificationIcon = (type) => {
    return "🔔";
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 top-20 z-40 bg-black/10 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-20 right-0 bottom-0 z-50 w-full sm:w-[420px] bg-white shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#476072] to-[#5a7a8f] text-white">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-base font-bold">Notifications</h2>
                <p className="text-xs text-white/80">
                  {notifications.filter((n) => !n.is_read).length} unread
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleMarkAllRead}
                disabled={notifications.filter((n) => !n.is_read).length === 0}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white/10 hover:bg-white/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white/10 hover:bg-white/20 rounded transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <div className="w-5 h-5 border-2 border-[#476072]/20 border-t-[#476072] rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <Bell className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  No notifications
                </h3>
                <p className="text-gray-500 text-xs">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <button
                    key={notification.notification_id || notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors",
                      !notification.is_read ? "bg-blue-50" : "bg-white"
                    )}
                  >
                    <div className="flex gap-2">
                      <div className="flex-shrink-0 text-base">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4
                            className={cn(
                              "font-semibold line-clamp-1 text-sm",
                              !notification.is_read
                                ? "text-gray-900"
                                : "text-gray-600"
                            )}
                          >
                            {notification.title || "New notification"}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-[#476072] rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                          {notification.message || notification.body}
                        </p>
                        <p className="text-xs text-gray-400">
                          {notification.created_at &&
                            formatDistanceToNow(
                              new Date(notification.created_at),
                              {
                                addSuffix: true,
                              }
                            )}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-white">
              <p className="text-xs text-center text-gray-500">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
