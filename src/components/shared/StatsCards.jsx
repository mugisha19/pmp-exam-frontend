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
        "bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border-2 border-gray-100 shadow-lg shadow-gray-100/50 p-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:scale-105 hover:border-accent-primary/20",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-600 font-medium">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center flex-shrink-0 shadow-md shadow-accent-primary/10">
            <Icon className="w-6 h-6 text-accent-primary" />
          </div>
        )}
      </div>
      {trend && (
        <div className="flex items-center gap-2 text-sm pt-3 border-t border-gray-100">
          <span className={cn(
            "font-semibold",
            trend.value > 0 ? "text-green-600" : trend.value < 0 ? "text-red-600" : "text-gray-500"
          )}>
            {trend.value > 0 ? "↑" : trend.value < 0 ? "↓" : "→"} {Math.abs(trend.value)}%
          </span>
          <span className="text-gray-600 font-medium">{trend.label}</span>
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

