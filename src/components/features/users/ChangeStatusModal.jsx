/**
 * Change Status Modal
 * Modal for enabling/disabling a user account
 */

import { useUpdateUserStatusMutation } from "@/hooks/queries/useUserQueries";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { UserCell } from "@/components/shared/UserCell";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export const ChangeStatusModal = ({ isOpen, onClose, user }) => {
  const updateStatusMutation = useUpdateUserStatusMutation();

  if (!user) return null;

  const isCurrentlyActive = user.active !== false; // Default to active if undefined
  const newStatus = !isCurrentlyActive;

  const handleConfirm = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        userId: user.user_id || user.id,
        active: newStatus,
        reason: newStatus ? "" : "Deactivated by administrator",
      });
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCurrentlyActive ? "Deactivate User" : "Activate User"}
      size="md"
    >
      <div className="space-y-4">
        {/* User Info */}
        <div className="p-4 bg-gray-100 rounded-xl">
          <UserCell user={user} showEmail />
        </div>

        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <span className="text-sm text-gray-500">Current Status</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              isCurrentlyActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {isCurrentlyActive ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Active
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                Inactive
              </>
            )}
          </span>
        </div>

        {/* Confirmation Message */}
        {isCurrentlyActive ? (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-700 font-medium">
                Deactivate this user?
              </p>
              <p className="text-xs text-gray-600 mt-1">
                This user will immediately lose access to the platform. Any
                active sessions will be terminated.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-green-700 font-medium">
                Activate this user?
              </p>
              <p className="text-xs text-gray-600 mt-1">
                This user will regain access to the platform based on their role
                permissions.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={updateStatusMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={isCurrentlyActive ? "danger" : "primary"}
            loading={updateStatusMutation.isPending}
            onClick={handleConfirm}
          >
            {isCurrentlyActive ? "Deactivate User" : "Activate User"}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
};

export default ChangeStatusModal;
