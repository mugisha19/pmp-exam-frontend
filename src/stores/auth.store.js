/**
 * Authentication Store
 * Global state management for authentication using Zustand
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  TOKEN_KEYS,
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
} from "@/constants/storage.constants";
import { ROLES } from "@/constants/roles.constants";

/**
 * Initial state
 */
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

/**
 * Authentication Store
 */
export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        ...initialState,

        // Actions
        /**
         * Set authenticated user
         * @param {Object} user - User data
         */
        setUser: (user) => {
          set(
            {
              user,
              isAuthenticated: !!user,
              error: null,
            },
            false,
            "auth/setUser"
          );

          // Store user data in localStorage
          if (user) {
            setStorageItem(STORAGE_KEYS.USER, user);
            setStorageItem(STORAGE_KEYS.USER_ROLE, user.role);
          }
        },

        /**
         * Set loading state
         * @param {boolean} isLoading - Loading state
         */
        setLoading: (isLoading) => {
          set({ isLoading }, false, "auth/setLoading");
        },

        /**
         * Set error
         * @param {string|Object} error - Error message or object
         */
        setError: (error) => {
          set({ error }, false, "auth/setError");
        },

        /**
         * Clear authentication state
         */
        clearAuth: () => {
          set({ ...initialState, isLoading: false }, false, "auth/clearAuth");

          // Clear stored data
          removeStorageItem(TOKEN_KEYS.ACCESS_TOKEN);
          removeStorageItem(TOKEN_KEYS.REFRESH_TOKEN);
          removeStorageItem(TOKEN_KEYS.TOKEN_EXPIRY);
          removeStorageItem(STORAGE_KEYS.USER);
          removeStorageItem(STORAGE_KEYS.USER_ROLE);
          removeStorageItem(STORAGE_KEYS.USER_PREFERENCES);
        },

        /**
         * Initialize authentication state
         * Checks localStorage and validates session
         */
        initialize: async () => {
          set({ isLoading: true }, false, "auth/initialize");

          try {
            // Check for stored token
            const token = getStorageItem(TOKEN_KEYS.ACCESS_TOKEN);
            const storedUser = getStorageItem(STORAGE_KEYS.USER);

            if (token && storedUser) {
              // Token exists, validate by fetching current user
              try {
                const { getCurrentUser } = await import(
                  "@/services/user.service"
                );
                const user = await getCurrentUser();

                set(
                  {
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                  },
                  false,
                  "auth/initialize/success"
                );
              } catch (error) {
                // Token invalid or expired, clear auth
                console.error("Session validation failed:", error);
                get().clearAuth();
                set({ isLoading: false }, false, "auth/initialize/failed");
              }
            } else {
              // No token, user not authenticated
              set(
                {
                  ...initialState,
                  isLoading: false,
                },
                false,
                "auth/initialize/noToken"
              );
            }
          } catch (error) {
            console.error("Auth initialization error:", error);
            set(
              {
                ...initialState,
                isLoading: false,
                error: "Failed to initialize authentication",
              },
              false,
              "auth/initialize/error"
            );
          }
        },

        // Getters
        /**
         * Get user role
         * @returns {string|null} User role
         */
        getUserRole: () => {
          return get().user?.role || null;
        },

        /**
         * Check if user is a student
         * @returns {boolean}
         */
        isStudent: () => {
          return get().user?.role === ROLES.STUDENT;
        },

        /**
         * Check if user is an instructor
         * @returns {boolean}
         */
        isInstructor: () => {
          return get().user?.role === ROLES.INSTRUCTOR;
        },

        /**
         * Check if user is an admin
         * @returns {boolean}
         */
        isAdmin: () => {
          return get().user?.role === ROLES.ADMIN;
        },

        /**
         * Check if user has specific role
         * @param {string} role - Role to check
         * @returns {boolean}
         */
        hasRole: (role) => {
          return get().user?.role === role;
        },

        /**
         * Check if user email is verified
         * @returns {boolean}
         */
        isEmailVerified: () => {
          return get().user?.email_verified === true;
        },

        /**
         * Check if user account is active
         * @returns {boolean}
         */
        isActive: () => {
          return get().user?.active === true;
        },

        /**
         * Update user data (partial update)
         * @param {Object} userData - User data to update
         */
        updateUser: (userData) => {
          const currentUser = get().user;
          if (currentUser) {
            const updatedUser = { ...currentUser, ...userData };
            get().setUser(updatedUser);
          }
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: "AuthStore",
      enabled: import.meta.env.DEV,
    }
  )
);

/**
 * Export selectors for optimized re-renders
 */
export const selectUser = (state) => state.user;
export const selectIsAuthenticated = (state) => state.isAuthenticated;
export const selectIsLoading = (state) => state.isLoading;
export const selectError = (state) => state.error;
export const selectUserRole = (state) => state.user?.role;
export const selectIsStudent = (state) => state.user?.role === ROLES.STUDENT;
export const selectIsInstructor = (state) =>
  state.user?.role === ROLES.INSTRUCTOR;
export const selectIsAdmin = (state) => state.user?.role === ROLES.ADMIN;

export default useAuthStore;
