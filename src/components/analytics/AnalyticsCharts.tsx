import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartLegend, appointmentChartConfig, revenueChartConfig, patientChartConfig } from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import type { 
  AppointmentAnalytics, 
  RevenueAnalytics, 
  PatientFlowAnalytics, 
  AppointmentTypeDistribution 
} from "@/hooks/useAnalytics";

// Appointment trends chart
interface AppointmentTrendsChartProps {
  data: AppointmentAnalytics[];
  isLoading?: boolean;
}

export function AppointmentTrendsChart({ data, isLoading }: AppointmentTrendsChartProps) {
  const chartData = data.map(item => ({
    date: format(new Date(item.date), 'MMM dd'),
    total: item.total_appointments,
    completed: item.completed_appointments,
    cancelled: item.cancelled_appointments,
    noShow: item.no_show_appointments,
  }));

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={appointmentChartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="date" 
                className="text-muted-foreground text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-muted-foreground text-xs"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<ChartTooltip config={appointmentChartConfig} />} />
              <Legend content={<ChartLegend config={appointmentChartConfig} />} />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stackId="1" 
                stroke={`hsl(${appointmentChartConfig.completed.color})`}
                fill={`hsl(${appointmentChartConfig.completed.color})`}
                fillOpacity={0.8}
              />
              <Area 
                type="monotone" 
                dataKey="cancelled" 
                stackId="1" 
                stroke={`hsl(${appointmentChartConfig.cancelled.color})`}
                fill={`hsl(${appointmentChartConfig.cancelled.color})`}
                fillOpacity={0.8}
              />
              <Area 
                type="monotone" 
                dataKey="noShow" 
                stackId="1" 
                stroke={`hsl(${appointmentChartConfig.noShow.color})`}
                fill={`hsl(${appointmentChartConfig.noShow.color})`}
                fillOpacity={0.8}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Revenue trends chart
interface RevenueTrendsChartProps {
  data: RevenueAnalytics[];
  isLoading?: boolean;
}

export function RevenueTrendsChart({ data, isLoading }: RevenueTrendsChartProps) {
  const chartData = data.map(item => ({
    month: format(new Date(item.month), 'MMM yy'),
    revenue: Number(item.total_revenue),
    paid: Number(item.paid_revenue),
    pending: Number(item.pending_revenue),
  }));

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={revenueChartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="month" 
                className="text-muted-foreground text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-muted-foreground text-xs"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                content={<ChartTooltip config={revenueChartConfig} />}
                formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
              />
              <Legend content={<ChartLegend config={revenueChartConfig} />} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke={`hsl(${revenueChartConfig.revenue.color})`}
                strokeWidth={3}
                dot={{ fill: `hsl(${revenueChartConfig.revenue.color})`, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Patient flow chart
interface PatientFlowChartProps {
  data: PatientFlowAnalytics[];
  isLoading?: boolean;
}

export function PatientFlowChart({ data, isLoading }: PatientFlowChartProps) {
  const chartData = data.map(item => ({
    month: format(new Date(item.month), 'MMM yy'),
    new: item.new_patients,
    active: item.active_patients,
    pediatric: item.pediatric_patients,
    senior: item.senior_patients,
  }));

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={patientChartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="month" 
                className="text-muted-foreground text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-muted-foreground text-xs"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<ChartTooltip config={patientChartConfig} />} />
              <Legend content={<ChartLegend config={patientChartConfig} />} />
              <Bar 
                dataKey="new" 
                fill={`hsl(${patientChartConfig.new.color})`}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Appointment type distribution pie chart
interface AppointmentTypeChartProps {
  data: AppointmentTypeDistribution[];
  isLoading?: boolean;
}

export function AppointmentTypeChart({ data, isLoading }: AppointmentTypeChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.appointment_type,
    value: item.count,
    color: `hsl(${214 + (index * 30)} 88% ${50 - (index * 5)}%)`, // Generate colors
  }));

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Types</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [value, name]}
                labelFormatter={() => ''}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}