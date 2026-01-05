/**
 * Role Constants
 * User role definitions and mappings
 */

// Role types
export const ROLES = {
  STUDENT: "student",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
};

// Role display labels
export const ROLE_LABELS = {
  [ROLES.STUDENT]: "Student",
  [ROLES.INSTRUCTOR]: "Instructor",
  [ROLES.ADMIN]: "Administrator",
};

// Role descriptions
export const ROLE_DESCRIPTIONS = {
  [ROLES.STUDENT]:
    "Access to quizzes, performance tracking, and group participation",
  [ROLES.INSTRUCTOR]:
    "Create and manage quizzes, groups, and view student performance",
  [ROLES.ADMIN]:
    "Full system access including user management and system configuration",
};

// Role-based dashboard routes
export const ROLE_ROUTES = {
  [ROLES.STUDENT]: "/home", // Student goes to home page
  [ROLES.INSTRUCTOR]: "/dashboard", // Instructor uses general dashboard
  [ROLES.ADMIN]: "/dashboard", // Admin uses general dashboard
};

// Role permissions map
export const ROLE_PERMISSIONS = {
  [ROLES.STUDENT]: [
    "quiz.take",
    "quiz.view",
    "performance.view_own",
    "group.join",
    "group.view",
    "profile.edit_own",
  ],
  [ROLES.INSTRUCTOR]: [
    "quiz.take",
    "quiz.view",
    "quiz.create",
    "quiz.edit",
    "quiz.delete",
    "question.create",
    "question.edit",
    "question.delete",
    "group.create",
    "group.edit",
    "group.delete",
    "group.manage_members",
    "performance.view_own",
    "performance.view_students",
    "profile.edit_own",
  ],
  [ROLES.ADMIN]: [
    "quiz.take",
    "quiz.view",
    "quiz.create",
    "quiz.edit",
    "quiz.delete",
    "question.create",
    "question.edit",
    "question.delete",
    "group.create",
    "group.edit",
    "group.delete",
    "group.manage_members",
    "user.create",
    "user.edit",
    "user.delete",
    "user.view_all",
    "performance.view_all",
    "system.configure",
    "profile.edit_any",
  ],
};

// Role hierarchy (higher number = higher privilege)
export const ROLE_HIERARCHY = {
  [ROLES.STUDENT]: 1,
  [ROLES.INSTRUCTOR]: 2,
  [ROLES.ADMIN]: 3,
};

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

/**
 * Check if a role has higher or equal privilege than another
 * @param {string} role1 - First role
 * @param {string} role2 - Second role
 * @returns {boolean}
 */
export const hasHigherOrEqualPrivilege = (role1, role2) => {
  return ROLE_HIERARCHY[role1] >= ROLE_HIERARCHY[role2];
};

/**
 * Get available roles for assignment (based on current user role)
 * @param {string} currentUserRole - Current user's role
 * @returns {Array} Array of assignable roles
 */
export const getAssignableRoles = (currentUserRole) => {
  const currentHierarchy = ROLE_HIERARCHY[currentUserRole];

  return Object.entries(ROLE_HIERARCHY)
    .filter(([, hierarchy]) => hierarchy < currentHierarchy)
    .map(([role]) => role);
};
