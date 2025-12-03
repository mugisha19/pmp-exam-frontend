/**
 * DashboardHeader Component
 * Top header bar with mobile menu, notifications, and user dropdown
 */

import { Menu } from "lucide-react";
import { useUIStore } from "@/stores/ui.store";
import NotificationBell from "./NotificationBell";
import UserDropdown from "./UserDropdown";

export const DashboardHeader = ({ title, subtitle }) => {
  const { toggleMobileSidebar } = useUIStore();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Page Title */}
          <div>
            {title && (
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <NotificationBell />

          {/* User Dropdown */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
