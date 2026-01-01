/**
 * Toast Components
 * React components for toast notifications
 * Separated from utilities for Fast Refresh compatibility
 */

import toast from "react-hot-toast";
import { X, ArrowRight, Undo2, Bell, Sparkles } from "lucide-react";
import { cn } from "@/utils/cn";
import { toastConfig } from "./toast.config";

/**
 * Custom Toast Component
 */
export const CustomToast = ({
  type = "info",
  title,
  message,
  t,
  onAction,
  actionLabel,
  onUndo,
  undoLabel = "Undo",
  showProgress = true,
  duration = 4000,
}) => {
  const config = toastConfig[type];
  const Icon = config.icon;
  const isLoading = type === "loading";

  return (
    <div
      className={cn(
        "max-w-md w-full pointer-events-auto",
        t.visible ? "animate-slide-in" : "animate-slide-out"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          config.bg,
          "border",
          config.border,
          "rounded-xl shadow-lg backdrop-blur-sm"
        )}
      >
        {/* Top Gradient Accent */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
            config.gradient
          )}
        />

        <div className="flex items-start gap-3 p-4 pt-5">
          {/* Icon */}
          <div
            className={cn(
              "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
              config.iconBg
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5",
                config.iconColor,
                isLoading && "animate-spin"
              )}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className={cn("text-sm font-semibold", config.titleColor)}>
              {title}
            </h3>
            {message && (
              <p
                className={cn(
                  "text-sm mt-0.5 leading-relaxed",
                  config.messageColor
                )}
              >
                {message}
              </p>
            )}

            {/* Actions */}
            {(onAction || onUndo) && (
              <div className="flex items-center gap-3 mt-3">
                {onAction && (
                  <button
                    onClick={() => {
                      onAction();
                      toast.dismiss(t.id);
                    }}
                    className={cn(
                      "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                      config.buttonColor
                    )}
                  >
                    {actionLabel || "View"}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                {onUndo && (
                  <button
                    onClick={() => {
                      onUndo();
                      toast.dismiss(t.id);
                    }}
                    className={cn(
                      "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                      config.buttonColor
                    )}
                  >
                    <Undo2 className="w-3 h-3" />
                    {undoLabel}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Close Button */}
          {!isLoading && (
            <button
              onClick={() => toast.dismiss(t.id)}
              className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && !isLoading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
            <div
              className={cn("h-full", config.progressColor)}
              style={{
                animation: `shrink-width ${duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Compact Toast Component
 */
export const CompactToast = ({ type = "info", message, t }) => {
  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "max-w-sm w-full pointer-events-auto",
        t.visible ? "animate-slide-in" : "animate-slide-out"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 py-3",
          config.bg,
          "border",
          config.border,
          "rounded-xl shadow-lg"
        )}
      >
        <Icon className={cn("w-4 h-4 shrink-0", config.iconColor)} />
        <p className={cn("text-sm font-medium flex-1", config.titleColor)}>
          {message}
        </p>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

/**
 * Notification Toast Component
 */
export const NotificationToast = ({
  t,
  title,
  message,
  avatar,
  icon,
  time,
  onClick,
}) => {
  const IconComponent = icon || Bell;

  return (
    <div
      className={cn(
        "max-w-md w-full pointer-events-auto",
        t.visible ? "animate-slide-in" : "animate-slide-out"
      )}
    >
      <div
        onClick={() => {
          onClick?.();
          toast.dismiss(t.id);
        }}
        className={cn(
          "relative overflow-hidden",
          "bg-white border border-gray-200",
          "rounded-xl shadow-lg",
          onClick && "cursor-pointer hover:bg-gray-50 transition-colors"
        )}
      >
        {/* Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />

        <div className="flex items-start gap-3 p-4 pt-5">
          {/* Avatar or Icon */}
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="w-10 h-10 rounded-xl object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <IconComponent className="w-5 h-5 text-emerald-600" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {title}
              </h3>
              {time && (
                <span className="text-xs text-gray-400 shrink-0">{time}</span>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{message}</p>
          </div>

          {/* Close */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.dismiss(t.id);
            }}
            className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Promise Toast Component
 */
export const PromiseToast = ({ t, state, messages }) => {
  const { loading, success, error } = messages;

  if (state === "loading") {
    return (
      <CustomToast
        t={t}
        type="loading"
        title="Loading"
        message={loading}
        showProgress={false}
      />
    );
  }

  if (state === "success") {
    return (
      <CustomToast
        t={t}
        type="success"
        title="Success"
        message={success}
        duration={4000}
      />
    );
  }

  if (state === "error") {
    return (
      <CustomToast
        t={t}
        type="error"
        title="Error"
        message={error}
        duration={5000}
      />
    );
  }

  return null;
};

/**
 * Achievement Toast Component
 */
export const AchievementToast = ({ t, title, description }) => {
  return (
    <div
      className={cn(
        "max-w-md w-full pointer-events-auto",
        t.visible ? "animate-slide-in" : "animate-slide-out"
      )}
    >
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl shadow-lg">
        {/* Sparkle Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400" />

        <div className="flex items-center gap-4 p-4 pt-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-200">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-0.5">
              Achievement Unlocked
            </p>
            <h3 className="text-sm font-bold text-amber-900">{title}</h3>
            {description && (
              <p className="text-xs text-amber-700 mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="shrink-0 p-1.5 rounded-lg text-amber-400 hover:text-amber-600 hover:bg-amber-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Undo Toast Component
 */
export const UndoToast = ({ t, message, onUndo, timeout = 5000 }) => {
  return (
    <div
      className={cn(
        "max-w-md w-full pointer-events-auto",
        t.visible ? "animate-slide-in" : "animate-slide-out"
      )}
    >
      <div className="relative overflow-hidden bg-gray-900 border border-gray-700 rounded-xl shadow-lg">
        <div className="flex items-center gap-3 p-4">
          <p className="text-sm font-medium text-white flex-1">{message}</p>
          <button
            onClick={() => {
              onUndo?.();
              toast.dismiss(t.id);
            }}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
          <div
            className="h-full bg-emerald-500"
            style={{
              animation: `shrink-width ${timeout}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
