/**
 * TopNavbar Component
 * Main navigation bar for student website with mega menu, search, notifications
 */

import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useNotifications } from "@/hooks/queries/useNotificationQueries";
import {
  Search,
  Bell,
  Menu,
  X,
  GraduationCap,
  ChevronDown,
  Users,
  TrendingUp,
  Home,
  BookOpen,
  Settings,
  LogOut,
  User,
  HelpCircle,
  Trophy,
  BarChart3,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { SearchOverlay } from "./SearchOverlay";
import { NotificationPanel } from "./NotificationPanel";
import { ProfileDropdown } from "./ProfileDropdown";

export const TopNavbar = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const { data: notificationsData } = useNotifications({
    page: 1,
    page_size: 100,
    unread_only: true,
  });

  const unreadCount =
    notificationsData?.items?.length || notificationsData?.length || 0;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const mainNavItems = [
    { label: "Home", path: "/dashboard", icon: Home },
    { label: "Browse Exams", path: "/browse", icon: BookOpen },
    { label: "My Learning", path: "/my-learning", icon: TrendingUp },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Groups", path: "/groups", icon: Users },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white shadow-sm border-b border-gray-200"
            : "bg-white border-b border-gray-100"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section: Logo + Navigation */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link to="/dashboard" className="flex items-center gap-2.5 group">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm group-hover:shadow-md transition-shadow">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg font-bold text-gray-900">
                    <span className="text-emerald-600">PMP</span>
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        active
                          ? "text-emerald-700 bg-emerald-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <Icon
                        className={cn("w-4 h-4", active && "text-emerald-600")}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-200"
              >
                <Search className="w-4 h-4" />
                <span className="text-sm text-gray-400">Search...</span>
                <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded shadow-sm">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>

              {/* Mobile Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="sm:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <div ref={notificationRef} className="relative">
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setProfileOpen(false);
                  }}
                  className={cn(
                    "relative p-2 rounded-lg transition-all duration-200",
                    notificationsOpen
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-5 h-5 px-1.5 text-[10px] font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-sm animate-pulse">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Panel */}
                {notificationsOpen && (
                  <NotificationPanel
                    onClose={() => setNotificationsOpen(false)}
                  />
                )}
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-6 bg-gray-200 mx-1" />

              {/* Profile */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => {
                    setProfileOpen(!profileOpen);
                    setNotificationsOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 pl-1 pr-3 py-1 rounded-full transition-all duration-200",
                    profileOpen
                      ? "bg-emerald-50 ring-2 ring-emerald-500/20"
                      : "hover:bg-gray-50"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-bold shadow-sm">
                      {user?.first_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    {/* Online indicator */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                  </div>

                  {/* User Info */}
                  <div className="flex items-center max-w-[120px] sm:max-w-[150px]">
                    <span className="text-sm font-semibold text-gray-900 leading-tight truncate">
                      {user?.first_name && user?.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user?.first_name || "User"}
                    </span>
                  </div>

                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-gray-400 transition-transform duration-200",
                      profileOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <ProfileDropdown onClose={() => setProfileOpen(false)} />
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(
                  "lg:hidden p-2 rounded-lg transition-all duration-200",
                  mobileMenuOpen
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
            mobileMenuOpen ? "max-h-96 border-t border-gray-100" : "max-h-0"
          )}
        >
          <div className="bg-white px-4 py-3 space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                    active
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <Icon
                    className={cn("w-5 h-5", active && "text-emerald-600")}
                  />
                  {item.label}
                </Link>
              );
            })}

            {/* Mobile Achievements Link */}
            <Link
              to="/achievements"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
            >
              <Trophy className="w-5 h-5 text-orange-500" />
              Achievements
            </Link>

            {/* Mobile Divider */}
            <div className="my-2 border-t border-gray-100" />

            {/* Quick Profile Info - Mobile */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  {user?.name || "User"}
                </div>
                <div className="text-sm text-gray-500 capitalize">
                  {user?.role || "Student"}
                </div>
              </div>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-all"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16" />
    </>
  );
};

export default TopNavbar;
