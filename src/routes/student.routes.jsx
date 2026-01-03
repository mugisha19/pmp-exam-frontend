/**
 * Student Routes Configuration
 * Routes accessible to students - Using website layout
 */

import { Route } from "react-router-dom";
import { RoleRoute } from "@/components/routes";
import StudentWebsiteLayout from "@/components/layouts/StudentWebsiteLayout";
import {
  Home,
  Groups,
  GroupDetail,
  MyExams,
  QuizDetail,
  Profile,
  Notifications,
  BrowseExams,
  LearningPaths,
  Analytics,
  Reminders,
} from "@/pages/student";
import QuizTaking from "@/pages/student/QuizTaking";
import AttemptReview from "@/pages/student/AttemptReview";

export const studentRoutes = (
  <Route
    element={
      <RoleRoute allowedRoles={["student", "instructor", "admin"]}>
        <StudentWebsiteLayout />
      </RoleRoute>
    }
  >
    <Route path="/dashboard" element={<Home />} />
    <Route path="/browse" element={<BrowseExams />} />
    <Route path="/learning-paths" element={<LearningPaths />} />
    <Route path="/my-learning" element={<MyExams />} />
    <Route path="/analytics" element={<Analytics />} />
    <Route path="/reminders" element={<Reminders />} />
    <Route path="/groups" element={<Groups />} />
    <Route path="/groups/:groupId" element={<GroupDetail />} />
    <Route path="/exams" element={<MyExams />} />
    <Route path="/exams/:quizId" element={<QuizDetail />} />
    <Route path="/exams/:quizId/take" element={<QuizTaking />} />
    <Route
      path="/exams/:quizId/attempts/:attemptId"
      element={<AttemptReview />}
    />
    <Route path="/notifications" element={<Notifications />} />
    <Route path="/profile" element={<Profile />} />
  </Route>
);
