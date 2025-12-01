/**
 * Role Utilities
 * Helper functions for role-based access control
 */

/**
 * Check if user has a specific role
 * @param {Object} user - User object with role property
 * @param {string} role - Role to check
 * @returns {boolean}
 */
export const hasRole = (user, role) => {
  if (!user || !user.role) return false;
  return user.role === role;
};

/**
 * Check if user has any of the specified roles
 * @param {Object} user - User object with role property
 * @param {string[]} roles - Array of roles to check
 * @returns {boolean}
 */
export const hasAnyRole = (user, roles = []) => {
  if (!user || !user.role || !Array.isArray(roles)) return false;
  return roles.includes(user.role);
};

/**
 * Get default route based on user role
 * @param {Object} user - User object with role property
 * @returns {string} - Default route path
 */
export const getDefaultRouteForRole = (user) => {
  if (!user || !user.role) return "/dashboard";

  switch (user.role) {
    case "admin":
      return "/admin/dashboard";
    case "instructor":
      return "/instructor/dashboard";
    case "student":
    default:
      return "/dashboard";
  }
};
