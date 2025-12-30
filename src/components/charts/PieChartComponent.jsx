/**
 * PieChart Component
 * Real pie chart using recharts
 */

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#476072", // Primary
  "#5a7a8f", // Lighter
  "#3a4d5c", // Darker
  "#6b8a9f", // Light variant
  "#8ba3b5", // Lighter variant
  "#a5b9c7", // Lightest variant
];

export function PieChartComponent({
  title,
  data = [],
  dataKey = "value",
  nameKey = "name",
  height = 280,
  showLegend = true,
  innerRadius = 60,
  outerRadius = 100,
}) {
  // Generate sample data if no data provided
  const chartData =
    data.length > 0
      ? data
      : [
          { name: "Excellent (90-100%)", value: 30 },
          { name: "Good (70-89%)", value: 40 },
          { name: "Average (50-69%)", value: 20 },
          { name: "Poor (<50%)", value: 10 },
        ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey={dataKey}
            nameKey={nameKey}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            formatter={(value, name) => [value, name]}
          />
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 20 }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PieChartComponent;
