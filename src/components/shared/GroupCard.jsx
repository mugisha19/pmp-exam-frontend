/**
 * GroupCard Component
 * Enhanced group card with stats, badges, and actions
 */

import { Users, BookOpen, Globe, Lock, CheckCircle, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { format } from "date-fns";

export const GroupCard = ({
  group,
  isJoined = false,
  onJoin,
  onView,
  onLeave,
  className,
  isLoading = false,
}) => {
  const groupId = group?.id || group?.group_id;
  const isPublic = group?.group_type === "public";
  const memberCount = group?.member_count || 0;
  const quizCount = group?.quiz_count || 0;
  const status = group?.status || "active";

  const getGroupTypeLabel = (type) => {
    const labels = {
      class: "Class",
      study_group: "Study Group",
      cohort: "Cohort",
    };
    return labels[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-success/10 text-success",
      inactive: "bg-gray-100 text-gray-600",
      archived: "bg-gray-100 text-gray-500",
    };
    return colors[status] || colors.inactive;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return null;
    }
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all group",
        className
      )}
    >
      {/* Header with gradient */}
      <div className="relative h-20 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent" />
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {isJoined && (
            <div className="px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Joined
            </div>
          )}
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(status))}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Group Type & Name */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {isPublic ? (
                <Globe className="w-4 h-4 text-accent-primary flex-shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
              )}
              <span className="text-xs font-medium text-gray-500 uppercase">
                {getGroupTypeLabel(group?.group_type)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-accent-primary transition-colors line-clamp-1">
              {group?.name}
            </h3>
            {group?.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">{memberCount}</span>
            <span className="text-xs text-gray-500">members</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">{quizCount}</span>
            <span className="text-xs text-gray-500">quizzes</span>
          </div>
        </div>

        {/* Timeline */}
        {(group?.from_date || group?.to_date) && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar className="w-3 h-3" />
              {group?.from_date && group?.to_date ? (
                <span>
                  {formatDate(group.from_date)} - {formatDate(group.to_date)}
                </span>
              ) : group?.from_date ? (
                <span>Starts {formatDate(group.from_date)}</span>
              ) : (
                <span>Ends {formatDate(group.to_date)}</span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isJoined ? (
            <>
              <button
                onClick={() => onView?.(groupId)}
                className="flex-1 px-4 py-2 bg-accent-primary text-white text-sm font-medium rounded-lg hover:bg-accent-secondary transition-colors flex items-center justify-center gap-2"
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {isPublic && (
                <button
                  onClick={() => onJoin?.(groupId)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-success text-white text-sm font-medium rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Joining..." : "Join Group"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupCard;

