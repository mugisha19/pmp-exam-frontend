/**
 * useInitializeAuth Hook
 * Initialize authentication state on app mount
 */

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import * as authService from "@/services/auth.service";
import { TOKEN_KEYS, getStorageItem } from "@/constants/storage.constants";

export const useInitializeAuth = () => {
  const { setUser, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // Check if tokens exist in localStorage
        const accessToken = getStorageItem(TOKEN_KEYS.ACCESS_TOKEN);

        if (!accessToken) {
          // No token, clear auth and stop loading immediately
          if (isMounted) {
            clearAuth();
          }
          return;
        }

        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session validation timeout')), 5000)
        );

        // Validate session and get user data with timeout
        const userData = await Promise.race([
          authService.validateSession(),
          timeoutPromise
        ]);

        if (isMounted) {
          if (userData) {
            setUser(userData);
            setLoading(false);
          } else {
            clearAuth();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (isMounted) {
          clearAuth();
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
