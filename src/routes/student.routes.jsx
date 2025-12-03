/**
 * Student Routes Configuration
 * Routes accessible to students
 * Uses StudentLayout as parent with nested child routes
 */

import { Route, Navigate } from "react-router-dom";
import { RoleRoute } from "@/components/routes";
import StudentLayout from "@/components/layouts/StudentLayout";
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
    {/* Student routes with layout */}
    <Route
      element={
        <RoleRoute allowedRoles={["student", "instructor", "admin"]}>
          <StudentLayout />
        </RoleRoute>
      }
    >
      <Route path="/exams" element={<ExamsPage />} />
      <Route path="/my-exams" element={<MyExamsPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/study-materials" element={<StudyMaterialsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Route>
  </>
);
