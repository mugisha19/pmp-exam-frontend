/**
 * RoleRoute Component
 * Check if user has required role(s)
 */

import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui";
import { hasAnyRole } from "../../utils/role.utils";

export const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoading } = useAuthStore();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  // Check if user has any of the allowed roles
  if (!user || !hasAnyRole(user, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleRoute;
