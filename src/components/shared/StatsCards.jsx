/**
 * DashboardStatsCards Component
 * Reusable stats cards for dashboard statistics display
 */

import { cn } from "@/utils/cn";

export const DashboardStatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-accent-primary" />
          </div>
        )}
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs">
          <span className={cn(
            trend.value > 0 ? "text-success" : trend.value < 0 ? "text-error" : "text-gray-500"
          )}>
            {trend.value > 0 ? "↑" : trend.value < 0 ? "↓" : "→"} {Math.abs(trend.value)}%
          </span>
          <span className="text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export const StatsGrid = ({ children, className }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {children}
    </div>
  );
};

export default DashboardStatsCard;

