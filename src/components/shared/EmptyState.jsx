/**
 * EmptyState Component
 * Display when there's no data or content
 */

import { cn } from "@/utils/cn";
import { Inbox } from "lucide-react";
import { Button } from "../ui/Button";

export const EmptyState = ({
  icon: IconComponent = Inbox,
  title = "No data found",
  description = "There's nothing to display here yet.",
  action,
  actionLabel = "Get started",
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      {/* Icon */}
      <div className="mb-4 p-4 bg-gray-100 rounded-2xl">
        <IconComponent className="w-12 h-12 text-gray-400" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-500 max-w-md mb-6">{description}</p>
      )}

      {/* Action Button */}
      {(action || onAction) && (
        <div>
          {action || (
            <Button onClick={onAction} variant="primary">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
