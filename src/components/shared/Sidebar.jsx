/**
 * Sidebar Component
 * Dark themed collapsible sidebar navigation
 */

import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useUIStore } from "@/stores/ui.store";
import { Avatar } from "../ui/Avatar";

export const Sidebar = ({ navItems = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-[#0a0a0a] border-r border-gray-800",
        "transition-all duration-300 ease-in-out z-40",
        "flex flex-col",
        sidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        {!sidebarCollapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">PMP</span>
            </div>
            <span className="text-white font-bold text-lg">Exam Platform</span>
          </Link>
        )}
        {sidebarCollapsed && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebarCollapsed}
        className={cn(
          "absolute -right-3 top-20 w-6 h-6 rounded-full",
          "bg-gray-800 border border-gray-700",
          "flex items-center justify-center text-gray-400",
          "hover:bg-gray-700 hover:text-white transition-colors"
        )}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl",
                    "transition-all duration-200 group relative",
                    active
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0",
                      sidebarCollapsed && "mx-auto"
                    )}
                  />
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-gray-700">
                      {item.label}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-800 p-3">
        {/* User Info */}
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-xl mb-2",
            "bg-gray-800/50",
            sidebarCollapsed && "justify-center"
          )}
        >
          <Avatar
            name={user?.name || user?.email}
            size="sm"
            showStatus
            isOnline
          />
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-400 truncate capitalize">
                {user?.role || "Student"}
              </p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-3 rounded-xl",
            "text-red-400 hover:text-red-300 hover:bg-red-600/10",
            "transition-all duration-200 group relative",
            sidebarCollapsed && "justify-center"
          )}
          title={sidebarCollapsed ? "Logout" : undefined}
        >
          <LogOut
            className={cn(
              "w-5 h-5 flex-shrink-0",
              sidebarCollapsed && "mx-auto"
            )}
          />
          {!sidebarCollapsed && <span className="font-medium">Logout</span>}

          {/* Tooltip for collapsed state */}
          {sidebarCollapsed && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-gray-700">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
