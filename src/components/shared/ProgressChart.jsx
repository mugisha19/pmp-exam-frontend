/**
 * ProgressChart Component
 * Visual progress representation with bar chart
 */

import { cn } from "@/utils/cn";

export const ProgressChart = ({ className, data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className={cn("bg-gradient-to-br from-white via-gray-50/30 to-white rounded-2xl border-2 border-gray-200 shadow-xl shadow-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300", className)}>
        <h3 className="text-base font-bold text-gray-900 mb-5 uppercase tracking-wide">Your Progress</h3>
        <div className="flex items-center justify-center h-40 text-sm text-gray-600 font-medium bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border-2 border-dashed border-gray-200">
          No progress data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 100);

  return (
    <div className={cn("bg-gradient-to-br from-white via-gray-50/30 to-white rounded-2xl border-2 border-gray-200 shadow-xl shadow-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300", className)}>
      <h3 className="text-base font-bold text-gray-900 mb-5 uppercase tracking-wide">Your Progress</h3>
      <div className="flex items-end justify-between gap-3 h-40">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;
          const isEven = index % 2 === 0;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-3">
              <div className="w-full flex flex-col items-center justify-end h-full">
                <div
                  className={cn(
                    "w-full rounded-t-xl transition-all duration-500 shadow-lg hover:shadow-xl",
                    isEven 
                      ? "bg-gradient-to-t from-violet-500 via-purple-500 to-purple-600" 
                      : "bg-gradient-to-t from-purple-500/90 via-purple-500 to-violet-600"
                  )}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 font-bold">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressChart;

