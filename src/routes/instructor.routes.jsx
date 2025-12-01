/**
 * Instructor Routes Configuration
 * Routes accessible to instructors
 */

import { Route } from "react-router-dom";
import { RoleRoute } from "@/components/routes";
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
  <>
    <Route
      path="/instructor/dashboard"
      element={
        <RoleRoute allowedRoles={["instructor", "admin"]}>
          <InstructorDashboard />
        </RoleRoute>
      }
    />
    <Route
      path="/instructor/exams"
      element={
        <RoleRoute allowedRoles={["instructor", "admin"]}>
          <ManageExamsPage />
        </RoleRoute>
      }
    />
    <Route
      path="/instructor/questions"
      element={
        <RoleRoute allowedRoles={["instructor", "admin"]}>
          <QuestionBankPage />
        </RoleRoute>
      }
    />
    <Route
      path="/instructor/groups"
      element={
        <RoleRoute allowedRoles={["instructor", "admin"]}>
          <GroupsPage />
        </RoleRoute>
      }
    />
    <Route
      path="/instructor/students"
      element={
        <RoleRoute allowedRoles={["instructor", "admin"]}>
          <StudentsPage />
        </RoleRoute>
      }
    />
    <Route
      path="/instructor/results"
      element={
        <RoleRoute allowedRoles={["instructor", "admin"]}>
          <InstructorResultsPage />
        </RoleRoute>
      }
    />
    <Route
      path="/instructor/grading"
      element={
        <RoleRoute allowedRoles={["instructor", "admin"]}>
          <GradingPage />
        </RoleRoute>
      }
    />
    <Route
      path="/instructor/schedule"
      element={
        <RoleRoute allowedRoles={["instructor", "admin"]}>
          <SchedulePage />
        </RoleRoute>
      }
    />
    <Route
      path="/instructor/announcements"
      element={
        <RoleRoute allowedRoles={["instructor", "admin"]}>
          <AnnouncementsPage />
        </RoleRoute>
      }
    />
    <Route
      path="/instructor/profile"
      element={
        <RoleRoute allowedRoles={["instructor", "admin"]}>
          <InstructorProfilePage />
        </RoleRoute>
      }
    />
    <Route
      path="/instructor/settings"
      element={
        <RoleRoute allowedRoles={["instructor", "admin"]}>
          <InstructorSettingsPage />
        </RoleRoute>
      }
    />
  </>
);
