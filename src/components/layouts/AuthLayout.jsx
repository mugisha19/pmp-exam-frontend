/**
 * AuthLayout Component
 * Split screen layout for authentication pages
 */

export const AuthLayout = ({ children, illustration: Illustration }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Illustration (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 items-center justify-center p-12">
        {Illustration && <Illustration />}
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
