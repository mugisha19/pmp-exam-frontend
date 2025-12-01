/**
 * Button Component
 * Reusable button with variants, sizes, and states
 */

import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";

const variantStyles = {
  primary:
    "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 border-transparent shadow-lg hover:shadow-xl",
  secondary: "bg-gray-700 text-white border border-gray-600 hover:bg-gray-600",
  ghost:
    "bg-transparent text-text-primary hover:bg-surface-secondary border-transparent",
  danger: "bg-error text-white hover:bg-error-hover border-transparent",
  success: "bg-success text-white hover:bg-success-hover border-transparent",
};

const sizeStyles = {
  xs: "px-3 py-1.5 text-xs",
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
  xl: "px-10 py-5 text-xl",
};

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  as = "button",
  ...props
}) => {
  const Component = as;
  const isDisabled = disabled || loading;

  return (
    <Component
      className={cn(
        // Base styles
        "inline-flex items-center justify-center gap-2",
        "font-medium rounded-full border",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        // Variant styles
        variantStyles[variant],
        // Size styles
        sizeStyles[size],
        // Full width
        fullWidth && "w-full",
        // Disabled state
        isDisabled && "pointer-events-none",
        // Custom className
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && (
        <span className="inline-flex">{rightIcon}</span>
      )}
    </Component>
  );
};

export default Button;
