/**
 * OAuthCallback Page
 * Handle OAuth callback and complete sign in
 */

import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "@/components/ui";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "react-hot-toast";
import { setStorageItem, STORAGE_KEYS } from "@/constants/storage.constants";
import { setAuthToken } from "@/services/api";

export const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState(null);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const errorParam = searchParams.get("error");

        if (errorParam) {
          setError("Authentication failed");
          toast.error("Google authentication failed");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        if (!accessToken || !refreshToken) {
          setError("Missing authentication tokens");
          toast.error("Authentication failed");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        // Store tokens
        setAuthToken(accessToken, refreshToken, true);

        // Fetch user data
        const response = await fetch("http://localhost:8000/api/v1/users/me", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (response.ok) {
          const user = await response.json();
          setUser(user);
          setStorageItem(STORAGE_KEYS.USER, user);
          setStorageItem(STORAGE_KEYS.USER_ROLE, user.role);
          
          toast.success(`Welcome, ${user.first_name}!`);
          navigate("/home", { replace: true });
        } else {
          throw new Error("Failed to fetch user data");
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError("Failed to complete sign in");
        toast.error("Authentication failed");
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    handleCallback();
  }, [navigate, searchParams, setUser]);

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
