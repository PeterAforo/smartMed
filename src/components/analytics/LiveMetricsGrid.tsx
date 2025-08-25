import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Users,
  DollarSign,
  Activity,
  Bed,
  UserCheck,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveMetric {
  id: string;
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: {
    value: number;
    percentage: number;
    positive: boolean;
  };
  status?: 'normal' | 'warning' | 'critical' | 'success';
  icon: React.ComponentType<any>;
  color: string;
  unit?: string;
  description?: string;
  onClick?: () => void;
}

interface LiveMetricsGridProps {
  metrics: LiveMetric[];
  isLive: boolean;
  lastUpdated: Date;
  className?: string;
}

export function LiveMetricsGrid({ 
  metrics, 
  isLive, 
  lastUpdated, 
  className 
}: LiveMetricsGridProps) {
  const [animatingMetrics, setAnimatingMetrics] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Animate metrics that have changed
    const changedMetrics = metrics.filter(metric => 
      metric.change && Math.abs(metric.change.value) > 0
    );
    
    if (changedMetrics.length > 0) {
      const newAnimatingMetrics = new Set(changedMetrics.map(m => m.id));
      setAnimatingMetrics(newAnimatingMetrics);
      
      // Remove animation after 2 seconds
      setTimeout(() => {
        setAnimatingMetrics(new Set());
      }, 2000);
    }
  }, [metrics]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'critical': return 'text-destructive border-destructive/20 bg-destructive/5';
      case 'warning': return 'text-warning border-warning/20 bg-warning/5';
      case 'success': return 'text-success border-success/20 bg-success/5';
      default: return 'text-foreground border-border bg-card';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle2 className="h-4 w-4" />;
      default: return null;
    }
  };

  const formatValue = (value: string | number, unit?: string) => {
    if (typeof value === 'number') {
      return `${value.toLocaleString()}${unit || ''}`;
    }
    return `${value}${unit || ''}`;
  };

  return (
    <div className={cn('grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6', className)}>
      {metrics.map((metric) => {
        const IconComponent = metric.icon;
        const isAnimating = animatingMetrics.has(metric.id);
        const statusColor = getStatusColor(metric.status);
        const StatusIcon = getStatusIcon(metric.status);

        return (
          <Card
            key={metric.id}
            className={cn(
              'healthcare-card relative overflow-hidden transition-all duration-300 hover:shadow-lg',
              statusColor,
              isAnimating && 'animate-pulse ring-2 ring-primary/20',
              metric.onClick && 'cursor-pointer hover:scale-105',
              !isLive && 'opacity-75'
            )}
            onClick={metric.onClick}
          >
            {/* Live indicator */}
            {isLive && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              </div>
            )}

            {/* Status indicator */}
            {StatusIcon && (
              <div className="absolute top-2 left-2">
                {StatusIcon}
              </div>
            )}

            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={cn('p-2 rounded-lg', metric.color)}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                
                {metric.change && (
                  <div className={cn(
                    'flex items-center gap-1 text-xs px-2 py-1 rounded-full',
                    metric.change.positive 
                      ? 'bg-success/10 text-success' 
                      : 'bg-destructive/10 text-destructive'
                  )}>
                    {metric.change.positive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(metric.change.percentage).toFixed(1)}%
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground leading-tight">
                  {metric.title}
                </h3>
                
                <div className="flex items-baseline gap-2">
                  <span className={cn(
                    'text-2xl font-bold transition-all duration-500',
                    isAnimating && 'text-primary scale-110'
                  )}>
                    {formatValue(metric.value, metric.unit)}
                  </span>
                  
                  {metric.previousValue && (
                    <span className="text-xs text-muted-foreground">
                      was {formatValue(metric.previousValue, metric.unit)}
                    </span>
                  )}
                </div>

                {metric.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.description}
                  </p>
                )}

                {metric.change && (
                  <div className="text-xs text-muted-foreground">
                    {metric.change.positive ? '+' : ''}{metric.change.value.toLocaleString()} 
                    {metric.unit || ''} from last period
                  </div>
                )}
              </div>
            </CardContent>

            {/* Hover effect overlay */}
            {metric.onClick && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            )}
          </Card>
        );
      })}

      {/* Add metric placeholders if not enough metrics */}
      {Array.from({ length: Math.max(0, 6 - metrics.length) }).map((_, index) => (
        <Card key={`placeholder-${index}`} className="healthcare-card opacity-50 border-dashed">
          <CardContent className="p-4 flex items-center justify-center h-full">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Add Metric</p>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Live status indicator */}
      <div className="col-span-full">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          {isLive ? (
            <>
              <Zap className="h-3 w-3 text-success" />
              Live updates active - Last refresh: {lastUpdated.toLocaleTimeString()}
            </>
          ) : (
            <>
              <Clock className="h-3 w-3" />
              Static view - Click refresh to update
            </>
          )}
        </div>
      </div>
    </div>
  );
}