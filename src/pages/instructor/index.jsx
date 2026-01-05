/**
 * Instructor Pages Index
 * Export all instructor page components
 */

// Implemented Pages
export { Dashboard as InstructorDashboard } from "./Dashboard";
export { default as QuestionBankPage } from "./QuestionBank";

// Placeholder Pages - To be implemented
export const ManageExamsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Manage Exams</h1>
    <p className="text-gray-500">Create and manage your exams - Coming Soon</p>
  </div>
);

export const GroupsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Groups</h1>
    <p className="text-gray-500">Manage student groups - Coming Soon</p>
  </div>
);

export const StudentsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Students</h1>
    <p className="text-gray-500">View and manage students - Coming Soon</p>
  </div>
);

export const InstructorResultsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">
      Results & Analytics
    </h1>
    <p className="text-gray-500">View student performance - Coming Soon</p>
  </div>
);

export const GradingPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Grading</h1>
    <p className="text-gray-500">Grade student submissions - Coming Soon</p>
  </div>
);

export const SchedulePage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Schedule</h1>
    <p className="text-gray-500">Manage exam schedules - Coming Soon</p>
  </div>
);

export const AnnouncementsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Announcements</h1>
    <p className="text-gray-500">
      Post announcements to students - Coming Soon
    </p>
  </div>
);

export const InstructorProfilePage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
    <p className="text-gray-500">Manage your profile - Coming Soon</p>
  </div>
);

export const InstructorSettingsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
    <p className="text-gray-500">Customize your preferences - Coming Soon</p>
  </div>
);
