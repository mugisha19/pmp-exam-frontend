/**
 * InstructorLayout Component
 * Dashboard layout wrapper for instructor role with Outlet for nested routes
 */

import { Outlet } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { INSTRUCTOR_NAV_ITEMS } from "@/constants/navigation.constants";

export const InstructorLayout = () => {
  return (
    <DashboardLayout navItems={INSTRUCTOR_NAV_ITEMS} role="instructor">
      <Outlet />
    </DashboardLayout>
  );
};

export default InstructorLayout;
