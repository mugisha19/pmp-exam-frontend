/**
 * GroupsGrid Component
 * Grid display for group cards
 */

import { Users, Lock, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

export const GroupsGrid = ({
  title,
  groups,
  maxItems = 8,
  showViewAll = true,
  className,
}) => {
  if (!groups || groups.length === 0) {
    return null;
  }

  const displayGroups = maxItems ? groups.slice(0, maxItems) : groups;

  return (
    <div className={cn("", className)}>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">
            {title}
          </h2>
          {showViewAll && groups.length > maxItems && (
            <Link
              to="/my-groups"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
            >
              View all →
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayGroups.map((group) => {
          const groupId = group.group_id || group.id;
          const isPrivate =
            group.group_type === "private" || group.privacy === "private";

          return (
            <Link
              key={groupId}
              to={`/my-groups/${groupId}`}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              {/* Cover Image */}
              <div className="h-32 bg-gradient-to-br from-primary-400 to-primary-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                <div className="absolute bottom-3 right-3">
                  {isPrivate ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-white/90 rounded-lg text-xs font-medium text-text-secondary">
                      <Lock className="w-3 h-3" />
                      Private
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1 bg-white/90 rounded-lg text-xs font-medium text-text-secondary">
                      <Globe className="w-3 h-3" />
                      Public
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-text-primary mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                  {group.name}
                </h3>
                <p className="text-text-tertiary text-sm line-clamp-2 mb-3">
                  {group.description || "No description available"}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-text-muted">
                    <Users className="w-4 h-4" />
                    <span>
                      {group.member_count || group.members_count || 0} members
                    </span>
                  </div>
                  {group.quiz_count !== undefined && (
                    <div className="text-primary-600 font-medium">
                      {group.quiz_count} quizzes
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
