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
    id: "dashboard",
    label: "Home",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "groups",
    label: "Groups",
    path: "/groups",
    icon: Users,
  },
  {
    id: "my-learning",
    label: "My Learning",
    path: "/my-learning",
    icon: TrendingUp,
  },
  {
    id: "reminders",
    label: "Reminders",
    path: "/reminders",
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
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "users",
    label: "User Management",
    path: "/admin/users",
    icon: Users,
  },
  {
    id: "exams",
    label: "Exams",
    path: "/admin/exams",
    icon: BookOpen,
  },
  {
    id: "topics",
    label: "Topics",
    path: "/admin/topics",
    icon: BookMarked,
  },
  {
    id: "courses-domains",
    label: "Courses & Domains",
    path: "/admin/courses-domains",
    icon: FolderTree,
  },
  {
    id: "questions",
    label: "Questions",
    path: "/admin/questions",
    icon: FileQuestion,
  },
  {
    id: "quiz-banks",
    label: "Quiz Banks",
    path: "/admin/quiz-banks",
    icon: FileText,
  },
  {
    id: "groups",
    label: "Groups",
    path: "/admin/groups",
    icon: Users,
  },
  {
    id: "analytics",
    label: "Analytics",
    path: "/admin/analytics",
    icon: BarChart3,
  },
  {
    id: "notifications",
    label: "Notifications",
    path: "/admin/notifications",
    icon: Bell,
  },
  {
    id: "system",
    label: "System Settings",
    path: "/admin/system",
    icon: Settings,
  },
];

export const getNavigationByRole = (role) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return ADMIN_NAV_ITEMS;
    case "instructor":
      return INSTRUCTOR_NAV_ITEMS;
    case "student":
      return STUDENT_NAV_ITEMS;
    default:
      return STUDENT_NAV_ITEMS;
  }
};
