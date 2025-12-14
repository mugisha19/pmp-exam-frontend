/**
 * Admin Pages Index
 * Export all admin page components
 */

// Implemented Pages
export { Dashboard as AdminDashboard } from "./Dashboard";
export { UserManagement as UserManagementPage } from "./UserManagement";
export { default as AdminGroupsPage } from "./GroupManagement";
export { GroupDetails as AdminGroupDetailsPage } from "./GroupDetails";
export { default as GroupQuizDetails } from "./GroupQuizDetails";
export { default as QuizAttemptDetails } from "./QuizAttemptDetails";
export { default as AdminTopicsPage } from "./TopicManagement";
export { default as AdminQuestionsPage } from "./QuestionManagement";
export { default as AdminQuestionDetailsPage } from "./QuestionDetails";
export { default as AdminQuestionEditPage } from "./QuestionEdit";
export { default as AdminQuizBanksPage } from "./QuizBankManagement";
export { default as AdminQuizBankAddQuestionsPage } from "./QuizBankAddQuestions";
export { default as AdminQuizBankDetailsPage } from "./QuizBankDetails";
export { default as AdminExamManagementPage } from "./ExamManagement";
export { default as AdminExamDetailsPage } from "./ExamDetails";
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

export { default as AdminExamsPage } from "./ExamManagement";
export { default as AdminExamDetails } from "./ExamDetails";

export const ReportsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
    <p className="text-gray-500">Generate and view reports - Coming Soon</p>
  </div>
);
