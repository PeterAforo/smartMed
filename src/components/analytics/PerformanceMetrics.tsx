import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Clock, 
  Users, 
  Calendar, 
  Star, 
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  UserCheck,
  Award
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PerformanceMetricsProps {
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ dateRange }) => {
  const { profile, currentBranch } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');

  // Mock performance data
  const { data: performanceData, isLoading } = useQuery({
    queryKey: ['performance-metrics', selectedDepartment, selectedPeriod, currentBranch?.id],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        kpis: {
          patientSatisfaction: 4.7,
          avgWaitTime: 18,
          appointmentUtilization: 87,
          staffEfficiency: 92,
          revenuePerPatient: 285,
          noShowRate: 8.2
        },
        departments: [
          {
            name: 'Emergency',
            metrics: {
              patientVolume: 450,
              avgWaitTime: 12,
              satisfaction: 4.6,
              efficiency: 89,
              trend: 'up'
            }
          },
          {
            name: 'Cardiology',
            metrics: {
              patientVolume: 320,
              avgWaitTime: 25,
              satisfaction: 4.8,
              efficiency: 95,
              trend: 'up'
            }
          },
          {
            name: 'Pediatrics',
            metrics: {
              patientVolume: 280,
              avgWaitTime: 22,
              satisfaction: 4.9,
              efficiency: 88,
              trend: 'stable'
            }
          },
          {
            name: 'Orthopedics',
            metrics: {
              patientVolume: 195,
              avgWaitTime: 35,
              satisfaction: 4.5,
              efficiency: 82,
              trend: 'down'
            }
          }
        ],
        staffPerformance: [
          {
            name: 'Dr. Sarah Wilson',
            role: 'Cardiologist',
            patientsToday: 18,
            efficiency: 96,
            satisfaction: 4.9,
            avgConsultTime: 22,
            status: 'excellent'
          },
          {
            name: 'Dr. Michael Chen',
            role: 'Emergency Physician',
            patientsToday: 25,
            efficiency: 88,
            satisfaction: 4.7,
            avgConsultTime: 15,
            status: 'good'
          },
          {
            name: 'Dr. Emily Rodriguez',
            role: 'Pediatrician',
            patientsToday: 16,
            efficiency: 92,
            satisfaction: 4.8,
            avgConsultTime: 28,
            status: 'excellent'
          },
          {
            name: 'Dr. David Thompson',
            role: 'Orthopedist',
            patientsToday: 12,
            efficiency: 79,
            satisfaction: 4.4,
            avgConsultTime: 42,
            status: 'needs_improvement'
          }
        ],
        timeSeriesData: [
          { period: 'Mon', efficiency: 85, satisfaction: 4.6, waitTime: 22 },
          { period: 'Tue', efficiency: 89, satisfaction: 4.7, waitTime: 19 },
          { period: 'Wed', efficiency: 92, satisfaction: 4.8, waitTime: 16 },
          { period: 'Thu', efficiency: 88, satisfaction: 4.7, waitTime: 21 },
          { period: 'Fri', efficiency: 94, satisfaction: 4.9, waitTime: 14 },
          { period: 'Sat', efficiency: 87, satisfaction: 4.6, waitTime: 18 },
          { period: 'Sun', efficiency: 83, satisfaction: 4.5, waitTime: 25 }
        ],
        alerts: [
          {
            type: 'warning',
            title: 'High Wait Times in Orthopedics',
            description: 'Average wait time has increased to 35 minutes',
            priority: 'high'
          },
          {
            type: 'success',
            title: 'Cardiology Performance Excellent',
            description: 'Efficiency and satisfaction above targets',
            priority: 'low'
          },
          {
            type: 'info',
            title: 'Staff Training Reminder',
            description: 'Quarterly training due for 3 staff members',
            priority: 'medium'
          }
        ]
      };
    },
    enabled: !!profile?.tenant_id
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'needs_improvement': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <Award className="h-4 w-4 text-green-500" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'needs_improvement': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Performance Metrics</h2>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="pediatrics">Pediatrics</SelectItem>
              <SelectItem value="orthopedics">Orthopedics</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Satisfaction</span>
            </div>
            <div className="text-2xl font-bold">{performanceData?.kpis.patientSatisfaction}/5</div>
            <Progress value={performanceData?.kpis.patientSatisfaction * 20} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Avg Wait</span>
            </div>
            <div className="text-2xl font-bold">{performanceData?.kpis.avgWaitTime}m</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Utilization</span>
            </div>
            <div className="text-2xl font-bold">{performanceData?.kpis.appointmentUtilization}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Efficiency</span>
            </div>
            <div className="text-2xl font-bold">{performanceData?.kpis.staffEfficiency}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Revenue/Patient</span>
            </div>
            <div className="text-2xl font-bold">${performanceData?.kpis.revenuePerPatient}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">No-Show Rate</span>
            </div>
            <div className="text-2xl font-bold">{performanceData?.kpis.noShowRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Performance Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {performanceData?.alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                {alert.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />}
                {alert.type === 'info' && <Target className="h-4 w-4 text-blue-500 mt-0.5" />}
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
                <Badge variant={alert.priority === 'high' ? 'destructive' : alert.priority === 'medium' ? 'default' : 'secondary'}>
                  {alert.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="departments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="staff">Staff Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {performanceData?.departments.map((dept, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{dept.name}</CardTitle>
                    {getTrendIcon(dept.metrics.trend)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Patient Volume</span>
                      <div className="text-lg font-bold">{dept.metrics.patientVolume}</div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Avg Wait Time</span>
                      <div className="text-lg font-bold">{dept.metrics.avgWaitTime}m</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Patient Satisfaction</span>
                      <span className="text-xs font-medium">{dept.metrics.satisfaction}/5</span>
                    </div>
                    <Progress value={dept.metrics.satisfaction * 20} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Efficiency</span>
                      <span className="text-xs font-medium">{dept.metrics.efficiency}%</span>
                    </div>
                    <Progress value={dept.metrics.efficiency} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <div className="space-y-4">
            {performanceData?.staffPerformance.map((staff, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium">{staff.name}</h4>
                      <p className="text-sm text-muted-foreground">{staff.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(staff.status)}
                      <span className={`text-sm font-medium ${getStatusColor(staff.status)}`}>
                        {staff.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Patients Today</span>
                      <div className="font-medium">{staff.patientsToday}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Efficiency</span>
                      <div className="font-medium">{staff.efficiency}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Satisfaction</span>
                      <div className="font-medium">{staff.satisfaction}/5</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Consult</span>
                      <div className="font-medium">{staff.avgConsultTime}m</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Efficiency Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData?.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="efficiency" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="Efficiency %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Satisfaction Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData?.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="period" />
                      <YAxis domain={[4, 5]} />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="satisfaction" 
                        stroke="hsl(var(--secondary))" 
                        fill="hsl(var(--secondary))"
                        fillOpacity={0.3}
                        name="Satisfaction Score"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wait Time Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData?.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="waitTime" 
                      fill="hsl(var(--primary))"
                      name="Wait Time (minutes)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};