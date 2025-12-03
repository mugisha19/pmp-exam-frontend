/**
 * PublicRoute Component
 * Redirect to role-based dashboard if already authenticated
 */

import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { ROLE_ROUTES } from "@/constants/roles.constants";

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  // Redirect to role-based dashboard if already logged in
  if (isAuthenticated && user) {
    const userRole = user.role?.toLowerCase();
    const defaultRoute = ROLE_ROUTES[userRole] || "/dashboard";
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
};

export default PublicRoute;
