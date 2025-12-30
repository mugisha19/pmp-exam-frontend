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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600 font-medium text-lg">View and manage your account information</p>
        </div>
        {!isEditing && (
          <Button 
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card className="border-2 border-gray-100 shadow-lg shadow-gray-100/50">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Avatar Section */}
            <div className="flex items-start gap-8 mb-10 pb-8 border-b-2 border-gray-100">
              <div className="relative">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={`${user?.first_name} ${user?.last_name}`}
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl ring-4 ring-accent-primary/10"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-32 h-32 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-xl ring-4 ring-accent-primary/10"
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
                      className="absolute -bottom-2 -right-2 p-3 bg-gradient-to-r from-accent-primary to-accent-secondary border-4 border-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                      title="Upload photo"
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </button>
                    {displayAvatar && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute -top-2 -right-2 p-2 bg-white border-2 border-gray-200 rounded-full shadow-lg hover:bg-red-50 hover:border-red-200 transition-all duration-200 hover:scale-110"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4 text-red-500" />
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
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-xl shadow-sm border border-blue-200">
                    <Shield className="w-4 h-4" />
                    Student
                  </span>
                </div>
                <p className="text-gray-600 font-medium flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-gray-500" />
                  {user?.email}
                </p>
                <p className="text-gray-500 text-sm font-medium mt-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member since {formatDate(user?.created_at)}
                </p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-8">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-accent-primary" />
                </div>
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
                    <p className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100/50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium shadow-sm">
                      {user?.first_name || "—"}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <Input
                      {...register("last_name")}
                      placeholder="Enter last name"
                      error={errors.last_name?.message}
                      className="border-2 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100/50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium shadow-sm">
                      {user?.last_name || "—"}
                    </p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100/50 border-2 border-gray-200 rounded-xl shadow-sm">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900 font-medium">{user?.email}</span>
                    <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                  </div>
                  <p className="text-xs text-gray-600 mt-2 font-medium">
                    Email address cannot be changed
                  </p>
                </div>

                {/* Role (Read-only) */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-xl shadow-sm">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-900 font-bold capitalize">
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
              <div className="flex items-center gap-4 mt-10 pt-8 border-t-2 border-gray-100">
                <Button
                  type="submit"
                  disabled={
                    (!isDirty && !selectedFile) ||
                    updateProfileMutation.isPending
                  }
                  className="bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                  className="border-2 hover:bg-gray-100 transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card className="border-2 border-gray-100 shadow-lg shadow-gray-100/50">
        <CardContent className="p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent-primary" />
            </div>
            Account Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100/30 rounded-xl border-2 border-green-200 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-700" />
                </div>
                <span className="text-sm font-bold text-green-700 uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-xs text-green-600 font-medium">Account is active</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl border-2 border-blue-200 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center shadow-sm">
                  <Mail className="w-5 h-5 text-blue-700" />
                </div>
                <span className="text-sm font-bold text-blue-700 uppercase tracking-wide">
                  Verified
                </span>
              </div>
              <p className="text-xs text-blue-600 font-medium">Email is verified</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/30 rounded-xl border-2 border-purple-200 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-200 flex items-center justify-center shadow-sm">
                  <Shield className="w-5 h-5 text-purple-700" />
                </div>
                <span className="text-sm font-bold text-purple-700 uppercase tracking-wide">
                  Student
                </span>
              </div>
              <p className="text-xs text-purple-600 font-medium">Learning access</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;
