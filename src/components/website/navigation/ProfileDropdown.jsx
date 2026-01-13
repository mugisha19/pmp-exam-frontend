/**
 * ProfileDropdown Component
 * User profile dropdown menu
 */

import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { useLogoutMutation } from "@/hooks/queries/useAuthQueries";
import analyticsService from "@/services/analytics.service";
import {
  User,
  Settings,
  BookOpen,
  LogOut,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { cn } from "@/utils/cn";

export const ProfileDropdown = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const logoutMutation = useLogoutMutation();

  // Fetch real student performance data
  const { data: performanceData, isLoading: statsLoading } = useQuery({
    queryKey: ["profile-dropdown-stats", user?.user_id],
    queryFn: async () => {
      try {
        const response = await analyticsService.getStudentPerformance(
          user?.user_id,
          "all"
        );
        return response;
      } catch (error) {
        console.error("Error fetching performance stats:", error);
        return {
          total_attempts: 0,
          total_passed: 0,
          average_score: 0,
        };
      }
    },
    enabled: !!user?.user_id && user?.role?.toLowerCase() === "student",
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={`${user?.first_name} ${user?.last_name}`}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-primary-100"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div 
              className={cn(
                "items-center justify-center w-12 h-12 bg-gradient-to-br from-[#FF5100] to-[#6EC1E4] text-white font-bold text-lg rounded-full flex-shrink-0 shadow-sm",
                user?.avatar_url ? "hidden" : "flex"
              )}
            >
              {user?.first_name?.charAt(0)?.toUpperCase() || "U"}
              {user?.last_name?.charAt(0)?.toUpperCase() || ""}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-text-primary truncate">
                {user?.first_name && user?.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user?.first_name || "User"}
              </div>
              <div className="text-sm text-text-tertiary truncate">
                {user?.email}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border-light">
            {statsLoading ? (
              <div className="flex-1 flex items-center justify-center py-2">
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary-600">
                    {performanceData?.total_attempts || 0}
                  </div>
                  <div className="text-xs text-text-muted">Attempts</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-secondary-600">
                    {performanceData?.total_passed || 0}
                  </div>
                  <div className="text-xs text-text-muted">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-secondary-500">
                    {Math.round(performanceData?.average_score || 0)}%
                  </div>
                  <div className="text-xs text-text-muted">Avg Score</div>
                </div>
              </>
            )}
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
