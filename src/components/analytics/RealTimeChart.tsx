import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { Activity, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealTimeChartProps {
  title: string;
  data: any[];
  dataKey: string;
  type?: 'line' | 'area' | 'bar';
  color?: string;
  isLive?: boolean;
  showAnimation?: boolean;
  height?: number;
  icon?: React.ComponentType<any>;
  formatter?: (value: any) => string;
  showTrend?: boolean;
  maxDataPoints?: number;
  className?: string;
}

export function RealTimeChart({
  title,
  data,
  dataKey,
  type = 'line',
  color = 'hsl(var(--primary))',
  isLive = false,
  showAnimation = true,
  height = 250,
  icon: Icon,
  formatter,
  showTrend = true,
  maxDataPoints = 20,
  className
}: RealTimeChartProps) {
  const [animationKey, setAnimationKey] = useState(0);
  const [isNewData, setIsNewData] = useState(false);

  // Limit data points for performance
  const chartData = useMemo(() => {
    const limitedData = data.slice(-maxDataPoints);
    return limitedData.map((item, index) => ({
      ...item,
      index: index,
      timestamp: item.timestamp || new Date().toISOString()
    }));
  }, [data, maxDataPoints]);

  // Calculate trend
  const trend = useMemo(() => {
    if (!showTrend || chartData.length < 2) return null;
    
    const current = chartData[chartData.length - 1]?.[dataKey] || 0;
    const previous = chartData[chartData.length - 2]?.[dataKey] || 0;
    
    const change = current - previous;
    const percentage = previous !== 0 ? (change / previous) * 100 : 0;
    
    return {
      value: change,
      percentage,
      positive: change >= 0
    };
  }, [chartData, dataKey, showTrend]);

  // Trigger animation when new data arrives
  useEffect(() => {
    if (isLive && data.length > 0) {
      setIsNewData(true);
      setAnimationKey(prev => prev + 1);
      
      setTimeout(() => setIsNewData(false), 1000);
    }
  }, [data, isLive]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const formattedValue = formatter ? formatter(value) : value.toLocaleString();
      
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">
            {typeof label === 'string' ? label : `Point ${label + 1}`}
          </p>
          <p className="text-lg font-bold" style={{ color }}>
            {formattedValue}
          </p>
        </div>
      );
    }
    return null;
  };

  // Get current value for display
  const currentValue = chartData[chartData.length - 1]?.[dataKey] || 0;
  const formattedCurrentValue = formatter ? formatter(currentValue) : currentValue.toLocaleString();

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 5, left: 5, bottom: 5 }
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`gradient-${animationKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis 
              dataKey="index" 
              tick={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={`url(#gradient-${animationKey})`}
              strokeWidth={2}
              dot={false}
              animationDuration={showAnimation ? 500 : 0}
              animationBegin={0}
            />
          </AreaChart>
        );
        
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis 
              dataKey="index" 
              tick={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey={dataKey}
              fill={color}
              radius={[2, 2, 0, 0]}
              animationDuration={showAnimation ? 500 : 0}
            />
          </BarChart>
        );
        
      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis 
              dataKey="index" 
              tick={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              dot={false}
              activeDot={{ 
                r: 4, 
                stroke: color, 
                strokeWidth: 2,
                fill: 'white'
              }}
              animationDuration={showAnimation ? 500 : 0}
            />
          </LineChart>
        );
    }
  };

  return (
    <Card className={cn(
      'healthcare-card transition-all duration-300',
      isNewData && 'ring-2 ring-primary/20',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-primary" />}
            <CardTitle className="text-lg">{title}</CardTitle>
            {isLive && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                Live
              </Badge>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">{formattedCurrentValue}</div>
            {trend && showTrend && (
              <div className={cn(
                'flex items-center gap-1 text-sm',
                trend.positive ? 'text-success' : 'text-destructive'
              )}>
                {trend.positive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend.percentage).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div style={{ height }} className={cn(
          'transition-all duration-300',
          isNewData && 'scale-[1.02]'
        )}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
        
        {isLive && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-3">
            <Zap className="h-3 w-3 text-success" />
            Real-time updates • {chartData.length} data points
          </div>
        )}
      </CardContent>
    </Card>
  );
}