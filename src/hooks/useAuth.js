/**
 * useAuth Hook
 * Custom hook for authentication state and operations
 */

import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import * as authService from "@/services/auth.service";
import { ROLE_ROUTES } from "@/constants/roles.constants";
import { AUTH_ROUTES } from "@/constants/routes.constants";

/**
 * Custom authentication hook
 * Provides auth state, actions, and utilities
 */
export const useAuth = () => {
  const navigate = useNavigate();

  // Auth store state and actions
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const initialize = useAuthStore((state) => state.initialize);
  const updateUser = useAuthStore((state) => state.updateUser);

  // Role getters
  const getUserRole = useAuthStore((state) => state.getUserRole);
  const isStudent = useAuthStore((state) => state.isStudent);
  const isInstructor = useAuthStore((state) => state.isInstructor);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const hasRole = useAuthStore((state) => state.hasRole);
  const isEmailVerified = useAuthStore((state) => state.isEmailVerified);
  const isActive = useAuthStore((state) => state.isActive);

  /**
   * Initialize authentication on mount
   */
  useEffect(() => {
    initialize();
  }, [initialize]);

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data
   */
  const login = useCallback(
    async (email, password) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authService.login(email, password);
        setUser(response.user || response);

        return response;
      } catch (err) {
        const errorMessage = err.message || "Login failed";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setUser, setLoading, setError]
  );

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  const register = useCallback(
    async (userData) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authService.register(userData);

        return response;
      } catch (err) {
        const errorMessage = err.message || "Registration failed";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  /**
   * Logout user
   * @param {boolean} logoutAll - Logout from all devices
   * @param {boolean} redirect - Redirect to login page
   */
  const logout = useCallback(
    async (logoutAll = false, redirect = true) => {
      try {
        setLoading(true);
        await authService.logout(logoutAll);
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        clearAuth();
        setLoading(false);

        if (redirect) {
          navigate(AUTH_ROUTES.LOGIN, { replace: true });
        }
      }
    },
    [clearAuth, setLoading, navigate]
  );

  /**
   * Verify email
   * @param {string} token - Email verification token
   * @returns {Promise<Object>} Verification response
   */
  const verifyEmail = useCallback(
    async (token) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authService.verifyEmail(token);

        // Update user's email_verified status
        if (user) {
          updateUser({ email_verified: true });
        }

        return response;
      } catch (err) {
        const errorMessage = err.message || "Email verification failed";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, updateUser, setLoading, setError]
  );

  /**
   * Resend verification email
   * @param {string} email - User email
   * @returns {Promise<Object>} Resend response
   */
  const resendVerification = useCallback(
    async (email) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authService.resendVerification(email);
        return response;
      } catch (err) {
        const errorMessage =
          err.message || "Failed to resend verification email";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset request response
   */
  const forgotPassword = useCallback(
    async (email) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authService.forgotPassword(email);
        return response;
      } catch (err) {
        const errorMessage =
          err.message || "Failed to send password reset email";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  /**
   * Reset password
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Reset response
   */
  const resetPassword = useCallback(
    async (token, newPassword) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authService.resetPassword(token, newPassword);
        return response;
      } catch (err) {
        const errorMessage = err.message || "Failed to reset password";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Change password response
   */
  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authService.changePassword(
          currentPassword,
          newPassword
        );
        return response;
      } catch (err) {
        const errorMessage = err.message || "Failed to change password";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  /**
   * Get default route based on user role
   * @returns {string} Default route for user's role
   */
  const getDefaultRoute = useCallback(() => {
    if (!user || !user.role) {
      return AUTH_ROUTES.LOGIN;
    }

    return ROLE_ROUTES[user.role] || AUTH_ROUTES.LOGIN;
  }, [user]);

  /**
   * Redirect to default route based on role
   */
  const redirectToDefaultRoute = useCallback(() => {
    const route = getDefaultRoute();
    navigate(route, { replace: true });
  }, [getDefaultRoute, navigate]);

  /**
   * Check if user can access route based on role
   * @param {string|string[]} allowedRoles - Allowed role(s)
   * @returns {boolean}
   */
  const canAccessRoute = useCallback(
    (allowedRoles) => {
      if (!user || !user.role) return false;

      if (Array.isArray(allowedRoles)) {
        return allowedRoles.includes(user.role);
      }

      return user.role === allowedRoles;
    },
    [user]
  );

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    logout,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser,
    initialize,

    // Role checks
    getUserRole,
    isStudent: isStudent(),
    isInstructor: isInstructor(),
    isAdmin: isAdmin(),
    hasRole,
    isEmailVerified: isEmailVerified(),
    isActive: isActive(),

    // Route utilities
    getDefaultRoute,
    redirectToDefaultRoute,
    canAccessRoute,
  };
};

export default useAuth;
