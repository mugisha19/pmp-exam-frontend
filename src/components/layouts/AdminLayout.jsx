/**
 * AdminLayout Component
 * Dashboard layout wrapper for admin role with Outlet for nested routes
 */

import { Outlet } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { ADMIN_NAV_ITEMS } from "@/constants/navigation.constants";

export const AdminLayout = () => {
  return (
    <DashboardLayout navItems={ADMIN_NAV_ITEMS} role="admin">
      <Outlet />
    </DashboardLayout>
  );
};

export default AdminLayout;
