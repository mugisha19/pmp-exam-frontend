/**
 * Avatar Component
 * Displays user avatar with fallback to initials
 */

import { cn } from "@/utils/cn";
import { User } from "lucide-react";

const sizeStyles = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
};

const statusSizes = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
  xl: "w-4 h-4",
};

export const Avatar = ({
  src,
  alt,
  name,
  size = "md",
  showStatus = false,
  isOnline = false,
  className,
}) => {
  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600",
          "flex items-center justify-center font-medium text-white",
          sizeStyles[size]
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : initials ? (
          <span>{initials}</span>
        ) : (
          <User className="w-1/2 h-1/2" />
        )}
      </div>

      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-gray-900",
            statusSizes[size],
            isOnline ? "bg-green-500" : "bg-gray-500"
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
