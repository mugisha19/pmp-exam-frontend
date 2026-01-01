/**
 * StudentWebsiteLayout Component
 * Main website layout for student portal with top navigation and footer
 */

import { Outlet } from "react-router-dom";
import { TopNavbar } from "../website/navigation/TopNavbar";
import { Footer } from "../website/sections/Footer";

export const StudentWebsiteLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-bg-secondary">
      {/* Top Navigation */}
      <TopNavbar />

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default StudentWebsiteLayout;
