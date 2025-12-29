/**
 * ConfirmDialog Component
 * Confirmation modal for destructive actions
 */

import { Modal, ModalBody, ModalFooter } from "../ui/Modal";
import { Button } from "../ui/Button";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/utils/cn";

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // 'danger' | 'warning' | 'info'
  loading = false,
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    if (!loading) {
      onClose();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: "text-red-400",
          iconBg: "bg-red-600/20",
          button: "bg-red-600 hover:bg-red-700",
        };
      case "warning":
        return {
          icon: "text-yellow-400",
          iconBg: "bg-yellow-600/20",
          button: "bg-yellow-600 hover:bg-yellow-700",
        };
      case "info":
        return {
          icon: "text-blue-400",
          iconBg: "bg-blue-600/20",
          button: "bg-blue-600 hover:bg-blue-700",
        };
      default:
        return {
          icon: "text-red-400",
          iconBg: "bg-red-600/20",
          button: "bg-red-600 hover:bg-red-700",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlay={!loading}
    >
      <ModalBody>
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-xl flex-shrink-0", styles.iconBg)}>
            <AlertTriangle className={cn("w-6 h-6", styles.icon)} />
          </div>
          <div className="flex-1">
            {typeof message === "string" ? (
              <p className="text-gray-800 text-base font-medium leading-relaxed">
                {message}
              </p>
            ) : (
              <div className="text-gray-800 text-base font-medium leading-relaxed">
                {message}
              </div>
            )}
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          loading={loading}
          className={styles.button}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmDialog;
