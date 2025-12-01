/**
 * Auth Routes Configuration
 * All authentication-related routes wrapped in PublicRoute
 */

import { Route } from "react-router-dom";
import { PublicRoute } from "../components/routes";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import OAuthCallback from "../pages/OAuthCallback";

export const authRoutes = (
  <>
    <Route
      path="/login"
      element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      }
    />
    <Route
      path="/signup"
      element={
        <PublicRoute>
          <Signup />
        </PublicRoute>
      }
    />
    <Route
      path="/verify-email"
      element={
        <PublicRoute>
          <VerifyEmail />
        </PublicRoute>
      }
    />
    <Route
      path="/forgot-password"
      element={
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      }
    />
    <Route
      path="/reset-password"
      element={
        <PublicRoute>
          <ResetPassword />
        </PublicRoute>
      }
    />
    <Route path="/auth/callback" element={<OAuthCallback />} />
  </>
);
