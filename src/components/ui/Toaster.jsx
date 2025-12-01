/**
 * Toaster Component
 * Global toast notification wrapper for react-hot-toast
 */

import { Toaster as HotToaster } from "react-hot-toast";

/**
 * Toaster component with custom styling
 */
export const Toaster = () => {
  return (
    <HotToaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: "#1a1a1a",
          color: "#ffffff",
          border: "1px solid #2a2a2a",
          borderRadius: "8px",
          fontSize: "14px",
          padding: "12px 16px",
        },
        // Success style
        success: {
          duration: 3000,
          iconTheme: {
            primary: "#7c7cff",
            secondary: "#ffffff",
          },
          style: {
            border: "1px solid #7c7cff",
          },
        },
        // Error style
        error: {
          duration: 5000,
          iconTheme: {
            primary: "#ff4444",
            secondary: "#ffffff",
          },
          style: {
            border: "1px solid #ff4444",
          },
        },
        // Loading style
        loading: {
          iconTheme: {
            primary: "#7c7cff",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
};

export default Toaster;
