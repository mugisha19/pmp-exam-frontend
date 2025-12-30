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
        "bg-gradient-to-br from-white to-gray-50/50 rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow transition-all duration-200 group hover:border-teal-300",
        className
      )}
    >
      {/* Header with gradient */}
      <div className="relative h-20 bg-gradient-to-br from-teal-500/15 via-teal-500/10 to-emerald-500/15">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/8 to-transparent" />
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {isJoined && (
            <div className="px-2 py-1 bg-teal-50 text-teal-700 rounded-full text-[10px] font-medium flex items-center gap-1 border border-teal-200">
              <CheckCircle className="w-3 h-3" />
              Joined
            </div>
          )}
          <span className={cn("px-2 py-1 rounded-full text-[10px] font-medium border", getStatusColor(status))}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Group Type & Name */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-2">
              {isPublic ? (
                <div className="w-5 h-5 rounded-md bg-teal-50 flex items-center justify-center">
                  <Globe className="w-3 h-3 text-teal-600 flex-shrink-0" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center">
                  <Lock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                </div>
              )}
              <span className="text-[10px] font-medium text-gray-600 uppercase tracking-wide">
                {getGroupTypeLabel(group?.group_type)}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1.5 group-hover:text-teal-600 transition-colors duration-200 line-clamp-1">
              {group?.name}
            </h3>
            {group?.description && (
              <p className="text-xs text-gray-600 font-medium line-clamp-2 leading-relaxed">{group.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900 block">{memberCount}</span>
              <span className="text-[10px] text-gray-600 font-medium">members</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-teal-50 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900 block">{quizCount}</span>
              <span className="text-[10px] text-gray-600 font-medium">quizzes</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {(group?.from_date || group?.to_date) && (
          <div className="mb-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
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
                className="flex-1 px-3 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-medium rounded-lg hover:shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                View Details
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              {isPublic && (
                <button
                  onClick={() => onJoin?.(groupId)}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-medium rounded-lg hover:shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

