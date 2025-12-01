# React Query Hooks Documentation

This directory contains custom React Query hooks for managing API calls and state in the PMP Exam Platform.

## Installation

The following packages are already installed:

```bash
npm install @tanstack/react-query react-hot-toast
npm install -D @tanstack/react-query-devtools
```

## Setup

The `QueryClientProvider` and `Toaster` are configured in `App.jsx`:

```jsx
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import Toaster from "@/components/ui/Toaster";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app content */}
      <Toaster />
    </QueryClientProvider>
  );
}
```

## Authentication Hooks (`useAuthQueries.js`)

### useLoginMutation

Authenticates user and updates auth store.

```jsx
import { useLoginMutation } from "@/hooks/queries";

function LoginForm() {
  const loginMutation = useLoginMutation();

  const handleSubmit = (data) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={loginMutation.isPending}>
        {loginMutation.isPending ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

### useRegisterMutation

Creates new user account and redirects to verification page.

```jsx
import { useRegisterMutation } from "@/hooks/queries";

function RegisterForm() {
  const registerMutation = useRegisterMutation();

  const handleSubmit = (data) => {
    registerMutation.mutate({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      password: data.password,
      role: "student", // optional, defaults to 'student'
    });
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### useForgotPasswordMutation

Sends password reset email.

```jsx
import { useForgotPasswordMutation } from "@/hooks/queries";

function ForgotPassword() {
  const forgotPasswordMutation = useForgotPasswordMutation();

  const handleSubmit = (email) => {
    forgotPasswordMutation.mutate(email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" />
      <button disabled={forgotPasswordMutation.isPending}>
        Send Reset Link
      </button>
    </form>
  );
}
```

### useResetPasswordMutation

Resets password using token from email.

```jsx
import { useResetPasswordMutation } from "@/hooks/queries";
import { useSearchParams } from "react-router-dom";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const resetPasswordMutation = useResetPasswordMutation();

  const handleSubmit = (newPassword) => {
    resetPasswordMutation.mutate({
      token,
      newPassword,
    });
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### useVerifyEmailMutation

Verifies user email with token.

```jsx
import { useVerifyEmailMutation } from "@/hooks/queries";
import { useSearchParams } from "react-router-dom";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // Option 1: Auto-login after verification
  const verifyEmailMutation = useVerifyEmailMutation({ autoLogin: true });

  // Option 2: Just verify and redirect to login
  // const verifyEmailMutation = useVerifyEmailMutation({ autoLogin: false });

  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate(token);
    }
  }, [token]);

  return <div>Verifying email...</div>;
}
```

### useResendVerificationMutation

Resends verification email.

```jsx
import { useResendVerificationMutation } from "@/hooks/queries";

function ResendVerification() {
  const resendMutation = useResendVerificationMutation();

  return (
    <button
      onClick={() => resendMutation.mutate("user@example.com")}
      disabled={resendMutation.isPending}
    >
      Resend Verification Email
    </button>
  );
}
```

### useLogoutMutation

Logs out user and clears all data.

```jsx
import { useLogoutMutation } from "@/hooks/queries";

function LogoutButton() {
  // Option 1: Logout from current device only
  const logoutMutation = useLogoutMutation();

  // Option 2: Logout from all devices
  // const logoutMutation = useLogoutMutation({ logoutAll: true });

  return (
    <button
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
    >
      Logout
    </button>
  );
}
```

### useChangePasswordMutation

Changes authenticated user's password.

```jsx
import { useChangePasswordMutation } from "@/hooks/queries";

function ChangePassword() {
  const changePasswordMutation = useChangePasswordMutation();

  const handleSubmit = (data) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### useGoogleLogin & useGoogleCallbackMutation

Google OAuth authentication.

```jsx
import { useGoogleLogin, useGoogleCallbackMutation } from "@/hooks/queries";

// Login page
function GoogleLoginButton() {
  const googleLogin = useGoogleLogin();

  return (
    <button onClick={() => googleLogin.mutate()}>Login with Google</button>
  );
}

// Callback page
function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const googleCallback = useGoogleCallbackMutation();

  useEffect(() => {
    if (code) {
      googleCallback.mutate(code);
    }
  }, [code]);

  return <div>Completing Google login...</div>;
}
```

## User Hooks (`useUserQueries.js`)

### useCurrentUser

Fetches authenticated user profile. Auto-enabled when tokens exist.

```jsx
import { useCurrentUser } from "@/hooks/queries";

function UserProfile() {
  const { data: user, isLoading, error } = useCurrentUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading profile</div>;

  return (
    <div>
      <h2>
        {user.first_name} {user.last_name}
      </h2>
      <p>{user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

### useUpdateProfileMutation

Updates user profile information.

```jsx
import { useUpdateProfileMutation } from "@/hooks/queries";

function EditProfile() {
  const updateProfileMutation = useUpdateProfileMutation();

  const handleSubmit = (data) => {
    updateProfileMutation.mutate({
      first_name: data.firstName,
      last_name: data.lastName,
      avatar_url: data.avatarUrl,
      notification_preferences: {
        email: data.emailNotifications,
        push: data.pushNotifications,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={updateProfileMutation.isPending}>Update Profile</button>
    </form>
  );
}
```

### useUpdateSettingsMutation

Updates user settings and preferences.

```jsx
import { useUpdateSettingsMutation } from "@/hooks/queries";

function Settings() {
  const updateSettingsMutation = useUpdateSettingsMutation();

  const handleSubmit = (data) => {
    updateSettingsMutation.mutate({
      language: data.language,
      timezone: data.timezone,
      notification_preferences: {
        email: data.emailNotifications,
        push: data.pushNotifications,
      },
    });
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### useChangePasswordMutation

Changes authenticated user's password.

```jsx
import { useChangePasswordMutation } from "@/hooks/queries";

function ChangePasswordForm() {
  const changePasswordMutation = useChangePasswordMutation();

  const handleSubmit = (data) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

## Admin Hooks

### useUsers

Lists users with filters (Admin/Instructor only).

```jsx
import { useUsers } from "@/hooks/queries";

function UsersList() {
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 20,
    role: "student",
    search: "",
  });

  const { data, isLoading, error } = useUsers(filters);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data.users.map((user) => (
        <div key={user.user_id}>{user.email}</div>
      ))}
    </div>
  );
}
```

### useUser

Gets single user by ID.

```jsx
import { useUser } from "@/hooks/queries";

function UserDetails({ userId }) {
  const { data: user, isLoading } = useUser(userId);

  if (isLoading) return <div>Loading...</div>;

  return <div>{user.email}</div>;
}
```

### useCreateUserMutation

Creates new user (Admin only).

```jsx
import { useCreateUserMutation } from "@/hooks/queries";

function CreateUser() {
  const createUserMutation = useCreateUserMutation();

  const handleSubmit = (data) => {
    createUserMutation.mutate({
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      role: data.role,
    });
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### useUpdateUserMutation

Updates user (Admin only).

```jsx
import { useUpdateUserMutation } from "@/hooks/queries";

function EditUser({ userId }) {
  const updateUserMutation = useUpdateUserMutation();

  const handleSubmit = (data) => {
    updateUserMutation.mutate({
      userId,
      userData: {
        first_name: data.firstName,
        last_name: data.lastName,
      },
    });
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### useDeleteUserMutation

Deletes user (Admin only).

```jsx
import { useDeleteUserMutation } from "@/hooks/queries";

function DeleteUserButton({ userId }) {
  const deleteUserMutation = useDeleteUserMutation();

  return (
    <button
      onClick={() => deleteUserMutation.mutate(userId)}
      disabled={deleteUserMutation.isPending}
    >
      Delete User
    </button>
  );
}
```

### useUpdateUserStatusMutation

Activates/deactivates user (Admin only).

```jsx
import { useUpdateUserStatusMutation } from "@/hooks/queries";

function UserStatusToggle({ userId, currentStatus }) {
  const updateStatusMutation = useUpdateUserStatusMutation();

  const handleToggle = () => {
    updateStatusMutation.mutate({
      userId,
      active: !currentStatus,
      reason: "Admin action",
    });
  };

  return (
    <button onClick={handleToggle}>
      {currentStatus ? "Deactivate" : "Activate"}
    </button>
  );
}
```

### useUpdateUserRoleMutation

Updates user role (Admin only).

```jsx
import { useUpdateUserRoleMutation } from "@/hooks/queries";

function ChangeUserRole({ userId }) {
  const updateRoleMutation = useUpdateUserRoleMutation();

  const handleRoleChange = (newRole) => {
    updateRoleMutation.mutate({
      userId,
      role: newRole,
    });
  };

  return (
    <select onChange={(e) => handleRoleChange(e.target.value)}>
      <option value="student">Student</option>
      <option value="instructor">Instructor</option>
      <option value="admin">Admin</option>
    </select>
  );
}
```

## Common Mutation States

All mutations return the following states:

```jsx
const mutation = useSomeMutation();

// States
mutation.isPending; // Request in progress
mutation.isSuccess; // Request succeeded
mutation.isError; // Request failed
mutation.error; // Error object
mutation.data; // Response data

// Methods
mutation.mutate(data); // Trigger mutation
mutation.mutateAsync(data); // Async mutation (returns promise)
mutation.reset(); // Reset mutation state
```

## Toast Notifications

All mutations automatically show toast notifications:

- **Success**: Green toast with success message
- **Error**: Red toast with error message
- **Loading**: Optional loading state (use `toast.loading()`)

Custom toast usage:

```jsx
import toast from "react-hot-toast";

// Success
toast.success("Operation successful!");

// Error
toast.error("Something went wrong");

// Loading
const toastId = toast.loading("Processing...");
// Later...
toast.success("Done!", { id: toastId });
```

## Query Invalidation

Mutations automatically invalidate related queries:

```jsx
// After updateProfile, current user query is refreshed
const updateProfileMutation = useUpdateProfileMutation();

// After createUser, users list is refreshed
const createUserMutation = useCreateUserMutation();
```

## Error Handling

All hooks handle errors automatically:

1. Display error toast
2. Update error state
3. Handle validation errors (422)
4. Handle auth errors (401)

```jsx
const mutation = useSomeMutation();

if (mutation.isError) {
  console.log(mutation.error.message);
  console.log(mutation.error.status);
  console.log(mutation.error.errors); // Validation errors
}
```

## Best Practices

1. **Use hooks in components only** - Not in regular functions
2. **Handle loading states** - Show spinners/disabled buttons
3. **Check authentication** - Most hooks require authenticated user
4. **Validate before submit** - Use React Hook Form + Zod
5. **Handle errors gracefully** - Show user-friendly messages
6. **Invalidate queries** - Let mutations handle this automatically

## React Query DevTools

In development, press `Ctrl+Shift+D` to open DevTools:

- View all queries and mutations
- Inspect cache data
- Manually trigger refetch
- Monitor loading states

## Example: Complete Login Flow

```jsx
import { useLoginMutation } from "@/hooks/queries";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function LoginPage() {
  const loginMutation = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("email")}
        type="email"
        placeholder="Email"
        disabled={loginMutation.isPending}
      />
      {errors.email && <span>{errors.email.message}</span>}

      <input
        {...register("password")}
        type="password"
        placeholder="Password"
        disabled={loginMutation.isPending}
      />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? "Logging in..." : "Login"}
      </button>

      {loginMutation.isError && (
        <div className="error">{loginMutation.error.message}</div>
      )}
    </form>
  );
}
```

## Additional Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Hot Toast Docs](https://react-hot-toast.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
