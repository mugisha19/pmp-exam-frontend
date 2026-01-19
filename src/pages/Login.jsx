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
} from "@/components/forms";
import { useLoginMutation, useGoogleLogin } from "@/hooks/queries";

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
  const googleLoginMutation = useGoogleLogin();

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
          {/* Google Sign In */}
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
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>
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
        </form>
      </AuthFormWrapper>
    </AuthLayout>
  );
};

export default Login;
