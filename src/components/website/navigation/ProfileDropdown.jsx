/**
 * ProfileDropdown Component
 * User profile dropdown menu
 */

import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useLogoutMutation } from "@/hooks/queries/useAuthQueries";
import {
  User,
  Settings,
  BookOpen,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/utils/cn";

export const ProfileDropdown = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const logoutMutation = useLogoutMutation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/login");
      },
    });
  };

  // Get role-specific profile path
  const getProfilePath = () => {
    switch (user?.role?.toLowerCase()) {
      case "admin":
      case "instructor":
        return "/profile";
      case "student":
        return "/my-profile";
      default:
        return "/my-profile";
    }
  };

  const menuItems = [
    {
      label: "My Profile",
      path: getProfilePath(),
      icon: User,
      description: "View and edit profile",
    },
    {
      label: "My Learning",
      path: "/my-learning",
      icon: BookOpen,
      description: "Progress and attempts",
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown */}
      <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-soft border border-border-light z-50">
        {/* User Info */}
        <div className="px-4 py-4 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-orange text-white font-bold text-lg rounded-full flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-text-primary truncate">
                {user?.name || "User"}
              </div>
              <div className="text-sm text-text-tertiary truncate">
                {user?.email}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border-light">
            <div className="text-center">
              <div className="text-lg font-bold text-primary-600">24</div>
              <div className="text-xs text-text-muted">Exams</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-secondary-600">18</div>
              <div className="text-xs text-text-muted">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-secondary-500">85%</div>
              <div className="text-xs text-text-muted">Avg Score</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 hover:bg-bg-secondary transition-colors group"
              >
                <Icon className="w-5 h-5 text-text-muted group-hover:text-primary-600 transition-colors" />
                <div className="flex-1">
                  <div className="font-medium text-text-secondary group-hover:text-text-primary">
                    {item.label}
                  </div>
                  <div className="text-xs text-text-muted">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <div className="border-t border-border-light py-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-error hover:bg-red-50 transition-colors group"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </div>
    </>
  );
};
