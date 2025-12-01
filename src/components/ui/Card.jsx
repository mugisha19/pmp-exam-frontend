/**
 * Card Component
 * Container with dark surface background
 */

import { cn } from "@/utils/cn";

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = ({
  children,
  padding = "md",
  hover = false,
  onClick,
  className,
  ...props
}) => {
  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        "bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50",
        paddingStyles[padding],
        hover &&
          "transition-all duration-200 hover:bg-gray-800/70 hover:border-gray-600/50",
        isClickable && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3 className={cn("text-xl font-bold text-white", className)} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className, ...props }) => {
  return (
    <p className={cn("text-sm text-gray-400 mt-1", className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className, ...props }) => {
  return (
    <div
      className={cn("mt-4 pt-4 border-t border-gray-700/50", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
