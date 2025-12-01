/**
 * PasswordStrength Component
 * Visual indicator for password strength
 */

import { cn } from "@/utils/cn";
import { useMemo } from "react";

const calculateStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;

  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Complexity
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Determine label and color
  if (score <= 2) {
    return { score: 1, label: "Weak", color: "bg-error" };
  } else if (score <= 4) {
    return { score: 2, label: "Fair", color: "bg-warning" };
  } else if (score <= 5) {
    return { score: 3, label: "Good", color: "bg-accent" };
  } else {
    return { score: 4, label: "Strong", color: "bg-success" };
  }
};

export const PasswordStrength = ({ password, className }) => {
  const strength = useMemo(() => calculateStrength(password), [password]);

  if (!password) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              level <= strength.score ? strength.color : "bg-surface-secondary"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-text-tertiary">
        Password strength: <span className="font-medium">{strength.label}</span>
      </p>
    </div>
  );
};

export default PasswordStrength;
