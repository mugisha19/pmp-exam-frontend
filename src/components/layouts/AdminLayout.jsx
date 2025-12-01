/**
 * AdminLayout Component
 * Dashboard layout wrapper for admin role
 */

import DashboardLayout from "./DashboardLayout";
import { ADMIN_NAV_ITEMS } from "@/constants/navigation.constants";

export const AdminLayout = ({ children, title, subtitle }) => {
  return (
    <DashboardLayout
      title={title}
      subtitle={subtitle}
      sidebarConfig={ADMIN_NAV_ITEMS}
    >
      {children}
    </DashboardLayout>
  );
};

export default AdminLayout;
