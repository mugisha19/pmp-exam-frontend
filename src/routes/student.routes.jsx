/**
 * Student Routes Configuration
 * Routes accessible to students
 */

import { Route } from "react-router-dom";
import { RoleRoute } from "@/components/routes";
import StudentLayout from "@/components/layouts/StudentLayout";
import { Dashboard, Groups, GroupDetail, MyExams, QuizDetail } from "@/pages/student";
import QuizTake from "@/pages/student/QuizTake";
import AttemptReview from "@/pages/student/AttemptReview";

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
    <Route path="/exams/:quizId" element={<QuizDetail />} />
    <Route path="/exams/:quizId/take" element={<QuizTake />} />
    <Route path="/exams/:quizId/attempts/:attemptId" element={<AttemptReview />} />
  </Route>
);
