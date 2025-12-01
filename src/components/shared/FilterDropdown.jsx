/**
 * FilterDropdown Component
 * Dropdown for filtering with multiple options
 */

import { useState, useRef, useEffect } from "react";
import { cn } from "@/utils/cn";
import { Filter, Check } from "lucide-react";

export const FilterDropdown = ({
  label = "Filter",
  options = [],
  value: controlledValue,
  onChange,
  multiple = false,
  placeholder = "Select filters...",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(
    controlledValue || (multiple ? [] : null)
  );
  const dropdownRef = useRef(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    let newValue;

    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      newValue = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];
    } else {
      newValue = optionValue;
      setIsOpen(false);
    }

    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const isSelected = (optionValue) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  const getSelectedLabel = () => {
    if (multiple) {
      const selectedOptions = options.filter(
        (opt) => Array.isArray(value) && value.includes(opt.value)
      );
      if (selectedOptions.length === 0) return placeholder;
      if (selectedOptions.length === 1) return selectedOptions[0].label;
      return `${selectedOptions.length} selected`;
    }

    const selectedOption = options.find((opt) => opt.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  };

  const handleClear = (e) => {
    e.stopPropagation();
    const newValue = multiple ? [] : null;
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const hasSelection = multiple
    ? Array.isArray(value) && value.length > 0
    : value !== null && value !== undefined;

  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl",
          "bg-gray-800 text-white border border-gray-700",
          "hover:bg-gray-700 hover:border-gray-600 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        )}
      >
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-sm">
          {label}: {getSelectedLabel()}
        </span>
        {hasSelection && (
          <button
            onClick={handleClear}
            className="ml-1 hover:text-red-400 transition-colors"
            aria-label="Clear filter"
          >
            ✕
          </button>
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[200px] right-0",
            "bg-gray-800 rounded-xl shadow-2xl border border-gray-700/50",
            "py-2 animate-in fade-in slide-in-from-top-2 duration-200"
          )}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              disabled={option.disabled}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-sm",
                "transition-colors",
                isSelected(option.value)
                  ? "bg-purple-600/20 text-white"
                  : "text-gray-200 hover:bg-gray-700/50",
                option.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <span>{option.label}</span>
              {isSelected(option.value) && (
                <Check className="w-4 h-4 text-purple-400" />
              )}
            </button>
          ))}

          {options.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
