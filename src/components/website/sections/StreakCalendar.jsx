/**
 * StreakCalendar Component
 * GitHub-style activity heatmap for learning streak
 */

import { useState, useMemo } from "react";
import { cn } from "@/utils/cn";
import { Flame } from "lucide-react";

export const StreakCalendar = ({ data, className }) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Generate last 12 weeks of days
  const days = useMemo(() => {
    const daysList = [];
    const today = new Date();
    for (let i = 83; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      daysList.push(date);
    }
    return daysList;
  }, []);

  const weeks = useMemo(() => {
    const weeksList = [];
    for (let i = 0; i < days.length; i += 7) {
      weeksList.push(days.slice(i, i + 7));
    }
    return weeksList;
  }, [days]);

  // Deterministic pseudo-random based on date (pure function)
  const getActivityLevel = (date) => {
    // Use date as seed for deterministic "random" value
    const dateStr = date.toDateString();
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash << 5) - hash + dateStr.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    const normalized = Math.abs(hash % 100) / 100;

    if (normalized < 0.3) return 0;
    if (normalized < 0.5) return 1;
    if (normalized < 0.7) return 2;
    if (normalized < 0.9) return 3;
    return 4;
  };

  const getColorClass = (level) => {
    if (level === 0) return "bg-bg-tertiary";
    if (level === 1) return "bg-primary-200";
    if (level === 2) return "bg-primary-400";
    if (level === 3) return "bg-primary-600";
    return "bg-primary-800";
  };

  const currentStreak = 12;
  const longestStreak = 28;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-border-light p-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Flame className="w-5 h-5 text-secondary-500" />
            Learning Streak
          </h3>
          <p className="text-sm text-text-tertiary mt-1">
            Keep the momentum going!
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-secondary-600">
            {currentStreak}
          </div>
          <div className="text-xs text-text-muted">day streak</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="inline-flex gap-1">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map((day, dayIdx) => {
                const level = getActivityLevel(day);
                const dateStr = day.toLocaleDateString();
                return (
                  <div
                    key={dayIdx}
                    onMouseEnter={() => setHoveredDay({ date: dateStr, level })}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={cn(
                      "w-3 h-3 rounded-sm transition-all cursor-pointer hover:ring-2 hover:ring-primary-400",
                      getColorClass(level)
                    )}
                    title={`${dateStr}: ${level} activities`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-light">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn("w-3 h-3 rounded-sm", getColorClass(level))}
              />
            ))}
          </div>
          <span>More</span>
        </div>
        <div className="text-xs text-text-tertiary">
          Longest:{" "}
          <span className="font-semibold text-text-secondary">
            {longestStreak} days
          </span>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div className="mt-3 p-2 bg-bg-secondary rounded-lg text-xs text-text-secondary">
          {hoveredDay.date}: {hoveredDay.level}{" "}
          {hoveredDay.level === 1 ? "activity" : "activities"}
        </div>
      )}
    </div>
  );
};
