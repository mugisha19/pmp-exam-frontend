/**
 * BarChart Component
 * Real bar chart using recharts
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function BarChartComponent({
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
          { name: "Mon", value: 65 },
          { name: "Tue", value: 45 },
          { name: "Wed", value: 80 },
          { name: "Thu", value: 55 },
          { name: "Fri", value: 90 },
          { name: "Sat", value: 70 },
          { name: "Sun", value: 85 },
        ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
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
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default BarChartComponent;
