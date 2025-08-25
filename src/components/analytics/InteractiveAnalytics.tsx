import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarDays,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  ChevronRight,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { DateRangePicker } from '@/components/analytics/DateRangePicker';
import { AnalyticsMetricCard } from '@/components/analytics/AnalyticsMetricCard';
import { 
  AppointmentTrendsChart,
  RevenueTrendsChart,
  PatientFlowChart,
  AppointmentTypeChart
} from '@/components/analytics/AnalyticsCharts';
import { useAnalyticsDashboard } from '@/hooks/useAnalytics';
import { addDays, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface DateRange {
  from: Date;
  to: Date;
}

export function InteractiveAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { 
    appointments, 
    revenue, 
    patientFlow, 
    appointmentTypes,
    isLoading, 
    isError 
  } = useAnalyticsDashboard();

  const quickDateRanges = [
    {
      label: 'Last 7 Days',
      range: { from: subDays(new Date(), 7), to: new Date() }
    },
    {
      label: 'Last 30 Days', 
      range: { from: subDays(new Date(), 30), to: new Date() }
    },
    {
      label: 'This Month',
      range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) }
    },
    {
      label: 'Last 90 Days',
      range: { from: subDays(new Date(), 90), to: new Date() }
    }
  ];

  const analyticsMetrics = useMemo(() => {
    if (!appointments?.data) return [];

    const totalAppointments = appointments.data?.reduce((sum, item) => 
      sum + (item.completed_appointments || 0) + (item.cancelled_appointments || 0) + (item.no_show_appointments || 0), 0) || 0;
    
    const totalRevenue = revenue.data?.reduce((sum, item) => sum + (item.total_revenue || 0), 0) || 0;
    
    const totalPatients = patientFlow.data?.reduce((sum, item) => sum + (item.new_patients || 0), 0) || 0;

    return [
      {
        title: 'Total Appointments',
        value: totalAppointments.toLocaleString(),
        description: 'All appointments in period',
        icon: CalendarDays,
        trend: { value: 8.2, positive: true, label: 'vs previous period' },
        onClick: () => console.log('Navigate to appointments detail')
      },
      {
        title: 'Revenue Generated',
        value: `$${totalRevenue.toLocaleString()}`,
        description: 'Total revenue earned',
        icon: DollarSign,
        trend: { value: 12.5, positive: true, label: 'vs previous period' },
        onClick: () => console.log('Navigate to revenue detail')
      },
      {
        title: 'New Patients',
        value: totalPatients.toLocaleString(),
        description: 'First-time patients',
        icon: Users,
        trend: { value: 5.1, positive: true, label: 'vs previous period' },
        onClick: () => console.log('Navigate to patients detail')
      },
      {
        title: 'Avg. Daily Activity',
        value: Math.round(totalAppointments / 30).toString(),
        description: 'Daily appointment average',
        icon: Activity,
        trend: { value: 2.3, positive: false, label: 'vs previous period' },
        onClick: () => console.log('Navigate to activity detail')
      }
    ];
  }, [appointments?.data, revenue?.data, patientFlow?.data]);

  if (isError) {
    return (
      <Card className="healthcare-card">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Failed to load analytics data</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Interactive insights and performance metrics</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex flex-wrap gap-1">
            {quickDateRanges.map((range) => (
              <Button
                key={range.label}
                variant="outline"
                size="sm"
                onClick={() => setDateRange(range.range)}
                className="text-xs"
              >
                {range.label}
              </Button>
            ))}
          </div>
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="healthcare-card p-6 animate-pulse">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-muted rounded" />
                    <div className="h-6 w-16 bg-muted rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          analyticsMetrics.map((metric, index) => (
            <AnalyticsMetricCard
              key={index}
              {...metric}
            />
          ))
        )}
      </div>

      {/* Interactive Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span className="hidden sm:inline">Trends</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Revenue</span>
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Patients</span>
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Types</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Appointment Trends
              </CardTitle>
              <CardDescription>
                Track appointment completion, cancellations, and no-shows over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentTrendsChart 
                data={appointments?.data || []} 
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-success" />
                Revenue Trends
              </CardTitle>
              <CardDescription>
                Monitor revenue growth and payment status across months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueTrendsChart 
                data={revenue?.data || []} 
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary-foreground" />
                Patient Flow
              </CardTitle>
              <CardDescription>
                Analyze patient demographics and flow patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientFlowChart 
                data={patientFlow?.data || []} 
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-warning-foreground" />
                Appointment Types
              </CardTitle>
              <CardDescription>
                Distribution of different appointment types and their completion rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentTypeChart 
                data={appointmentTypes?.data || []} 
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}