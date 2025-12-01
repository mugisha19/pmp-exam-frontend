/**
 * Modal Component
 * Overlay modal with dark theme
 */

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";
import { X } from "lucide-react";

const sizeStyles = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-full mx-4",
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeOnOverlay = true,
  showClose = true,
  className,
}) => {
  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          "relative bg-gray-800 rounded-2xl shadow-2xl border border-gray-700/50",
          "w-full overflow-hidden",
          sizeStyles[size],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
            {title && (
              <h2 id="modal-title" className="text-xl font-bold text-white">
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="ml-auto text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700/50"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export const ModalHeader = ({ children, className }) => {
  return <div className={cn("mb-4", className)}>{children}</div>;
};

export const ModalBody = ({ children, className }) => {
  return <div className={cn("", className)}>{children}</div>;
};

export const ModalFooter = ({ children, className }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-700/50",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Modal;
