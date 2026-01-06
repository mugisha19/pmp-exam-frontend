/**
 * NotificationItem Component
 * Individual notification display with read/delete actions
 */

import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  MessageSquare,
  Users,
  FileText,
  Award,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { transformNotificationLink } from "@/utils/notification.utils";

// Icon mapping based on notification type
const notificationIcons = {
  info: { icon: Info, color: "text-blue-600", bg: "bg-blue-500/10" },
  success: {
    icon: CheckCircle,
    color: "",
    bg: "",
  },
  warning: {
    icon: AlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  error: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-500/10" },
  message: {
    icon: MessageSquare,
    color: "",
    bg: "",
  },
  group: { icon: Users, color: "text-cyan-600", bg: "bg-cyan-500/10" },
  quiz: { icon: FileText, color: "text-blue-600", bg: "bg-blue-500/10" },
  achievement: {
    icon: Award,
    color: "text-yellow-600",
    bg: "bg-yellow-500/10",
  },
  system: { icon: Settings, color: "text-gray-600", bg: "bg-gray-500/10" },
  default: { icon: Bell, color: "text-gray-600", bg: "bg-gray-500/10" },
};

export function NotificationItem({
  notification,
  onRead,
  onDelete,
  showDeleteButton = true,
  compact = false,
  onClick,
}) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    id,
    type = "default",
    title,
    message,
    created_at,
    read,
    is_read,
    link,
  } = notification;

  // Support both read and is_read field names
  const isRead = read ?? is_read ?? false;

  // Get icon configuration
  const iconConfig = notificationIcons[type] || notificationIcons.default;
  const Icon = iconConfig.icon;
  
  // Check if this is a success or message type that should use #476072
  const useCustomColor = type === 'success' || type === 'message';

  // Format relative time
  const timeAgo = created_at
    ? formatDistanceToNow(new Date(created_at), { addSuffix: true })
    : "";

  const handleClick = () => {
    // Call custom onClick handler first (for modal opening)
    if (onClick) {
      onClick(notification);
      return; // Let the parent handle marking as read
    }
    
    // Fallback: Mark as read if unread and no onClick handler
    if (!isRead && onRead) {
      onRead(id);
    }
    
    // Navigate to link if provided and no onClick handler
    if (link && !onClick && user) {
      const transformedLink = transformNotificationLink(link, user.role);
      if (transformedLink) {
        navigate(transformedLink);
      }
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className={`
          relative flex items-start gap-2 transition-colors cursor-pointer
          ${isRead ? "" : "bg-blue-50/50"}
        `}
      >
        {!isRead && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-blue-500" />
        )}
        <div 
          className={`p-1.5 rounded flex-shrink-0 ${useCustomColor ? '' : iconConfig.bg}`}
          style={useCustomColor ? { backgroundColor: 'rgba(71, 96, 114, 0.1)' } : {}}
        >
          <Icon 
            className={`w-3.5 h-3.5 ${useCustomColor ? '' : iconConfig.color}`}
            style={useCustomColor ? { color: '#476072' } : {}}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-xs truncate ${isRead ? "text-gray-600" : "text-gray-900 font-medium"}`}>
            {title}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{message}</p>
          <span className="text-xs text-gray-400 mt-0.5 block">{timeAgo}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`
        relative flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer
        ${
          isRead
            ? "bg-gray-50 border-gray-200 hover:bg-gray-100"
            : "bg-white border-gray-300 hover:bg-gray-50"
        }
      `}
    >
      {/* Unread indicator */}
      {!isRead && (
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500" />
      )}

      {/* Icon */}
      <div 
        className={`p-2 rounded-lg flex-shrink-0 ${useCustomColor ? '' : iconConfig.bg}`}
        style={useCustomColor ? { backgroundColor: 'rgba(71, 96, 114, 0.1)' } : {}}
      >
        <Icon 
          className={`w-5 h-5 ${useCustomColor ? '' : iconConfig.color}`}
          style={useCustomColor ? { color: '#476072' } : {}}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-8">
        <h4
          className={`text-sm truncate ${
            isRead ? "text-gray-600 font-normal" : "text-gray-900 font-semibold"
          }`}
        >
          {title}
        </h4>
        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{message}</p>
        <span className="text-xs text-gray-400 mt-1 block">{timeAgo}</span>
      </div>

      {/* Delete button */}
      {showDeleteButton && (
        <button
          onClick={handleDelete}
          className="absolute top-4 right-8 p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
          style={{ opacity: 1 }}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Compact variant for dropdown menus
export function NotificationItemCompact({ notification, onRead, onClick }) {
  const {
    id,
    type = "default",
    title,
    message,
    created_at,
    read,
    is_read,
  } = notification;

  const isRead = read ?? is_read ?? false;
  const iconConfig = notificationIcons[type] || notificationIcons.default;
  const Icon = iconConfig.icon;
  const useCustomColor = type === 'success' || type === 'message';

  const timeAgo = created_at
    ? formatDistanceToNow(new Date(created_at), { addSuffix: true })
    : "";

  const handleClick = () => {
    if (!isRead && onRead) {
      onRead(id);
    }
    if (onClick) {
      onClick(notification);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative flex items-start gap-3 p-3 transition-colors cursor-pointer
        ${isRead ? "hover:bg-gray-100" : "bg-blue-50 hover:bg-gray-100"}
      `}
    >
      {/* Unread indicator */}
      {!isRead && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
      )}

      {/* Icon */}
      <div 
        className={`p-1.5 rounded flex-shrink-0 ${useCustomColor ? '' : iconConfig.bg}`}
        style={useCustomColor ? { backgroundColor: 'rgba(71, 96, 114, 0.1)' } : {}}
      >
        <Icon 
          className={`w-4 h-4 ${useCustomColor ? '' : iconConfig.color}`}
          style={useCustomColor ? { color: '#476072' } : {}}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4
          className={`text-sm truncate ${
            isRead ? "text-gray-600" : "text-gray-900 font-medium"
          }`}
        >
          {title}
        </h4>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{message}</p>
        <span className="text-xs text-gray-400 mt-0.5 block">{timeAgo}</span>
      </div>
    </div>
  );
}

export default NotificationItem;
