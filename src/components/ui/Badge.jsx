/**
 * Badge Component
 * Small label/tag component with different variants
 */

import { cn } from "@/utils/cn";

const variantStyles = {
  default: "bg-gray-700 text-gray-200",
  success: "bg-green-600/20 text-green-400 ring-1 ring-green-600/30",
  warning: "bg-yellow-600/20 text-yellow-400 ring-1 ring-yellow-600/30",
  error: "bg-red-600/20 text-red-400 ring-1 ring-red-600/30",
  info: "bg-blue-600/20 text-blue-400 ring-1 ring-blue-600/30",
  purple: "bg-purple-600/20 text-purple-400 ring-1 ring-purple-600/30",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

export const Badge = ({
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
