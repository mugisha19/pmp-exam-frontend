/**
 * User React Query Hooks
 * Custom hooks for user profile and settings operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as userService from "@/services/user.service";
import { useAuthStore } from "@/stores/auth.store";
import { queryKeys } from "@/lib/query-client";
import { TOKEN_KEYS, getStorageItem } from "@/constants/storage.constants";

/**
 * Current user query hook
 * Fetches authenticated user profile
 * @param {Object} options - Query options
 */
export const useCurrentUser = (options = {}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  // Check if token exists
  const hasToken = !!getStorageItem(TOKEN_KEYS.ACCESS_TOKEN);

  return useQuery({
    queryKey: queryKeys.users.current(),
    queryFn: async () => {
      try {
        const user = await userService.getCurrentUser();
        return user;
      } catch (error) {
        // If unauthorized, clear auth
        if (error.status === 401) {
          clearAuth();
        }
        throw error;
      }
    },
    enabled: hasToken && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: (data) => {
      // Update auth store with fresh user data
      setUser(data);
    },
    onError: (error) => {
      console.error("Failed to fetch current user:", error);
    },
    ...options,
  });
};

/**
 * Update profile mutation hook
 * Updates user profile information
 */
export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (profileData) => userService.updateProfile(profileData),
    onSuccess: (data) => {
      // Update auth store
      updateUser(data);

      // Update query cache
      queryClient.setQueryData(queryKeys.users.current(), data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current() });

      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to update profile. Please try again.";

      // Handle validation errors
      if (error.errors) {
        Object.values(error.errors).forEach((err) => {
          toast.error(err);
        });
      } else {
        toast.error(errorMessage);
      }
    },
  });
};

/**
 * Update settings mutation hook
 * Updates user settings and preferences
 */
export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (settings) => userService.updateSettings(settings),
    onSuccess: (data) => {
      // Update auth store with new settings
      updateUser(data);

      // Invalidate current user query
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current() });

      toast.success("Settings updated successfully!");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to update settings. Please try again.";

      if (error.errors) {
        Object.values(error.errors).forEach((err) => {
          toast.error(err);
        });
      } else {
        toast.error(errorMessage);
      }
    },
  });
};

/**
 * Change password mutation hook
 * Changes authenticated user's password
 */
export const useChangePasswordMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      userService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      // Refetch user data to update password_changed_at
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current() });
      toast.success(
        "Password changed successfully! Please login with your new password."
      );
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to change password. Please try again.";

      if (error.errors) {
        Object.values(error.errors).forEach((err) => {
          toast.error(err);
        });
      } else {
        toast.error(errorMessage);
      }
    },
  });
};

/**
 * Get user by ID query hook (Admin/Instructor)
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 */
export const useUser = (userId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch user";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * List users query hook (Admin/Instructor)
 * @param {Object} filters - Query filters (page, per_page, role, search, active)
 * @param {Object} options - Query options
 */
export const useUsers = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => userService.getUsers(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    keepPreviousData: true, // Keep previous data on filter change
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch users";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * Create user mutation hook (Admin)
 */
export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData) => userService.createUser(userData),
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });

      toast.success("User created. Credentials sent via email.");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to create user. Please try again.";

      if (error.errors) {
        Object.values(error.errors).forEach((err) => {
          toast.error(err);
        });
      } else {
        toast.error(errorMessage);
      }
    },
  });
};

/**
 * Update user mutation hook (Admin)
 */
export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, userData }) =>
      userService.updateUser(userId, userData),
    onSuccess: (data, variables) => {
      // Update specific user in cache
      queryClient.setQueryData(queryKeys.users.detail(variables.userId), data);

      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });

      toast.success("User updated successfully!");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to update user. Please try again.";

      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach((err) => {
          // Handle both string errors and {field, message} objects
          const msg = typeof err === "string" ? err : err.message || err.field;
          if (msg) toast.error(msg);
        });
      } else {
        toast.error(errorMessage);
      }
    },
  });
};

/**
 * Delete user mutation hook (Admin)
 */
export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => userService.deleteUser(userId),
    onSuccess: (_, userId) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(userId) });

      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });

      toast.success("User deleted");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to delete user. Please try again.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Update user email mutation hook (Admin)
 */
export const useUpdateUserEmailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, newEmail }) =>
      userService.updateUserEmail(userId, newEmail),
    onSuccess: (data, variables) => {
      // Update specific user in cache
      queryClient.setQueryData(queryKeys.users.detail(variables.userId), data);

      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });

      toast.success("User email updated successfully!");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to update email. Please try again.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Update user status mutation hook (Admin)
 */
export const useUpdateUserStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, active, reason }) =>
      userService.updateUserStatus(userId, active, reason),
    onSuccess: (data, variables) => {
      // Update specific user in cache
      queryClient.setQueryData(queryKeys.users.detail(variables.userId), data);

      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });

      const statusText = variables.active ? "activated" : "deactivated";
      toast.success(`User ${statusText} successfully!`);
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to update user status. Please try again.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Update user role mutation hook (Admin)
 */
export const useUpdateUserRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }) => userService.updateUserRole(userId, role),
    onSuccess: (data, variables) => {
      // Update specific user in cache
      queryClient.setQueryData(queryKeys.users.detail(variables.userId), data);

      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });

      toast.success("Role updated");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to update user role. Please try again.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Resend credentials mutation hook (Admin)
 */
export const useResendCredentialsMutation = () => {
  return useMutation({
    mutationFn: (userId) => userService.resendCredentials(userId),
    onSuccess: () => {
      toast.success("Credentials resent to user's email");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to resend credentials. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export default {
  useCurrentUser,
  useUpdateProfileMutation,
  useUpdateSettingsMutation,
  useChangePasswordMutation,
  useUser,
  useUsers,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserEmailMutation,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useResendCredentialsMutation,
};
