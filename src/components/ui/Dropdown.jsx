/**
 * Dropdown Component
 * Dropdown menu with click-outside-to-close
 */

import { useState, useRef, useEffect } from "react";
import { cn } from "@/utils/cn";
import { ChevronDown } from "lucide-react";

export const Dropdown = ({ trigger, children, align = "left", className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const alignmentStyles = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger || (
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
            Menu
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[200px]",
            "bg-gray-800 rounded-xl shadow-2xl border border-gray-700/50",
            "py-2 animate-in fade-in slide-in-from-top-2 duration-200",
            alignmentStyles[align],
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({
  children,
  onClick,
  icon: Icon,
  danger = false,
  disabled = false,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm",
        "transition-colors",
        !disabled && !danger && "text-gray-200 hover:bg-gray-700/50",
        !disabled && danger && "text-red-400 hover:bg-red-600/10",
        disabled && "text-gray-500 cursor-not-allowed opacity-50",
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

export const DropdownDivider = () => {
  return <div className="my-1 border-t border-gray-700/50" />;
};

export const DropdownLabel = ({ children, className }) => {
  return (
    <div
      className={cn(
        "px-4 py-2 text-xs font-medium text-gray-500 uppercase",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Dropdown;
