/**
 * Admin Routes Configuration
 * Routes accessible to admins only
 * Uses AdminLayout as parent with nested child routes
 */

import { Route, Navigate } from "react-router-dom";
import { RoleRoute } from "@/components/routes";
import AdminLayout from "@/components/layouts/AdminLayout";
import {
  AdminDashboard,
  UserManagementPage,
  AdminInstructorsPage,
  AdminStudentsPage,
  AdminExamManagementPage,
  AdminExamDetailsPage,
  AdminExamEditPage,
  AdminGroupsPage,
  AdminGroupDetailsPage,
  GroupQuizDetails,
  QuizAttemptDetails,
  AdminTopicsPage,
  AdminQuestionsPage,
  AdminQuestionDetailsPage,
  AdminQuestionEditPage,
  AdminQuizBanksPage,
  AdminQuizBankDetailsPage,
  AdminQuizBankAddQuestionsPage,
  AnalyticsPage,
  ReportsPage,
  NotificationsPage,
  SystemSettingsPage,
  AdminProfilePage,
} from "@/pages/admin";

export const adminRoutes = (
  <Route
    path="/admin"
    element={
      <RoleRoute allowedRoles={["admin"]}>
        <AdminLayout />
      </RoleRoute>
    }
  >
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="users" element={<UserManagementPage />} />
    <Route path="instructors" element={<AdminInstructorsPage />} />
    <Route path="students" element={<AdminStudentsPage />} />
    <Route path="exams" element={<AdminExamManagementPage />} />
    <Route path="exams/:examId" element={<AdminExamDetailsPage />} />
    <Route path="exams/:examId/edit" element={<AdminExamEditPage />} />
    <Route path="exams/:examId/attempt/:attemptId" element={<QuizAttemptDetails />} />
    <Route path="groups" element={<AdminGroupsPage />} />
    <Route path="groups/:groupId" element={<AdminGroupDetailsPage />} />
    <Route path="groups/:groupId/quiz/:quizId" element={<GroupQuizDetails />} />
    <Route path="groups/:groupId/quiz/:quizId/attempt/:attemptId" element={<QuizAttemptDetails />} />
    <Route path="topics" element={<AdminTopicsPage />} />
    <Route path="questions" element={<AdminQuestionsPage />} />
    <Route
      path="questions/:questionId"
      element={<AdminQuestionDetailsPage />}
    />
    <Route
      path="questions/:questionId/edit"
      element={<AdminQuestionEditPage />}
    />
    <Route path="quiz-banks" element={<AdminQuizBanksPage />} />
    <Route
      path="quiz-banks/:quizBankId"
      element={<AdminQuizBankDetailsPage />}
    />
    <Route
      path="quiz-banks/:quizBankId/add-questions"
      element={<AdminQuizBankAddQuestionsPage />}
    />
    <Route path="analytics" element={<AnalyticsPage />} />
    <Route path="reports" element={<ReportsPage />} />
    <Route path="notifications" element={<NotificationsPage />} />
    <Route path="settings" element={<SystemSettingsPage />} />
    <Route path="profile" element={<AdminProfilePage />} />
    <Route path="system" element={<SystemSettingsPage />} />
  </Route>
);
