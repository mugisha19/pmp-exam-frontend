/**
 * Badge Component
 * Small label/tag component with different variants
 */

import { cn } from "@/utils/cn";

const variantStyles = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-50 text-green-700 ring-1 ring-green-200",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  error: "bg-red-50 text-red-700 ring-1 ring-red-200",
  info: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  primary: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
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
