/**
 * Google OAuth Callback Page
 * Handles Google OAuth redirect and authentication
 */

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGoogleCallbackMutation } from "@/hooks/queries";
import { Loader2 } from "lucide-react";

export const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const googleCallbackMutation = useGoogleCallbackMutation();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      navigate("/login", { 
        replace: true,
        state: { error: "Google authentication was cancelled or failed" }
      });
      return;
    }

    if (code) {
      googleCallbackMutation.mutate(code);
    } else {
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, googleCallbackMutation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto" />
        <h2 className="text-xl font-semibold text-gray-900">
          Completing Google Sign In...
        </h2>
        <p className="text-gray-600">Please wait while we authenticate your account</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
