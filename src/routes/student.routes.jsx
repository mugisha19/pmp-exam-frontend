/**
 * Student Routes Configuration
 * Routes accessible to students - Using website layout
 * 
 * Student-specific paths to avoid conflict with management routes:
 * - /home - Student home
 * - /my-learning - Student exams/learning
 * - /my-groups - Student groups
 * - /my-analytics - Student analytics
 * - /my-reminders - Student reminders
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
  LearningPaths,
  Analytics,
  Reminders,
  Support,
} from "@/pages/student";
import QuizTaking from "@/pages/student/QuizTaking";
import AttemptReview from "@/pages/student/AttemptReview";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Cookies from "@/pages/Cookies";

export const studentRoutes = (
  <Route
    element={
      <RoleRoute allowedRoles={["student"]}>
        <StudentWebsiteLayout />
      </RoleRoute>
    }
  >
    <Route path="/home" element={<Home />} />
    <Route path="/learning-paths" element={<LearningPaths />} />
    <Route path="/my-learning" element={<MyExams />} />
    <Route path="/my-analytics" element={<Analytics />} />
    <Route path="/my-reminders" element={<Reminders />} />
    <Route path="/my-support" element={<Support />} />
    <Route path="/my-groups" element={<Groups />} />
    <Route path="/my-groups/:groupId" element={<GroupDetail />} />
    <Route path="/my-exams" element={<MyExams />} />
    <Route path="/my-exams/:quizId" element={<QuizDetail />} />
    <Route path="/my-exams/:quizId/take" element={<QuizTaking />} />
    <Route path="/my-exams/:quizId/attempts/:attemptId" element={<AttemptReview />} />
    <Route path="/my-notifications" element={<Notifications />} />
    <Route path="/my-profile" element={<Profile />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/cookies" element={<Cookies />} />
  </Route>
);
