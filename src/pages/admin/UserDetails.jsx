/**
 * Admin User Details Page
 * View and manage individual user details with all admin operations
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Shield,
  Mail,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Key,
  Ban,
  UserCheck,
} from "lucide-react";
import {
  useUser,
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useResendCredentialsMutation,
} from "@/hooks/queries/useUserQueries";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EditUserModal } from "@/components/features/users/EditUserModal";
import { ChangeRoleModal } from "@/components/features/users/ChangeRoleModal";
import { ChangeStatusModal } from "@/components/features/users/ChangeStatusModal";

const formatDate = (dateStr) => {
  if (!dateStr) return "Not set";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "Unknown";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [changeRoleModalOpen, setChangeRoleModalOpen] = useState(false);
  const [changeStatusModalOpen, setChangeStatusModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resendCredentialsDialogOpen, setResendCredentialsDialogOpen] = useState(false);

  const { data: user, isLoading, isError, error } = useUser(userId);
  const deleteUserMutation = useDeleteUserMutation();
  const updateStatusMutation = useUpdateUserStatusMutation();
  const resendCredentialsMutation = useResendCredentialsMutation();

  const handleDelete = async () => {
    await deleteUserMutation.mutateAsync(userId);
    setDeleteDialogOpen(false);
    navigate("/admin/users");
  };

  const handleToggleStatus = async () => {
    await updateStatusMutation.mutateAsync({
      userId,
      active: !user.active,
      reason: user.active ? "Deactivated by admin" : "Activated by admin",
    });
  };

  const handleResendCredentials = async () => {
    await resendCredentialsMutation.mutateAsync(userId);
    setResendCredentialsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton width={40} height={40} className="rounded-lg" />
          <div className="space-y-2">
            <Skeleton width={200} height={28} />
            <Skeleton width={150} height={16} />
          </div>
        </div>
        <Skeleton height={200} className="rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate("/admin/users")}
        >
          Back to Users
        </Button>
        <EmptyState
          icon={User}
          title="Failed to load user"
          description={error?.message || "An error occurred while loading the user details."}
          actionLabel="Go Back"
          onAction={() => navigate("/admin/users")}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate("/admin/users")}
        >
          Back to Users
        </Button>
        <EmptyState
          icon={User}
          title="User not found"
          description="The user you're looking for doesn't exist or has been deleted."
          actionLabel="Go Back"
          onAction={() => navigate("/admin/users")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>{`${user.first_name} ${user.last_name}`}</span>
            <StatusBadge status={user.active ? "active" : "inactive"} size="md" />
          </div>
        }
        subtitle={user.email}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Edit className="w-4 h-4" />}
              onClick={() => setEditModalOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Shield className="w-4 h-4" />}
              onClick={() => setChangeRoleModalOpen(true)}
            >
              Change Role
            </Button>
            <Button
              variant={user?.active ? "warning" : "success"}
              size="sm"
              leftIcon={user?.active ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              onClick={handleToggleStatus}
              loading={updateStatusMutation.isPending}
            >
              {user?.active ? "Deactivate" : "Activate"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Key className="w-4 h-4" />}
              onClick={() => setResendCredentialsDialogOpen(true)}
            >
              Resend Credentials
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate("/admin/users")}
            >
              Back
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoItem
              icon={User}
              label="Full Name"
              value={`${user.first_name} ${user.last_name}`}
            />
            <InfoItem icon={Mail} label="Email" value={user.email} />
            <InfoItem icon={Shield} label="Role" value={<RoleBadge role={user.role} />} />
            <InfoItem
              icon={user.active ? CheckCircle : XCircle}
              label="Status"
              value={<StatusBadge status={user.active ? "active" : "inactive"} />}
            />
            <InfoItem
              icon={user.email_verified ? CheckCircle : XCircle}
              label="Email Verified"
              value={user.email_verified ? "Yes" : "No"}
            />
            <InfoItem icon={Calendar} label="Joined" value={formatDate(user.created_at)} />
            <InfoItem
              icon={Clock}
              label="Last Login"
              value={formatDateTime(user.last_login)}
            />
            <InfoItem
              icon={Calendar}
              label="Last Updated"
              value={formatDateTime(user.updated_at)}
            />
            {user.avatar_url && (
              <InfoItem
                icon={User}
                label="Avatar"
                value={
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                }
              />
            )}
          </div>
        </CardContent>
      </Card>

      <EditUserModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={user}
      />

      <ChangeRoleModal
        isOpen={changeRoleModalOpen}
        onClose={() => setChangeRoleModalOpen(false)}
        user={user}
      />

      <ChangeStatusModal
        isOpen={changeStatusModalOpen}
        onClose={() => setChangeStatusModalOpen(false)}
        user={user}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteUserMutation.isPending}
      />

      <ConfirmDialog
        isOpen={resendCredentialsDialogOpen}
        onClose={() => setResendCredentialsDialogOpen(false)}
        onConfirm={handleResendCredentials}
        title="Resend Credentials"
        message={`This will generate a new password and send it to ${user?.email}. The user will need to verify their email if not already verified.`}
        confirmText="Resend"
        variant="info"
        loading={resendCredentialsMutation.isPending}
      />
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-blue-50 rounded-lg">
      <Icon className="w-4 h-4 text-blue-600" />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-700 mb-1">{label}</p>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  </div>
);

export default UserDetails;
