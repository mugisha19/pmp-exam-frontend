/**
 * Admin Settings Page
 * Profile, security, and system settings management
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Lock,
  Bell,
  Settings as SettingsIcon,
  Camera,
  Eye,
  EyeOff,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/stores/auth.store";
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
} from "@/hooks/queries/useUserQueries";

// Profile form schema
const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

// Password form schema
const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number"
      ),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export function Settings() {
  const { user } = useAuthStore();
  const updateUser = useAuthStore((state) => state.updateUser);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    quizReminders: true,
    systemAnnouncements: true,
  });

  // Mutations
  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty: profileDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  // Handle profile update
  const onProfileSubmit = async (data) => {
    try {
      await updateProfileMutation.mutateAsync(data);
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  // Handle password change
  const onPasswordSubmit = async (data) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.current_password,
        newPassword: data.new_password,
      });

      // Update password_changed_at in global state
      updateUser({ password_changed_at: new Date().toISOString() });

      resetPasswordForm();
      setShowPasswordForm(false);
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    }
  };

  // Handle notification toggle
  const handleNotificationToggle = (key) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success("Notification preferences updated");
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      {/* Profile Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
        </div>

        <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
          {/* Avatar */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.first_name?.[0]}
                {user?.last_name?.[0]}
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 p-1.5 bg-gray-100 border border-gray-200 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div>
              <p className="text-gray-900 font-medium">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-gray-500 text-sm capitalize">{user?.role}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                First Name
              </label>
              <Input
                {...registerProfile("first_name")}
                placeholder="Enter first name"
                error={profileErrors.first_name?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Last Name
              </label>
              <Input
                {...registerProfile("last_name")}
                placeholder="Enter last name"
                error={profileErrors.last_name?.message}
              />
            </div>
          </div>

          {/* Email (Display Only) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{user?.email}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed
            </p>
          </div>

          <Button
            type="submit"
            disabled={!profileDirty || updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Lock className="w-5 h-5 text-amber-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Security</h2>
        </div>

        {!showPasswordForm ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-medium">Password</p>
              <p className="text-gray-500 text-sm">
                Last changed:{" "}
                {user?.password_changed_at
                  ? new Date(user.password_changed_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "Never"}
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
              Change Password
            </Button>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
            <div className="space-y-4 mb-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    {...registerPassword("current_password")}
                    placeholder="Enter current password"
                    error={passwordErrors.current_password?.message}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    {...registerPassword("new_password")}
                    placeholder="Enter new password"
                    error={passwordErrors.new_password?.message}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    {...registerPassword("confirm_password")}
                    placeholder="Confirm new password"
                    error={passwordErrors.confirm_password?.message}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowPasswordForm(false);
                  resetPasswordForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Notification Preferences
          </h2>
        </div>

        <div className="space-y-4">
          <NotificationToggle
            label="Email Notifications"
            description="Receive notifications via email"
            checked={notificationPrefs.emailNotifications}
            onChange={() => handleNotificationToggle("emailNotifications")}
          />
          <NotificationToggle
            label="Quiz Deadline Reminders"
            description="Get reminded about upcoming quiz deadlines"
            checked={notificationPrefs.quizReminders}
            onChange={() => handleNotificationToggle("quizReminders")}
          />
          <NotificationToggle
            label="System Announcements"
            description="Receive important system updates and announcements"
            checked={notificationPrefs.systemAnnouncements}
            onChange={() => handleNotificationToggle("systemAnnouncements")}
          />
        </div>
      </div>

      {/* System Settings (Admin Only) */}
      {user?.role === "admin" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <SettingsIcon className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              System Settings
            </h2>
          </div>

          <div className="space-y-4">
            <ComingSoonItem
              title="Default Quiz Settings"
              description="Set default time limits, passing scores, and attempt limits"
            />
            <ComingSoonItem
              title="Registration Settings"
              description="Configure user registration and approval workflows"
            />
            <ComingSoonItem
              title="Email Templates"
              description="Customize system email templates"
            />
            <ComingSoonItem
              title="Backup & Export"
              description="Configure automated backups and data export"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Toggle switch component
function NotificationToggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
      <div>
        <p className="text-gray-900 font-medium">{label}</p>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`
          relative w-11 h-6 rounded-full transition-colors
          ${checked ? "bg-blue-600" : "bg-gray-300"}
        `}
      >
        <span
          className={`
            absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
}

// Coming soon placeholder item
function ComingSoonItem({ title, description }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0 opacity-60">
      <div>
        <p className="text-gray-900 font-medium">{title}</p>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
      <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded">
        Coming soon
      </span>
    </div>
  );
}

export default Settings;
