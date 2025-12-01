/**
 * Skeleton Component
 * Loading placeholder with animation
 */

import { cn } from "@/utils/cn";

const variantStyles = {
  text: "h-4 w-full rounded",
  circle: "rounded-full",
  rectangle: "rounded-xl",
};

export const Skeleton = ({
  variant = "rectangle",
  width,
  height,
  className,
  animation = "pulse",
  ...props
}) => {
  const animationStyles = {
    pulse: "animate-pulse",
    wave: "animate-shimmer bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%]",
    none: "",
  };

  return (
    <div
      className={cn(
        "bg-gray-800/50",
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={{
        width: width,
        height: height,
      }}
      {...props}
    />
  );
};

export const SkeletonText = ({ lines = 3, className }) => {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? "60%" : "100%"}
        />
      ))}
    </div>
  );
};

export const SkeletonCard = ({ className }) => {
  return (
    <div className={cn("bg-gray-800/50 rounded-2xl p-6 space-y-4", className)}>
      <div className="flex items-center gap-4">
        <Skeleton variant="circle" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
};

export const SkeletonAvatar = ({ size = 40, className }) => {
  return (
    <Skeleton
      variant="circle"
      width={size}
      height={size}
      className={className}
    />
  );
};

export const SkeletonButton = ({ className }) => {
  return (
    <Skeleton
      variant="rectangle"
      height={40}
      width={120}
      className={cn("rounded-full", className)}
    />
  );
};

export default Skeleton;
