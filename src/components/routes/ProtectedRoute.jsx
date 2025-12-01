/**
 * ProtectedRoute Component
 * Redirect to login if not authenticated
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui";

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  // Redirect to login if not authenticated, save attempted URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
