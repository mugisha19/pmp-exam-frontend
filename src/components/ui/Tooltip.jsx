/**
 * Tooltip Component
 * Hover tooltip with multiple positions
 */

import { useState } from "react";
import { cn } from "@/utils/cn";

const positionStyles = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowStyles = {
  top: "top-full left-1/2 -translate-x-1/2 -mt-1 border-t-gray-800 border-x-transparent border-b-transparent",
  bottom:
    "bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-gray-800 border-x-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 -ml-1 border-l-gray-800 border-y-transparent border-r-transparent",
  right:
    "right-full top-1/2 -translate-y-1/2 -mr-1 border-r-gray-800 border-y-transparent border-l-transparent",
};

export const Tooltip = ({
  children,
  content,
  position = "top",
  delay = 200,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const showTooltip = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(false);
  };

  if (!content) return children;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      {isVisible && (
        <div
          className={cn(
            "absolute z-50 whitespace-nowrap",
            "px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-xl",
            "pointer-events-none animate-in fade-in zoom-in-95 duration-200",
            "border border-gray-700/50",
            positionStyles[position],
            className
          )}
          role="tooltip"
        >
          {content}
          {/* Arrow */}
          <div
            className={cn("absolute w-0 h-0 border-4", arrowStyles[position])}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
