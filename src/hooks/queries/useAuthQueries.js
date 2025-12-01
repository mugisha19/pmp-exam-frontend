/**
 * Authentication React Query Hooks
 * Custom hooks for authentication operations using TanStack Query
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as authService from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { AUTH_ROUTES } from "@/constants/routes.constants";
import { ROLE_ROUTES } from "@/constants/roles.constants";

/**
 * Login mutation hook
 * Authenticates user and updates store
 */
export const useLoginMutation = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const setError = useAuthStore((state) => state.setError);

  return useMutation({
    retry: false, // Don't retry failed login attempts
    mutationFn: ({ email, password }) => authService.login(email, password),
    onSuccess: (data) => {
      // Extract user from response
      const user = data.user || data;

      // Update auth store
      setUser(user);
      setError(null);

      // Show success message
      toast.success(`Welcome back, ${user.first_name}!`);

      // Navigate to default route based on role
      const defaultRoute = ROLE_ROUTES[user.role] || AUTH_ROUTES.LOGIN;
      navigate(defaultRoute, { replace: true });
    },
    onError: (error) => {
      const errorMessage = error.message || "Login failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });
};

/**
 * Register mutation hook
 * Creates new user account
 */
export const useRegisterMutation = () => {
  const navigate = useNavigate();
  const setError = useAuthStore((state) => state.setError);

  return useMutation({
    mutationFn: (userData) => authService.register(userData),
    onSuccess: (data) => {
      setError(null);

      // Show success message
      toast.success(
        "Registration successful! Please check your email to verify your account."
      );

      // Navigate to verification pending page
      navigate(AUTH_ROUTES.VERIFY_EMAIL, {
        replace: true,
        state: { email: data.email },
      });
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Registration failed. Please try again.";
      setError(errorMessage);

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
 * Forgot password mutation hook
 * Sends password reset email
 */
export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (email) => authService.forgotPassword(email),
    onSuccess: () => {
      toast.success(
        "Password reset instructions have been sent to your email."
      );
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to send reset email. Please try again.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Reset password mutation hook
 * Resets user password with token
 */
export const useResetPasswordMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ token, newPassword }) =>
      authService.resetPassword(token, newPassword),
    onSuccess: () => {
      toast.success(
        "Password reset successful! You can now login with your new password."
      );

      // Navigate to login
      navigate(AUTH_ROUTES.LOGIN, { replace: true });
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Password reset failed. Please try again.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Verify email mutation hook
 * Verifies user email with token
 * @param {Object} options - Options
 * @param {boolean} options.autoLogin - Auto-login after verification
 */
export const useVerifyEmailMutation = ({ autoLogin = false } = {}) => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (token) => authService.verifyEmail(token),
    onSuccess: (data) => {
      toast.success("Email verified successfully!");

      if (autoLogin && data.access_token) {
        // Auto-login: set user from response
        const user = data.user || data;
        setUser(user);

        // Navigate to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        // Just update email_verified status
        updateUser({ email_verified: true });

        // Navigate to login
        navigate(AUTH_ROUTES.LOGIN, {
          replace: true,
          state: { emailVerified: true },
        });
      }
    },
    onError: (error) => {
      const errorMessage =
        error.message ||
        "Email verification failed. The link may have expired.";
      toast.error(errorMessage);

      // Navigate to resend verification page
      navigate(AUTH_ROUTES.VERIFY_EMAIL, { replace: true });
    },
  });
};

/**
 * Resend verification email mutation hook
 * Resends verification email to user
 */
export const useResendVerificationMutation = () => {
  return useMutation({
    mutationFn: (email) => authService.resendVerification(email),
    onSuccess: () => {
      toast.success("Verification email sent! Please check your inbox.");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to send verification email. Please try again.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Logout mutation hook
 * Logs out user and clears all data
 * @param {Object} options - Options
 * @param {boolean} options.logoutAll - Logout from all devices
 */
export const useLogoutMutation = ({ logoutAll = false } = {}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: () => authService.logout(logoutAll),
    onSuccess: () => {
      // Clear auth store
      clearAuth();

      // Clear all queries
      queryClient.clear();

      // Show success message
      toast.success("Logged out successfully");

      // Navigate to login
      navigate(AUTH_ROUTES.LOGIN, { replace: true });
    },
    onError: (error) => {
      // Even on error, clear local auth
      clearAuth();
      queryClient.clear();

      const errorMessage = error.message || "Logout failed";
      toast.error(errorMessage);

      // Still navigate to login
      navigate(AUTH_ROUTES.LOGIN, { replace: true });
    },
  });
};

/**
 * Change password mutation hook
 * Changes user password while authenticated
 */
export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      authService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success("Password changed successfully!");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to change password. Please try again.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Google OAuth login hook
 * Initiates Google OAuth flow
 */
export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: () => authService.getGoogleAuthUrl(),
    onSuccess: (authUrl) => {
      // Redirect to Google OAuth
      window.location.href = authUrl;
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to initiate Google login. Please try again.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Google OAuth callback hook
 * Handles Google OAuth callback
 */
export const useGoogleCallbackMutation = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const setError = useAuthStore((state) => state.setError);

  return useMutation({
    mutationFn: (code) => authService.handleGoogleCallback(code),
    onSuccess: (data) => {
      const user = data.user || data;
      setUser(user);
      setError(null);

      toast.success(`Welcome, ${user.first_name}!`);

      // Navigate to dashboard
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Google login failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);

      // Navigate back to login
      navigate(AUTH_ROUTES.LOGIN, { replace: true });
    },
  });
};

export default {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useGoogleLogin,
  useGoogleCallbackMutation,
};
