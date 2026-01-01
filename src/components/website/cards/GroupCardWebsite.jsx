/**
 * GroupCardWebsite Component
 * Enhanced group card for website layout
 */

import { Link } from "react-router-dom";
import { Users, Lock, Globe, BookOpen, TrendingUp } from "lucide-react";
import { cn } from "@/utils/cn";

export const GroupCardWebsite = ({ group, className }) => {
  const groupId = group.group_id || group.id;
  const isPrivate =
    group.group_type === "private" || group.privacy === "private";
  const memberCount = group.member_count || group.members_count || 0;
  const quizCount = group.quiz_count || group.quizzes_count || 0;

  return (
    <Link
      to={`/groups/${groupId}`}
      className={cn(
        "group bg-white rounded-xl overflow-hidden shadow-sm border border-border-light hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
        className
      )}
    >
      {/* Cover Image/Header */}
      <div className="relative h-32 bg-gradient-to-br from-accent-teal to-primary-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />

        {/* Privacy Badge */}
        <div className="absolute top-3 right-3">
          {isPrivate ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-text-secondary">
              <Lock className="w-3 h-3" />
              Private
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-text-secondary">
              <Globe className="w-3 h-3" />
              Public
            </div>
          )}
        </div>

        {/* Group Type */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-1 bg-white/80 backdrop-blur-sm text-xs font-semibold text-primary-700 rounded">
            {group.group_type === "class"
              ? "Class"
              : group.group_type === "study_group"
              ? "Study Group"
              : "Cohort"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-text-primary mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {group.name}
        </h3>

        {group.description && (
          <p className="text-text-tertiary text-sm line-clamp-2 mb-4">
            {group.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border-light">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg">
              <Users className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <div className="font-semibold text-text-primary">
                {memberCount}
              </div>
              <div className="text-xs text-text-muted">Members</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center justify-center w-8 h-8 bg-secondary-100 rounded-lg">
              <BookOpen className="w-4 h-4 text-secondary-600" />
            </div>
            <div>
              <div className="font-semibold text-text-primary">{quizCount}</div>
              <div className="text-xs text-text-muted">Quizzes</div>
            </div>
          </div>
        </div>

        {/* Activity Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span>Active today</span>
          </div>

          {/* Join/View Button */}
          <div className="text-sm font-semibold text-primary-600 group-hover:text-primary-700">
            View Group →
          </div>
        </div>
      </div>
    </Link>
  );
};
