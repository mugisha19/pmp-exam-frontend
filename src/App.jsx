import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "@/lib/query-client";
import Toaster from "@/components/ui/Toaster";
import { InitializeAuth } from "@/components/InitializeAuth";
import { authRoutes } from "@/routes/auth.routes";
import { studentRoutes } from "@/routes/student.routes";
import { instructorRoutes } from "@/routes/instructor.routes";
import { adminRoutes } from "@/routes/admin.routes";
import Unauthorized from "@/pages/Unauthorized";
import { JoinGroup } from "@/pages/student";
import { RoleBasedRedirect } from "@/components/routes/RoleBasedRedirect";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <InitializeAuth>
          <Routes>
            {/* Auth routes (login, signup, etc.) */}
            {authRoutes}

            {/* Public routes */}
            <Route path="/join-group" element={<JoinGroup />} />

            {/* Unauthorized page */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Student routes */}
            {studentRoutes}

            {/* Instructor routes */}
            {instructorRoutes}

            {/* Admin routes */}
            {adminRoutes}

            {/* Role-based dashboard redirect */}
            <Route path="/dashboard" element={<RoleBasedRedirect />} />

            {/* Default redirect to dashboard */}
            <Route path="/" element={<RoleBasedRedirect />} />

            {/* 404 - Redirect to dashboard */}
            <Route path="*" element={<RoleBasedRedirect />} />
          </Routes>
        </InitializeAuth>
      </BrowserRouter>

      {/* Toast notifications */}
      <Toaster />

      {/* React Query DevTools (only in development) */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
