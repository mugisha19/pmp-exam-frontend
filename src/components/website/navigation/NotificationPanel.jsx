/**
 * NotificationPanel Component
 * Slide-in panel for notifications
 */

import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Bell, Check, Trash2, Settings } from "lucide-react";
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

  const { data: notificationsData, isLoading } = useNotifications({
    page: 1,
    page_size: 50,
  });

  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();

  const notifications = notificationsData?.items || notificationsData || [];

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(
        notification.notification_id || notification.id
      );
    }
    // Navigate based on notification type
    if (notification.related_entity_type === "quiz") {
      navigate(`/exams/${notification.related_entity_id}`);
    } else if (notification.related_entity_type === "group") {
      navigate(`/groups/${notification.related_entity_id}`);
    }
    onClose();
  };

  const handleMarkAllRead = () => {
    markAllAsReadMutation.mutate();
  };

  const getNotificationIcon = (type) => {
    // Return appropriate icon based on notification type
    return "🔔";
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-96 bg-white shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border-light">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Notifications
              </h2>
              <p className="text-sm text-text-tertiary">
                {notifications.filter((n) => !n.is_read).length} unread
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-text-tertiary" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border-light bg-bg-secondary">
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
            <button
              onClick={() => {
                navigate("/notifications");
                onClose();
              }}
              className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <Bell className="w-16 h-16 text-text-muted mb-4" />
                <h3 className="text-lg font-semibold text-text-secondary mb-2">
                  No notifications
                </h3>
                <p className="text-text-tertiary">
                  You're all caught up! Check back later for updates.
                </p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <button
                    key={notification.notification_id || notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "w-full px-6 py-4 text-left border-b border-border-light hover:bg-bg-secondary transition-colors",
                      !notification.is_read && "bg-primary-50/50"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4
                            className={cn(
                              "font-medium line-clamp-1",
                              !notification.is_read
                                ? "text-text-primary"
                                : "text-text-secondary"
                            )}
                          >
                            {notification.title || "New notification"}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-text-tertiary line-clamp-2 mb-2">
                          {notification.message || notification.body}
                        </p>
                        <p className="text-xs text-text-muted">
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
          <div className="px-6 py-4 border-t border-border-light">
            <button
              onClick={() => {
                navigate("/notifications");
                onClose();
              }}
              className="w-full py-2.5 text-center text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
            >
              View all notifications
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
