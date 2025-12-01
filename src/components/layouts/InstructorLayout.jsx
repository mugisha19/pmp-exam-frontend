/**
 * InstructorLayout Component
 * Dashboard layout wrapper for instructor role
 */

import DashboardLayout from "./DashboardLayout";
import { INSTRUCTOR_NAV_ITEMS } from "@/constants/navigation.constants";

export const InstructorLayout = ({ children, title, subtitle }) => {
  return (
    <DashboardLayout
      title={title}
      subtitle={subtitle}
      sidebarConfig={INSTRUCTOR_NAV_ITEMS}
    >
      {children}
    </DashboardLayout>
  );
};

export default InstructorLayout;
