/**
 * Input Component
 * Styled input field with label, error states, and icons
 */

import { cn } from "@/utils/cn";
import { forwardRef } from "react";

const sizeStyles = {
  sm: "px-3 py-2 text-xs sm:text-sm",
  md: "px-3 py-2.5 text-sm sm:px-4 sm:py-3 sm:text-base",
  lg: "px-4 py-3 text-base sm:px-5 sm:py-4 sm:text-lg",
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
            className="block text-sm font-medium text-gray-700 mb-2"
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
              "w-full rounded-lg sm:rounded-xl bg-white border border-gray-300",
              "text-gray-900 placeholder:text-gray-400",
              "transition-all duration-200",
              "focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50",
              "min-h-[44px]",
              // Size styles
              sizeStyles[size],
              // Icon padding
              leftIcon && "pl-10 sm:pl-11",
              rightIcon && "pr-10 sm:pr-11",
              // Error state
              error
                ? "border-red-500 focus:ring-red-500/50 focus:border-red-500"
                : "hover:border-gray-400",
              // Disabled state
              props.disabled && "opacity-50 cursor-not-allowed bg-gray-100",
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
