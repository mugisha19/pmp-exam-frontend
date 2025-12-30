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
    <div className={cn("bg-gradient-to-br from-white via-gray-50/30 to-white rounded-2xl border-2 border-gray-200 shadow-xl shadow-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300", className)}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Your Mentor</h3>
        <button className="text-accent-primary hover:text-accent-secondary transition-all duration-200 p-2 rounded-xl hover:bg-accent-primary/10 hover:scale-110">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        {displayMentors.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-600 font-medium bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border-2 border-dashed border-gray-200">
            No mentors available
          </div>
        ) : (
          displayMentors.map((mentor) => (
          <div
            key={mentor.id}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-accent-primary/20">
              <span className="text-white font-bold text-sm">
                {getInitials(mentor.name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{mentor.name}</p>
              <p className="text-xs text-gray-600 truncate font-medium">{mentor.role}</p>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-xs font-bold rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 flex-shrink-0">
              Follow
            </button>
          </div>
          ))
        )}
      </div>

      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="w-full mt-5 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          See All
        </button>
      )}
    </div>
  );
};

export default MentorList;

