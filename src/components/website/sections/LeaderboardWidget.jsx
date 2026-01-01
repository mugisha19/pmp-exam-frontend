/**
 * LeaderboardWidget Component
 * Display top performers
 */

import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { cn } from "@/utils/cn";

export const LeaderboardWidget = ({
  title = "Top Performers",
  data,
  className,
}) => {
  // Mock data if none provided
  const leaderboardData = data || [
    { rank: 1, name: "Alex Chen", score: 98, avatar: "AC", trend: "up" },
    { rank: 2, name: "Sarah Kim", score: 96, avatar: "SK", trend: "same" },
    { rank: 3, name: "Mike Johnson", score: 95, avatar: "MJ", trend: "up" },
    { rank: 4, name: "Emma Davis", score: 93, avatar: "ED", trend: "down" },
    { rank: 5, name: "Chris Lee", score: 92, avatar: "CL", trend: "up" },
  ];

  const getMedalIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-amber-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-600" />;
    return null;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "from-amber-50 to-amber-100";
    if (rank === 2) return "from-slate-50 to-slate-100";
    if (rank === 3) return "from-orange-50 to-orange-100";
    return "";
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-border-light overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-light bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm">
            <Trophy className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">{title}</h3>
            <p className="text-xs text-text-tertiary">This week's champions</p>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="divide-y divide-border-light">
        {leaderboardData.map((entry) => (
          <div
            key={entry.rank}
            className={cn(
              "flex items-center gap-4 px-6 py-4 transition-colors hover:bg-bg-secondary",
              entry.rank <= 3 && `bg-gradient-to-r ${getRankColor(entry.rank)}`
            )}
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
              {getMedalIcon(entry.rank) || (
                <span className="text-sm font-bold text-text-muted">
                  #{entry.rank}
                </span>
              )}
            </div>

            {/* Avatar */}
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm flex-shrink-0",
                entry.rank === 1 &&
                  "bg-gradient-to-br from-amber-400 to-amber-600 text-white",
                entry.rank === 2 &&
                  "bg-gradient-to-br from-slate-300 to-slate-500 text-white",
                entry.rank === 3 &&
                  "bg-gradient-to-br from-orange-400 to-orange-600 text-white",
                entry.rank > 3 && "bg-primary-100 text-primary-700"
              )}
            >
              {entry.avatar}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-text-primary truncate">
                {entry.name}
              </div>
              <div className="text-xs text-text-muted">Student</div>
            </div>

            {/* Score */}
            <div className="text-right">
              <div
                className={cn(
                  "text-lg font-bold",
                  entry.rank === 1 && "text-amber-600",
                  entry.rank === 2 && "text-slate-600",
                  entry.rank === 3 && "text-orange-600",
                  entry.rank > 3 && "text-primary-600"
                )}
              >
                {entry.score}%
              </div>
              {entry.trend && (
                <div
                  className={cn(
                    "text-xs flex items-center justify-end gap-0.5",
                    entry.trend === "up" && "text-success",
                    entry.trend === "down" && "text-error",
                    entry.trend === "same" && "text-text-muted"
                  )}
                >
                  {entry.trend === "up" && "↑"}
                  {entry.trend === "down" && "↓"}
                  {entry.trend === "same" && "—"}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View All */}
      <div className="px-6 py-4 bg-bg-secondary">
        <button className="w-full py-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
          View Full Leaderboard →
        </button>
      </div>
    </div>
  );
};
