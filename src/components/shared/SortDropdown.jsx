/**
 * SortDropdown Component
 * Dropdown for sorting options
 */

import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { useState, useRef, useEffect } from "react";

export const SortDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Sort by",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg",
          "hover:border-gray-300 transition-colors text-sm font-medium text-gray-700"
        )}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronDown
          className={cn("w-4 h-4 text-gray-400 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange?.(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors",
                value === option.value && "bg-accent-primary/10 text-accent-primary font-medium"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;

