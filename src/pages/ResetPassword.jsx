/**
 * ResetPassword Page
 * Reset password with token from email
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout, AuthFormWrapper } from "../components/layouts";
import { SecurityIllustration } from "../components/illustrations";
import { Button, PasswordStrength } from "../components/ui";
import { FormPasswordField } from "@/components/forms";
import { useResetPasswordMutation } from "@/hooks/queries";
import { toast } from "react-hot-toast";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const resetPasswordMutation = useResetPasswordMutation();

  const { control, handleSubmit, watch } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");

  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      navigate("/forgot-password");
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        password: data.password,
      });
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch {
      // Error handled by mutation
    }
  };

  // Redirect if no token
  if (!token) {
    toast.error("Invalid reset link");
    navigate("/forgot-password");
    return null;
  }

  return (
    <AuthLayout illustration={SecurityIllustration}>
      <AuthFormWrapper
        title="Reset your password"
        subtitle="Enter your new password below"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <FormPasswordField
              name="password"
              control={control}
              label="New Password"
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
            {passwordValue && <PasswordStrength password={passwordValue} />}
          </div>

          <FormPasswordField
            name="confirmPassword"
            control={control}
            label="Confirm Password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={resetPasswordMutation.isPending}
          >
            Reset Password
          </Button>
        </form>
      </AuthFormWrapper>
    </AuthLayout>
  );
};

export default ResetPassword;
