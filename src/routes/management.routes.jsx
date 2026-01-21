/**
 * Management Routes Configuration
 * Routes accessible to admins and instructors (with restrictions)
 * Uses ManagementLayout as parent with nested child routes
 * 
 * General paths (no /admin prefix):
 * - /dashboard, /questions, /groups, /exams, etc.
 * 
 * Instructor restrictions:
 * - Cannot access: users, topics, courses-domains, support
 */

import { Route, Navigate } from "react-router-dom";
import { RoleRoute, AdminOnlyRoute } from "@/components/routes";
import ManagementLayout from "@/components/layouts/ManagementLayout";
import {
  AdminDashboard,
  UserManagementPage,
  UserDetailsPage,
  AdminInstructorsPage,
  AdminStudentsPage,
  AdminExamManagementPage,
  AdminExamDetailsPage,
  AdminExamEditPage,
  AdminExamQuestionsManage,
  AdminGroupsPage,
  AdminGroupDetailsPage,
  QuizAttemptDetails,
  AdminTopicsPage,
  AdminTopicDetailsPage,
  AdminCourseDomainPage,
  AdminQuestionsPage,
  AdminQuestionDetailsPage,
  AdminQuestionEditPage,
  AdminQuizBanksPage,
  AdminQuizBankDetailsPage,
  AnalyticsPage,
  NotificationsPage,
  SystemSettingsPage,
  AdminProfilePage,
  AdminSupportTicketsPage,
  AdminSupportTicketDetailsPage,
} from "@/pages/admin";

export const managementRoutes = (
  <>
    {/* Management routes with ManagementLayout */}
    <Route
      element={
        <RoleRoute allowedRoles={["admin", "instructor"]}>
          <ManagementLayout />
        </RoleRoute>
      }
    >
      {/* Dashboard */}
      <Route path="/dashboard" element={<AdminDashboard />} />
      
      {/* Admin-only routes - User Management */}
      <Route path="/users" element={<AdminOnlyRoute><UserManagementPage /></AdminOnlyRoute>} />
      <Route path="/users/:userId" element={<AdminOnlyRoute><UserDetailsPage /></AdminOnlyRoute>} />
      <Route path="/instructors" element={<AdminOnlyRoute><AdminInstructorsPage /></AdminOnlyRoute>} />
      <Route path="/students" element={<AdminOnlyRoute><AdminStudentsPage /></AdminOnlyRoute>} />
      
      {/* Shared routes - Exams */}
      <Route path="/exams" element={<AdminExamManagementPage />} />
      <Route path="/exams/:examId" element={<AdminExamDetailsPage />} />
      <Route path="/exams/:examId/edit" element={<AdminExamEditPage />} />
      <Route path="/exams/:examId/questions/manage" element={<AdminExamQuestionsManage />} />
      <Route path="/exams/:examId/attempt/:attemptId" element={<QuizAttemptDetails />} />
      
      {/* Shared routes - Groups */}
      <Route path="/groups" element={<AdminGroupsPage />} />
      <Route path="/groups/:groupId" element={<AdminGroupDetailsPage />} />
      <Route path="/groups/:groupId/quiz/:quizId/attempt/:attemptId" element={<QuizAttemptDetails />} />
      
      {/* Admin-only routes - Topics & Courses */}
      <Route path="/topics" element={<AdminOnlyRoute><AdminTopicsPage /></AdminOnlyRoute>} />
      <Route path="/topics/:topicId" element={<AdminOnlyRoute><AdminTopicDetailsPage /></AdminOnlyRoute>} />
      <Route path="/courses-domains" element={<AdminOnlyRoute><AdminCourseDomainPage /></AdminOnlyRoute>} />
      
      {/* Shared routes - Questions & Quiz Banks */}
      <Route path="/questions" element={<AdminQuestionsPage />} />
      <Route path="/questions/:questionId" element={<AdminQuestionDetailsPage />} />
      <Route path="/questions/:questionId/edit" element={<AdminQuestionEditPage />} />
      <Route path="/quiz-banks" element={<AdminQuizBanksPage />} />
      <Route path="/quiz-banks/:quizBankId" element={<AdminQuizBankDetailsPage />} />
      
      {/* Shared routes - Analytics & Notifications */}
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      
      {/* Admin-only routes - Support */}
      <Route path="/support" element={<AdminOnlyRoute><AdminSupportTicketsPage /></AdminOnlyRoute>} />
      <Route path="/support/:ticketId" element={<AdminOnlyRoute><AdminSupportTicketDetailsPage /></AdminOnlyRoute>} />
      
      {/* Shared routes - Settings & Profile */}
      <Route path="/settings" element={<SystemSettingsPage />} />
      <Route path="/profile" element={<AdminProfilePage />} />
      <Route path="/system" element={<AdminOnlyRoute><SystemSettingsPage /></AdminOnlyRoute>} />
    </Route>
  </>
);
