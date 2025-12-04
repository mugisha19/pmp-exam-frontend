/**
 * Login Page
 * User login with email/password and OAuth
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useSearchParams } from "react-router-dom";
import { AuthLayout, AuthFormWrapper } from "../components/layouts";
import { WelcomeIllustration } from "../components/illustrations";
import { Button } from "../components/ui";
import {
  FormField,
  FormPasswordField,
  FormCheckbox,
  SocialAuthButtons,
} from "@/components/forms";
import { Divider } from "@/components/ui";
import { useLoginMutation } from "@/hooks/queries";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const Login = () => {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url");
  // Decode the redirect URL if it exists
  const decodedRedirectUrl = redirectUrl
    ? decodeURIComponent(redirectUrl)
    : null;
  console.log("Login - redirectUrl:", redirectUrl);
  console.log("Login - decodedRedirectUrl:", decodedRedirectUrl);
  const loginMutation = useLoginMutation({ redirectUrl: decodedRedirectUrl });

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    try {
      await loginMutation.mutateAsync(data);
      // Navigation handled by useLoginMutation based on user role
    } catch {
      // Error handled by mutation's onError callback
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const handleAppleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/apple`;
  };

  return (
    <AuthLayout illustration={WelcomeIllustration}>
      <AuthFormWrapper
        title="Welcome back"
        subtitle="Sign in to your account to continue"
        footer={
          <p>
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-accent hover:text-accent/80 font-medium"
            >
              Sign up
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

          <FormPasswordField
            name="password"
            control={control}
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between">
            <FormCheckbox
              name="rememberMe"
              control={control}
              label="Remember me"
            />

            <Link
              to="/forgot-password"
              className="text-sm text-accent hover:text-accent/80"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="glass"
            size="lg"
            fullWidth
            loading={loginMutation.isPending}
            className="font-semibold"
          >
            Log in
          </Button>

          <Divider text="Or" />

          <SocialAuthButtons
            onGoogleClick={handleGoogleLogin}
            onAppleClick={handleAppleLogin}
          />
        </form>
      </AuthFormWrapper>
    </AuthLayout>
  );
};

export default Login;
