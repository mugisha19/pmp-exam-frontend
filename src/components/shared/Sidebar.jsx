/**
 * Sidebar Component
 * Light themed collapsible sidebar navigation - Prodex style
 */

import { Link, useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useUIStore } from "@/stores/ui.store";

export const Sidebar = ({ navItems = [] }) => {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-gray-200",
        "transition-all duration-300 ease-in-out z-40",
        "flex flex-col",
        sidebarCollapsed ? "w-20" : "w-[280px]"
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!sidebarCollapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">PM</span>
            </div>
            <span className="text-gray-900 font-bold text-lg">PMP Exam</span>
          </Link>
        )}
        {sidebarCollapsed && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">PM</span>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebarCollapsed}
        className={cn(
          "absolute -right-3 top-20 w-6 h-6 rounded-full",
          "bg-white border border-gray-300 shadow-sm",
          "flex items-center justify-center text-gray-500",
          "hover:bg-gray-50 hover:text-gray-900 transition-colors"
        )}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Section Label */}
      {!sidebarCollapsed && (
        <div className="px-6 pt-6 pb-2">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            Main
          </span>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-3 pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md",
                    "transition-all duration-150 group relative",
                    active
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0",
                      sidebarCollapsed && "mx-auto"
                    )}
                  />
                  {!sidebarCollapsed && (
                    <span className="text-[14px]">{item.label}</span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                      {item.label}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
