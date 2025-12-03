/**
 * ChartPlaceholder Component
 * Placeholder component for charts before integration with recharts
 * TODO: Integrate recharts library for actual charts
 */

import { BarChart3, LineChart, PieChart, TrendingUp } from "lucide-react";

const chartIcons = {
  line: LineChart,
  bar: BarChart3,
  pie: PieChart,
  area: TrendingUp,
};

export function ChartPlaceholder({
  title,
  type = "bar",
  height = "h-64",
  showMockData = true,
}) {
  const Icon = chartIcons[type] || BarChart3;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div
        className={`${height} flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300`}
      >
        {showMockData ? (
          <MockChart type={type} />
        ) : (
          <>
            <Icon className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-500 text-sm">Coming soon</p>
          </>
        )}
      </div>
    </div>
  );
}

// Mock visualizations for placeholder charts
function MockChart({ type }) {
  switch (type) {
    case "line":
      return <MockLineChart />;
    case "bar":
      return <MockBarChart />;
    case "pie":
      return <MockPieChart />;
    case "area":
      return <MockAreaChart />;
    default:
      return <MockBarChart />;
  }
}

function MockLineChart() {
  return (
    <div className="w-full h-full p-4 flex flex-col justify-end">
      <svg viewBox="0 0 400 150" className="w-full h-32">
        {/* Grid lines */}
        <line
          x1="40"
          y1="20"
          x2="40"
          y2="130"
          stroke="#9ca3af"
          strokeWidth="1"
        />
        <line
          x1="40"
          y1="130"
          x2="380"
          y2="130"
          stroke="#9ca3af"
          strokeWidth="1"
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="40"
            y1={130 - i * 27.5}
            x2="380"
            y2={130 - i * 27.5}
            stroke="#d1d5db"
            strokeWidth="1"
            strokeDasharray="4"
          />
        ))}
        {/* Line path */}
        <path
          d="M 50 100 L 100 80 L 150 90 L 200 50 L 250 60 L 300 30 L 350 45 L 370 35"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        {/* Dots */}
        {[
          [50, 100],
          [100, 80],
          [150, 90],
          [200, 50],
          [250, 60],
          [300, 30],
          [350, 45],
          [370, 35],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="#3b82f6" />
        ))}
        {/* Area fill */}
        <path
          d="M 50 100 L 100 80 L 150 90 L 200 50 L 250 60 L 300 30 L 350 45 L 370 35 L 370 130 L 50 130 Z"
          fill="url(#lineGradient)"
          opacity="0.3"
        />
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <p className="text-center text-gray-500 text-xs mt-2">
        Sample visualization
      </p>
    </div>
  );
}

function MockBarChart() {
  const bars = [65, 45, 80, 55, 90, 70, 85];
  const maxHeight = 100;

  return (
    <div className="w-full h-full p-4 flex flex-col justify-end">
      <div className="flex items-end justify-center gap-3 h-32">
        {bars.map((height, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="w-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
              style={{ height: `${(height / maxHeight) * 100}%` }}
            />
            <span className="text-gray-500 text-xs">
              {["M", "T", "W", "T", "F", "S", "S"][i]}
            </span>
          </div>
        ))}
      </div>
      <p className="text-center text-gray-500 text-xs mt-2">
        Sample visualization
      </p>
    </div>
  );
}

function MockPieChart() {
  return (
    <div className="w-full h-full p-4 flex flex-col items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        {/* Pie segments */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          stroke="#3b82f6"
          strokeWidth="20"
          strokeDasharray="75 175"
          strokeDashoffset="0"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          stroke="#10b981"
          strokeWidth="20"
          strokeDasharray="50 200"
          strokeDashoffset="-75"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          stroke="#f59e0b"
          strokeWidth="20"
          strokeDasharray="40 210"
          strokeDashoffset="-125"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          stroke="#ef4444"
          strokeWidth="20"
          strokeDasharray="35 215"
          strokeDashoffset="-165"
        />
        <circle cx="50" cy="50" r="25" fill="#f8fafc" />
      </svg>
      <div className="flex flex-wrap justify-center gap-3 mt-3">
        {[
          { color: "bg-blue-500", label: "Excellent" },
          { color: "bg-emerald-500", label: "Good" },
          { color: "bg-amber-500", label: "Average" },
          { color: "bg-red-500", label: "Poor" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-gray-500 text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockAreaChart() {
  return (
    <div className="w-full h-full p-4 flex flex-col justify-end">
      <svg viewBox="0 0 400 150" className="w-full h-32">
        {/* Grid lines */}
        <line
          x1="40"
          y1="20"
          x2="40"
          y2="130"
          stroke="#475569"
          strokeWidth="1"
        />
        <line
          x1="40"
          y1="130"
          x2="380"
          y2="130"
          stroke="#475569"
          strokeWidth="1"
        />
        {/* Horizontal bar chart */}
        {[
          { label: "Process", value: 85, color: "#3b82f6" },
          { label: "People", value: 72, color: "#10b981" },
          { label: "Env", value: 68, color: "#f59e0b" },
          { label: "BA", value: 58, color: "#8b5cf6" },
        ].map((item, i) => (
          <g key={i}>
            <text
              x="35"
              y={35 + i * 25}
              fill="#6b7280"
              fontSize="10"
              textAnchor="end"
            >
              {item.label}
            </text>
            <rect
              x="45"
              y={25 + i * 25}
              width={(item.value / 100) * 300}
              height="16"
              fill={item.color}
              rx="2"
            />
            <text
              x={55 + (item.value / 100) * 300}
              y={37 + i * 25}
              fill="#374151"
              fontSize="10"
            >
              {item.value}%
            </text>
          </g>
        ))}
      </svg>
      <p className="text-center text-gray-500 text-xs mt-2">
        Sample visualization
      </p>
    </div>
  );
}

export default ChartPlaceholder;
