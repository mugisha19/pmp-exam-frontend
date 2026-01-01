/**
 * ProgressRing Component
 * Circular progress indicator
 */

import { cn } from "@/utils/cn";

export const ProgressRing = ({
  progress = 0,
  size = 120,
  strokeWidth = 8,
  color = "primary",
  showPercentage = true,
  label,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const colorClasses = {
    primary: "text-primary-600",
    secondary: "text-secondary-600",
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
  };

  const strokeClasses = {
    primary: "#10b981",
    secondary: "#f97316",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  };

  return (
    <div className={cn("inline-flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-bg-tertiary"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeClasses[color] || strokeClasses.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={cn(
                "text-2xl font-bold",
                colorClasses[color] || colorClasses.primary
              )}
            >
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
      {label && (
        <span className="text-sm font-medium text-text-tertiary text-center">
          {label}
        </span>
      )}
    </div>
  );
};
