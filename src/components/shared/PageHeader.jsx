/**
 * PageHeader Component
 * Page title with optional breadcrumbs and actions
 */

import { cn } from "@/utils/cn";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  className,
}) => {
  return (
    <div className={cn("mb-6", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 mb-3 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-500" />}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-200">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-gray-400">{subtitle}</p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
