/**
 * Textarea Component
 * Multiline input matching Input style
 */

import { forwardRef } from "react";
import { cn } from "@/utils/cn";

export const Textarea = forwardRef(
  (
    {
      label,
      helperText,
      error,
      rows = 4,
      resize = "vertical",
      className,
      wrapperClassName,
      ...props
    },
    ref
  ) => {
    const resizeStyles = {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x",
      both: "resize",
    };

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

        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            // Base styles
            "w-full rounded-xl bg-gray-900/50 border border-gray-600",
            "text-white placeholder:text-gray-500",
            "transition-all duration-200",
            "focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50",
            // Padding
            "px-4 py-3",
            // Resize
            resizeStyles[resize],
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

Textarea.displayName = "Textarea";

export default Textarea;
