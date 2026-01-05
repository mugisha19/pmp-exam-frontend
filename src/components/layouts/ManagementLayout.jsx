/**
 * ManagementLayout Component
 * Dashboard layout wrapper for admin and instructor roles with Outlet for nested routes
 * Uses general paths (no /admin prefix)
 */

import { Outlet } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { getNavigationByRole } from "@/constants/navigation.constants";
import { useAuthStore } from "@/stores/auth.store";

export const ManagementLayout = () => {
  const { user } = useAuthStore();
  const role = user?.role || "admin";
  
  // Get navigation items filtered by the user's actual role
  const navItems = getNavigationByRole(role);
  
  return (
    <DashboardLayout navItems={navItems} role={role}>
      <Outlet />
    </DashboardLayout>
  );
};

export default ManagementLayout;
