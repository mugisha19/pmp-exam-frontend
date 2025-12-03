/**
 * StudentLayout Component
 * Dashboard layout wrapper for student role with Outlet for nested routes
 */

import { Outlet } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { STUDENT_NAV_ITEMS } from "@/constants/navigation.constants";

export const StudentLayout = () => {
  return (
    <DashboardLayout navItems={STUDENT_NAV_ITEMS} role="student">
      <Outlet />
    </DashboardLayout>
  );
};

export default StudentLayout;
