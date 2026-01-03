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

export const NotificationPanel = ({ onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading, error, refetch } = useNotifications({
    page: 1,
    page_size: 50,
  });

  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();

  const notifications = Array.isArray(notificationsData) 
    ? notificationsData 
    : (notificationsData?.items || []);

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(
        notification.notification_id || notification.id
      );
    }
    // Navigate based on link field or fallback to entity type
    if (notification.link) {
      // Transform backend routes to frontend routes
      let frontendLink = notification.link;
      frontendLink = frontendLink.replace(/\/quizzes\//g, '/exams/');
      frontendLink = frontendLink.replace(/\/groups\//g, '/groups/');
      navigate(frontendLink);
    } else if (notification.related_entity_type === "quiz") {
      navigate(`/exams/${notification.related_entity_id}`);
    } else if (notification.related_entity_type === "group") {
      navigate(`/groups/${notification.related_entity_id}`);
    }
    onClose();
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
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] bg-white shadow-2xl">
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
