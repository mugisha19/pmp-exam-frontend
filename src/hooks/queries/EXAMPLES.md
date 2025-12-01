/**
 * Example: Complete Authentication Flow
 * Demonstrates how to use authentication and user query hooks
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useLoginMutation,
  useRegisterMutation,
  useCurrentUser,
  useUpdateProfileMutation,
  useLogoutMutation,
} from '@/hooks/queries';
import { useAuth } from '@/hooks/useAuth';

// ============================================
// Example 1: Login Form with Validation
// ============================================

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function LoginForm() {
  const loginMutation = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input
          {...register('email')}
          type="email"
          id="email"
          disabled={loginMutation.isPending}
          className="w-full px-4 py-2 border rounded"
        />
        {errors.email && (
          <span className="text-red-500 text-sm">{errors.email.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          {...register('password')}
          type="password"
          id="password"
          disabled={loginMutation.isPending}
          className="w-full px-4 py-2 border rounded"
        />
        {errors.password && (
          <span className="text-red-500 text-sm">
            {errors.password.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </button>

      {loginMutation.isError && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {loginMutation.error.message}
        </div>
      )}
    </form>
  );
}

// ============================================
// Example 2: Registration Form
// ============================================

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export function RegisterForm() {
  const registerMutation = useRegisterMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data) => {
    registerMutation.mutate({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      password: data.password,
      role: 'student', // or get from form
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName">First Name</label>
          <input
            {...register('firstName')}
            type="text"
            id="firstName"
            disabled={registerMutation.isPending}
            className="w-full px-4 py-2 border rounded"
          />
          {errors.firstName && (
            <span className="text-red-500 text-sm">
              {errors.firstName.message}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="lastName">Last Name</label>
          <input
            {...register('lastName')}
            type="text"
            id="lastName"
            disabled={registerMutation.isPending}
            className="w-full px-4 py-2 border rounded"
          />
          {errors.lastName && (
            <span className="text-red-500 text-sm">
              {errors.lastName.message}
            </span>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          {...register('email')}
          type="email"
          id="email"
          disabled={registerMutation.isPending}
          className="w-full px-4 py-2 border rounded"
        />
        {errors.email && (
          <span className="text-red-500 text-sm">{errors.email.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          {...register('password')}
          type="password"
          id="password"
          disabled={registerMutation.isPending}
          className="w-full px-4 py-2 border rounded"
        />
        {errors.password && (
          <span className="text-red-500 text-sm">
            {errors.password.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          {...register('confirmPassword')}
          type="password"
          id="confirmPassword"
          disabled={registerMutation.isPending}
          className="w-full px-4 py-2 border rounded"
        />
        {errors.confirmPassword && (
          <span className="text-red-500 text-sm">
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={registerMutation.isPending}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {registerMutation.isPending ? 'Creating Account...' : 'Register'}
      </button>
    </form>
  );
}

// ============================================
// Example 3: User Profile with Current User Query
// ============================================

export function UserProfile() {
  const { data: user, isLoading, error } = useCurrentUser();
  const { isStudent, isInstructor, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        Failed to load profile. Please try again.
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={`${user.first_name} ${user.last_name}`}
              className="w-20 h-20 rounded-full"
            />
          ) : (
            <span className="text-2xl font-bold text-gray-600">
              {user.first_name[0]}
              {user.last_name[0]}
            </span>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold">
            {user.first_name} {user.last_name}
          </h2>
          <p className="text-gray-600">{user.email}</p>
          <div className="mt-2 flex items-center space-x-2">
            <span
              className={`px-2 py-1 text-xs rounded ${
                isStudent
                  ? 'bg-blue-100 text-blue-800'
                  : isInstructor
                  ? 'bg-green-100 text-green-800'
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              {user.role}
            </span>
            {user.email_verified && (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                Verified
              </span>
            )}
            {user.active ? (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                Active
              </span>
            ) : (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                Inactive
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-gray-700">Member Since</h3>
          <p className="text-gray-600">
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700">Last Updated</h3>
          <p className="text-gray-600">
            {new Date(user.updated_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Example 4: Edit Profile Form
// ============================================

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
});

export function EditProfileForm() {
  const { data: user } = useCurrentUser();
  const updateProfileMutation = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      avatarUrl: user?.avatar_url || '',
      emailNotifications: user?.notification_preferences?.email || false,
      pushNotifications: user?.notification_preferences?.push || false,
    },
  });

  const onSubmit = (data) => {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName">First Name</label>
          <input
            {...register('firstName')}
            type="text"
            id="firstName"
            disabled={updateProfileMutation.isPending}
            className="w-full px-4 py-2 border rounded"
          />
          {errors.firstName && (
            <span className="text-red-500 text-sm">
              {errors.firstName.message}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="lastName">Last Name</label>
          <input
            {...register('lastName')}
            type="text"
            id="lastName"
            disabled={updateProfileMutation.isPending}
            className="w-full px-4 py-2 border rounded"
          />
          {errors.lastName && (
            <span className="text-red-500 text-sm">
              {errors.lastName.message}
            </span>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="avatarUrl">Avatar URL</label>
        <input
          {...register('avatarUrl')}
          type="text"
          id="avatarUrl"
          disabled={updateProfileMutation.isPending}
          className="w-full px-4 py-2 border rounded"
          placeholder="https://example.com/avatar.jpg"
        />
        {errors.avatarUrl && (
          <span className="text-red-500 text-sm">
            {errors.avatarUrl.message}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <label className="font-semibold">Notification Preferences</label>
        <div className="flex items-center space-x-2">
          <input
            {...register('emailNotifications')}
            type="checkbox"
            id="emailNotifications"
            disabled={updateProfileMutation.isPending}
          />
          <label htmlFor="emailNotifications">Email Notifications</label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            {...register('pushNotifications')}
            type="checkbox"
            id="pushNotifications"
            disabled={updateProfileMutation.isPending}
          />
          <label htmlFor="pushNotifications">Push Notifications</label>
        </div>
      </div>

      <button
        type="submit"
        disabled={updateProfileMutation.isPending}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}

// ============================================
// Example 5: Logout Button
// ============================================

export function LogoutButton() {
  const logoutMutation = useLogoutMutation();

  return (
    <button
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
    >
      {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
    </button>
  );
}

// ============================================
// Example 6: Protected Dashboard Layout
// ============================================

export function DashboardLayout({ children }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();

  // Show loading state
  if (isLoading || isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Not authenticated</p>
          <a
            href="/login"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">PMP Exam Platform</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              {currentUser?.first_name} {currentUser?.last_name}
            </span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

// ============================================
// Example 7: Using Multiple Hooks Together
// ============================================

export function UserDashboard() {
  const { user, isStudent, isInstructor, isAdmin } = useAuth();
  const { data: currentUser, isLoading } = useCurrentUser();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Welcome, {currentUser?.first_name}!
        </h1>

        {/* Role-based content */}
        {isStudent && (
          <div className="mb-6 p-4 bg-blue-100 border-l-4 border-blue-500">
            <h2 className="font-semibold">Student Dashboard</h2>
            <p>Access your quizzes, performance, and groups here.</p>
          </div>
        )}

        {isInstructor && (
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500">
            <h2 className="font-semibold">Instructor Dashboard</h2>
            <p>Manage quizzes, students, and view analytics.</p>
          </div>
        )}

        {isAdmin && (
          <div className="mb-6 p-4 bg-purple-100 border-l-4 border-purple-500">
            <h2 className="font-semibold">Admin Dashboard</h2>
            <p>Full system access and user management.</p>
          </div>
        )}

        {/* Profile section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Profile</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {isEditing ? <EditProfileForm /> : <UserProfile />}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default {
  LoginForm,
  RegisterForm,
  UserProfile,
  EditProfileForm,
  LogoutButton,
  DashboardLayout,
  UserDashboard,
};
