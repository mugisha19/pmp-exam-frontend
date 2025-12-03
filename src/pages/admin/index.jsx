/**
 * Admin Pages Index
 * Export all admin page components
 */

// Implemented Pages
export { Dashboard as AdminDashboard } from "./Dashboard";
export { UserManagement as UserManagementPage } from "./UserManagement";
export { GroupManagement as AdminGroupsPage } from "./GroupManagement";
export { GroupDetails as AdminGroupDetailsPage } from "./GroupDetails";
export { Analytics as AnalyticsPage } from "./Analytics";
export { Settings as SystemSettingsPage } from "./Settings";
export { Notifications as NotificationsPage } from "./Notifications";
export { Profile as AdminProfilePage } from "./Profile";

// Placeholder Pages - To be implemented
export const AdminInstructorsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Instructors</h1>
    <p className="text-gray-500">Manage instructor accounts - Coming Soon</p>
  </div>
);

export const AdminStudentsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Students</h1>
    <p className="text-gray-500">Manage student accounts - Coming Soon</p>
  </div>
);

export const AdminExamsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Exams</h1>
    <p className="text-gray-500">Oversee all exams - Coming Soon</p>
  </div>
);

export const ReportsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
    <p className="text-gray-500">Generate and view reports - Coming Soon</p>
  </div>
);
