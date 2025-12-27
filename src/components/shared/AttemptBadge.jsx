/**
 * AttemptBadge Component
 * Badge showing attempt information
 */

import { Trophy, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import { format } from "date-fns";

export const AttemptBadge = ({
  attempts = 0,
  bestScore = null,
  lastAttemptDate = null,
  maxAttempts = null,
  className,
}) => {
  const remainingAttempts = maxAttempts ? maxAttempts - attempts : null;
  const hasAttempts = attempts > 0;

  return (
    <div className={cn("flex flex-wrap items-center gap-3 text-xs", className)}>
      {hasAttempts && (
        <>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-full">
            <CheckCircle className="w-3 h-3 text-gray-600" />
            <span className="font-medium text-gray-700">{attempts} attempt{attempts !== 1 ? "s" : ""}</span>
          </div>
          {bestScore !== null && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-accent-primary/10 rounded-full">
              <Trophy className="w-3 h-3 text-accent-primary" />
              <span className="font-medium text-accent-primary">Best: {bestScore}%</span>
            </div>
          )}
          {lastAttemptDate && (() => {
            try {
              const date = new Date(lastAttemptDate);
              if (!isNaN(date.getTime())) {
                return (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-full">
                    <Clock className="w-3 h-3 text-gray-600" />
                    <span className="text-gray-600">
                      {format(date, "MMM d, yyyy")}
                    </span>
                  </div>
                );
              }
            } catch {
              // Invalid date, skip
            }
            return null;
          })()}
        </>
      )}
      {!hasAttempts && (
        <span className="text-gray-500">No attempts yet</span>
      )}
      {remainingAttempts !== null && (
        <div className={cn(
          "px-2 py-1 rounded-full font-medium",
          remainingAttempts > 0
            ? "bg-success/10 text-success"
            : "bg-error/10 text-error"
        )}>
          {remainingAttempts > 0 ? `${remainingAttempts} remaining` : "No attempts left"}
        </div>
      )}
    </div>
  );
};

export default AttemptBadge;

