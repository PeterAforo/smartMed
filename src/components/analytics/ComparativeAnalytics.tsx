import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart3,
  Calendar,
  Users,
  DollarSign,
  Activity,
  RefreshCw
} from 'lucide-react';
import { useAnalyticsDashboard } from '@/hooks/useAnalytics';
import { AnalyticsCharts } from './AnalyticsCharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface ComparisonMetric {
  title: string;
  currentValue: number;
  previousValue: number;
  format: 'number' | 'currency' | 'percentage' | 'time';
  icon: React.ComponentType<{ className?: string }>;
}

export function ComparativeAnalytics() {
  const [comparisonPeriod, setComparisonPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  
  const analytics = useAnalyticsDashboard();

  const comparisonMetrics = useMemo(() => {
    if (!analytics.appointments.data || !analytics.revenue.data || !analytics.patientFlow.data) {
      return [];
    }

    // Get current period data (most recent) with fallback properties
    const currentAppointments = analytics.appointments.data[analytics.appointments.data.length - 1] || {
      total_appointments: 0,
      completed_appointments: 0
    };
    const previousAppointments = analytics.appointments.data[analytics.appointments.data.length - 2] || {
      total_appointments: 0,
      completed_appointments: 0
    };
    
    const currentRevenue = analytics.revenue.data[analytics.revenue.data.length - 1] || {
      total_revenue: 0
    };
    const previousRevenue = analytics.revenue.data[analytics.revenue.data.length - 2] || {
      total_revenue: 0
    };
    
    const currentPatients = analytics.patientFlow.data[analytics.patientFlow.data.length - 1] || {
      new_patients: 0
    };
    const previousPatients = analytics.patientFlow.data[analytics.patientFlow.data.length - 2] || {
      new_patients: 0
    };
    
    const currentQueue = analytics.queuePerformance.data?.[analytics.queuePerformance.data.length - 1] || {
      avg_wait_time: 0
    };
    const previousQueue = analytics.queuePerformance.data?.[analytics.queuePerformance.data.length - 2] || {
      avg_wait_time: 0
    };

    return [
      {
        title: 'Total Appointments',
        currentValue: currentAppointments.total_appointments || 0,
        previousValue: previousAppointments.total_appointments || 0,
        format: 'number' as const,
        icon: Calendar
      },
      {
        title: 'Completed Appointments',
        currentValue: currentAppointments.completed_appointments || 0,
        previousValue: previousAppointments.completed_appointments || 0,
        format: 'number' as const,
        icon: Activity
      },
      {
        title: 'Total Revenue',
        currentValue: currentRevenue.total_revenue || 0,
        previousValue: previousRevenue.total_revenue || 0,
        format: 'currency' as const,
        icon: DollarSign
      },
      {
        title: 'New Patients',
        currentValue: currentPatients.new_patients || 0,
        previousValue: previousPatients.new_patients || 0,
        format: 'number' as const,
        icon: Users
      },
      {
        title: 'Average Wait Time',
        currentValue: Math.round((currentQueue.avg_wait_time || 0) / 60),
        previousValue: Math.round((previousQueue.avg_wait_time || 0) / 60),
        format: 'time' as const,
        icon: Activity
      }
    ];
  }, [analytics]);

  const formatValue = (value: number, format: ComparisonMetric['format']) => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'time':
        return `${value}min`;
      default:
        return value.toLocaleString();
    }
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, positive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      positive: change >= 0
    };
  };

  const getComparisonLabel = () => {
    switch (comparisonPeriod) {
      case 'month':
        return 'vs Previous Month';
      case 'quarter':
        return 'vs Previous Quarter';
      case 'year':
        return 'vs Previous Year';
    }
  };

  if (analytics.isLoading) {
    return (
      <Card className="healthcare-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Comparative Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="healthcare-card p-4 animate-pulse">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-20 bg-muted rounded" />
                    <div className="h-3 w-10 bg-muted rounded" />
                  </div>
                  <div className="h-6 w-16 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="healthcare-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Comparative Analytics
              </CardTitle>
              <CardDescription>
                Compare performance across different time periods {getComparisonLabel()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={comparisonPeriod} onValueChange={(value: any) => setComparisonPeriod(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="quarter">Quarterly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {comparisonMetrics.map((metric, index) => {
              const change = calculateChange(metric.currentValue, metric.previousValue);
              const Icon = metric.icon;
              
              return (
                <Card key={index} className="healthcare-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {metric.title}
                        </span>
                      </div>
                      <div className={`flex items-center text-xs font-medium ${
                        change.positive ? 'text-success' : 'text-destructive'
                      }`}>
                        {change.positive ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {change.value.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-xl font-bold text-foreground">
                        {formatValue(metric.currentValue, metric.format)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Previous: {formatValue(metric.previousValue, metric.format)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis Tabs */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle>Appointment Trends</CardTitle>
              <CardDescription>
                Detailed appointment analytics with period comparisons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsCharts 
                data={analytics.appointments.data || []} 
                type="appointments" 
                showComparison={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>
                Revenue performance with growth analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsCharts 
                data={analytics.revenue.data || []} 
                type="revenue" 
                showComparison={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients">
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle>Patient Flow Trends</CardTitle>
              <CardDescription>
                Patient acquisition and demographics analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsCharts 
                data={analytics.patientFlow.data || []} 
                type="patients" 
                showComparison={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle>Operational Performance</CardTitle>
              <CardDescription>
                Queue performance and efficiency metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsCharts 
                data={analytics.queuePerformance.data || []} 
                type="queue" 
                showComparison={true}
              />
              
              {/* Performance Summary */}
              <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success-foreground">
                      Best Performance
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Lowest average wait time: 18 minutes (March 15)
                  </p>
                </div>
                
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary-foreground">
                      Average Performance
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Overall wait time: 24 minutes across all days
                  </p>
                </div>
                
                <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium text-warning-foreground">
                      Improvement Needed
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Peak wait time: 42 minutes (Mondays 9-11 AM)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}