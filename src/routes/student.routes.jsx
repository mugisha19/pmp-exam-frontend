/**
 * Student Routes Configuration
 * Routes accessible to students
 */

import { Route } from "react-router-dom";
import { RoleRoute } from "@/components/routes";
import StudentLayout from "@/components/layouts/StudentLayout";
import { Dashboard, Groups, GroupDetail, MyExams } from "@/pages/student";

export const studentRoutes = (
  <Route
    element={
      <RoleRoute allowedRoles={["student", "instructor", "admin"]}>
        <StudentLayout />
      </RoleRoute>
    }
  >
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/groups" element={<Groups />} />
    <Route path="/groups/:groupId" element={<GroupDetail />} />
    <Route path="/exams" element={<MyExams />} />
  </Route>
);
