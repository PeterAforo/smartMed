import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsMetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    positive: boolean;
    label: string;
  };
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  onClick?: () => void;
  className?: string;
}

export function AnalyticsMetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  badge,
  onClick,
  className
}: AnalyticsMetricCardProps) {
  const CardWrapper = onClick ? Button : 'div';
  const cardProps = onClick ? {
    variant: 'ghost' as const,
    onClick,
    className: cn(
      "h-auto p-0 hover:bg-card-hover transition-colors group",
      className
    )
  } : { className };

  return (
    <CardWrapper {...cardProps}>
      <Card className="healthcare-card hover:shadow-hover transition-all duration-300 w-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  {badge && (
                    <Badge variant={badge.variant || 'secondary'} className="text-xs">
                      {badge.text}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
                {trend && (
                  <div className={cn(
                    "flex items-center text-xs font-medium",
                    trend.positive ? "text-success" : "text-destructive"
                  )}>
                    {trend.positive ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {trend.value}% {trend.label}
                  </div>
                )}
              </div>
            </div>
            {onClick && (
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </div>
        </CardContent>
      </Card>
    </CardWrapper>
  );
}