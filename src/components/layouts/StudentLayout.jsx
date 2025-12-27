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
  Settings,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import { useNotifications } from "@/hooks/queries/useNotificationQueries";
import { ProfileCard } from "@/components/shared/ProfileCard";
import { ProgressChart } from "@/components/shared/ProgressChart";
import { MentorList } from "@/components/shared/MentorList";

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
    <div className="flex min-h-screen bg-bg-primary">
      {/* Left Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col fixed left-4 top-1/2 -translate-y-1/2 w-72 h-[95vh] bg-white/95 backdrop-blur-xl shadow-lg shadow-gray-200/50 rounded-3xl border border-gray-200/50 z-50 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Logo & Brand */}
          <div className="p-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-accent-primary via-accent-primary to-accent-secondary rounded-2xl shadow-md shadow-accent-primary/15">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                  PMP Portal
                </h1>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Student Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-hide">
            {STUDENT_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "group relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300",
                    "hover:scale-[1.01] hover:shadow-sm",
                    active
                      ? "bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-md shadow-accent-primary/20"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
                  )}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                  )}
                  <div className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300",
                    active 
                      ? "bg-white/20" 
                      : "bg-gray-100 group-hover:bg-accent-primary/10"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5 transition-all duration-300",
                      active ? "text-white" : "text-gray-600 group-hover:text-accent-primary"
                    )} />
                  </div>
                  <span className={cn(
                    "text-sm font-semibold transition-all duration-300",
                    active ? "text-white" : "text-gray-700 group-hover:text-gray-900"
                  )}>
                    {item.label}
                  </span>
                  {active && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Profile Section */}
          <div className="mt-auto p-4 border-t border-gray-100 bg-gradient-to-br from-gray-50/50 to-white rounded-b-3xl">
            {/* Notifications */}
            <button 
              onClick={() => navigate("/notifications")}
              className={cn(
                "group w-full flex items-center gap-3 px-4 py-3 mb-3 rounded-xl transition-all duration-300",
                "hover:bg-white hover:shadow-sm hover:scale-[1.01]",
                isActive("/notifications") && "bg-white shadow-sm"
              )}
            >
              <div className="relative">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                  isActive("/notifications")
                    ? "bg-accent-primary/10"
                    : "bg-gray-100 group-hover:bg-accent-primary/10"
                )}>
                  <Bell className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    isActive("/notifications") ? "text-accent-primary" : "text-gray-600 group-hover:text-accent-primary"
                  )} />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-sm font-semibold transition-colors duration-300",
                isActive("/notifications") ? "text-accent-primary" : "text-gray-700 group-hover:text-gray-900"
              )}>
                Notifications
              </span>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                  "hover:bg-white hover:shadow-sm hover:scale-[1.01]",
                  profileMenuOpen && "bg-white shadow-sm"
                )}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-sm">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize font-medium">{user?.role}</p>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-gray-500 transition-transform duration-300",
                  profileMenuOpen && "rotate-180"
                )} />
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-lg shadow-gray-200/40 border border-gray-200/50 py-2 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 flex items-center gap-3 transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-accent-primary/10 flex items-center justify-center transition-colors">
                      <User className="w-4 h-4 text-gray-600 group-hover:text-accent-primary transition-colors" />
                    </div>
                    <span className="font-medium">My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 flex items-center gap-3 transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-accent-primary/10 flex items-center justify-center transition-colors">
                      <Settings className="w-4 h-4 text-gray-600 group-hover:text-accent-primary transition-colors" />
                    </div>
                    <span className="font-medium">Settings</span>
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 flex items-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                      {logoutMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                      ) : (
                        <LogOut className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <span className="font-medium">{logoutMutation.isPending ? "Signing out..." : "Logout"}</span>
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
      <aside className="hidden xl:flex flex-col fixed right-4 top-1/2 -translate-y-1/2 w-72 h-[95vh] space-y-4 overflow-y-auto z-40 scrollbar-hide">
        <ProfileCard />
        <ProgressChart data={[]} />
        <MentorList mentors={[]} />
      </aside>
    </div>
  );
};

export default StudentLayout;
