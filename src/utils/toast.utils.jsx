/**
 * Custom Toast Utilities
 * Beautiful toast notifications matching the design system
 *
 * Components are separated into toast.components.jsx for Fast Refresh compatibility
 */

import toast from "react-hot-toast";
import {
  CustomToast,
  CompactToast,
  NotificationToast,
  PromiseToast,
  AchievementToast,
  UndoToast,
} from "./toast.components";

/**
 * Toast notification helpers
 */
export const showToast = {
  /**
   * Success toast with title and message
   */
  success: (title, message, options = {}) => {
    return toast.custom(
      (t) => (
        <CustomToast
          type="success"
          title={title}
          message={message}
          t={t}
          duration={options.duration || 4000}
          {...options}
        />
      ),
      { duration: options.duration || 4000 }
    );
  },

  /**
   * Error toast with title and message
   */
  error: (title, message, options = {}) => {
    return toast.custom(
      (t) => (
        <CustomToast
          type="error"
          title={title}
          message={message}
          t={t}
          duration={options.duration || 5000}
          {...options}
        />
      ),
      { duration: options.duration || 5000 }
    );
  },

  /**
   * Warning toast with title and message
   */
  warning: (title, message, options = {}) => {
    return toast.custom(
      (t) => (
        <CustomToast
          type="warning"
          title={title}
          message={message}
          t={t}
          duration={options.duration || 4000}
          {...options}
        />
      ),
      { duration: options.duration || 4000 }
    );
  },

  /**
   * Info toast with title and message
   */
  info: (title, message, options = {}) => {
    return toast.custom(
      (t) => (
        <CustomToast
          type="info"
          title={title}
          message={message}
          t={t}
          duration={options.duration || 4000}
          {...options}
        />
      ),
      { duration: options.duration || 4000 }
    );
  },

  /**
   * Loading toast (returns toast ID for dismissal)
   */
  loading: (title, message) => {
    return toast.custom(
      (t) => (
        <CustomToast
          type="loading"
          title={title || "Loading"}
          message={message}
          t={t}
          showProgress={false}
        />
      ),
      { duration: Infinity }
    );
  },

  /**
   * Notification toast with avatar
   */
  notification: (options) => {
    return toast.custom((t) => <NotificationToast t={t} {...options} />, {
      duration: options.duration || 6000,
    });
  },

  /**
   * Promise toast
   */
  promise: async (promise, messages, options = {}) => {
    const toastId = toast.custom(
      (t) => <PromiseToast t={t} state="loading" messages={messages} />,
      { duration: Infinity }
    );

    try {
      const result = await promise;
      toast.custom(
        (t) => <PromiseToast t={t} state="success" messages={messages} />,
        { id: toastId, duration: 4000 }
      );
      return result;
    } catch (error) {
      toast.custom(
        (t) => <PromiseToast t={t} state="error" messages={messages} />,
        { id: toastId, duration: 5000 }
      );
      throw error;
    }
  },

  /**
   * Dismiss a toast by ID
   */
  dismiss: (toastId) => toast.dismiss(toastId),

  /**
   * Dismiss all toasts
   */
  dismissAll: () => toast.dismiss(),
};

/**
 * Simple wrappers for backwards compatibility
 * Use when you only need a message (no title)
 */
export const customToast = {
  success: (message, options = {}) => {
    return toast.custom(
      (t) => <CompactToast type="success" message={message} t={t} />,
      { duration: options.duration || 4000 }
    );
  },

  error: (message, options = {}) => {
    return toast.custom(
      (t) => <CompactToast type="error" message={message} t={t} />,
      { duration: options.duration || 5000 }
    );
  },

  warning: (message, options = {}) => {
    return toast.custom(
      (t) => <CompactToast type="warning" message={message} t={t} />,
      { duration: options.duration || 4000 }
    );
  },

  info: (message, options = {}) => {
    return toast.custom(
      (t) => <CompactToast type="info" message={message} t={t} />,
      { duration: options.duration || 4000 }
    );
  },
};

/**
 * Special toast types
 */
export const specialToast = {
  /**
   * Achievement unlocked toast
   */
  achievement: (title, description) => {
    return toast.custom(
      (t) => <AchievementToast t={t} title={title} description={description} />,
      { duration: 6000 }
    );
  },

  /**
   * Undo action toast
   */
  undo: (message, onUndo, timeout = 5000) => {
    return toast.custom(
      (t) => (
        <UndoToast t={t} message={message} onUndo={onUndo} timeout={timeout} />
      ),
      { duration: timeout }
    );
  },
};

export default showToast;
