/**
 * Button Component
 * Reusable button with variants, sizes, and states
 */

import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";

const variantStyles = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 border-transparent shadow-md hover:shadow-lg",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400",
  ghost:
    "bg-transparent text-text-primary hover:bg-surface-secondary border-transparent",
  danger: "bg-error text-white hover:bg-error-hover border-transparent",
  success: "bg-success text-white hover:bg-success-hover border-transparent",
  outline:
    "bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-100",
  glass:
    "relative bg-white/70 backdrop-blur-xl text-gray-600 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] hover:bg-white/80 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-blue-400/20 before:via-purple-400/20 before:to-pink-400/20 before:opacity-60 before:blur-xl before:-z-10 overflow-visible",
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
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white",
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
