/**
 * ProgressCard Component
 * Card showing course/quiz progress
 */

import { Bell, MoreVertical } from "lucide-react";
import { cn } from "@/utils/cn";

export const ProgressCard = ({ 
  title = "Course Title",
  completed = 2,
  total = 8,
  className,
  onClick 
}) => {
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg border border-gray-200 shadow-sm p-3 hover:shadow transition-all cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(to bottom right, #476072, #5a7a8f)' }}>
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-gray-900 mb-0.5">{`${completed}/${total} Completed`}</p>
            <p className="text-xs font-medium text-gray-700 truncate">{title}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-0.5">
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-300"
          style={{ background: 'linear-gradient(to right, #476072, #5a7a8f)', width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressCard;

