/**
 * AchievementBadge Component
 * Display achievement badges with details
 */

import { Trophy, Star, Zap, Target, Award, Medal } from "lucide-react";
import { cn } from "@/utils/cn";

export const AchievementBadge = ({
  achievement,
  size = "md",
  unlocked = false,
  className,
}) => {
  const icons = {
    trophy: Trophy,
    star: Star,
    zap: Zap,
    target: Target,
    award: Award,
    medal: Medal,
  };

  const Icon = icons[achievement?.icon] || Trophy;

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className={cn("text-center", className)}>
      <div className="relative inline-block mb-3">
        {/* Badge Container */}
        <div
          className={cn(
            "relative flex items-center justify-center rounded-full transition-all duration-300",
            sizeClasses[size],
            unlocked
              ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30"
              : "bg-bg-tertiary opacity-40 grayscale"
          )}
        >
          <Icon
            className={cn(
              iconSizes[size],
              unlocked ? "text-white" : "text-text-muted"
            )}
          />
        </div>

        {/* Unlock Indicator */}
        {unlocked && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-white flex items-center justify-center">
            <Star className="w-3 h-3 text-white fill-current" />
          </div>
        )}
      </div>

      {/* Badge Info */}
      <h4
        className={cn(
          "font-semibold mb-1",
          unlocked ? "text-text-primary" : "text-text-muted"
        )}
      >
        {achievement?.title || "Achievement"}
      </h4>
      {achievement?.description && (
        <p className="text-xs text-text-tertiary max-w-[200px]">
          {achievement.description}
        </p>
      )}
      {achievement?.date && unlocked && (
        <p className="text-xs text-text-muted mt-1">
          Earned {new Date(achievement.date).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};
