/**
 * DashboardHeader Component
 * Top header bar with mobile menu, notifications, and user dropdown
 */

import { Menu, Bell, Search } from "lucide-react";
import { useUIStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { Avatar } from "../ui/Avatar";
import { Dropdown, DropdownItem, DropdownDivider } from "../ui/Dropdown";
import { Badge } from "../ui/Badge";
import { useNavigate } from "react-router-dom";

export const DashboardHeader = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const { toggleMobileSidebar } = useUIStore();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Toggle mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Page Title */}
          <div>
            {title && <h1 className="text-xl font-bold text-white">{title}</h1>}
            {subtitle && (
              <p className="text-sm text-gray-400 hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <button
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Search...</span>
            <kbd className="hidden lg:inline-block px-2 py-0.5 text-xs bg-gray-900 rounded border border-gray-700">
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <Dropdown
            align="right"
            trigger={
              <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            }
          >
            <div className="py-2 px-4 border-b border-gray-700/50">
              <h3 className="font-semibold text-white">Notifications</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                You have 3 unread messages
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <DropdownItem>
                <div className="flex flex-col">
                  <span className="font-medium">New exam available</span>
                  <span className="text-xs text-gray-400">2 hours ago</span>
                </div>
              </DropdownItem>
              <DropdownItem>
                <div className="flex flex-col">
                  <span className="font-medium">Results published</span>
                  <span className="text-xs text-gray-400">5 hours ago</span>
                </div>
              </DropdownItem>
              <DropdownItem>
                <div className="flex flex-col">
                  <span className="font-medium">Group invitation</span>
                  <span className="text-xs text-gray-400">1 day ago</span>
                </div>
              </DropdownItem>
            </div>
            <DropdownDivider />
            <DropdownItem>
              <span className="text-center w-full text-purple-400 font-medium">
                View all notifications
              </span>
            </DropdownItem>
          </Dropdown>

          {/* User Dropdown */}
          <Dropdown
            align="right"
            trigger={
              <button className="flex items-center gap-2 p-1.5 hover:bg-gray-800 rounded-xl transition-colors">
                <Avatar
                  name={user?.name || user?.email}
                  size="sm"
                  showStatus
                  isOnline
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {user?.role || "Student"}
                  </p>
                </div>
              </button>
            }
          >
            <div className="py-2 px-4 border-b border-gray-700/50">
              <p className="font-medium text-white">{user?.name || "User"}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <Badge variant="purple" size="sm" className="mt-2 capitalize">
                {user?.role || "Student"}
              </Badge>
            </div>
            <DropdownItem onClick={() => navigate("/profile")}>
              Profile Settings
            </DropdownItem>
            <DropdownItem onClick={() => navigate("/settings")}>
              Preferences
            </DropdownItem>
            <DropdownItem>Help & Support</DropdownItem>
            <DropdownDivider />
            <DropdownItem onClick={handleLogout} danger>
              Logout
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
