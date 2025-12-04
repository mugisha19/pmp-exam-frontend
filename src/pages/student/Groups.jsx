/**
 * Student Groups Page
 * View all groups the student is a member of
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, Clock, Search } from "lucide-react";
import { useMyGroups } from "@/hooks/queries/useGroupQueries";
import StudentLayout from "@/components/layouts/StudentLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Format date for display
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "Not set";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const Groups = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user's groups
  const { data: groups, isLoading, isError } = useMyGroups();

  // Filter groups based on search
  const filteredGroups = groups?.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <StudentLayout
      title="My Groups"
      subtitle="View and manage your group memberships"
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton height={24} className="mb-4" />
                  <Skeleton height={16} className="mb-2" />
                  <Skeleton height={16} className="mb-4" />
                  <Skeleton height={40} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <EmptyState
            icon={Users}
            title="Failed to load groups"
            description="There was an error loading your groups. Please try again."
          />
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredGroups?.length === 0 && (
          <EmptyState
            icon={Users}
            title={searchQuery ? "No groups found" : "No groups yet"}
            description={
              searchQuery
                ? "Try adjusting your search terms"
                : "You haven't joined any groups yet. Join a group using an invite link to get started."
            }
          />
        )}

        {/* Groups Grid */}
        {!isLoading &&
          !isError &&
          filteredGroups &&
          filteredGroups.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.group_id}
                  group={group}
                  onClick={() => navigate(`/student/groups/${group.group_id}`)}
                />
              ))}
            </div>
          )}
      </div>
    </StudentLayout>
  );
};

/**
 * Group Card Component
 */
const GroupCard = ({ group, onClick }) => {
  const isPrivate = group.group_type === "private" || group.type === "private";

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {group.name}
            </h3>
            <StatusBadge status={group.status || "active"} size="sm" />
          </div>
          {group.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {group.description}
            </p>
          )}
        </div>

        {/* Info */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{group.member_count || 0} members</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(group.from_date || group.start_date)} -{" "}
              {formatDate(group.to_date || group.end_date)}
            </span>
          </div>
          {group.quiz_count !== undefined && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{group.quiz_count} quizzes</span>
            </div>
          )}
        </div>

        {/* Type Badge */}
        <Badge variant={isPrivate ? "warning" : "success"} size="sm">
          {isPrivate ? "Private" : "Public"}
        </Badge>
      </CardContent>
    </Card>
  );
};

export default Groups;
