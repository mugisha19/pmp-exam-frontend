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
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#6366f1", // Indigo
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
  embedded = false,
  valueSuffix = "%",
}) {
  if (!data || data.length === 0) {
    const Wrapper = embedded ? "div" : ({ children }) => (
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">{children}</div>
    );
    return (
      <Wrapper>
        {title && <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>}
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-gray-500 text-sm">No data available</p>
        </div>
      </Wrapper>
    );
  }

  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius: ir, outerRadius: or, percent }) => {
    if (percent < 0.05) return null; // Don't render labels for slices < 5%
    const radius = ir + (or - ir) * 1.3;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#374151" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={12} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const content = (
    <>
      {title && <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey={dataKey}
            nameKey={nameKey}
            label={renderCustomLabel}
            labelLine={true}
          >
            {data.map((entry, index) => (
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
            formatter={(value, name) => [`${typeof value === 'number' ? value.toFixed(1) : value}${valueSuffix}`, name]}
          />
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </>
  );

  if (embedded) return <div>{content}</div>;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      {content}
    </div>
  );
}

export default PieChartComponent;
