import { useState, useMemo, useEffect } from "react";
import { Bell, CheckCheck, Inbox, Loader2, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { NotificationItem } from "@/components/shared/NotificationItem";
import { NotificationDetailModal } from "@/components/shared/NotificationDetailModal";
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

export function Notifications() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 10;

  // Fetch notifications
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useNotifications({
    skip: (currentPage - 1) * pageSize,
    limit: pageSize,
    unread_only: activeFilter === "unread",
  });

  // Refetch when query becomes enabled (after auth initializes)
  useEffect(() => {
    // Refetch once when query is ready and we have no data yet
    if (!isLoading && !notificationsData && !isFetching && !error) {
      // Small delay to ensure query is fully enabled
      const timer = setTimeout(() => {
        refetch();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, notificationsData, isFetching, error, refetch]);

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
    // Return empty array instead of mock data when no data is available
    return [];
  }, [notificationsData]);

  // Calculate pagination - if we got exactly pageSize items, there might be more
  const hasMore = notifications.length === pageSize;
  // Show pagination if we have items and either we're not on page 1 or there might be more
  const showPagination = notifications.length > 0 && (currentPage > 1 || hasMore);
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
      // Close modal if deleted notification is currently open
      if (selectedNotification?.id === notificationId) {
        setIsModalOpen(false);
        setSelectedNotification(null);
      }
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  // Handle notification click - open modal
  const handleNotificationClick = async (notification) => {
    // Mark as read if unread BEFORE opening modal
    if (!notification.read && !notification.is_read) {
      try {
        await handleMarkRead(notification.id);
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
    // Update notification state to reflect read status
    setSelectedNotification({
      ...notification,
      is_read: true,
      read: true,
    });
    setIsModalOpen(true);
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
              onClick={handleNotificationClick}
            />
          ))}
        </div>
      )}

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNotification(null);
        }}
        notification={selectedNotification}
        onMarkRead={handleMarkRead}
      />

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!hasMore}
          >
            Next
          </Button>
        </div>
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
