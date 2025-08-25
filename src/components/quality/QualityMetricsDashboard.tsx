import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';

const qualityMetrics = [
  {
    id: 'patient_satisfaction',
    name: 'Patient Satisfaction Score',
    value: 4.8,
    target: 4.5,
    unit: '/5',
    trend: 'up',
    change: '+0.2',
    status: 'excellent'
  },
  {
    id: 'wait_time_compliance',
    name: 'Wait Time Compliance',
    value: 87,
    target: 90,
    unit: '%',
    trend: 'down',
    change: '-3%',
    status: 'warning'
  },
  {
    id: 'infection_rate',
    name: 'Healthcare-Associated Infection Rate',
    value: 1.2,
    target: 2.0,
    unit: '%',
    trend: 'up',
    change: '+0.1%',
    status: 'good'
  },
  {
    id: 'readmission_rate',
    name: '30-Day Readmission Rate',
    value: 8.5,
    target: 10.0,
    unit: '%',
    trend: 'down',
    change: '-1.2%',
    status: 'good'
  }
];

const departmentPerformance = [
  { department: 'Emergency', score: 92, patients: 1250 },
  { department: 'Surgery', score: 96, patients: 340 },
  { department: 'Cardiology', score: 89, patients: 580 },
  { department: 'Pediatrics', score: 94, patients: 420 },
  { department: 'Orthopedics', score: 88, patients: 310 }
];

const complianceData = [
  { name: 'Documentation', value: 95, status: 'compliant' },
  { name: 'Safety Protocols', value: 98, status: 'compliant' },
  { name: 'Staff Training', value: 82, status: 'warning' },
  { name: 'Equipment Maintenance', value: 90, status: 'compliant' },
  { name: 'Patient Privacy', value: 99, status: 'compliant' }
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const QualityMetricsDashboard: React.FC = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent': return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
      case 'good': return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Needs Attention</Badge>;
      case 'critical': return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default: return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quality Metrics Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor quality indicators and compliance metrics across your healthcare facility
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm text-muted-foreground">Last updated: 5 minutes ago</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {qualityMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value}{metric.unit}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      Target: {metric.target}{metric.unit}
                    </p>
                    {getStatusBadge(metric.status)}
                  </div>
                  <Progress 
                    value={(metric.value / metric.target) * 100} 
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.change} from last month
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quality Score by Department</CardTitle>
                <CardDescription>Overall performance metrics across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
                <CardDescription>Current compliance status across key areas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={complianceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid gap-4">
            {departmentPerformance.map((dept) => (
              <Card key={dept.department}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{dept.department} Department</CardTitle>
                    <Badge variant={dept.score >= 90 ? "default" : "secondary"}>
                      {dept.score}% Quality Score
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{dept.patients} patients this month</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Avg wait: 15 min</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">95% satisfaction</span>
                    </div>
                  </div>
                  <Progress value={dept.score} className="mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4">
            {complianceData.map((item) => (
              <Card key={item.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {item.value >= 90 ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      )}
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">{item.value}%</span>
                      <Badge variant={item.value >= 90 ? "default" : "secondary"}>
                        {item.status === 'compliant' ? 'Compliant' : 'Needs Review'}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={item.value} className="mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Trends</CardTitle>
              <CardDescription>Historical performance data and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Trend analysis charts would be displayed here with historical data
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};