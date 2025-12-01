/**
 * DashboardLayout Component
 * Main layout wrapper with sidebar and content area
 */

import { cn } from "@/utils/cn";
import { useAuthStore } from "@/stores/auth.store";
import { useUIStore } from "@/stores/ui.store";
import { getNavigationByRole } from "@/constants/navigation.constants";
import Sidebar from "../shared/Sidebar";
import MobileSidebar from "../shared/MobileSidebar";
import DashboardHeader from "../shared/DashboardHeader";

export const DashboardLayout = ({
  children,
  title,
  subtitle,
  sidebarConfig,
}) => {
  const { user } = useAuthStore();
  const { sidebarCollapsed } = useUIStore();

  // Get navigation items based on role or use provided config
  const navItems = sidebarConfig || getNavigationByRole(user?.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar navItems={navItems} />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar navItems={navItems} />

      {/* Main Content */}
      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          "lg:ml-64",
          sidebarCollapsed && "lg:ml-20"
        )}
      >
        {/* Header */}
        <DashboardHeader title={title} subtitle={subtitle} />

        {/* Content Area */}
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
