/**
 * Checkbox Component
 * Custom styled checkbox with label
 */

import { cn } from "@/utils/cn";
import { Check } from "lucide-react";
import { forwardRef } from "react";

export const Checkbox = forwardRef(
  ({ label, error, disabled, className, id, ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            disabled={disabled}
            className={cn(
              "peer h-5 w-5 appearance-none rounded border-2 cursor-pointer",
              "bg-gray-900/50 border-gray-600",
              "transition-all duration-200",
              "checked:bg-purple-600 checked:border-purple-600",
              "focus:outline-none focus:ring-4 focus:ring-purple-500/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-error",
              className
            )}
            {...props}
          />
          <Check className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {label && (
          <label
            htmlFor={id}
            className={cn(
              "ml-3 text-sm text-gray-300 select-none",
              !disabled && "cursor-pointer",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
