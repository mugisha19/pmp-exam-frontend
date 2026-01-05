/**
 * UserDropdown Component
 * Compact, stylish user menu dropdown
 */

import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/stores/auth.store";
import { useLogoutMutation } from "@/hooks/queries/useAuthQueries";
import { Avatar } from "../ui/Avatar";
import { Dropdown } from "../ui/Dropdown";

// Get role-specific profile path
const getProfilePath = (role) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return "/profile";
    case "instructor":
      return "/profile";
    default:
      return "/profile";
  }
};

// Get role-specific settings path
const getSettingsPath = (role) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return "/settings";
    case "instructor":
      return "/settings";
    default:
      return "/settings";
  }
};

export const UserDropdown = ({ className }) => {
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

  const handleProfile = () => {
    navigate(getProfilePath(user?.role));
  };

  const handleSettings = () => {
    navigate(getSettingsPath(user?.role));
  };

  return (
    <Dropdown
      align="right"
      className="min-w-[180px] py-1.5"
      trigger={
        <button
          className={cn(
            "flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-colors",
            className
          )}
        >
          <Avatar
            name={user?.name || user?.email}
            src={user?.avatar_url || user?.profile_picture}
            size="sm"
          />
          <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
            {user?.first_name && user?.last_name
              ? `${user.first_name} ${user.last_name}`
              : user?.first_name ||
                user?.last_name ||
                user?.email?.split("@")[0] ||
                "User"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>
      }
    >
      {/* User info - compact */}
      <div className="px-3 py-2 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user?.first_name && user?.last_name
            ? `${user.first_name} ${user.last_name}`
            : user?.first_name ||
              user?.last_name ||
              user?.email?.split("@")[0] ||
              "User"}
        </p>
        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
      </div>

      {/* Menu items - compact */}
      <div className="py-1">
        <button
          onClick={handleProfile}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <User className="w-3.5 h-3.5" />
          Profile
        </button>
      </div>

      {/* Logout - stylish */}
      <div className="border-t border-gray-100 pt-1 pb-0.5 px-1.5">
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {logoutMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          {logoutMutation.isPending ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </Dropdown>
  );
};

export default UserDropdown;
