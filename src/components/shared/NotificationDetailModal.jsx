/**
 * NotificationDetailModal Component
 * Modal to display full notification details
 */

import { Modal, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatDistanceToNow, format } from "date-fns";
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
  ExternalLink,
} from "lucide-react";
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

export function NotificationDetailModal({ isOpen, onClose, notification, onMarkRead }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!notification) return null;

  const {
    id,
    type = "default",
    title,
    message,
    created_at,
    read,
    is_read,
    link,
    category,
  } = notification;

  const isRead = read ?? is_read ?? false;
  const iconConfig = notificationIcons[type] || notificationIcons.default;
  const Icon = iconConfig.icon;
  const useCustomColor = type === 'success' || type === 'message';

  const timeAgo = created_at
    ? formatDistanceToNow(new Date(created_at), { addSuffix: true })
    : "";

  const formattedDate = created_at
    ? format(new Date(created_at), "PPpp")
    : "";

  const handleGoToLink = async () => {
    if (link && user) {
      // Mark as read before navigating
      if (!isRead && onMarkRead) {
        await onMarkRead(id);
      }
      const transformedLink = transformNotificationLink(link, user.role);
      if (transformedLink) {
        navigate(transformedLink);
        onClose();
      }
    }
  };

  const handleMarkAsRead = async () => {
    if (!isRead && onMarkRead) {
      await onMarkRead(id);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notification Details" size="md">
      <ModalBody>
        <div className="space-y-6">
          {/* Header with Icon */}
          <div className="flex items-start gap-4">
            <div 
              className={`p-3 rounded-lg flex-shrink-0 ${useCustomColor ? '' : iconConfig.bg}`}
              style={useCustomColor ? { backgroundColor: 'rgba(71, 96, 114, 0.1)' } : {}}
            >
              <Icon 
                className={`w-6 h-6 ${useCustomColor ? '' : iconConfig.color}`}
                style={useCustomColor ? { color: '#476072' } : {}}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900">{title || "Notification"}</h3>
                {!isRead && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                    New
                  </span>
                )}
              </div>
              {category && (
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  {category.replace(/_/g, " ")}
                </p>
              )}
              <p className="text-sm text-gray-500">{timeAgo}</p>
            </div>
          </div>

          {/* Message Content */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Message</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {message}
            </p>
          </div>

          {/* Metadata */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Status:</span>
              <span className={`font-medium ${isRead ? "text-gray-600" : "text-blue-600"}`}>
                {isRead ? "Read" : "Unread"}
              </span>
            </div>
            {formattedDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Received:</span>
                <span className="text-gray-700">{formattedDate}</span>
              </div>
            )}
            {link && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Related Link:</span>
                <span className="text-blue-600 truncate max-w-xs ml-2" title={link}>
                  {link}
                </span>
              </div>
            )}
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex items-center justify-between w-full">
          <div>
            {!isRead && (
              <Button
                variant="outline"
                onClick={handleMarkAsRead}
                disabled={!onMarkRead}
              >
                Mark as Read
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {link && (
              <Button variant="primary" onClick={handleGoToLink}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Go to Link
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
}

export default NotificationDetailModal;

