/**
 * StatsRibbon Component
 * Horizontal stats display for quick metrics
 */

import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { AnimatedCounter } from "../ui/AnimatedCounter";

export const StatsRibbon = ({ stats, className }) => {
  if (!stats || stats.length === 0) return null;

  return (
    <div className={cn("bg-white border-y border-border-light", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  {Icon && (
                    <div
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg",
                        stat.color === "primary" &&
                          "bg-primary-100 text-primary-600",
                        stat.color === "secondary" &&
                          "bg-secondary-100 text-secondary-600",
                        stat.color === "success" &&
                          "bg-green-100 text-green-600",
                        stat.color === "warning" &&
                          "bg-amber-100 text-amber-600",
                        !stat.color && "bg-primary-100 text-primary-600"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex items-baseline justify-center md:justify-start gap-2">
                  <div className="text-3xl font-bold text-text-primary">
                    {stat.animated ? (
                      <AnimatedCounter value={stat.value} />
                    ) : (
                      stat.value
                    )}
                  </div>
                  {stat.trend && (
                    <div
                      className={cn(
                        "flex items-center gap-1 text-sm font-medium",
                        stat.trend > 0 ? "text-success" : "text-error"
                      )}
                    >
                      {stat.trend > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {Math.abs(stat.trend)}%
                    </div>
                  )}
                </div>
                <div className="text-sm text-text-tertiary font-medium mt-1">
                  {stat.label}
                </div>
                {stat.subtext && (
                  <div className="text-xs text-text-muted mt-0.5">
                    {stat.subtext}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
