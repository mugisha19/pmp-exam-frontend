/**
 * Input Component
 * Styled input field with label, error states, and icons
 */

import { cn } from "@/utils/cn";
import { forwardRef } from "react";

const sizeStyles = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-base",
  lg: "px-5 py-4 text-lg",
};

export const Input = forwardRef(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      size = "md",
      className,
      wrapperClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("w-full", wrapperClassName)}>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={cn(
              // Base styles
              "w-full rounded-xl bg-gray-900/50 border border-gray-600",
              "text-white placeholder:text-gray-500",
              "transition-all duration-200",
              "focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50",
              // Size styles
              sizeStyles[size],
              // Icon padding
              leftIcon && "pl-11",
              rightIcon && "pr-11",
              // Error state
              error
                ? "border-red-500 focus:ring-red-500/50 focus:border-red-500"
                : "hover:border-gray-500",
              // Disabled state
              props.disabled && "opacity-50 cursor-not-allowed bg-gray-900/30",
              // Custom className
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={cn(
              "mt-2 text-sm",
              error ? "text-error animate-shake" : "text-text-tertiary"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
