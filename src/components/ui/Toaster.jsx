/**
 * Toaster Component
 * Global toast notification wrapper with custom styling
 */

import { Toaster as HotToaster, toast } from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
} from "lucide-react";

/**
 * Custom Toast Component
 */
export const CustomToast = ({ t, message, type = "default" }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    loading: <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />,
    default: <Info className="w-5 h-5 text-gray-500" />,
  };

  const backgrounds = {
    success: "bg-emerald-50 border-emerald-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-amber-50 border-amber-200",
    info: "bg-blue-50 border-blue-200",
    loading: "bg-gray-50 border-gray-200",
    default: "bg-white border-gray-200",
  };

  const textColors = {
    success: "text-emerald-800",
    error: "text-red-800",
    warning: "text-amber-800",
    info: "text-blue-800",
    loading: "text-gray-800",
    default: "text-gray-800",
  };

  const progressColors = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-blue-500",
    loading: "bg-emerald-500",
    default: "bg-gray-500",
  };

  return (
    <div
      className={`
        ${t.visible ? "animate-enter" : "animate-leave"}
        max-w-md w-full pointer-events-auto
      `}
    >
      <div
        className={`
          relative overflow-hidden
          flex items-start gap-3 p-4 
          ${backgrounds[type]} 
          border rounded-xl shadow-lg
          backdrop-blur-sm
        `}
      >
        {/* Icon */}
        <div className="shrink-0 mt-0.5">{icons[type]}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${textColors[type]}`}>
            {typeof message === "string" ? message : message}
          </p>
        </div>

        {/* Close Button */}
        {type !== "loading" && (
          <button
            onClick={() => toast.dismiss(t.id)}
            className="shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}

        {/* Progress Bar */}
        {type !== "loading" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
            <div
              className={`h-full ${progressColors[type]} transition-all duration-100`}
              style={{
                animation: `shrink ${t.duration || 4000}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Toaster component with custom styling
 */
export const Toaster = () => {
  return (
    <>
      {/* CSS for animations */}
      <style>
        {`
          @keyframes enter {
            0% {
              transform: translateX(100%);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes leave {
            0% {
              transform: translateX(0);
              opacity: 1;
            }
            100% {
              transform: translateX(100%);
              opacity: 0;
            }
          }

          @keyframes shrink {
            0% {
              width: 100%;
            }
            100% {
              width: 0%;
            }
          }

          .animate-enter {
            animation: enter 0.3s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
          }

          .animate-leave {
            animation: leave 0.2s cubic-bezier(0.06, 0.71, 0.55, 1) forwards;
          }
        `}
      </style>

      <HotToaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        containerStyle={{
          top: 24,
          right: 24,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: "transparent",
            boxShadow: "none",
            padding: 0,
            maxWidth: "420px",
          },
          success: {
            duration: 4000,
            style: {
              background: "transparent",
              boxShadow: "none",
              padding: 0,
            },
          },
          error: {
            duration: 5000,
            style: {
              background: "transparent",
              boxShadow: "none",
              padding: 0,
            },
          },
        }}
      >
        {(t) => {
          // Check if it's a custom toast (already rendered)
          if (t.type === "custom") {
            return t.message;
          }

          // Default rendering for standard toasts
          const type =
            t.type === "success"
              ? "success"
              : t.type === "error"
              ? "error"
              : t.type === "loading"
              ? "loading"
              : "default";

          return <CustomToast t={t} message={t.message} type={type} />;
        }}
      </HotToaster>
    </>
  );
};

export default Toaster;
