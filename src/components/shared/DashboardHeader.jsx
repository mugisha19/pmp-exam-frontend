/**
 * DashboardHeader Component
 * Top header bar with mobile menu, notifications, and user dropdown
 */

import { Menu } from "lucide-react";
import { useUIStore } from "@/stores/ui.store";
import { NotificationDropdown } from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";

export const DashboardHeader = ({ title, subtitle }) => {
  const { toggleMobileSidebar } = useUIStore();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 h-14 sm:h-16">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileSidebar}
            className="flex lg:hidden items-center justify-center p-2.5 min-w-[44px] min-h-[44px] text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 active:scale-95 touch-manipulation"
            aria-label="Toggle mobile menu"
            type="button"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Page Title */}
          <div className="min-w-0 flex-1">
            {title && (
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">{title}</h1>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Notifications */}
          <NotificationDropdown />

          {/* User Dropdown */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
