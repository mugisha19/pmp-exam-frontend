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
  Calendar,
  FileText,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { SearchOverlay } from "./SearchOverlay";
import { NotificationPanel } from "./NotificationPanel";
import { ReminderPanel } from "./ReminderPanel";
import { ProfileDropdown } from "./ProfileDropdown";
import { NotesPanel } from "@/components/ui/NotesPanel";

export const TopNavbar = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
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
    if (path === "/home") {
      return location.pathname === "/home" || location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const mainNavItems = [
    { label: "Home", path: "/home", icon: Home },
    { label: "My Learning", path: "/my-learning", icon: TrendingUp },
    { label: "Groups", path: "/my-groups", icon: Users },
    { label: "Analytics", path: "/my-analytics", icon: BarChart3 },
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
          <div className="flex items-center justify-between h-20">
            {/* Left Section: Logo + Navigation */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link 
                to="/home" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center -my-2"
              >
                <img src="/pmp logo.png" alt="PMP Portal" className="h-24 w-auto object-contain" style={{ imageRendering: 'crisp-edges' }} />
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
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
                        active
                          ? "text-[#FF5100] bg-orange-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <Icon
                        className={cn("w-4 h-4", active ? "text-[#FF5100]" : "")}
                      />
                      {item.label}
                      {active && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#FF5100] rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-2">
              {/* Notes - Desktop only */}
              <button
                onClick={() => {
                  setNotesOpen(!notesOpen);
                  setReminderOpen(false);
                  setNotificationsOpen(false);
                  setProfileOpen(false);
                }}
                title="My Notes"
                className={cn(
                  "hidden md:flex relative p-2 rounded-lg transition-all duration-200",
                  notesOpen
                    ? "text-primary-500 bg-primary-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <FileText className="w-5 h-5" />
              </button>

              {/* Reminders - Desktop only */}
              <button
                onClick={() => {
                  setReminderOpen(!reminderOpen);
                  setNotesOpen(false);
                  setNotificationsOpen(false);
                  setProfileOpen(false);
                }}
                title="Reminders"
                className={cn(
                  "hidden md:flex relative p-2 rounded-lg transition-all duration-200",
                  reminderOpen
                    ? "text-primary-500 bg-primary-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <Calendar className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <div ref={notificationRef} className="relative">
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setNotesOpen(false);
                    setReminderOpen(false);
                    setProfileOpen(false);
                  }}
                  title="Notifications"
                  className={cn(
                    "relative p-2 rounded-lg transition-all duration-200",
                    notificationsOpen
                      ? "text-primary-500 bg-primary-50"
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
                    setNotesOpen(false);
                    setNotificationsOpen(false);
                    setReminderOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 border",
                    profileOpen
                      ? "bg-primary-50 border-primary-300 shadow-sm"
                      : "bg-white border-gray-200 hover:border-primary-300 hover:shadow-sm"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#FF5100] to-[#6EC1E4] text-white text-sm font-bold shadow-sm">
                      {user?.first_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    {/* Online indicator */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  </div>

                  {/* User Info - Hidden on mobile */}
                  <div className="hidden md:flex flex-col max-w-[120px]">
                    <span className="text-sm font-semibold text-gray-900 leading-tight truncate">
                      {user?.first_name && user?.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user?.first_name || "User"}
                    </span>
                    
                  </div>

                  <ChevronDown
                    className={cn(
                      "hidden md:block w-4 h-4 text-gray-400 transition-transform duration-200",
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
        {mobileMenuOpen && (
          <>
            {/* Mobile Menu Backdrop */}
            <div 
              className="fixed inset-0 top-20 bg-black/10 backdrop-blur-sm z-30 lg:hidden" 
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu Content */}
            <div className="lg:hidden border-t border-gray-100 relative z-40">
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
                      ? "text-[#FF5100] bg-orange-50 border-l-4 border-[#FF5100]"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <Icon
                    className={cn("w-5 h-5", active ? "text-[#FF5100]" : "")}
                  />
                  {item.label}
                </Link>
              );
            })}

            {/* Mobile Divider */}
            <div className="my-2 border-t border-gray-100" />

            {/* Notes - Mobile */}
            <button
              onClick={() => {
                setNotesOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <FileText className="w-5 h-5" />
              My Notes
            </button>

            {/* Reminders - Mobile */}
            <button
              onClick={() => {
                setReminderOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <Calendar className="w-5 h-5" />
              Reminders
            </button>

            {/* Mobile Divider */}
            <div className="my-2 border-t border-gray-100" />

            {/* Quick Profile Info - Mobile */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white font-bold">
                {user?.first_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  {user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user?.first_name || "User"}
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
          </>
        )}
      </header>

      {/* Search Overlay */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

      {/* Reminder Panel */}
      {reminderOpen && <ReminderPanel onClose={() => setReminderOpen(false)} />}

      {/* Notes Panel */}
      <NotesPanel isOpen={notesOpen} onClose={() => setNotesOpen(false)} />

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-20" />
    </>
  );
};

export default TopNavbar;
