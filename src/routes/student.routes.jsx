/**
 * Student Routes Configuration
 * Routes accessible to students
 */

import { Route } from "react-router-dom";
import { RoleRoute } from "@/components/routes";
import Dashboard from "@/pages/Dashboard";
import {
  ExamsPage,
  MyExamsPage,
  ResultsPage,
  LeaderboardPage,
  StudyMaterialsPage,
  ProfilePage,
  SettingsPage,
} from "@/pages/student";

export const studentRoutes = (
  <>
    <Route
      path="/dashboard"
      element={
        <RoleRoute allowedRoles={["student", "instructor", "admin"]}>
          <Dashboard />
        </RoleRoute>
      }
    />
    <Route
      path="/exams"
      element={
        <RoleRoute allowedRoles={["student", "instructor", "admin"]}>
          <ExamsPage />
        </RoleRoute>
      }
    />
    <Route
      path="/my-exams"
      element={
        <RoleRoute allowedRoles={["student", "instructor", "admin"]}>
          <MyExamsPage />
        </RoleRoute>
      }
    />
    <Route
      path="/results"
      element={
        <RoleRoute allowedRoles={["student", "instructor", "admin"]}>
          <ResultsPage />
        </RoleRoute>
      }
    />
    <Route
      path="/leaderboard"
      element={
        <RoleRoute allowedRoles={["student", "instructor", "admin"]}>
          <LeaderboardPage />
        </RoleRoute>
      }
    />
    <Route
      path="/study-materials"
      element={
        <RoleRoute allowedRoles={["student", "instructor", "admin"]}>
          <StudyMaterialsPage />
        </RoleRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <RoleRoute allowedRoles={["student", "instructor", "admin"]}>
          <ProfilePage />
        </RoleRoute>
      }
    />
    <Route
      path="/settings"
      element={
        <RoleRoute allowedRoles={["student", "instructor", "admin"]}>
          <SettingsPage />
        </RoleRoute>
      }
    />
  </>
);
