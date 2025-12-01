/**
 * Logo Component
 * 4-dot grid icon as seen in screenshots
 */

import { cn } from "@/utils/cn";

const sizeStyles = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

export const Logo = ({ size = "md", className }) => {
  return (
    <div className={cn("inline-flex", sizeStyles[size], className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <rect x="4" y="4" width="7" height="7" rx="1.5" fill="#7c7cff" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" fill="#7c7cff" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" fill="#7c7cff" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" fill="#7c7cff" />
      </svg>
    </div>
  );
};

export default Logo;
