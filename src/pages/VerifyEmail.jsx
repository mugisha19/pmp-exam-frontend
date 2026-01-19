/**
 * VerifyEmail Page
 * Email verification with link from email
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout, AuthFormWrapper } from "../components/layouts";
import { VerifyIllustration } from "../components/illustrations";
import { Button, Input } from "../components/ui";
import {
  useVerifyEmailMutation,
  useResendVerificationMutation,
} from "@/hooks/queries";
import { toast } from "react-hot-toast";
import { Mail, Loader2, CheckCircle, ArrowLeft } from "lucide-react";

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);

  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendVerificationMutation();

  // Get email from storage on mount
  useEffect(() => {
    const storedEmail =
      localStorage.getItem("verification_email") ||
      sessionStorage.getItem("verification_email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (token) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleVerify = async () => {
    if (!token) {
      toast.error("Invalid verification link");
      return;
    }

    try {
      await verifyMutation.mutateAsync({ token });
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      // Error handled by mutation
    }
  };

  const handleResend = async () => {
    let emailToUse = email;

    // If no email in state, try to get from storage
    if (!emailToUse) {
      emailToUse =
        localStorage.getItem("verification_email") ||
        sessionStorage.getItem("verification_email");
    }

    // If still no email, show input field
    if (!emailToUse) {
      setShowEmailInput(true);
      toast.error("Please enter your email address");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToUse)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await resendMutation.mutateAsync({ email: emailToUse });
      setShowEmailInput(false);
    } catch {
      // Error handled by mutation
    }
  };

  // Show verification status
  if (token && verifyMutation.isPending) {
    return (
      <AuthLayout illustration={VerifyIllustration}>
        <AuthFormWrapper
          title="Verifying your email..."
          subtitle="Please wait while we verify your email address"
        >
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-gray-600">Verifying...</p>
          </div>
        </AuthFormWrapper>
      </AuthLayout>
    );
  }

  if (token && verifyMutation.isSuccess) {
    return (
      <AuthLayout illustration={VerifyIllustration}>
        <AuthFormWrapper
          title="Email verified!"
          subtitle="Your email has been successfully verified"
        >
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-gray-600">Redirecting to login...</p>
          </div>
        </AuthFormWrapper>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout illustration={VerifyIllustration}>
      <AuthFormWrapper
       
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-gray-700 font-medium">
                Click the verification link in your email
              </p>
              <p className="text-sm text-gray-500">
                The link will verify your account automatically
              </p>
            </div>
          </div>

          {/* Email input for resend (shown when email not found) */}
          {showEmailInput && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={resendMutation.isPending}
              />
            </div>
          )}

          {/* Resend link section */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Didn't receive the email?
              </p>
              <button
                onClick={handleResend}
                disabled={resendMutation.isPending}
                className="group relative inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <Mail className="w-4 h-4" />
                <span>{resendMutation.isPending ? "Sending..." : "Resend Verification Link"}</span>
                {resendMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              If you don't see the email, check your spam folder
            </p>
          </div>

          {/* Back to Login button */}
          <div className="pt-4">
            <Button
              variant="outline"
              className="w-full"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate("/login")}
            >
              Back to Login
            </Button>
          </div>
        </div>
      </AuthFormWrapper>
    </AuthLayout>
  );
};

export default VerifyEmail;
