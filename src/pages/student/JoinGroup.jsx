/**
 * Join Group Page
 * Public page for joining a group via invite link
 */

import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Globe,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import * as groupService from "@/services/group.service";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";

/**
 * Format date for display
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "Not set";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const JoinGroup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const { isAuthenticated, user } = useAuthStore();

  // Fetch group preview
  const {
    data: groupPreview,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["group-preview", token],
    queryFn: () => groupService.getGroupPreviewByToken(token),
    enabled: !!token,
    retry: 1,
  });

  // Join group mutation - creates join request with token
  const joinMutation = useMutation({
    mutationFn: () =>
      groupService.createJoinRequest({
        group_id: groupPreview.group_id,
        invite_token: token,
        message: "Joining via invite link",
      }),
    onSuccess: (data) => {
      navigate(`/my-groups?tab=mygroups&joinRequest=success`);
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to join group. Please try again.";
      toast.error(errorMessage);
    },
  });

  // Handle join/login button click
  const handleJoin = () => {
    if (!isAuthenticated) {
      // Redirect to login with current URL to come back after login
      const currentUrl = window.location.pathname + window.location.search;
      navigate(`/login?redirect_url=${encodeURIComponent(currentUrl)}`);
      return;
    }

    if (user?.role?.toLowerCase() !== "student") {
      toast.error("Only students can join groups");
      return;
    }

    // User is authenticated as student, join the group
    joinMutation.mutate();
  };

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
        <EmptyState
          icon={AlertCircle}
          title="Invalid Invite Link"
          description="The invite link is missing or invalid. Please check the link and try again."
          actionLabel="Go to Dashboard"
          onAction={() => navigate("/dashboard")}
        />
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <Skeleton width={200} height={32} className="mx-auto" />
              <Skeleton width={300} height={20} className="mx-auto" />
            </div>
            <div className="space-y-4">
              <Skeleton height={80} />
              <Skeleton height={80} />
              <Skeleton height={80} />
            </div>
            <Skeleton height={48} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError || !groupPreview) {
    const errorMessage = error?.message || "Failed to load group information";
    const isInvalidToken =
      errorMessage.includes("invalid") ||
      errorMessage.includes("expired") ||
      errorMessage.includes("not found");

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
        <EmptyState
          icon={AlertCircle}
          title={
            isInvalidToken ? "Invalid or Expired Link" : "Error Loading Group"
          }
          description={
            isInvalidToken
              ? "This invite link is invalid or has expired. Please request a new invite link."
              : errorMessage
          }
          actionLabel="Go to Dashboard"
          onAction={() => navigate("/dashboard")}
        />
      </div>
    );
  }

  // Check if invite is valid
  if (!groupPreview.invite_valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
        <EmptyState
          icon={AlertCircle}
          title="Invite Link Expired"
          description="This invite link has expired or reached its maximum usage limit. Please request a new invite link from the group administrator."
          actionLabel="Go to Dashboard"
          onAction={() => navigate("/dashboard")}
        />
      </div>
    );
  }

  const isPrivateGroup =
    groupPreview.group_type === "private" || groupPreview.type === "private";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            You've been invited to join
          </h1>
          <p className="text-gray-600">
            Review the group details below and click join to become a member
          </p>
        </div>

        {/* Group Info Card */}
        <Card>
          <CardContent className="p-8 space-y-6">
            {/* Group Name and Status */}
            <div className="text-center space-y-3 pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {groupPreview.name}
              </h2>
              {groupPreview.description && (
                <p className="text-gray-600">{groupPreview.description}</p>
              )}
              <div className="flex items-center justify-center gap-2">
                <Badge
                  variant={isPrivateGroup ? "warning" : "success"}
                  size="md"
                >
                  {isPrivateGroup ? (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Private
                    </>
                  ) : (
                    <>
                      <Globe className="w-3 h-3 mr-1" />
                      Public
                    </>
                  )}
                </Badge>
                <StatusBadge
                  status={groupPreview.status || "active"}
                  size="md"
                />
              </div>
            </div>

            {/* Group Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Start Date */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(groupPreview.from_date)}
                  </p>
                </div>
              </div>

              {/* End Date */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(groupPreview.to_date)}
                  </p>
                </div>
              </div>

              {/* Member Count */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Current Members
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {groupPreview.member_count || 0}
                  </p>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Status
                  </p>
                  <div className="flex items-center gap-2">
                    {groupPreview.is_active ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-600">
                          Active
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-semibold text-yellow-600">
                          Not Started
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Join Button */}
            <div className="pt-6 border-t border-gray-200">
              {!isAuthenticated ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Login Required
                        </p>
                        <p className="text-sm text-blue-700">
                          You need to log in with a student account to join this
                          group. Don't have an account? You can sign up after
                          clicking the button below.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="w-full"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    onClick={handleJoin}
                  >
                    Log In to Join Group
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Don't have an account?{" "}
                    <Link
                      to={`/signup?redirect_url=${encodeURIComponent(
                        window.location.pathname + window.location.search
                      )}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Sign up here
                    </Link>
                  </p>
                </div>
              ) : user?.role?.toLowerCase() !== "student" ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900 mb-1">
                        Student Account Required
                      </p>
                      <p className="text-sm text-yellow-700">
                        Only students can join groups. You are currently logged
                        in as <span className="font-semibold">{user.role}</span>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  onClick={handleJoin}
                  isLoading={joinMutation.isLoading}
                  disabled={joinMutation.isLoading}
                >
                  {joinMutation.isLoading ? "Joining..." : "Join Group"}
                </Button>
              )}

              {isAuthenticated && user?.role?.toLowerCase() === "student" && (
                <p className="text-xs text-gray-500 text-center mt-4">
                  Already a member?{" "}
                  <Link
                    to="/my-groups?tab=mygroups"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View My Groups
                  </Link>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinGroup;




