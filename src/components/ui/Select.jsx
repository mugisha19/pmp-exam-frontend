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
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={cn(
              // Base styles
              "w-full rounded-xl bg-white border border-gray-300",
              "text-gray-900 placeholder:text-gray-400",
              "transition-all duration-200 appearance-none",
              "focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50",
              // Size styles
              sizeStyles[size],
              // Padding for icon
              "pr-10",
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
              error ? "text-red-500 animate-shake" : "text-gray-500"
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
