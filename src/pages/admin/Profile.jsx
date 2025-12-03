/**
 * Admin Profile Page
 * Complete profile management for admin users
 */

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Camera,
  Save,
  Loader2,
  CheckCircle,
  X,
  Upload,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuthStore } from "@/stores/auth.store";
import { useUpdateProfileMutation } from "@/hooks/queries/useUserQueries";
import toast from "react-hot-toast";

// Profile form schema
const profileSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  avatar_url: z
    .string()
    .refine(
      (val) =>
        !val ||
        val.startsWith("data:image/") ||
        val.startsWith("http://") ||
        val.startsWith("https://"),
      "Please enter a valid URL or upload an image"
    )
    .optional()
    .or(z.literal("")),
});

// Max file size: 2MB
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function Profile() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  // Mutations
  const updateProfileMutation = useUpdateProfileMutation();

  // Profile form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      avatar_url: user?.avatar_url || "",
    },
  });

  const currentAvatarUrl = watch("avatar_url");

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    // Create preview and convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setAvatarPreview(base64String);
      setValue("avatar_url", base64String, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setValue("avatar_url", "", { shouldDirty: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle profile update
  const onSubmit = async (data) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      setIsEditing(false);
      setAvatarPreview(null);
      setShowUrlInput(false);
    } catch {
      // Error handled by mutation
    }
  };

  // Cancel editing
  const handleCancel = () => {
    reset({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      avatar_url: user?.avatar_url || "",
    });
    setIsEditing(false);
    setAvatarPreview(null);
    setShowUrlInput(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get display avatar
  const displayAvatar = avatarPreview || currentAvatarUrl || user?.avatar_url;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <PageHeader
        title="My Profile"
        subtitle="View and manage your account information"
        actions={
          !isEditing && (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )
        }
      />

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Avatar Section */}
            <div className="flex items-start gap-6 mb-8 pb-6 border-b border-gray-200">
              <div className="relative">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={`${user?.first_name} ${user?.last_name}`}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                    {user?.first_name?.[0]}
                    {user?.last_name?.[0]}
                  </div>
                )}
                {isEditing && (
                  <div className="absolute -bottom-1 -right-1 flex gap-1">
                    <button
                      type="button"
                      onClick={handleCameraClick}
                      className="p-2 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 transition-colors"
                      title="Upload photo"
                    >
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                    {displayAvatar && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="p-2 bg-white border border-gray-200 rounded-full shadow-md hover:bg-red-50 transition-colors"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                    <Shield className="w-3.5 h-3.5" />
                    Administrator
                  </span>
                </div>
                <p className="text-gray-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
                <p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member since {formatDate(user?.created_at)}
                </p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    First Name
                  </label>
                  {isEditing ? (
                    <Input
                      {...register("first_name")}
                      placeholder="Enter first name"
                      error={errors.first_name?.message}
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {user?.first_name || "—"}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Last Name
                  </label>
                  {isEditing ? (
                    <Input
                      {...register("last_name")}
                      placeholder="Enter last name"
                      error={errors.last_name?.message}
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {user?.last_name || "—"}
                    </p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{user?.email}</span>
                    <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Email address cannot be changed
                  </p>
                </div>

                {/* Role (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Role
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-900 capitalize">
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Avatar URL (when editing) */}
              {isEditing && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Profile Picture
                  </label>

                  {/* Upload info */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="shrink-0">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 font-medium">
                        Click the camera icon to upload a photo
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Supported formats: JPEG, PNG, GIF, WebP (max 2MB)
                      </p>

                      {/* Toggle URL input */}
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                      >
                        {showUrlInput
                          ? "Hide URL input"
                          : "Or enter image URL instead"}
                      </button>

                      {/* URL Input (optional) */}
                      {showUrlInput && (
                        <div className="mt-3">
                          <Input
                            {...register("avatar_url")}
                            placeholder="https://example.com/avatar.jpg"
                            error={errors.avatar_url?.message}
                            onChange={(e) => {
                              register("avatar_url").onChange(e);
                              setAvatarPreview(null); // Clear file preview when URL is entered
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {avatarPreview && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      New image selected - save to apply changes
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={!isDirty || updateProfileMutation.isPending}
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
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={updateProfileMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Active
                </span>
              </div>
              <p className="text-xs text-green-600">Account is active</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Verified
                </span>
              </div>
              <p className="text-xs text-blue-600">Email is verified</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  Admin
                </span>
              </div>
              <p className="text-xs text-purple-600">Full platform access</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;
