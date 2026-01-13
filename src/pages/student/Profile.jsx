/**
 * Student Profile Page
 * Profile management for student users - Modern design
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
  Edit3,
  Award,
  BookOpen,
  TrendingUp,
  Clock,
  ChevronRight,
  Settings,
  Bell,
  Lock,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/stores/auth.store";
import { useUpdateProfileMutation } from "@/hooks/queries/useUserQueries";
import api from "@/services/api";
import toast from "react-hot-toast";
import { cn } from "@/utils/cn";
import { Link } from "react-router-dom";

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
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
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
      toast.success("Profile updated successfully!");
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            {/* Avatar Section */}
            <div className="relative shrink-0">
              <div className="relative">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={`${user?.first_name} ${user?.last_name}`}
                    className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl object-cover border-4 border-white shadow-lg"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={cn(
                    "w-32 h-32 lg:w-40 lg:h-40 rounded-2xl flex items-center justify-center text-white text-4xl lg:text-5xl font-bold border-4 border-white shadow-lg bg-gradient-to-br from-[#FF5100] to-[#FF6B2C]",
                    displayAvatar ? "hidden" : "flex"
                  )}
                >
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </div>

                {/* Online Status */}
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-[#6EC1E4] border-3 border-white rounded-full shadow-sm" />
              </div>

              {/* Edit Avatar Button */}
              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-3 bg-[#FF5100] rounded-xl shadow-lg hover:bg-[#E64800] hover:shadow-xl transition-all"
                    title="Upload photo"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                  {displayAvatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-2 -right-2 p-2 bg-white border border-gray-200 rounded-xl shadow-lg hover:bg-red-50 hover:border-red-200 transition-all"
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

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {user?.first_name} {user?.last_name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      {user?.email}
                    </span>
                    <span className="hidden sm:block text-gray-300">•</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Joined {formatDate(user?.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </span>
                  </div>
                </div>

                {/* Edit Button */}
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5100] text-white font-semibold rounded-lg hover:bg-[#E64800] transition-colors shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Main Content */}
          <div className="flex-1 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(110,193,228,0.2)] flex items-center justify-center">
                    <User className="w-5 h-5 text-[#6EC1E4]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Personal Information
                    </h2>
                    <p className="text-sm text-gray-500">
                      Manage your personal details
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    {isEditing ? (
                      <div>
                        <input
                          {...register("first_name")}
                          placeholder="Enter first name"
                          className={cn(
                            "w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[rgba(255,81,0,0.2)] focus:border-[#FF5100] outline-none transition-all",
                            errors.first_name
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                              : "border-gray-300"
                          )}
                        />
                        {errors.first_name && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.first_name.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium">
                        {user?.first_name || "—"}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    {isEditing ? (
                      <div>
                        <input
                          {...register("last_name")}
                          placeholder="Enter last name"
                          className={cn(
                            "w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[rgba(255,81,0,0.2)] focus:border-[#FF5100] outline-none transition-all",
                            errors.last_name
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                              : "border-gray-300"
                          )}
                        />
                        {errors.last_name && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.last_name.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium">
                        {user?.last_name || "—"}
                      </p>
                    )}
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-medium flex-1">
                        {user?.email}
                      </span>
                      <CheckCircle className="w-4 h-4 text-[#6EC1E4]" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                      Email cannot be changed
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={
                        (!isDirty && !selectedFile) ||
                        updateProfileMutation.isPending
                      }
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5100] text-white font-semibold rounded-lg hover:bg-[#E64800] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={updateProfileMutation.isPending}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-80 shrink-0 space-y-6">
            {/* Quick Stats Card */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Quick Stats</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(110,193,228,0.2)] flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#6EC1E4]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Exams Taken</p>
                    <p className="text-lg font-bold text-gray-900">12</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Average Score</p>
                    <p className="text-lg font-bold text-gray-900">85%</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Study Hours</p>
                    <p className="text-lg font-bold text-gray-900">24h</p>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                <Link
                  to="/my-learning"
                  className="text-sm font-medium text-[#FF5100] hover:text-[#E64800] flex items-center gap-1"
                >
                  View detailed stats
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Member Since Card */}
            <div className="bg-gradient-to-br from-[#FF5100] to-[#FF6B2C] rounded-xl p-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Member Since</p>
                  <p className="font-bold text-white">
                    {formatDate(user?.created_at)}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-white/20">
                <p className="text-sm text-white/80">
                  Thank you for being part of our learning community!
                </p>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Account</h3>
              </div>
              <div className="p-5">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;



