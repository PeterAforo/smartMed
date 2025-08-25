import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';

interface MiniChartProps {
  data: any[];
  dataKey: string;
  type?: 'area' | 'bar' | 'line';
  color?: string;
  height?: number;
  className?: string;
}

export function MiniChart({ 
  data, 
  dataKey, 
  type = 'area', 
  color = 'hsl(var(--primary))', 
  height = 60,
  className 
}: MiniChartProps) {
  const chartData = useMemo(() => {
    return data.slice(-7); // Show last 7 data points for mini chart
  }, [data]);

  if (!chartData.length) {
    return (
      <div 
        className={`bg-muted/30 rounded flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <span className="text-xs text-muted-foreground">No data</span>
      </div>
    );
  }

  const commonProps = {
    width: '100%',
    height,
    data: chartData,
  };

  return (
    <div className={className}>
      <ResponsiveContainer {...commonProps}>
        {type === 'area' ? (
          <AreaChart data={chartData}>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={color}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        ) : type === 'bar' ? (
          <BarChart data={chartData}>
            <Bar
              dataKey={dataKey}
              fill={color}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        ) : (
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}