/**
 * Select Component
 * Custom styled select matching dark theme
 */

import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { ChevronDown } from "lucide-react";

const sizeStyles = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-base",
  lg: "px-5 py-4 text-lg",
};

export const Select = forwardRef(
  (
    {
      label,
      helperText,
      error,
      options = [],
      placeholder = "Select an option",
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
          <select
            ref={ref}
            className={cn(
              // Base styles
              "w-full rounded-xl bg-gray-900/50 border border-gray-600",
              "text-white placeholder:text-gray-500",
              "transition-all duration-200 appearance-none",
              "focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50",
              // Size styles
              sizeStyles[size],
              // Padding for icon
              "pr-10",
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
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown Icon */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        {(error || helperText) && (
          <p
            className={cn(
              "mt-2 text-sm",
              error ? "text-red-400 animate-shake" : "text-gray-400"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
