/**
 * Instructor Routes Configuration
 * Routes accessible to instructors
 * Uses InstructorLayout as parent with nested child routes
 */

import { Route, Navigate } from "react-router-dom";
import { RoleRoute } from "@/components/routes";
import InstructorLayout from "@/components/layouts/InstructorLayout";
import {
  InstructorDashboard,
  ManageExamsPage,
  QuestionBankPage,
  GroupsPage,
  StudentsPage,
  InstructorResultsPage,
  GradingPage,
  SchedulePage,
  AnnouncementsPage,
  InstructorProfilePage,
  InstructorSettingsPage,
} from "@/pages/instructor";

export const instructorRoutes = (
  <Route
    path="/instructor"
    element={
      <RoleRoute allowedRoles={["instructor", "admin"]}>
        <InstructorLayout />
      </RoleRoute>
    }
  >
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<InstructorDashboard />} />
    <Route path="exams" element={<ManageExamsPage />} />
    <Route path="questions" element={<QuestionBankPage />} />
    <Route path="groups" element={<GroupsPage />} />
    <Route path="students" element={<StudentsPage />} />
    <Route path="results" element={<InstructorResultsPage />} />
    <Route path="grading" element={<GradingPage />} />
    <Route path="schedule" element={<SchedulePage />} />
    <Route path="announcements" element={<AnnouncementsPage />} />
    <Route path="profile" element={<InstructorProfilePage />} />
    <Route path="settings" element={<InstructorSettingsPage />} />
  </Route>
);
