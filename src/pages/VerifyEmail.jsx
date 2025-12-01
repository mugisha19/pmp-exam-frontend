/**
 * VerifyEmail Page
 * Email verification with OTP input
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout, AuthFormWrapper } from "../components/layouts";
import { VerifyIllustration } from "../components/illustrations";
import { Button } from "../components/ui";
import { OTPInput } from "@/components/forms";
import {
  useVerifyEmailMutation,
  useResendVerificationMutation,
} from "@/hooks/queries";
import { toast } from "react-hot-toast";

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendVerificationMutation();

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    try {
      await verifyMutation.mutateAsync({ code: otp });
      toast.success("Email verified successfully!");
      navigate("/dashboard");
    } catch {
      // Error handled by mutation
      setOtp(""); // Clear OTP on error
    }
  };

  const handleResend = async () => {
    try {
      await resendMutation.mutateAsync();
      toast.success("Verification code sent!");
      setCooldown(60); // 60 second cooldown
      setOtp(""); // Clear current OTP
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <AuthLayout illustration={VerifyIllustration}>
      <AuthFormWrapper
        title="Verify your email"
        subtitle="We've sent a 6-digit code to your email address"
        footer={
          <p>
            Didn't receive the code?{" "}
            {cooldown > 0 ? (
              <span className="text-white/40">Resend in {cooldown}s</span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendMutation.isPending}
                className="text-accent hover:text-accent/80 font-medium disabled:opacity-50"
              >
                Resend code
              </button>
            )}
          </p>
        }
      >
        <div className="space-y-6">
          <OTPInput value={otp} onChange={setOtp} length={6} />

          <Button
            onClick={handleVerify}
            variant="primary"
            size="lg"
            fullWidth
            loading={verifyMutation.isPending}
            disabled={otp.length !== 6}
          >
            Verify Email
          </Button>
        </div>
      </AuthFormWrapper>
    </AuthLayout>
  );
};

export default VerifyEmail;
