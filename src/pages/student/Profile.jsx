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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Cover Photo Section */}
      <div className="relative h-48 bg-gradient-to-br from-primary via-primary/90 to-secondary rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-end gap-6">
            {/* Avatar */}
            <div className="relative -mb-16">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={`${user?.first_name} ${user?.last_name}`}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="w-32 h-32 rounded-2xl flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-xl"
                style={{
                  background:
                    "linear-gradient(to bottom right, #10b981, #0d9488)",
                  display: displayAvatar ? "none" : "flex",
                }}
              >
                {user?.first_name?.[0]}
                {user?.last_name?.[0]}
              </div>
              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-3 bg-primary border-4 border-white rounded-full shadow-lg hover:shadow-xl transition-all"
                    title="Upload photo"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                  {displayAvatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-2 -right-2 p-2 bg-white border-2 border-gray-200 rounded-full shadow-lg hover:bg-red-50 hover:border-red-200 transition-all"
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
            {/* Name and Edit Button */}
            <div className="flex-1 pb-4 flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {user?.first_name} {user?.last_name}
                </h1>
                <p className="text-white/90 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-primary hover:shadow-lg transition-all font-semibold"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="border-2 border-gray-100 shadow-soft mt-20">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Profile Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <Input
                      {...register("first_name")}
                      placeholder="Enter first name"
                      error={errors.first_name?.message}
                      className="border-2 focus:border-primary"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 font-medium">
                      {user?.first_name || "—"}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <Input
                      {...register("last_name")}
                      placeholder="Enter last name"
                      error={errors.last_name?.message}
                      className="border-2 focus:border-primary"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 font-medium">
                      {user?.last_name || "—"}
                    </p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-medium">
                      {user?.email}
                    </span>
                    <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Email address cannot be changed
                  </p>
                </div>

                {/* Role (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border-2 border-primary/20 rounded-xl">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="text-gray-900 font-semibold capitalize">
                      {user?.role}
                    </span>
                  </div>
                </div>

                {/* Member Since */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-medium">
                      {formatDate(user?.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center gap-4 mt-8 pt-6 border-t-2 border-gray-100">
                <Button
                  type="submit"
                  disabled={
                    (!isDirty && !selectedFile) ||
                    updateProfileMutation.isPending
                  }
                  className="bg-primary hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="border-2 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card className="border-2 border-gray-100 shadow-soft">
        <CardContent className="p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            Account Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-xl border-2 border-emerald-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-200 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-700" />
                </div>
                <span className="text-sm font-bold text-emerald-700 uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-xs text-emerald-600 font-medium">
                Account is active
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-xl border-2 border-emerald-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-200 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-emerald-700" />
                </div>
                <span className="text-sm font-bold text-emerald-700 uppercase tracking-wide">
                  Verified
                </span>
              </div>
              <p className="text-xs text-emerald-600 font-medium">
                Email is verified
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border-2 border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-bold text-primary uppercase tracking-wide">
                  Student
                </span>
              </div>
              <p className="text-xs text-primary/80 font-medium">
                Learning access
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;
