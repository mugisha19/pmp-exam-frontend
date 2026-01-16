/**
 * Unauthorized Page
 * 403 - Access Denied
 */

import { Link, useNavigate } from "react-router-dom";
import { Button, Logo } from "../components/ui";
import { ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

export const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleGoToDashboard = () => {
    const dashboardPath = user?.role === 'student' ? '/my-dashboard' : '/dashboard';
    navigate(dashboardPath);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <Logo size="lg" />
        </div>

        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-error" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4">403</h1>

        <h2 className="text-2xl font-semibold text-white mb-3">
          Access Denied
        </h2>

        <p className="text-white/60 mb-8">
          You don't have permission to access this page. If you believe this is
          an error, please contact support.
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleGoToDashboard}
            variant="primary"
            size="lg"
            fullWidth
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
