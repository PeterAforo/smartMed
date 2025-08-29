import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  PieChart, 
  LineChart,
  DollarSign,
  Users,
  Calendar,
  Target,
  Brain,
  Lightbulb,
  Download,
  RefreshCw
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const BusinessIntelligence = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const kpiData = [
    { 
      label: 'Revenue Growth', 
      value: '+12.5%', 
      trend: 'up', 
      amount: '$2.4M',
      previousPeriod: '$2.1M'
    },
    { 
      label: 'Patient Satisfaction', 
      value: '+8.2%', 
      trend: 'up', 
      amount: '4.8/5.0',
      previousPeriod: '4.4/5.0'
    },
    { 
      label: 'Operational Efficiency', 
      value: '+15.3%', 
      trend: 'up', 
      amount: '87%',
      previousPeriod: '76%'
    },
    { 
      label: 'Cost per Patient', 
      value: '-5.7%', 
      trend: 'down', 
      amount: '$235',
      previousPeriod: '$249'
    }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 180000, patients: 450, efficiency: 85 },
    { month: 'Feb', revenue: 195000, patients: 480, efficiency: 87 },
    { month: 'Mar', revenue: 210000, patients: 520, efficiency: 89 },
    { month: 'Apr', revenue: 225000, patients: 580, efficiency: 91 },
    { month: 'May', revenue: 240000, patients: 620, efficiency: 88 },
    { month: 'Jun', revenue: 255000, patients: 680, efficiency: 92 }
  ];

  const departmentData = [
    { name: 'Emergency', value: 35, color: '#3b82f6' },
    { name: 'Surgery', value: 25, color: '#10b981' },
    { name: 'Cardiology', value: 20, color: '#f59e0b' },
    { name: 'Pediatrics', value: 12, color: '#ef4444' },
    { name: 'Other', value: 8, color: '#8b5cf6' }
  ];

  const insights = [
    {
      id: 1,
      type: 'opportunity',
      title: 'Peak Hour Optimization',
      description: 'Emergency department shows 23% higher efficiency between 2-4 PM. Consider staff reallocation.',
      impact: 'High',
      category: 'Operations'
    },
    {
      id: 2,
      type: 'trend',
      title: 'Patient Satisfaction Trend',
      description: 'Cardiology department satisfaction increased 15% after implementing new patient portal.',
      impact: 'Medium',
      category: 'Quality'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Cost Anomaly Detected',
      description: 'Surgical supplies cost 18% above projected budget. Review vendor contracts.',
      impact: 'High',
      category: 'Finance'
    },
    {
      id: 4,
      type: 'recommendation',
      title: 'Capacity Planning',
      description: 'Projected 12% patient increase next quarter. Consider expanding ICU capacity.',
      impact: 'Medium',
      category: 'Planning'
    }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="h-4 w-4 text-blue-500" />;
      case 'trend': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'alert': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'High': return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">High Impact</Badge>;
      case 'Medium': return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Medium Impact</Badge>;
      case 'Low': return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Low Impact</Badge>;
      default: return <Badge variant="outline">{impact}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue Analysis</SelectItem>
              <SelectItem value="efficiency">Operational Efficiency</SelectItem>
              <SelectItem value="satisfaction">Patient Satisfaction</SelectItem>
              <SelectItem value="costs">Cost Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">{kpi.label}</h3>
                {getTrendIcon(kpi.trend)}
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{kpi.amount}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.value}
                  </span>
                  <span className="text-xs text-muted-foreground">vs {kpi.previousPeriod}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Department Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Department Revenue Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`${value}%`, 'Revenue Share']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {departmentData.map((dept, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }}></div>
                      <span className="text-sm">{dept.name}: {dept.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="patients" fill="#3b82f6" name="Patients" />
                    <Bar dataKey="efficiency" fill="#10b981" name="Efficiency %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Generated Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{insight.title}</h3>
                          {getImpactBadge(insight.impact)}
                          <Badge variant="outline">{insight.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Predictive Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Revenue Forecast</h4>
                  <div className="text-2xl font-bold">$3.2M</div>
                  <p className="text-sm text-muted-foreground">Next quarter projection</p>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-green-600">85% confidence</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Patient Volume</h4>
                  <div className="text-2xl font-bold">+18%</div>
                  <p className="text-sm text-muted-foreground">Expected growth</p>
                  <Progress value={92} className="h-2" />
                  <p className="text-xs text-green-600">92% confidence</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Cost Optimization</h4>
                  <div className="text-2xl font-bold">-8%</div>
                  <p className="text-sm text-muted-foreground">Potential savings</p>
                  <Progress value={76} className="h-2" />
                  <p className="text-xs text-yellow-600">76% confidence</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessIntelligence;