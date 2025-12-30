/**
 * Signup Page
 * User registration with email/password and OAuth
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout, AuthFormWrapper } from "../components/layouts";
import { LearningIllustration } from "../components/illustrations";
import { Button, PasswordStrength } from "../components/ui";
import {
  FormField,
  FormPasswordField,
  FormCheckbox,
} from "@/components/forms";
import { useRegisterMutation } from "@/hooks/queries";
const signupSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

export const Signup = () => {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
  const { control, handleSubmit, watch } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      agreeToTerms: false,
    },
  });

  // Watch password for strength indicator
  const passwordValue = watch("password");

  const onSubmit = async (data) => {
    try {
      await registerMutation.mutateAsync(data);
      // Store email for resend verification
      localStorage.setItem("verification_email", data.email);
      navigate("/verify-email");
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <AuthLayout illustration={LearningIllustration}>
      <AuthFormWrapper
        title="Create your account"
        subtitle="Start your PMP exam preparation journey"
        footer={
          <p>
            Already have an account?{" "}
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
            name="first_name"
            control={control}
            label="First Name"
            type="text"
            placeholder="Enter your first name"
            autoComplete="given-name"
          />

          <FormField
            name="last_name"
            control={control}
            label="Last Name"
            type="text"
            placeholder="Enter your last name"
            autoComplete="family-name"
          />

          <FormField
            name="email"
            control={control}
            label="Email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
          />

          <div className="space-y-2">
            <FormPasswordField
              name="password"
              control={control}
              label="Password"
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
            {passwordValue && <PasswordStrength password={passwordValue} />}
          </div>

          <FormCheckbox
            name="agreeToTerms"
            control={control}
            label={
              <span>
                I agree to the{" "}
                <Link to="/terms" className="text-accent hover:text-accent/80">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-accent hover:text-accent/80"
                >
                  Privacy Policy
                </Link>
              </span>
            }
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={registerMutation.isPending}
          >
            Create Account
          </Button>
        </form>
      </AuthFormWrapper>
    </AuthLayout>
  );
};

export default Signup;
