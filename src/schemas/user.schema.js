/**
 * User Validation Schemas
 * Zod schemas for user-related form validation
 */

import { z } from "zod";

// Role enum values
export const USER_ROLES = {
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
};

// Status enum values
export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  SUSPENDED: "suspended",
};

// Role options for select dropdowns
export const ROLE_OPTIONS = [
  { value: USER_ROLES.ADMIN, label: "Admin" },
  { value: USER_ROLES.INSTRUCTOR, label: "Instructor" },
  { value: USER_ROLES.STUDENT, label: "Student" },
];

// Status options for select dropdowns
export const STATUS_OPTIONS = [
  { value: USER_STATUS.ACTIVE, label: "Active" },
  { value: USER_STATUS.INACTIVE, label: "Inactive" },
  { value: USER_STATUS.PENDING, label: "Pending" },
  { value: USER_STATUS.SUSPENDED, label: "Suspended" },
];

/**
 * Create user schema
 * Used when adding a new user
 */
export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  first_name: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR, USER_ROLES.STUDENT], {
    required_error: "Please select a role",
    invalid_type_error: "Invalid role selected",
  }),
});

/**
 * Update user schema
 * Used when editing user profile information
 */
export const updateUserSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  avatar_url: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

/**
 * Change role schema
 * Used when changing a user's role
 */
export const changeRoleSchema = z.object({
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR, USER_ROLES.STUDENT], {
    required_error: "Please select a role",
    invalid_type_error: "Invalid role selected",
  }),
  reason: z
    .string()
    .max(500, "Reason must be less than 500 characters")
    .optional(),
});

/**
 * Change status schema
 * Used when enabling/disabling a user
 */
export const changeStatusSchema = z.object({
  status: z.enum(
    [USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.SUSPENDED],
    {
      required_error: "Please select a status",
      invalid_type_error: "Invalid status selected",
    }
  ),
  reason: z
    .string()
    .max(500, "Reason must be less than 500 characters")
    .optional(),
});

/**
 * Bulk action schema
 * Used for bulk user operations
 */
export const bulkActionSchema = z.object({
  action: z.enum(["delete", "activate", "deactivate", "change_role"], {
    required_error: "Please select an action",
  }),
  user_ids: z
    .array(z.string().uuid())
    .min(1, "Please select at least one user"),
  role: z
    .enum([USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR, USER_ROLES.STUDENT])
    .optional(),
});

/**
 * Type exports for TypeScript-like usage
 */
export const userSchemas = {
  createUserSchema,
  updateUserSchema,
  changeRoleSchema,
  changeStatusSchema,
  bulkActionSchema,
};

export default userSchemas;
