# Authentication System Documentation

## Overview

Complete authentication system with UI components, forms, pages, and routing matching the provided design screenshots. Built with React, react-hook-form, React Router, and Zustand.

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                          # Reusable UI components
│   │   ├── Button.jsx              # Multi-variant button
│   │   ├── Input.jsx               # Styled input field
│   │   ├── PasswordInput.jsx       # Password field with toggle
│   │   ├── Checkbox.jsx            # Custom checkbox
│   │   ├── Divider.jsx             # Horizontal divider
│   │   ├── Spinner.jsx             # Loading spinner
│   │   ├── Logo.jsx                # 4-dot grid logo
│   │   ├── PasswordStrength.jsx    # Password strength indicator
│   │   └── index.js                # UI exports
│   ├── forms/                       # Form components
│   │   ├── FormField.jsx           # Input wrapper for react-hook-form
│   │   ├── FormPasswordField.jsx   # Password field wrapper
│   │   ├── FormCheckbox.jsx        # Checkbox wrapper
│   │   ├── SocialAuthButtons.jsx   # Google/Apple OAuth buttons
│   │   └── OTPInput.jsx            # 6-digit OTP input
│   ├── illustrations/               # SVG illustrations
│   │   ├── WelcomeIllustration.jsx # Login page illustration
│   │   ├── LearningIllustration.jsx # Signup page illustration
│   │   ├── SecurityIllustration.jsx # Password security illustration
│   │   ├── VerifyIllustration.jsx  # Email verification illustration
│   │   └── index.js                # Illustration exports
│   ├── layouts/                     # Layout components
│   │   ├── AuthLayout.jsx          # Split-screen auth layout
│   │   ├── AuthFormWrapper.jsx     # Consistent form wrapper
│   │   └── index.js                # Layout exports
│   ├── routes/                      # Route protection components
│   │   ├── ProtectedRoute.jsx      # Require authentication
│   │   ├── PublicRoute.jsx         # Redirect if authenticated
│   │   ├── RoleRoute.jsx           # Role-based access
│   │   └── index.js                # Route exports
│   └── InitializeAuth.jsx           # Auth initialization wrapper
├── pages/                           # Page components
│   ├── Login.jsx                   # Login page
│   ├── Signup.jsx                  # Registration page
│   ├── VerifyEmail.jsx             # Email verification with OTP
│   ├── ForgotPassword.jsx          # Password reset request
│   ├── ResetPassword.jsx           # Password reset with token
│   ├── OAuthCallback.jsx           # OAuth callback handler
│   ├── Unauthorized.jsx            # 403 error page
│   └── index.js                    # Page exports
├── routes/
│   └── auth.routes.jsx             # Auth route configuration
├── hooks/
│   └── useInitializeAuth.js        # Auth initialization hook
├── utils/
│   └── role.utils.js               # Role-based access helpers
└── App.jsx                          # Main app with routing

```

## 🎨 Design System

### Colors

- **Background**: `#050505` (bg-bg-primary)
- **Surface**: `#1a1a1a`
- **Border**: `#2a2a2a`
- **Accent**: `#7c7cff` (violet)
- **Text**: White with varying opacity

### Typography

- **Headings**: Bold, white
- **Body**: Regular, white/60% opacity
- **Labels**: Small, white/70% opacity

### Spacing

- Consistent padding and gaps
- Form fields: `space-y-5`
- Components: `gap-2`, `gap-3`

### Animations

- `fadeIn`: Opacity + translateY
- `slideInLeft`: Opacity + translateX from left
- `slideInRight`: Opacity + translateX from right
- `shake`: Horizontal shake for errors

## 🧩 Component Library

### UI Components

#### Button

```jsx
<Button
  variant="primary|secondary|ghost|danger|success"
  size="xs|sm|md|lg|xl"
  loading={boolean}
  disabled={boolean}
  fullWidth={boolean}
  leftIcon={<Icon />}
  rightIcon={<Icon />}
  as={Link}
>
  Click me
</Button>
```

**Variants:**

- `primary`: White background, black text
- `secondary`: Transparent with border
- `ghost`: No border
- `danger`: Red theme
- `success`: Green theme

#### Input

```jsx
<Input
  label="Email"
  type="email"
  placeholder="Enter email"
  error="Error message"
  helperText="Helper text"
  leftIcon={<Icon />}
  rightIcon={<Icon />}
  size="sm|md|lg"
/>
```

#### PasswordInput

```jsx
<PasswordInput
  label="Password"
  placeholder="Enter password"
  error="Error message"
/>
```

Auto-includes eye/eye-off toggle.

#### Checkbox

```jsx
<Checkbox
  label="Remember me"
  error="Error message"
  checked={boolean}
  onChange={(e) => {}}
/>
```

#### PasswordStrength

```jsx
<PasswordStrength password={passwordValue} />
```

Shows 4-bar strength indicator: Weak/Fair/Good/Strong.

### Form Components

All form components integrate with `react-hook-form`:

```jsx
import { useForm } from 'react-hook-form';

const { control } = useForm();

<FormField
  name="email"
  control={control}
  label="Email"
  type="email"
  placeholder="Enter email"
/>

<FormPasswordField
  name="password"
  control={control}
  label="Password"
/>

<FormCheckbox
  name="agree"
  control={control}
  label="I agree to terms"
/>
```

#### SocialAuthButtons

```jsx
<SocialAuthButtons
  onGoogleClick={() => {}}
  onAppleClick={() => {}}
  googleLoading={boolean}
  appleLoading={boolean}
/>
```

#### OTPInput

```jsx
<OTPInput value={otp} onChange={setOtp} length={6} />
```

Features: auto-focus, paste support, arrow navigation.

### Layout Components

#### AuthLayout

```jsx
<AuthLayout illustration={WelcomeIllustration}>{/* Form content */}</AuthLayout>
```

Split-screen layout with illustration on left, form on right.

#### AuthFormWrapper

```jsx
<AuthFormWrapper
  title="Welcome back"
  subtitle="Sign in to continue"
  footer={<p>Footer content</p>}
>
  {/* Form fields */}
</AuthFormWrapper>
```

## 📄 Pages

### Login (`/login`)

- Email + password fields
- "Remember me" checkbox
- "Forgot password?" link
- Social auth (Google/Apple)
- Link to signup

### Signup (`/signup`)

- Name, email, password fields
- Password strength indicator
- Terms agreement checkbox
- Social auth
- Link to login

### Verify Email (`/verify-email`)

- 6-digit OTP input
- Resend code with 60s cooldown
- Auto-navigation on success

### Forgot Password (`/forgot-password`)

- Email input
- Two-state view (form/success)
- Success shows email confirmation

### Reset Password (`/reset-password?token=xxx`)

- New password + confirm fields
- Password strength indicator
- Token validation from URL
- Redirect to login on success

### OAuth Callback (`/auth/callback`)

- Handles OAuth redirect
- Extracts tokens from URL
- Stores auth data
- Redirects to dashboard
- 10s timeout protection

### Unauthorized (`/unauthorized`)

- 403 error page
- Links to dashboard and login

## 🛡️ Route Protection

### ProtectedRoute

Requires authentication. Redirects to `/login` if not authenticated.

```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### PublicRoute

Redirects to `/dashboard` if already authenticated.

```jsx
<Route
  path="/login"
  element={
    <PublicRoute>
      <Login />
    </PublicRoute>
  }
/>
```

### RoleRoute

Checks user role. Redirects to `/unauthorized` if not allowed.

```jsx
<Route
  path="/admin"
  element={
    <RoleRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </RoleRoute>
  }
/>
```

## 🔧 Role Utilities

```javascript
import {
  hasRole,
  hasAnyRole,
  getDefaultRouteForRole,
} from "@/utils/role.utils";

// Check specific role
hasRole(user, "admin"); // boolean

// Check multiple roles
hasAnyRole(user, ["admin", "instructor"]); // boolean

// Get default route for user role
getDefaultRouteForRole(user); // '/dashboard' | '/admin/dashboard' | '/instructor/dashboard'
```

## 🚀 Auth Initialization

The `InitializeAuth` component wraps your app and:

1. Checks for existing tokens on mount
2. Validates session with backend
3. Loads user data
4. Shows loading spinner during initialization
5. Clears auth on error

```jsx
<InitializeAuth>
  <Routes>{/* Your routes */}</Routes>
</InitializeAuth>
```

## 📱 Responsive Design

- **Desktop**: Split-screen layout with illustration
- **Mobile**: Hide left panel, full-width form
- **Breakpoint**: `lg` (1024px)

## 🎯 Form Validation

All forms use Zod schemas with react-hook-form:

```javascript
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Required"),
});

const { control, handleSubmit } = useForm({
  resolver: zodResolver(loginSchema),
});
```

### Password Requirements

- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number

## 🔄 State Management

Uses Zustand auth store (already implemented):

```javascript
const { user, isAuthenticated, isLoading, setTokens, setUser, clearAuth } =
  useAuthStore();
```

## 🌐 API Integration

Uses React Query mutations (already implemented):

```javascript
import {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "@/hooks/mutations/useAuthMutations";

const loginMutation = useLoginMutation();
await loginMutation.mutateAsync({ email, password });
```

## 🔔 Notifications

All mutations show toast notifications on success/error using `react-hot-toast`.

## ⚙️ Environment Variables

Required in `.env`:

```env
VITE_API_URL=http://localhost:8000
```

Used for OAuth redirects:

```javascript
window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
```

## 🎨 Customization

### Change Accent Color

Update all instances of `#7c7cff` and `accent` classes.

### Add New Auth Page

1. Create page component in `src/pages/`
2. Add route to `src/routes/auth.routes.jsx`
3. Wrap with appropriate route protection

### Add New Illustration

1. Create SVG component in `src/components/illustrations/`
2. Export from `index.js`
3. Use in `AuthLayout illustration={YourIllustration}`

## 📝 Usage Examples

### Complete Login Flow

```jsx
import { Login } from "@/pages/Login";

// Component handles:
// - Form validation
// - API call with useLoginMutation
// - Token storage via auth store
// - Navigation to dashboard
// - Error handling with toasts
```

### Custom Protected Page

```jsx
import { ProtectedRoute } from "@/components/routes";

<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  }
/>;
```

### Role-Based Dashboard

```jsx
import { RoleRoute } from "@/components/routes";
import { getDefaultRouteForRole } from "@/utils/role.utils";

// Redirect to role-specific dashboard
const user = useAuthStore((state) => state.user);
const defaultRoute = getDefaultRouteForRole(user);
navigate(defaultRoute);

// Or protect routes
<Route
  path="/admin/dashboard"
  element={
    <RoleRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </RoleRoute>
  }
/>;
```

## ✅ Features Implemented

- ✅ Complete UI component library (9 components)
- ✅ Form components with react-hook-form integration (5 components)
- ✅ SVG illustrations (4 components)
- ✅ Auth layout system (2 components)
- ✅ Auth pages (6 pages)
- ✅ Route protection (3 components)
- ✅ Role-based access utilities
- ✅ Auth initialization
- ✅ Routing configuration
- ✅ App integration with React Router
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design
- ✅ Animations
- ✅ OAuth support
- ✅ OTP verification
- ✅ Password reset flow

## 🐛 Known Issues

1. **React Compiler Warnings**: `watch()` from react-hook-form triggers compiler warnings about memoization. These are safe to ignore - the components work correctly.

2. **OTPInput Effect Warning**: Minor cascading render warning in OTP component. Functionality not affected.

## 🚦 Next Steps

1. Replace placeholder Dashboard component with actual dashboard
2. Add more protected routes as needed
3. Implement role-specific dashboards
4. Add password change functionality
5. Add profile management
6. Implement remember me functionality
7. Add session timeout handling
8. Implement refresh token rotation

## 📚 Dependencies

- `react` - UI library
- `react-router-dom` - Routing
- `react-hook-form` - Form management
- `zod` - Schema validation
- `@hookform/resolvers` - Zod integration
- `@tanstack/react-query` - API state management
- `zustand` - Global state
- `react-hot-toast` - Notifications
- `lucide-react` - Icons
- `tailwindcss` - Styling

---

**Built with ❤️ for PMP Exam Platform**
