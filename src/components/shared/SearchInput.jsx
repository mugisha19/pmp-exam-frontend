/**
 * SearchInput Component
 * Search input with debounced onChange
 */

import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/utils/cn";

export const SearchInput = ({
  placeholder = "Search...",
  value: controlledValue,
  onChange,
  onClear,
  debounceMs = 300,
  className,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue || "");

  // Sync with controlled value
  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== internalValue) {
      setInternalValue(controlledValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledValue]);

  // Debounced onChange
  useEffect(() => {
    if (!onChange) return;

    const timeoutId = setTimeout(() => {
      onChange(internalValue);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [internalValue, debounceMs, onChange]);

  const handleChange = (e) => {
    setInternalValue(e.target.value);
  };

  const handleClear = useCallback(() => {
    setInternalValue("");
    onClear?.();
    onChange?.("");
  }, [onClear, onChange]);

  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <Search className="w-5 h-5" />
      </div>

      <input
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "w-full pl-12 pr-12 py-3 rounded-xl",
          "bg-white border border-gray-300",
          "text-gray-900 placeholder:text-gray-400",
          "transition-all duration-200",
          "focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50",
          "hover:border-gray-400"
        )}
        {...props}
      />

      {internalValue && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
