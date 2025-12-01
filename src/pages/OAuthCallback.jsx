/**
 * OAuthCallback Page
 * Handle OAuth callback and complete sign in
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "@/components/ui";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "react-hot-toast";

export const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract tokens from URL params
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const user = searchParams.get("user");
        const errorParam = searchParams.get("error");

        // Handle error from OAuth provider
        if (errorParam) {
          setError(errorParam);
          toast.error("Authentication failed");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        // Validate tokens
        if (!accessToken || !refreshToken) {
          setError("Missing authentication tokens");
          toast.error("Authentication failed");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        // Parse user data
        const userData = user ? JSON.parse(decodeURIComponent(user)) : null;

        // Store tokens and user data
        setTokens(accessToken, refreshToken);
        if (userData) {
          setUser(userData);
        }

        toast.success("Successfully signed in!");

        // Redirect to dashboard
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError("Failed to complete sign in");
        toast.error("Authentication failed");
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (!error) {
        setError("Authentication timeout");
        toast.error("Authentication timed out");
        navigate("/login");
      }
    }, 10000); // 10 second timeout

    handleCallback();

    return () => clearTimeout(timeout);
  }, [navigate, searchParams, setTokens, setUser, error]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-center">
        <Spinner size="xl" />
        <p className="mt-6 text-white/70 text-lg">
          {error ? error : "Completing sign in..."}
        </p>
        {error && (
          <p className="mt-2 text-white/50 text-sm">Redirecting to login...</p>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
