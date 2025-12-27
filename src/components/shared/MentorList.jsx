/**
 * MentorList Component
 * List of instructors/mentors in right sidebar
 */

import { UserPlus, Plus } from "lucide-react";
import { cn } from "@/utils/cn";
import { useNavigate } from "react-router-dom";

export const MentorList = ({ mentors = [], className, onSeeAll }) => {
  const navigate = useNavigate();

  const displayMentors = mentors.slice(0, 5);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Your Mentor</h3>
        <button className="text-accent-primary hover:text-accent-secondary transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {displayMentors.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            No mentors available
          </div>
        ) : (
          displayMentors.map((mentor) => (
          <div
            key={mentor.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-xs">
                {getInitials(mentor.name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{mentor.name}</p>
              <p className="text-xs text-gray-500 truncate">{mentor.role}</p>
            </div>
            <button className="px-3 py-1 bg-accent-primary text-white text-xs font-medium rounded-lg hover:bg-accent-secondary transition-colors flex-shrink-0">
              Follow
            </button>
          </div>
          ))
        )}
      </div>

      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="w-full mt-4 py-2 bg-accent-primary text-white text-sm font-medium rounded-lg hover:bg-accent-secondary transition-colors"
        >
          See All
        </button>
      )}
    </div>
  );
};

export default MentorList;

