/**
 * StudentLayout Component
 * Dashboard layout wrapper for student role
 */

import DashboardLayout from "./DashboardLayout";
import { STUDENT_NAV_ITEMS } from "@/constants/navigation.constants";

export const StudentLayout = ({ children, title, subtitle }) => {
  return (
    <DashboardLayout
      title={title}
      subtitle={subtitle}
      sidebarConfig={STUDENT_NAV_ITEMS}
    >
      {children}
    </DashboardLayout>
  );
};

export default StudentLayout;
