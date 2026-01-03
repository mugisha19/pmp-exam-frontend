/**
 * Role-Based Redirect Component
 * Redirects users to their role-specific dashboard
 */

import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { ROLE_ROUTES } from "@/constants/roles.constants";
import { AUTH_ROUTES } from "@/constants/routes.constants";
import { Spinner } from "@/components/ui";

export const RoleBasedRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Wait for auth to initialize
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={AUTH_ROUTES.LOGIN} replace />;
  }

  // Redirect to role-specific dashboard
  const redirectPath = ROLE_ROUTES[user.role] || "/admin/dashboard";

  return <Navigate to={redirectPath} replace />;
};

export default RoleBasedRedirect;
