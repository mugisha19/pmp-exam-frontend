/**
 * StatusBadge Component
 * Auto-maps status strings to appropriate colors
 */

import { cn } from "@/utils/cn";

// Status to color mapping
const statusColorMap = {
  // Active/Positive states
  active: "bg-green-500/10 text-green-400 border-green-500/20",
  published: "bg-green-500/10 text-green-400 border-green-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  success: "bg-green-500/10 text-green-400 border-green-500/20",
  verified: "bg-green-500/10 text-green-400 border-green-500/20",
  online: "bg-green-500/10 text-green-400 border-green-500/20",
  enabled: "bg-green-500/10 text-green-400 border-green-500/20",
  passed: "bg-green-500/10 text-green-400 border-green-500/20",

  // Inactive/Neutral states
  inactive: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  pending: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  disabled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  offline: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  archived: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  unknown: "bg-gray-500/10 text-gray-400 border-gray-500/20",

  // Scheduled/Info states
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  upcoming: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "in-progress": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  inprogress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  started: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  reviewing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",

  // Warning states
  warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  expiring: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "needs-attention": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  needs_attention: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  review: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "awaiting-review": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",

  // Completed/Done states
  finished: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  done: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  graded: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  submitted: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  closed: "bg-slate-500/10 text-slate-600 border-slate-500/20",

  // Error/Cancelled states
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  canceled: "bg-red-500/10 text-red-400 border-red-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  expired: "bg-red-500/10 text-red-400 border-red-500/20",
  blocked: "bg-red-500/10 text-red-400 border-red-500/20",
  suspended: "bg-red-500/10 text-red-400 border-red-500/20",
  banned: "bg-red-500/10 text-red-400 border-red-500/20",
};

// Size variants
const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export const StatusBadge = ({
  status,
  label,
  variant,
  size = "md",
  dot = false,
  className,
}) => {
  // Normalize status string
  const normalizedStatus =
    status?.toLowerCase().replace(/\s+/g, "-") || "unknown";

  // Get color from map or use variant override or default to gray
  const colorClass =
    variant || statusColorMap[normalizedStatus] || statusColorMap.unknown;

  // Display label (use label prop or capitalize status)
  const displayLabel =
    label ||
    status?.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ||
    "Unknown";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border",
        sizeClasses[size],
        colorClass,
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            // Extract text color and make it background
            colorClass.includes("green") && "bg-green-400",
            colorClass.includes("gray") && "bg-gray-400",
            colorClass.includes("blue") && "bg-blue-400",
            colorClass.includes("yellow") && "bg-yellow-400",
            colorClass.includes("emerald") && "bg-emerald-500",
            colorClass.includes("teal") && "bg-teal-500",
            colorClass.includes("cyan") && "bg-cyan-500",
            colorClass.includes("slate") && "bg-slate-500",
            colorClass.includes("red") && "bg-red-400"
          )}
        />
      )}
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
