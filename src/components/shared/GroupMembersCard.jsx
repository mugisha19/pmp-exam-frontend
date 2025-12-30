/**
 * GroupMembersCard Component
 * Compact group members card for sidebar
 */

import { useNavigate } from "react-router-dom";
import { useMyGroups, useGroupMembers } from "@/hooks/queries/useGroupQueries";
import { UserCell } from "@/components/shared/UserCell";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui";
import { Users, ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";

export const GroupMembersCard = ({ className }) => {
  const navigate = useNavigate();
  const { data: myGroups } = useMyGroups();

  // Get the first group the user is a member of
  const firstGroup = myGroups && myGroups.length > 0 ? myGroups[0] : null;
  const groupId = firstGroup?.group_id || firstGroup?.id;

  // Fetch members of the first group
  const { data: membersData, isLoading: membersLoading } = useGroupMembers(groupId, {
    enabled: !!groupId,
  });

  // Extract members array - handle different response structures
  const members = Array.isArray(membersData)
    ? membersData
    : membersData?.items || membersData?.members || [];

  // Show more members (up to 8) to fit better
  const displayMembers = members.slice(0, 8);
  const hasMore = members.length > 8;

  return (
    <div className={cn("bg-gradient-to-br from-white via-gray-50/30 to-white rounded-2xl border-2 border-gray-200 shadow-xl shadow-gray-200/50 p-5 hover:shadow-2xl transition-all duration-300", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          {firstGroup ? (firstGroup.name.length > 15 ? `${firstGroup.name.substring(0, 15)}...` : firstGroup.name) : "Group Members"}
        </h3>
        {firstGroup && (
          <button
            onClick={() => navigate("/groups")}
            className="text-xs text-accent-primary hover:text-accent-secondary font-bold transition-colors duration-200 hover:underline flex-shrink-0"
          >
            All
          </button>
        )}
      </div>

      {membersLoading ? (
        <div className="flex items-center justify-center py-6">
          <Spinner size="sm" />
        </div>
      ) : !groupId ? (
        <div className="text-center py-5">
          <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
            <Users className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-xs text-gray-600 font-medium mb-2">No groups yet</p>
          <button
            onClick={() => navigate("/groups")}
            className="px-3 py-1.5 bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-xs font-bold rounded-lg hover:shadow-md transition-all duration-200 hover:scale-105"
          >
            Browse
          </button>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-5">
          <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
            <Users className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-xs text-gray-600 font-medium">No members</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayMembers.map((member) => {
            const memberId = member.user_id || member.id;
            const role = member.group_role || member.role || "member";
            const initials = `${member.first_name?.[0] || ""}${member.last_name?.[0] || ""}`.toUpperCase();
            const fullName = `${member.first_name || ""} ${member.last_name || ""}`.trim();
            
            return (
              <div
                key={memberId}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 cursor-pointer group"
                onClick={() => navigate(`/groups/${groupId}`)}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-all">
                  <span className="text-xs font-bold text-gray-700">
                    {initials || "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate leading-tight">
                    {fullName || "Unknown"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge
                      variant={
                        role === "admin" || role === "owner"
                          ? "primary"
                          : role === "instructor"
                          ? "info"
                          : "default"
                      }
                      size="sm"
                      className="text-[10px] px-1.5 py-0.5 h-4"
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
          {hasMore && (
            <button
              onClick={() => navigate(`/groups/${groupId}`)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:from-accent-primary/10 hover:to-accent-secondary/10 hover:text-accent-primary transition-all duration-200 mt-2"
            >
              View All {members.length}
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupMembersCard;

