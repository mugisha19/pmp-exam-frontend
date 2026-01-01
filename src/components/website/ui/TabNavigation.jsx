/**
 * TabNavigation Component
 * Horizontal tab navigation
 */

import { cn } from "@/utils/cn";

export const TabNavigation = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn("border-b border-border-light", className)}>
      <nav className="flex gap-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap",
                isActive
                  ? "text-primary-600 border-primary-600"
                  : "text-text-tertiary border-transparent hover:text-text-secondary hover:border-border-dark"
              )}
            >
              {Icon && <Icon className="w-5 h-5" />}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs font-semibold rounded-full",
                    isActive
                      ? "bg-primary-100 text-primary-700"
                      : "bg-bg-tertiary text-text-muted"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
