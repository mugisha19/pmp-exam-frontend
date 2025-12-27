/**
 * ProgressChart Component
 * Visual progress representation with bar chart
 */

import { cn } from "@/utils/cn";

export const ProgressChart = ({ className, data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm p-5", className)}>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Your Progress</h3>
        <div className="flex items-center justify-center h-32 text-sm text-gray-500">
          No progress data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 100);

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm p-5", className)}>
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Your Progress</h3>
      <div className="flex items-end justify-between gap-2 h-32">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;
          const isEven = index % 2 === 0;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center justify-end h-full">
                <div
                  className={cn(
                    "w-full rounded-t transition-all duration-300",
                    isEven 
                      ? "bg-gradient-to-t from-accent-secondary to-accent-primary" 
                      : "bg-gradient-to-t from-accent-primary/80 to-accent-primary"
                  )}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressChart;

