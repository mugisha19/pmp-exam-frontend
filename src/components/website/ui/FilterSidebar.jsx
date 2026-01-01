/**
 * FilterSidebar Component
 * Sidebar with filter options
 */

import { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/utils/cn";

export const FilterSidebar = ({
  filters,
  selectedFilters,
  onChange,
  onClear,
  className,
}) => {
  const [expandedSections, setExpandedSections] = useState(
    filters?.map((_, idx) => idx) || []
  );

  const toggleSection = (idx) => {
    setExpandedSections((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleFilterChange = (filterKey, value) => {
    const currentValues = selectedFilters[filterKey] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onChange({
      ...selectedFilters,
      [filterKey]: newValues,
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(selectedFilters || {}).reduce(
      (sum, values) => sum + (Array.isArray(values) ? values.length : 0),
      0
    );
  };

  if (!filters || filters.length === 0) return null;

  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm border border-border-light",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
        <div>
          <h3 className="font-bold text-text-primary">Filters</h3>
          {getActiveFilterCount() > 0 && (
            <p className="text-xs text-text-tertiary mt-0.5">
              {getActiveFilterCount()} active
            </p>
          )}
        </div>
        {getActiveFilterCount() > 0 && (
          <button
            onClick={onClear}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="divide-y divide-border-light max-h-[600px] overflow-y-auto">
        {filters.map((filter, idx) => {
          const isExpanded = expandedSections.includes(idx);
          const selectedCount = (selectedFilters[filter.key] || []).length;

          return (
            <div key={filter.key}>
              {/* Section Header */}
              <button
                onClick={() => toggleSection(idx)}
                className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-bg-secondary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">
                    {filter.label}
                  </span>
                  {selectedCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-primary-100 text-primary-700 rounded-full">
                      {selectedCount}
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-text-muted" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-text-muted" />
                )}
              </button>

              {/* Filter Options */}
              {isExpanded && (
                <div className="px-6 pb-4 space-y-2">
                  {filter.options.map((option) => {
                    const isSelected = (
                      selectedFilters[filter.key] || []
                    ).includes(option.value);

                    return (
                      <label
                        key={option.value}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            handleFilterChange(filter.key, option.value)
                          }
                          className="w-4 h-4 text-primary-600 border-border-DEFAULT rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                          {option.label}
                        </span>
                        {option.count !== undefined && (
                          <span className="ml-auto text-xs text-text-muted">
                            ({option.count})
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
