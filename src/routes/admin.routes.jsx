/**
 * Admin Routes Configuration
 * Routes accessible to admins only
 */

import { Route } from "react-router-dom";
import { RoleRoute } from "@/components/routes";
import {
  AdminDashboard,
  UserManagementPage,
  AdminInstructorsPage,
  AdminStudentsPage,
  AdminExamsPage,
  AdminGroupsPage,
  AnalyticsPage,
  ReportsPage,
  NotificationsPage,
  SystemSettingsPage,
} from "@/pages/admin";

export const adminRoutes = (
  <>
    <Route
      path="/admin/dashboard"
      element={
        <RoleRoute allowedRoles={["admin"]}>
          <AdminDashboard />
        </RoleRoute>
      }
    />
    <Route
      path="/admin/users"
      element={
        <RoleRoute allowedRoles={["admin"]}>
          <UserManagementPage />
        </RoleRoute>
      }
    />
    <Route
      path="/admin/instructors"
      element={
        <RoleRoute allowedRoles={["admin"]}>
          <AdminInstructorsPage />
        </RoleRoute>
      }
    />
    <Route
      path="/admin/students"
      element={
        <RoleRoute allowedRoles={["admin"]}>
          <AdminStudentsPage />
        </RoleRoute>
      }
    />
    <Route
      path="/admin/exams"
      element={
        <RoleRoute allowedRoles={["admin"]}>
          <AdminExamsPage />
        </RoleRoute>
      }
    />
    <Route
      path="/admin/groups"
      element={
        <RoleRoute allowedRoles={["admin"]}>
          <AdminGroupsPage />
        </RoleRoute>
      }
    />
    <Route
      path="/admin/analytics"
      element={
        <RoleRoute allowedRoles={["admin"]}>
          <AnalyticsPage />
        </RoleRoute>
      }
    />
    <Route
      path="/admin/reports"
      element={
        <RoleRoute allowedRoles={["admin"]}>
          <ReportsPage />
        </RoleRoute>
      }
    />
    <Route
      path="/admin/notifications"
      element={
        <RoleRoute allowedRoles={["admin"]}>
          <NotificationsPage />
        </RoleRoute>
      }
    />
    <Route
      path="/admin/system"
      element={
        <RoleRoute allowedRoles={["admin"]}>
          <SystemSettingsPage />
        </RoleRoute>
      }
    />
  </>
);
