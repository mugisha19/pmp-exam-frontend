import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export const RadarChartComponent = ({ 
  data, 
  dataKey = 'value', 
  nameKey = 'name',
  height = 400,
  color = '#3b82f6'
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis 
          dataKey={nameKey} 
          tick={{ fill: '#374151', fontSize: 13, fontWeight: 600 }}
          tickLine={false}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickCount={6}
        />
        <Radar 
          name="Mastery" 
          dataKey={dataKey} 
          stroke={color} 
          fill={color} 
          fillOpacity={0.5} 
          strokeWidth={2}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
          formatter={(value) => [`${value}%`, 'Mastery']}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};
