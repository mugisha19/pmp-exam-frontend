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
        "bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border-2 border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group hover:scale-105 hover:border-accent-primary/30",
        className
      )}
    >
      {/* Header with gradient */}
      <div className="relative h-24 bg-gradient-to-br from-accent-primary/20 via-accent-primary/15 to-accent-secondary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-transparent" />
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isJoined && (
            <div className="px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-700 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md border border-green-200">
              <CheckCircle className="w-3.5 h-3.5" />
              Joined
            </div>
          )}
          <span className={cn("px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border", getStatusColor(status))}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Group Type & Name */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              {isPublic ? (
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center">
                  <Globe className="w-3.5 h-3.5 text-accent-primary flex-shrink-0" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                </div>
              )}
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                {getGroupTypeLabel(group?.group_type)}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-accent-primary transition-colors duration-200 line-clamp-1">
              {group?.name}
            </h3>
            {group?.description && (
              <p className="text-sm text-gray-600 font-medium line-clamp-2 leading-relaxed">{group.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-5 pb-5 border-b-2 border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <span className="text-base font-bold text-gray-900 block">{memberCount}</span>
              <span className="text-xs text-gray-600 font-medium">members</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-sm">
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <span className="text-base font-bold text-gray-900 block">{quizCount}</span>
              <span className="text-xs text-gray-600 font-medium">quizzes</span>
            </div>
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
                className="flex-1 px-5 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105"
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
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
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

