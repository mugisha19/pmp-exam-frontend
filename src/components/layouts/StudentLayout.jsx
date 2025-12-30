/**
 * StudentLayout Component
 * Modern, clean layout for student exam portal with blue/indigo theme
 */

import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useLogoutMutation } from "@/hooks/queries/useAuthQueries";
import { STUDENT_NAV_ITEMS } from "@/constants/navigation.constants";
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  User, 
  LogOut,
  ChevronDown,
  BookOpen,
  GraduationCap,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import { useNotifications } from "@/hooks/queries/useNotificationQueries";
import { ProfileCard } from "@/components/shared/ProfileCard";
import { ProgressChart } from "@/components/shared/ProgressChart";
import { GroupMembersCard } from "@/components/shared/GroupMembersCard";
import { GrassBackground } from "@/components/shared/GrassBackground";

export const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const logoutMutation = useLogoutMutation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const { data: notificationsData } = useNotifications({
    page: 1,
    page_size: 100,
    unread_only: true,
  });

  const unreadCount = notificationsData?.items?.length || notificationsData?.length || 0;

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/login");
      },
    });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-bg-primary relative">
      <GrassBackground />
      {/* Left Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col fixed left-4 top-1/2 -translate-y-1/2 w-72 h-[95vh] bg-white/90 backdrop-blur-xl shadow-2xl shadow-purple-300/30 rounded-3xl border-2 border-purple-200/60 z-50 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Logo & Brand */}
          <div className="p-7 pb-5 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/30 ring-4 ring-purple-500/10">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-3 border-white shadow-md animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  PMP Portal
                </h1>
                <p className="text-xs text-gray-600 font-bold mt-1 uppercase tracking-wide">Student Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-5 py-5 space-y-2 scrollbar-hide">
            {STUDENT_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "group relative w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300",
                    "hover:scale-[1.02] hover:shadow-lg",
                    active
                      ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-xl shadow-purple-500/30 scale-[1.02]"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 hover:shadow-md"
                  )}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-white rounded-r-full shadow-lg"></div>
                  )}
                  <div className={cn(
                    "flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 shadow-sm",
                    active 
                      ? "bg-white/25 shadow-md" 
                      : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:bg-purple-500/15 group-hover:shadow-md"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5 transition-all duration-300",
                      active ? "text-white" : "text-gray-600 group-hover:text-purple-600"
                    )} />
                  </div>
                  <span className={cn(
                    "text-sm font-bold transition-all duration-300",
                    active ? "text-white" : "text-gray-700 group-hover:text-gray-900"
                  )}>
                    {item.label}
                  </span>
                  {active && (
                    <div className="ml-auto w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-lg"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Profile Section */}
          <div className="mt-auto p-5 border-t-2 border-gray-100 bg-gradient-to-br from-gray-50/50 via-white to-gray-50/30 rounded-b-3xl">
            {/* Notifications */}
            <button 
              onClick={() => navigate("/notifications")}
              className={cn(
                "group w-full flex items-center gap-4 px-5 py-4 mb-4 rounded-2xl transition-all duration-300",
                "hover:bg-white hover:shadow-lg hover:scale-[1.02]",
                isActive("/notifications") && "bg-white shadow-lg scale-[1.02]"
              )}
            >
              <div className="relative">
                <div className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 shadow-md",
                  isActive("/notifications")
                    ? "bg-gradient-to-br from-purple-100 to-violet-100"
                    : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:bg-purple-500/15"
                )}>
                  <Bell className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    isActive("/notifications") ? "text-purple-600" : "text-gray-600 group-hover:text-purple-600"
                  )} />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-xl border-2 border-white animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-sm font-bold transition-colors duration-300",
                isActive("/notifications") ? "text-purple-600" : "text-gray-700 group-hover:text-gray-900"
              )}>
                Notifications
              </span>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300",
                  "hover:bg-white hover:shadow-lg hover:scale-[1.02]",
                  profileMenuOpen && "bg-white shadow-lg scale-[1.02]"
                )}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg ring-4 ring-purple-500/10">
                    <span className="text-white font-bold text-base">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-3 border-white shadow-md"></div>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-600 capitalize font-bold uppercase tracking-wide">{user?.role}</p>
                </div>
                <ChevronDown className={cn(
                  "w-5 h-5 text-gray-500 transition-transform duration-300",
                  profileMenuOpen && "rotate-180"
                )} />
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-3 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-2xl shadow-gray-300/50 border-2 border-gray-200/60 py-2 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setProfileMenuOpen(false);
                    }}
                    className="w-full px-5 py-3.5 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 flex items-center gap-4 transition-all duration-200 group"
                  >
                    <div                       className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:bg-gradient-to-br group-hover:from-purple-100 group-hover:to-violet-100 flex items-center justify-center transition-all duration-200 shadow-sm group-hover:shadow-md">
                      <User className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <span className="font-bold">My Profile</span>
                  </button>
                  <div className="border-t-2 border-gray-100 my-2"></div>
                  <button
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="w-full px-5 py-3.5 text-left text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 flex items-center gap-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-red-100 group-hover:from-red-100 group-hover:to-red-200 flex items-center justify-center transition-all duration-200 shadow-sm group-hover:shadow-md">
                      {logoutMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                      ) : (
                        <LogOut className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <span className="font-bold">{logoutMutation.isPending ? "Signing out..." : "Logout"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <nav className="lg:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  PMP Portal
                </h1>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {STUDENT_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      active
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <LogOut className="w-5 h-5" />
                )}
                <span className="font-medium">{logoutMutation.isPending ? "Signing out..." : "Logout"}</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-80 xl:mr-80 px-4 sm:px-6 lg:px-8 py-6 transition-all duration-300">
        <Outlet />
      </main>

      {/* Right Sidebar - Hidden on mobile/tablet, visible on xl screens */}
      <aside className="hidden xl:flex flex-col fixed right-4 top-1/2 -translate-y-1/2 w-72 h-[95vh] space-y-5 overflow-y-auto z-40 scrollbar-hide">
        <ProfileCard />
        <ProgressChart data={[]} />
        <GroupMembersCard />
      </aside>
    </div>
  );
};

export default StudentLayout;
