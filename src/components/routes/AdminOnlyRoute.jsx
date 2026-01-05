/**
 * AdminOnlyRoute Component
 * Wrapper for admin-only pages within the admin layout
 * Redirects instructors to unauthorized page
 */

import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { ROLES } from "@/constants/roles.constants";

export const AdminOnlyRoute = ({ children }) => {
  const { user } = useAuthStore();

  // If user is not admin (e.g., instructor), redirect to unauthorized
  if (user?.role !== ROLES.ADMIN) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default AdminOnlyRoute;
