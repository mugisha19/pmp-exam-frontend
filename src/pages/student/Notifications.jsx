import { useState, useMemo } from "react";
import { Bell, CheckCheck, Inbox, Loader2, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { NotificationItem } from "@/components/shared/NotificationItem";
import { Pagination } from "@/components/shared/Pagination";
import {
  useNotifications,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from "@/hooks/queries/useNotificationQueries";

// Filter tabs
const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
];

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "quiz",
    title: "New Quiz Available",
    message: "A new quiz 'PMP Process Groups' has been assigned to you.",
    created_at: "2024-12-15T10:55:00.000Z",
    is_read: false,
  },
  {
    id: "2",
    type: "success",
    title: "Quiz Completed",
    message: "Congratulations! You scored 85% on the Risk Management quiz.",
    created_at: "2024-12-15T10:30:00.000Z",
    is_read: false,
  },
  {
    id: "3",
    type: "group",
    title: "Group Invitation",
    message: "You have been invited to join 'PMP Prep 2024' study group.",
    created_at: "2024-12-15T09:00:00.000Z",
    is_read: true,
  },
  {
    id: "4",
    type: "warning",
    title: "Quiz Deadline Approaching",
    message: "The quiz 'Agile Methodology' is due in 24 hours.",
    created_at: "2024-12-15T06:00:00.000Z",
    is_read: true,
  },
  {
    id: "5",
    type: "system",
    title: "System Maintenance",
    message: "Scheduled maintenance on December 5th from 2-4 AM UTC.",
    created_at: "2024-12-14T11:00:00.000Z",
    is_read: true,
  },
  {
    id: "6",
    type: "achievement",
    title: "Achievement Unlocked",
    message: "You have completed 10 quizzes! Keep up the great work.",
    created_at: "2024-12-13T11:00:00.000Z",
    is_read: true,
  },
];

export function Notifications() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch notifications
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useNotifications({
    page: currentPage,
    page_size: pageSize,
    unread_only: activeFilter === "unread",
  });

  // Mutations
  const markReadMutation = useMarkAsReadMutation();
  const markAllReadMutation = useMarkAllAsReadMutation();
  const deleteMutation = useDeleteNotificationMutation();

  // Extract notifications and pagination info
  const notifications = useMemo(() => {
    if (notificationsData?.items) {
      return notificationsData.items;
    }
    if (Array.isArray(notificationsData)) {
      return notificationsData;
    }
    return MOCK_NOTIFICATIONS;
  }, [notificationsData]);

  const totalPages =
    notificationsData?.total_pages ||
    Math.ceil(notifications.length / pageSize);
  const unreadCount = notifications.filter((n) => !n.is_read && !n.read).length;

  // Handle mark as read
  const handleMarkRead = async (notificationId) => {
    try {
      await markReadMutation.mutateAsync(notificationId);
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  // Handle mark all as read
  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all notifications as read");
    }
  };

  // Handle delete notification
  const handleDelete = async (notificationId) => {
    try {
      await deleteMutation.mutateAsync(notificationId);
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  // Filter notifications based on active filter
  const filteredNotifications = useMemo(() => {
    if (activeFilter === "unread") {
      return notifications.filter((n) => !n.is_read && !n.read);
    }
    return notifications;
  }, [notifications, activeFilter]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Notifications"
          subtitle={`${unreadCount} unread notification${
            unreadCount !== 1 ? "s" : ""
          }`}
        />

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
          >
            {markAllReadMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCheck className="w-4 h-4 mr-2" />
            )}
            Mark all read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleFilterChange(tab.value)}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${
                activeFilter === tab.value
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }
            `}
          >
            {tab.label}
            {tab.value === "unread" && unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load notifications</p>
          <Button variant="ghost" className="mt-4" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState filter={activeFilter} />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredNotifications.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

// Empty state component
function EmptyState({ filter }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-gray-100 rounded-full mb-4">
        {filter === "unread" ? (
          <CheckCheck className="w-12 h-12 text-emerald-500" />
        ) : (
          <Inbox className="w-12 h-12 text-gray-400" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {filter === "unread" ? "All caught up!" : "No notifications"}
      </h3>
      <p className="text-gray-500 max-w-sm">
        {filter === "unread"
          ? "You have no unread notifications. Great job staying on top of things!"
          : "You don't have any notifications yet. They will appear here when you receive them."}
      </p>
    </div>
  );
}

export default Notifications;
