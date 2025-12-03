/**
 * AreaChart Component
 * Real area chart using recharts (used for domain performance)
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
  Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

export function AreaChartComponent({
  title,
  data = [],
  dataKey = "value",
  xAxisKey = "name",
  height = 280,
  showGrid = true,
  showLegend = false,
  horizontal = true,
}) {
  // Generate sample data if no data provided (domain performance)
  const chartData =
    data.length > 0
      ? data
      : [
          { name: "Process", value: 85 },
          { name: "People", value: 72 },
          { name: "Business Environment", value: 68 },
          { name: "Business Analysis", value: 58 },
        ];

  if (horizontal) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                horizontal={true}
                vertical={false}
              />
            )}
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={{ stroke: "#d1d5db" }}
              tickLine={{ stroke: "#d1d5db" }}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey={xAxisKey}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={{ stroke: "#d1d5db" }}
              tickLine={{ stroke: "#d1d5db" }}
              width={75}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value) => [`${value}%`, "Score"]}
            />
            {showLegend && <Legend />}
            <Bar dataKey={dataKey} radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
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
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            formatter={(value) => [`${value}%`, "Score"]}
          />
          {showLegend && <Legend />}
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AreaChartComponent;
