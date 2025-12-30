/**
 * UserCell Component
 * Displays user avatar, name, and email for table cells
 */

import { cn } from "@/utils/cn";
import { User } from "lucide-react";

// Generate initials from name
const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Generate consistent color from string
const getAvatarColor = (str) => {
  if (!str) return "bg-gray-600";

  const colors = [
    "bg-blue-600",
    "",
    "bg-yellow-600",
    "",
    "bg-orange-600",
    "bg-cyan-600",
    "bg-rose-600",
    "",
    "bg-sky-600",
    "bg-amber-600",
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colorIndex = Math.abs(hash) % colors.length;
  const colorClass = colors[colorIndex];
  
  // If it's an empty string (green/teal/emerald replacement), use #476072
  if (!colorClass) {
    return "";
  }
  
  return colorClass;
};

// Size variants
const sizeConfig = {
  sm: {
    avatar: "w-7 h-7 text-xs",
    name: "text-sm",
    email: "text-xs",
    gap: "gap-2",
  },
  md: {
    avatar: "w-9 h-9 text-sm",
    name: "text-sm",
    email: "text-xs",
    gap: "gap-3",
  },
  lg: {
    avatar: "w-11 h-11 text-base",
    name: "text-base",
    email: "text-sm",
    gap: "gap-3",
  },
};

export const UserCell = ({
  user,
  name,
  email,
  avatarUrl,
  showEmail = true,
  showAvatar = true,
  size = "md",
  onClick,
  className,
}) => {
  // Support both user object and individual props
  const displayName =
    name ||
    (user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.first_name ||
        user?.last_name ||
        user?.email?.split("@")[0] ||
        "Unknown User");
  const displayEmail = email || user?.email;
  const displayAvatarUrl =
    avatarUrl || user?.avatar_url || user?.profile_picture;

  const config = sizeConfig[size];
  const initials = getInitials(displayName);
  const avatarBgColor = getAvatarColor(displayEmail || displayName);

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center",
        config.gap,
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
    >
      {/* Avatar */}
      {showAvatar && (
        <div
          className={cn(
            "shrink-0 rounded-full flex items-center justify-center font-medium text-white",
            config.avatar
          )}
          style={!displayAvatarUrl && !avatarBgColor ? { backgroundColor: '#476072' } : {}}
        >
          {displayAvatarUrl ? (
            <img
              src={displayAvatarUrl}
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className={cn("font-medium text-gray-900 truncate", config.name)}>
          {displayName}
        </div>
        {showEmail && displayEmail && (
          <div className={cn("text-gray-500 truncate", config.email)}>
            {displayEmail}
          </div>
        )}
      </div>
    </div>
  );
};

// Avatar only variant for compact displays
export const UserAvatar = ({
  user,
  name,
  email,
  avatarUrl,
  size = "md",
  className,
}) => {
  const displayName =
    name ||
    (user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.first_name ||
        user?.last_name ||
        user?.email?.split("@")[0] ||
        "Unknown User");
  const displayEmail = email || user?.email;
  const displayAvatarUrl =
    avatarUrl || user?.avatar_url || user?.profile_picture;

  const config = sizeConfig[size];
  const initials = getInitials(displayName);
  const avatarBgColor = getAvatarColor(displayEmail || displayName);

  return (
    <div
      className={cn(
        "shrink-0 rounded-full flex items-center justify-center font-medium text-white",
        config.avatar,
        !displayAvatarUrl && avatarBgColor,
        className
      )}
      style={!displayAvatarUrl && !avatarBgColor ? { backgroundColor: '#476072' } : {}}
      title={displayName}
    >
      {displayAvatarUrl ? (
        <img
          src={displayAvatarUrl}
          alt={displayName}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
};

export default UserCell;
