/**
 * Divider Component
 * Horizontal line with optional text
 */

import { cn } from "@/utils/cn";

export const Divider = ({ text, className }) => {
  if (!text) {
    return <div className={cn("h-px bg-border-primary", className)} />;
  }

  return (
    <div className={cn("relative flex items-center", className)}>
      <div className="grow h-px bg-border-primary" />
      <span className="px-4 text-sm text-text-tertiary">{text}</span>
      <div className="grow h-px bg-border-primary" />
    </div>
  );
};

export default Divider;
