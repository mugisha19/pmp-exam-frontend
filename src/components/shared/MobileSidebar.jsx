/**
 * MobileSidebar Component
 * Drawer/overlay sidebar for mobile devices
 */

import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import { X, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useUIStore } from "@/stores/ui.store";
import { Avatar } from "../ui/Avatar";

export const MobileSidebar = ({ navItems = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
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

  const handleLogout = () => {
    logout();
    closeMobileSidebar();
    navigate("/login");
  };

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
          "fixed left-0 top-0 h-screen w-64 bg-[#0a0a0a] border-r border-gray-800",
          "z-50 lg:hidden flex flex-col",
          "animate-in slide-in-from-left duration-300"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">PMP</span>
            </div>
            <span className="text-white font-bold text-lg">Exam Platform</span>
          </Link>
          <button
            onClick={closeMobileSidebar}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
                      "transition-all duration-200",
                      active
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-800 p-3">
          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-800/50 mb-2">
            <Avatar
              name={user?.name || user?.email}
              size="sm"
              showStatus
              isOnline
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-400 truncate capitalize">
                {user?.role || "Student"}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-600/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;
