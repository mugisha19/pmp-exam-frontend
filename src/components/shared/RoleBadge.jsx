/**
 * RoleBadge Component
 * Displays user role with appropriate color coding
 */

import { cn } from "@/utils/cn";
import { Shield, User, GraduationCap, Crown } from "lucide-react";

// Role to color and icon mapping
const roleConfig = {
  student: {
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: GraduationCap,
    label: "Student",
  },
  instructor: {
    color: "",
    icon: User,
    label: "Instructor",
  },
  admin: {
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: Shield,
    label: "Admin",
  },
  superadmin: {
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: Crown,
    label: "Super Admin",
  },
  // Fallback
  default: {
    color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    icon: User,
    label: "User",
  },
};

// Size variants
const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

const iconSizes = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
  lg: "w-4 h-4",
};

export const RoleBadge = ({
  role,
  label,
  showIcon = true,
  size = "md",
  className,
}) => {
  // Normalize role string
  const normalizedRole = role?.toLowerCase().replace(/\s+/g, "") || "default";

  // Get config for role
  const config = roleConfig[normalizedRole] || roleConfig.default;
  const Icon = config.icon;

  // Display label
  const displayLabel = label || config.label;

  const isInstructor = normalizedRole === 'instructor';
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border",
        sizeClasses[size],
        !isInstructor && config.color,
        className
      )}
      style={isInstructor ? {
        backgroundColor: 'rgba(71, 96, 114, 0.1)',
        color: '#476072',
        borderColor: 'rgba(71, 96, 114, 0.2)',
      } : {}}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {displayLabel}
    </span>
  );
};

export default RoleBadge;
