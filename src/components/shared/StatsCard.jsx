/**
 * StatsCard Component
 * Display a single statistic with icon and optional trend
 */

import { cn } from "@/utils/cn";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection, // 'up' | 'down' | 'neutral'
  trendLabel,
  subtitle,
  loading = false,
  className,
  iconBgColor = "bg-blue-100",
  iconColor = "text-blue-600",
}) => {
  const getTrendIcon = () => {
    if (trendDirection === "up" || trend > 0)
      return <TrendingUp className="w-4 h-4" />;
    if (trendDirection === "down" || trend < 0)
      return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trendDirection === "up" || trend > 0) return "text-green-400";
    if (trendDirection === "down" || trend < 0) return "text-red-400";
    return "text-gray-400";
  };

  // Loading skeleton state
  if (loading) {
    return (
      <Card hover className={className}>
        <CardContent padding="md">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <Skeleton width={80} height={16} className="mb-2" />
              <Skeleton width={60} height={32} className="mb-2" />
              <Skeleton width={100} height={14} />
            </div>
            <Skeleton
              width={48}
              height={48}
              rounded
              className="flex-shrink-0"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card hover className={className}>
      <CardContent padding="md">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>

            {(trend !== undefined || trendLabel || subtitle) && (
              <div className="flex items-center gap-2 mt-2">
                {trend !== undefined && (
                  <div
                    className={cn("flex items-center gap-1", getTrendColor())}
                  >
                    {getTrendIcon()}
                    <span className="text-sm font-medium">
                      {trend > 0 ? "+" : ""}
                      {trend}%
                    </span>
                  </div>
                )}
                {(trendLabel || subtitle) && (
                  <span className="text-xs text-gray-400">
                    {trendLabel || subtitle}
                  </span>
                )}
              </div>
            )}
          </div>

          {Icon && (
            <div className={cn("p-3 rounded-xl flex-shrink-0", iconBgColor)}>
              <Icon className={cn("w-6 h-6", iconColor)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
