/**
 * ViewToggle Component
 * Toggle between grid and list view
 */

import { Grid3x3, List } from "lucide-react";
import { cn } from "@/utils/cn";

export const ViewToggle = ({ view = "grid", onChange, className }) => {
  return (
    <div className={cn("flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1", className)}>
      <button
        onClick={() => onChange?.("grid")}
        className={cn(
          "p-2 rounded transition-colors",
          view === "grid"
            ? "bg-accent-primary text-white"
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
        )}
        aria-label="Grid view"
      >
        <Grid3x3 className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange?.("list")}
        className={cn(
          "p-2 rounded transition-colors",
          view === "list"
            ? "bg-accent-primary text-white"
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
        )}
        aria-label="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ViewToggle;

