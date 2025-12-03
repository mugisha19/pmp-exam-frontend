/**
 * useInitializeAuth Hook
 * Initialize authentication state on app mount
 */

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import * as authService from "@/services/auth.service";
import { TOKEN_KEYS, getStorageItem } from "@/constants/storage.constants";

export const useInitializeAuth = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);

        // Check if tokens exist in localStorage
        const accessToken = getStorageItem(TOKEN_KEYS.ACCESS_TOKEN);

        if (!accessToken) {
          // No token, clear any stale auth state
          if (isAuthenticated) {
            clearAuth();
          }
          setLoading(false);
          return;
        }

        // Validate session and get user data
        const userData = await authService.validateSession();

        if (userData) {
          setUser(userData);
        } else {
          // Invalid session, clear auth
          clearAuth();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // On error, clear auth state
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [clearAuth, setLoading, setUser, isAuthenticated]);

  return null;
};
