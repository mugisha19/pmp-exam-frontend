/**
 * Tabs Component
 * Tab navigation with underline indicator
 */

import { useState } from "react";
import { cn } from "@/utils/cn";

export const Tabs = ({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (newValue) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <div className={cn("", className)}>
      {typeof children === "function"
        ? children({ value, onValueChange: handleChange })
        : children}
    </div>
  );
};

export const TabsList = ({ children, className }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1 border-b border-gray-700/50",
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
};

export const TabsTrigger = ({
  value,
  children,
  className,
  activeValue,
  onValueChange,
}) => {
  const isActive = value === activeValue;

  return (
    <button
      onClick={() => onValueChange(value)}
      className={cn(
        "relative px-4 py-3 text-sm font-medium transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700",
        className
      )}
      role="tab"
      aria-selected={isActive}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
      )}
    </button>
  );
};

export const TabsContent = ({ value, children, className, activeValue }) => {
  if (value !== activeValue) return null;

  return (
    <div className={cn("mt-4 focus:outline-none", className)} role="tabpanel">
      {children}
    </div>
  );
};

// Convenience wrapper with context
export const TabsRoot = ({ defaultValue, children, className }) => {
  const [value, setValue] = useState(defaultValue);

  return (
    <Tabs value={value} onValueChange={setValue} className={className}>
      {children({ value, onValueChange: setValue })}
    </Tabs>
  );
};

export default Tabs;
