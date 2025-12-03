/**
 * MobileSidebar Component
 * Drawer/overlay sidebar for mobile devices - Prodex style
 */

import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";
import { X } from "lucide-react";
import { useUIStore } from "@/stores/ui.store";

export const MobileSidebar = ({ navItems = [] }) => {
  const location = useLocation();
  const { mobileSidebarOpen, closeMobileSidebar } = useUIStore();

  // Close sidebar on route change
  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname, closeMobileSidebar]);

  // Close on escape key
  useEffect(() => {
    if (!mobileSidebarOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeMobileSidebar();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileSidebarOpen, closeMobileSidebar]);

  // Prevent body scroll when open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileSidebarOpen]);

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  if (!mobileSidebarOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />

      {/* Sidebar Drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-[280px] bg-white border-r border-gray-200",
          "z-50 lg:hidden flex flex-col",
          "animate-in slide-in-from-left duration-300"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">PM</span>
            </div>
            <span className="text-gray-900 font-bold text-lg">PMP Exam</span>
          </Link>
          <button
            onClick={closeMobileSidebar}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Label */}
        <div className="px-6 pt-6 pb-2">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            Main
          </span>
        </div>

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
                      "transition-all duration-150",
                      active
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-[14px]">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default MobileSidebar;
