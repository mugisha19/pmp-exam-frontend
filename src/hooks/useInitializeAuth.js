/**
 * useInitializeAuth Hook
 * Initialize authentication state on app mount
 */

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import * as authService from "@/services/auth.service";

export const useInitializeAuth = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);

        // Check if tokens exist
        if (!accessToken) {
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
  }, [accessToken, clearAuth, setLoading, setUser]);

  return null;
};
