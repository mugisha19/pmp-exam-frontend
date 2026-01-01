/**
 * Breadcrumbs Component
 * Navigation breadcrumbs for detail pages
 */

import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/utils/cn";

export const Breadcrumbs = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 text-text-tertiary hover:text-primary-600 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {items?.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-text-muted" />
          {item.path ? (
            <Link
              to={item.path}
              className="text-text-tertiary hover:text-primary-600 transition-colors truncate max-w-[150px]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text-primary font-medium truncate max-w-[150px]">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};
