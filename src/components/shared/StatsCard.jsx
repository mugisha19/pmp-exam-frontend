/**
 * StatsCard Component
 * Display a single statistic with icon and optional trend
 */

import { cn } from "@/utils/cn";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "../ui/Card";

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  className,
  iconBgColor = "bg-purple-600/20",
  iconColor = "text-purple-400",
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend > 0) return "text-green-400";
    if (trend < 0) return "text-red-400";
    return "text-gray-400";
  };

  return (
    <Card hover className={className}>
      <CardContent padding="md">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white truncate">{value}</p>

            {(trend !== undefined || trendLabel) && (
              <div
                className={cn("flex items-center gap-1 mt-2", getTrendColor())}
              >
                {getTrendIcon()}
                {trend !== undefined && (
                  <span className="text-sm font-medium">
                    {trend > 0 ? "+" : ""}
                    {trend}%
                  </span>
                )}
                {trendLabel && (
                  <span className="text-xs text-gray-400">{trendLabel}</span>
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
