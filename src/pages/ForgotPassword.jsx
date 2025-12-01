/**
 * ForgotPassword Page
 * Request password reset link
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { AuthLayout, AuthFormWrapper } from "../components/layouts";
import { SecurityIllustration } from "../components/illustrations";
import { Button } from "../components/ui";
import { FormField } from "@/components/forms";
import { useForgotPasswordMutation } from "@/hooks/queries";
import { Mail } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ForgotPassword = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const forgotPasswordMutation = useForgotPasswordMutation();

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await forgotPasswordMutation.mutateAsync(data);
      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch {
      // Error handled by mutation
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout illustration={SecurityIllustration}>
        <AuthFormWrapper
          title="Check your email"
          subtitle={`We've sent a password reset link to ${submittedEmail}`}
          footer={
            <p>
              <Link
                to="/login"
                className="text-accent hover:text-accent/80 font-medium"
              >
                Back to login
              </Link>
            </p>
          }
        >
          <div className="text-center py-8">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-accent" />
              </div>
            </div>
            <p className="text-white/70 mb-6">
              Click the link in the email to reset your password. If you don't
              see it, check your spam folder.
            </p>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setIsSuccess(false)}
            >
              Try another email
            </Button>
          </div>
        </AuthFormWrapper>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout illustration={SecurityIllustration}>
      <AuthFormWrapper
        title="Forgot password?"
        subtitle="Enter your email and we'll send you a reset link"
        footer={
          <p>
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-accent hover:text-accent/80 font-medium"
            >
              Log in
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            name="email"
            control={control}
            label="Email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={forgotPasswordMutation.isPending}
          >
            Send Reset Link
          </Button>
        </form>
      </AuthFormWrapper>
    </AuthLayout>
  );
};

export default ForgotPassword;
