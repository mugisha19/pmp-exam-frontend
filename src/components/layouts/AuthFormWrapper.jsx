/**
 * AuthFormWrapper Component
 * Consistent wrapper for authentication forms
 */

import { Logo } from "../ui";

export const AuthFormWrapper = ({ title, subtitle, children, footer }) => {
  return (
    <div className="w-full animate-fade-in">
      {/* Icon */}
      <div className="mb-6 flex justify-center">
        {/* <Logo size="md" /> */}
      </div>

      {/* Title and Subtitle */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
      </div>

      {/* Form Content */}
      <div className="mb-6">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="mt-8 text-center text-sm text-gray-400">{footer}</div>
      )}
    </div>
  );
};

export default AuthFormWrapper;
