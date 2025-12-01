/**
 * PublicRoute Component
 * Redirect to dashboard if already authenticated
 */

import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

export const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  // Redirect to dashboard if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
