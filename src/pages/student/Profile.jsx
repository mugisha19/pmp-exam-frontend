/**
 * Student Profile Page
 * Profile management for student users
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
  Save,
  Loader2,
  CheckCircle,
  X,
  Upload,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuthStore } from "@/stores/auth.store";
import { useUpdateProfileMutation } from "@/hooks/queries/useUserQueries";
import api from "@/services/api";
import toast from "react-hot-toast";

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
    .optional()
    .refine(
      (val) =>
        !val ||
        val === "" ||
        val === "file_upload_pending" ||
        val.startsWith("http://") ||
        val.startsWith("https://") ||
        val.startsWith("/api/"),
      "Please enter a valid image URL (http:// or https://)"
    ),
});

export function Profile() {
  const { user } = useAuthStore();
  const updateUser = useAuthStore((state) => state.updateUser);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const updateProfileMutation = useUpdateProfileMutation();

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

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setValue("avatar_url", "file_upload_pending", { shouldDirty: true });
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setValue("avatar_url", "", { shouldDirty: true });
  };

  const onSubmit = async (data) => {
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await api.post("/users/me/avatar", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const avatarUrl = response.data.avatar_url;
        data.avatar_url = avatarUrl;

        const fullAvatarUrl = avatarUrl.startsWith("http")
          ? avatarUrl
          : `http://localhost:8000${avatarUrl}`;
        updateUser({ avatar_url: fullAvatarUrl });
      } else if (data.avatar_url === "file_upload_pending") {
        data.avatar_url = "";
      }

      const updateData = {
        first_name: data.first_name,
        last_name: data.last_name,
      };

      if (data.avatar_url && data.avatar_url !== "file_upload_pending") {
        updateData.avatar_url = data.avatar_url;
      }

      await updateProfileMutation.mutateAsync(updateData);
      setIsEditing(false);
      setAvatarPreview(null);
      setSelectedFile(null);
    } catch (error) {

      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else if (error.response?.status === 413) {
        toast.error("File too large. Maximum size is 5MB.");
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error(error.message || "Failed to update profile");
      }
    }
  };

  const handleCancel = () => {
    reset({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      avatar_url: user?.avatar_url || "",
    });
    setIsEditing(false);
    setAvatarPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const displayAvatar = avatarPreview || currentAvatarUrl || user?.avatar_url;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">View and manage your account information</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Avatar Section */}
            <div className="flex items-start gap-6 mb-8 pb-6 border-b border-gray-200">
              <div className="relative">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={`${user?.first_name} ${user?.last_name}`}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg"
                  style={{ display: displayAvatar ? "none" : "flex" }}
                >
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </div>
                {isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 p-2 bg-blue-600 border-2 border-white rounded-full shadow-md hover:bg-blue-700 transition-colors"
                      title="Upload photo"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                    {displayAvatar && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute -top-1 -right-1 p-1.5 bg-white border border-gray-200 rounded-full shadow-md hover:bg-red-50 transition-colors"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                    <Shield className="w-3.5 h-3.5" />
                    Student
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

              {/* Avatar Upload/URL (when editing) */}
              {isEditing && (
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Profile Picture
                    </label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                      <span className="text-sm text-gray-500">
                        {selectedFile ? selectedFile.name : "No file selected"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Profile Picture URL
                    </label>
                    <Input
                      {...register("avatar_url")}
                      placeholder="https://example.com/avatar.jpg"
                      error={errors.avatar_url?.message}
                      helperText="Enter a publicly accessible image URL"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={
                    (!isDirty && !selectedFile) ||
                    updateProfileMutation.isPending
                  }
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
                  Student
                </span>
              </div>
              <p className="text-xs text-purple-600">Learning access</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;
