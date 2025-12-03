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
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            // Base styles
            "w-full rounded-xl bg-white border border-gray-300",
            "text-gray-900 placeholder:text-gray-400",
            "transition-all duration-200",
            "focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50",
            // Padding
            "px-4 py-3",
            // Resize
            resizeStyles[resize],
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

Textarea.displayName = "Textarea";

export default Textarea;
