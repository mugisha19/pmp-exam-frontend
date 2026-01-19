/**
 * Avatar Component
 * Displays user avatar with fallback to initials and personalized colors
 */

import React from "react";
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

// Curated gradient color combinations for avatars
const colorGradients = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-purple-500",
  "from-teal-500 to-green-500",
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-cyan-500 to-blue-500",
  "from-fuchsia-500 to-purple-500",
];

export const Avatar = ({
  src,
  alt,
  name,
  size = "md",
  showStatus = false,
  isOnline = false,
  className,
}) => {
  const [imageError, setImageError] = React.useState(false);

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate consistent color based on name
  const getColorGradient = (name) => {
    if (!name) return colorGradients[0];
    
    // Simple hash function to get consistent color for same name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colorGradients.length;
    return colorGradients[index];
  };

  const initials = getInitials(name);
  const gradientColors = getColorGradient(name);
  const showImage = src && !imageError;

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "rounded-full overflow-hidden bg-gradient-to-br",
          gradientColors,
          "flex items-center justify-center font-semibold text-white shadow-sm",
          sizeStyles[size]
        )}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : initials ? (
          <span className="select-none">{initials}</span>
        ) : (
          <User className="w-1/2 h-1/2" />
        )}
      </div>

      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-gray-900",
            statusSizes[size],
            !isOnline && "bg-gray-500"
          )}
          style={isOnline ? { backgroundColor: '#476072' } : {}}
        />
      )}
    </div>
  );
};

export default Avatar;
