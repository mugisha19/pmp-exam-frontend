/**
 * PasswordInput Component
 * Input with password visibility toggle
 */

import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./Input";

export const PasswordInput = forwardRef(({ ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Input
      ref={ref}
      type={showPassword ? "text" : "password"}
      rightIcon={
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="text-text-tertiary hover:text-text-secondary transition-colors"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      }
      {...props}
    />
  );
});

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
