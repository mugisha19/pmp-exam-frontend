/**
 * InitializeAuth Component
 * Wrapper to initialize auth state before rendering app
 */

import { useInitializeAuth } from "@/hooks/useInitializeAuth";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui";

export const InitializeAuth = ({ children }) => {
  useInitializeAuth();
  const isLoading = useAuthStore((state) => state.isLoading);

  // Show loading spinner during initialization
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return children;
};

export default InitializeAuth;
