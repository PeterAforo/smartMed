import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  DollarSign,
  Activity,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { MiniChart } from '@/components/analytics/MiniChart';
import { useAnalyticsDashboard } from '@/hooks/useAnalytics';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';

interface QuickMetricProps {
  title: string;
  value: string | number;
  change: { value: number; positive: boolean };
  data: any[];
  dataKey: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

function QuickMetric({ title, value, change, data, dataKey, icon: Icon, onClick }: QuickMetricProps) {
  return (
    <Card className="healthcare-card cursor-pointer hover:shadow-hover transition-all" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
          </div>
          <div className={`flex items-center text-xs font-medium ${
            change.positive ? 'text-success' : 'text-destructive'
          }`}>
            {change.positive ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            )}
            {Math.abs(change.value)}%
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-xl font-bold text-foreground">{value}</p>
          <MiniChart 
            data={data} 
            dataKey={dataKey} 
            type="area" 
            height={40}
            color={change.positive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardAnalyticsSection() {
  const navigate = useNavigate();
  const { 
    appointments, 
    revenue, 
    patientFlow, 
    queuePerformance,
    realtime,
    isLoading 
  } = useAnalyticsDashboard();

  // Use real-time data when available, fallback to historical data
  const realtimeStats = realtime?.data || {
    appointments_today: 0,
    revenue_today: 0,
    patients_today: 0,
    queue_length: 0,
    avg_wait_time: 0,
    staff_online: 0,
    new_patients_today: 0,
    completed_appointments: 0
  };
  const safeAppointments = appointments || { data: [] };
  const safeRevenue = revenue || { data: [] };
  const safePatientFlow = patientFlow || { data: [] };
  const safeQueuePerformance = queuePerformance || { data: [] };

  const quickMetrics = [
    {
      title: 'Today\'s Appointments',
      value: realtimeStats.completed_appointments || safeAppointments.data?.[0]?.completed_appointments || 0,
      change: { value: 8.2, positive: true },
      data: safeAppointments.data || [],
      dataKey: 'completed_appointments',
      icon: Calendar,
      onClick: () => navigate('/appointments')
    },
    {
      title: 'Revenue Today',
      value: formatCurrency(realtimeStats.revenue_today || safeRevenue.data?.[0]?.paid_revenue || 0),
      change: { value: 12.5, positive: true },
      data: safeRevenue.data || [],
      dataKey: 'total_revenue',
      icon: DollarSign,
      onClick: () => navigate('/reports?tab=revenue')
    },
    {
      title: 'New Patients Today',
      value: realtimeStats.new_patients_today || safePatientFlow.data?.[0]?.new_patients || 0,
      change: { value: 5.1, positive: true },
      data: safePatientFlow.data || [],
      dataKey: 'new_patients',  
      icon: Users,
      onClick: () => navigate('/patients')
    },
    {
      title: 'Current Queue',
      value: `${realtimeStats.queue_length || 0} waiting`,
      change: { value: Math.round((realtimeStats.avg_wait_time || safeQueuePerformance.data?.[0]?.avg_wait_time || 0)), positive: false },
      data: safeQueuePerformance.data || [],
      dataKey: 'avg_wait_time',
      icon: Activity,
      onClick: () => navigate('/reports?tab=queue')
    }
  ];

  if (isLoading) {
    return (
      <Card className="healthcare-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Analytics Overview
              </CardTitle>
              <CardDescription>Real-time performance insights</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="healthcare-card p-4 animate-pulse">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-20 bg-muted rounded" />
                    <div className="h-3 w-10 bg-muted rounded" />
                  </div>
                  <div className="h-6 w-16 bg-muted rounded" />
                  <div className="h-10 w-full bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="healthcare-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Analytics Overview
            </CardTitle>
            <CardDescription>Real-time performance insights and trends</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2"
          >
            View Details
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {quickMetrics.map((metric, index) => (
            <QuickMetric key={index} {...metric} />
          ))}
        </div>

        {/* Quick Insights */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Today's Insights</h3>
            <Badge variant="secondary" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Trending Up
            </Badge>
          </div>
          
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-sm font-medium text-success-foreground">Live Updates</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {realtimeStats.staff_online || 0} staff online • {realtimeStats.appointments_today || 0} total appointments today
              </p>
            </div>
            
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm font-medium text-primary-foreground">Performance</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Avg wait time: {Math.round(realtimeStats.avg_wait_time || 0)}min • {realtimeStats.patients_today || 0} patients seen today
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}