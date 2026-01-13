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
    <div className="flex min-h-screen bg-transparent relative">
      <GrassBackground />
      {/* Left Sidebar Navigation - Redesigned */}
      <aside className="hidden lg:flex flex-col fixed left-4 top-1/2 -translate-y-1/2 w-56 h-[92vh] bg-white/90 backdrop-blur-xl shadow-md shadow-gray-200/40 rounded-2xl border border-gray-200/60 z-50 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Logo & Brand */}
          <div className="p-3 pb-2.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <img src="/pmp logo.png" alt="PMP Portal" className="w-8 h-8 object-contain" />
              <div>
                <h1 className="text-base font-semibold bg-clip-text text-transparent" style={{ background: 'linear-gradient(135deg, #53629E 0%, #6b7aad 100%)', WebkitBackgroundClip: 'text' }}>
                  PMP Portal
                </h1>
                <p className="text-[9px] text-gray-600 font-medium uppercase tracking-wide">Student Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-hide">
            {STUDENT_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    console.log('Navigating to:', item.path);
                    navigate(item.path);
                  }}
                  className={cn(
                    "group relative w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-200",
                    active
                      ? "text-white bg-[#476072]"
                      : "text-gray-700 hover:text-white hover:bg-[#476072]"
                  )}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-r-full"></div>
                  )}
                  <div className="flex items-center justify-center w-7 h-7 transition-all duration-200">
                    <Icon className={cn(
                      "w-3.5 h-3.5 transition-all duration-200",
                      active ? "text-white" : "text-gray-600 group-hover:text-white"
                    )} />
                  </div>
                  <span className={cn(
                    "text-[11px] font-medium transition-all duration-200 flex-1 text-left",
                    active ? "text-white" : "text-gray-700 group-hover:text-white"
                  )}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Profile Section */}
          <div className="mt-auto p-3 border-t border-gray-100 bg-gradient-to-br from-gray-50/50 via-white to-gray-50/30 rounded-b-2xl">
            {/* Notifications */}
            <button 
              onClick={() => navigate("/notifications")}
              className={cn(
                "group w-full flex items-center gap-2 px-2.5 py-2 mb-2 rounded-lg transition-all duration-200",
                isActive("/notifications") 
                  ? "text-white bg-[#476072]" 
                  : "text-gray-700 hover:text-white hover:bg-[#476072]"
              )}
            >
              <div className="relative">
                <div className="flex items-center justify-center w-7 h-7 transition-all duration-200">
                  <Bell className={cn(
                    "w-3.5 h-3.5 transition-colors duration-200",
                    isActive("/notifications") ? "text-white" : "text-gray-600 group-hover:text-white"
                  )} />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center border border-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[11px] font-medium transition-colors duration-200 flex-1 text-left",
                isActive("/notifications") ? "text-white" : "text-gray-700 group-hover:text-white"
              )}>
                Notifications
              </span>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-200",
                  profileMenuOpen
                    ? "text-white bg-[#476072]"
                    : "text-gray-700 hover:text-white hover:bg-[#476072]"
                )}
              >
                <div className="relative">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm ring-2" style={{ backgroundColor: '#476072', ringColor: 'rgba(71, 96, 114, 0.1)' }}>
                    <span className="text-white font-semibold text-[10px]">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: '#476072' }}></div>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className={cn(
                    "text-[11px] font-medium truncate transition-colors duration-200",
                    profileMenuOpen ? "text-white" : "text-gray-900 group-hover:text-white"
                  )}>
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className={cn(
                    "text-[9px] font-medium truncate transition-colors duration-200",
                    profileMenuOpen ? "text-white/80" : "text-gray-600 group-hover:text-white/80"
                  )}>{user?.email}</p>
                </div>
                <ChevronDown className={cn(
                  "w-3 h-3 transition-all duration-200",
                  profileMenuOpen ? "text-white rotate-180" : "text-gray-500 group-hover:text-white"
                )} />
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-md border border-gray-200 py-1 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <button
                    onClick={() => {
                      navigate("/my-profile");
                      setProfileMenuOpen(false);
                    }}
                    className="w-full px-2.5 py-1.5 text-left text-[11px] text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200 group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-all duration-200">
                      <User className="w-3 h-3 text-gray-600 transition-colors" />
                    </div>
                    <span className="font-medium">My Profile</span>
                  </button>
                  <div className="border-t border-gray-100 my-0.5"></div>
                  <button
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="w-full px-2.5 py-1.5 text-left text-[11px] text-red-600 hover:bg-red-50 flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-all duration-200">
                      {logoutMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin text-red-600" />
                      ) : (
                        <LogOut className="w-3 h-3 text-red-600" />
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
            <div className="flex items-center gap-2.5">
              <img src="/pmp logo.png" alt="PMP Portal" className="w-9 h-9 object-contain" />
              <div>
                <h1 className="text-base font-semibold" style={{ color: '#476072' }}>
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
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200",
                      active
                        ? "text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                    style={active ? { background: 'linear-gradient(135deg, #476072 0%, #3d5161 100%)' } : {}}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
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
      <main className="flex-1 lg:ml-72 xl:mr-64 px-4 sm:px-5 lg:px-6 py-5 transition-all duration-300 relative z-10">
        <Outlet />
      </main>

      {/* Right Sidebar - Hidden on mobile/tablet, visible on xl screens */}
      <aside className="hidden xl:flex flex-col fixed right-4 top-1/2 -translate-y-1/2 w-56 h-[92vh] space-y-4 overflow-y-auto z-40 scrollbar-hide">
        <ProfileCard />
        <ProgressChart data={[]} />
        <GroupMembersCard />
      </aside>
    </div>
  );
};

export default StudentLayout;
