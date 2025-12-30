/**
 * LineChart Component
 * Real line chart using recharts
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function LineChartComponent({
  title,
  data = [],
  dataKey = "value",
  xAxisKey = "name",
  color = "#3b82f6",
  height = 280,
  showGrid = true,
  showLegend = false,
}) {
  // Generate sample data if no data provided
  const chartData =
    data.length > 0
      ? data
      : [
          { name: "Mon", value: 12 },
          { name: "Tue", value: 19 },
          { name: "Wed", value: 15 },
          { name: "Thu", value: 25 },
          { name: "Fri", value: 22 },
          { name: "Sat", value: 30 },
          { name: "Sun", value: 28 },
        ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        <XAxis
          dataKey={xAxisKey}
          tick={{ fill: "#6b7280", fontSize: 12 }}
          axisLine={{ stroke: "#d1d5db" }}
          tickLine={{ stroke: "#d1d5db" }}
        />
        <YAxis
          tick={{ fill: "#6b7280", fontSize: 12 }}
          axisLine={{ stroke: "#d1d5db" }}
          tickLine={{ stroke: "#d1d5db" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        />
        {showLegend && <Legend />}
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default LineChartComponent;
