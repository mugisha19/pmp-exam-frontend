/**
 * NotificationBell Component
 * Bell icon with unread count badge and dropdown
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { Dropdown, DropdownItem, DropdownDivider } from "../ui/Dropdown";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "@/hooks/queries/useNotificationQueries";
import { formatDistanceToNow } from "date-fns";

// Notification type to icon/color mapping (reserved for future styling enhancements)
const _getNotificationStyle = (type) => {
  switch (type?.toLowerCase()) {
    case "exam":
    case "quiz":
      return "bg-blue-500/20 text-blue-600";
    case "result":
    case "grade":
      return "";
    case "group":
    case "invitation":
      return "";
    case "warning":
    case "alert":
      return "bg-yellow-500/20 text-yellow-600";
    case "error":
      return "bg-red-500/20 text-red-600";
    default:
      return "bg-gray-500/20 text-gray-600";
  }
};

// Format notification time
const formatTime = (dateString) => {
  if (!dateString) return "";
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return "";
  }
};

export const NotificationBell = ({ className }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Get unread count for badge
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  // Get recent notifications for dropdown
  const { data: notificationsData, isLoading } = useNotifications(
    { limit: 5 },
    { enabled: isOpen } // Only fetch when dropdown is open
  );

  const notifications = notificationsData?.items || notificationsData || [];

  // Mutations
  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate if there's a link
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleViewAll = () => {
    navigate("/notifications");
  };

  return (
    <Dropdown
      align="right"
      onOpenChange={setIsOpen}
      trigger={
        <button
          className={cn(
            "relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors",
            className
          )}
          aria-label={`Notifications${
            unreadCount > 0 ? ` (${unreadCount} unread)` : ""
          }`}
        >
          <Bell className="w-5 h-5" />

          {/* Unread count badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      }
    >
      {/* Header */}
      <div className="py-3 px-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {unreadCount > 0
                ? `You have ${unreadCount} unread message${
                    unreadCount !== 1 ? "s" : ""
                  }`
                : "No new notifications"}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="text-xs text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
            >
              {markAllAsReadMutation.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                "Mark all read"
              )}
            </button>
          )}
        </div>
      </div>

      {/* Notifications list */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={cn("py-3!", !notification.read && "bg-blue-50")}
            >
              <div className="flex items-start gap-3 w-full">
                {/* Indicator dot for unread */}
                <div
                  className={cn(
                    "w-2 h-2 rounded-full mt-2 shrink-0",
                    notification.read ? "bg-transparent" : "bg-blue-500"
                  )}
                />

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm",
                      notification.read
                        ? "text-gray-600"
                        : "text-gray-900 font-medium"
                    )}
                  >
                    {notification.title || notification.message}
                  </p>
                  {notification.body && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {notification.body}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(notification.created_at)}
                  </p>
                </div>
              </div>
            </DropdownItem>
          ))
        )}
      </div>

      {/* Footer */}
      <DropdownDivider />
      <DropdownItem onClick={handleViewAll}>
        <span className="text-center w-full text-blue-600 font-medium">
          View all notifications
        </span>
      </DropdownItem>
    </Dropdown>
  );
};

export default NotificationBell;
