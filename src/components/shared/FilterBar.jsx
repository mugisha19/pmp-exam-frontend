/**
 * FilterBar Component
 * Horizontal flex container for filter controls with responsive wrapping
 */

import { cn } from "@/utils/cn";
import { X } from "lucide-react";

export const FilterBar = ({
  children,
  onClearAll,
  activeFiltersCount = 0,
  showClearAll = true,
  className,
}) => {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {children}

      {/* Clear all button */}
      {showClearAll && activeFiltersCount > 0 && onClearAll && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X className="w-4 h-4" />
          Clear all ({activeFiltersCount})
        </button>
      )}
    </div>
  );
};

// Filter group for logical grouping
export const FilterGroup = ({ children, label, className }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && <span className="text-sm text-gray-500">{label}:</span>}
      {children}
    </div>
  );
};

// Individual filter chip/badge for showing active filters
export const FilterChip = ({ label, value, onRemove, className }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm",
        className
      )}
    >
      <span className="text-gray-500">{label}:</span>
      <span className="text-gray-900">{value}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-3 h-3 text-gray-400 hover:text-gray-900" />
        </button>
      )}
    </div>
  );
};

export default FilterBar;
