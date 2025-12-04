/**
 * VerifyEmail Page
 * Email verification with link from email
 */

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout, AuthFormWrapper } from "../components/layouts";
import { VerifyIllustration } from "../components/illustrations";
import { Button } from "../components/ui";
import {
  useVerifyEmailMutation,
  useResendVerificationMutation,
} from "@/hooks/queries";
import { toast } from "react-hot-toast";
import { Mail, Loader2, CheckCircle } from "lucide-react";

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendVerificationMutation();

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
      toast.success("Email verified successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      // Error handled by mutation
    }
  };

  const handleResend = async () => {
    const email =
      localStorage.getItem("verification_email") ||
      sessionStorage.getItem("verification_email");

    if (!email) {
      toast.error("No email found. Please register again.");
      navigate("/signup");
      return;
    }

    try {
      await resendMutation.mutateAsync({ email });
      toast.success("Verification link sent to your email!");
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
        title="Check your email"
        subtitle="We've sent a verification link to your email address"
        footer={
          <p>
            Didn't receive the email?{" "}
            <button
              onClick={handleResend}
              disabled={resendMutation.isPending}
              className="text-accent hover:text-accent/80 font-medium disabled:opacity-50"
            >
              {resendMutation.isPending ? "Sending..." : "Resend link"}
            </button>
          </p>
        }
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

          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 text-center">
              If you don't see the email, check your spam folder
            </p>
          </div>
        </div>
      </AuthFormWrapper>
    </AuthLayout>
  );
};

export default VerifyEmail;
