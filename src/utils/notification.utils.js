/**
 * Notification Utilities
 * Helper functions for handling notification links and routing
 */

import { ROLES } from "@/constants/roles.constants";

/**
 * Transform notification link based on user role
 * Ensures links work correctly for admin, instructor, and student portals
 * 
 * @param {string} link - The link from the notification
 * @param {string} userRole - The current user's role
 * @returns {string} - The transformed link appropriate for the user's role
 */
export const transformNotificationLink = (link, userRole) => {
  if (!link) return null;

  // Remove leading slash for easier processing
  const cleanLink = link.startsWith("/") ? link.substring(1) : link;

  // Student role - transform management links to student portal links
  if (userRole === ROLES.STUDENT) {
    // Map admin/management routes to student routes
    const studentRouteMap = {
      "exams": "my-exams",
      "groups": "my-groups",
      "notifications": "my-notifications",
      "profile": "my-profile",
      "analytics": "my-analytics",
    };

    // Check if link starts with a management route
    for (const [adminRoute, studentRoute] of Object.entries(studentRouteMap)) {
      if (cleanLink.startsWith(adminRoute)) {
        return `/${cleanLink.replace(adminRoute, studentRoute)}`;
      }
    }

    // If it's already a student route, return as is
    if (cleanLink.startsWith("my-") || cleanLink.startsWith("home")) {
      return `/${cleanLink}`;
    }

    // Default: redirect to home if link doesn't match
    return "/home";
  }

  // Admin/Instructor role - remove /admin prefix if present
  if (userRole === ROLES.ADMIN || userRole === ROLES.INSTRUCTOR) {
    // Remove /admin prefix from legacy links
    if (cleanLink.startsWith("admin/")) {
      return `/${cleanLink.replace("admin/", "")}`;
    }

    // Return management route as is
    return `/${cleanLink}`;
  }

  // Fallback: return original link
  return `/${cleanLink}`;
};

/**
 * Check if a notification link is valid for the current user role
 * 
 * @param {string} link - The link from the notification
 * @param {string} userRole - The current user's role
 * @returns {boolean} - Whether the link is accessible for this role
 */
export const isNotificationLinkValid = (link, userRole) => {
  if (!link) return false;

  const cleanLink = link.startsWith("/") ? link.substring(1) : link;

  // Admin-only routes
  const adminOnlyRoutes = ["users", "instructors", "students", "topics", "courses-domains", "support"];
  
  // Check if instructor is trying to access admin-only route
  if (userRole === ROLES.INSTRUCTOR) {
    for (const route of adminOnlyRoutes) {
      if (cleanLink.startsWith(route)) {
        return false;
      }
    }
  }

  // Check if student is trying to access management route
  if (userRole === ROLES.STUDENT) {
    const managementRoutes = ["dashboard", "exams", "groups", "questions", "quiz-banks", "analytics", "users", "topics"];
    for (const route of managementRoutes) {
      if (cleanLink.startsWith(route) && !cleanLink.startsWith("my-")) {
        return false;
      }
    }
  }

  return true;
};

export default {
  transformNotificationLink,
  isNotificationLinkValid,
};
