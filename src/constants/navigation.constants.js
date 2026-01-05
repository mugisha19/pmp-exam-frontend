/**
 * Navigation Constants
 * Role-based navigation items for dashboard
 */

import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  BarChart3,
  Trophy,
  Users,
  Settings,
  FileText,
  UserCircle,
  Bell,
  Calendar,
  MessageSquare,
  Award,
  Target,
  BookMarked,
  FileQuestion,
  FolderTree,
  TrendingUp,
} from "lucide-react";

export const STUDENT_NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    path: "/home",
    icon: LayoutDashboard,
  },
  {
    id: "my-groups",
    label: "Groups",
    path: "/my-groups",
    icon: Users,
  },
  {
    id: "my-learning",
    label: "My Learning",
    path: "/my-learning",
    icon: TrendingUp,
  },
  {
    id: "my-reminders",
    label: "Reminders",
    path: "/my-reminders",
    icon: Bell,
  },
];

export const INSTRUCTOR_NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/instructor/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "exams",
    label: "Manage Exams",
    path: "/instructor/exams",
    icon: BookOpen,
  },
  {
    id: "questions",
    label: "Question Bank",
    path: "/instructor/questions",
    icon: FileText,
  },
  {
    id: "groups",
    label: "Groups",
    path: "/instructor/groups",
    icon: Users,
  },
  {
    id: "students",
    label: "Students",
    path: "/instructor/students",
    icon: UserCircle,
  },
  {
    id: "results",
    label: "Results & Analytics",
    path: "/instructor/results",
    icon: BarChart3,
  },
  {
    id: "grading",
    label: "Grading",
    path: "/instructor/grading",
    icon: Award,
  },
  {
    id: "schedule",
    label: "Schedule",
    path: "/instructor/schedule",
    icon: Calendar,
  },
  {
    id: "announcements",
    label: "Announcements",
    path: "/instructor/announcements",
    icon: Bell,
  },
  {
    id: "profile",
    label: "Profile",
    path: "/instructor/profile",
    icon: UserCircle,
  },
  {
    id: "settings",
    label: "Settings",
    path: "/instructor/settings",
    icon: Settings,
  },
];

export const ADMIN_NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["admin", "instructor"],
  },
  {
    id: "courses-domains",
    label: "Courses & Domains",
    path: "/courses-domains",
    icon: FolderTree,
    allowedRoles: ["admin"], // Admin only
  },
  {
    id: "topics",
    label: "Topics",
    path: "/topics",
    icon: BookMarked,
    allowedRoles: ["admin"], // Admin only
  },
  {
    id: "questions",
    label: "Questions",
    path: "/questions",
    icon: FileQuestion,
    allowedRoles: ["admin", "instructor"],
  },
  {
    id: "quiz-banks",
    label: "Quiz Banks",
    path: "/quiz-banks",
    icon: FileText,
    allowedRoles: ["admin", "instructor"],
  },
  {
    id: "groups",
    label: "Groups",
    path: "/groups",
    icon: Users,
    allowedRoles: ["admin", "instructor"],
  },
  {
    id: "exams",
    label: "Exams",
    path: "/exams",
    icon: BookOpen,
    allowedRoles: ["admin", "instructor"],
  },
  {
    id: "users",
    label: "User Management",
    path: "/users",
    icon: Users,
    allowedRoles: ["admin"], // Admin only
  },
  {
    id: "support",
    label: "Support Tickets",
    path: "/support",
    icon: MessageSquare,
    allowedRoles: ["admin"], // Admin only
  },
];

/**
 * Get navigation items by role
 * @param {string} role - User role
 * @returns {Array} Navigation items
 */
export const getNavigationByRole = (role) => {
  const roleLower = role?.toLowerCase();
  
  switch (roleLower) {
    case "admin":
      return ADMIN_NAV_ITEMS;
    case "instructor":
      // Instructor uses admin nav but filtered by allowedRoles
      return ADMIN_NAV_ITEMS.filter(
        (item) => !item.allowedRoles || item.allowedRoles.includes("instructor")
      );
    case "student":
      return STUDENT_NAV_ITEMS;
    default:
      return STUDENT_NAV_ITEMS;
  }
};
