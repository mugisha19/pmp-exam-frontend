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
import { useRegisterMutation, useGoogleLogin } from "@/hooks/queries";
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
});

export const Signup = () => {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
  const googleLoginMutation = useGoogleLogin();
  const { control, handleSubmit, watch } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
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
          {/* Google Sign Up */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => googleLoginMutation.mutate()}
            loading={googleLoginMutation.isPending}
            className="border-gray-300 hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
            </div>
          </div>
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
