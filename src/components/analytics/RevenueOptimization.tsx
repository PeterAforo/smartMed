import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  BarChart3, 
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Users,
  Calendar,
  Star
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RevenueOptimizationProps {
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export const RevenueOptimization: React.FC<RevenueOptimizationProps> = ({ dateRange }) => {
  const { profile, currentBranch } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  // Mock revenue optimization data
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['revenue-optimization', selectedPeriod, currentBranch?.id],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        currentMetrics: {
          totalRevenue: 425000,
          growthRate: 12.5,
          averagePerPatient: 285,
          conversionRate: 78.3,
          revenuePerHour: 1250
        },
        opportunities: [
          {
            id: 1,
            title: 'Increase High-Value Services',
            category: 'service_mix',
            impact: 'High',
            potentialIncrease: 85000,
            effort: 'Medium',
            description: 'Focus on promoting cosmetic and elective procedures',
            actions: [
              'Launch targeted marketing for cosmetic procedures',
              'Train staff on upselling techniques',
              'Create premium service packages'
            ],
            roi: 340
          },
          {
            id: 2,
            title: 'Optimize Appointment Pricing',
            category: 'pricing',
            impact: 'Medium',
            potentialIncrease: 45000,
            effort: 'Low',
            description: 'Adjust pricing based on demand patterns and competitor analysis',
            actions: [
              'Implement dynamic pricing for peak hours',
              'Review and adjust consultation fees',
              'Create bundled service packages'
            ],
            roi: 280
          },
          {
            id: 3,
            title: 'Reduce No-Show Rate',
            category: 'efficiency',
            impact: 'Medium',
            potentialIncrease: 32000,
            effort: 'Low',
            description: 'Implement better reminder systems and cancellation policies',
            actions: [
              'Automated SMS/email reminders',
              'Implement cancellation fees',
              'Offer online rescheduling'
            ],
            roi: 420
          },
          {
            id: 4,
            title: 'Expand Evening Hours',
            category: 'capacity',
            impact: 'High',
            potentialIncrease: 95000,
            effort: 'High',
            description: 'Add evening appointments to serve working patients',
            actions: [
              'Hire additional evening staff',
              'Promote evening availability',
              'Offer evening-specific services'
            ],
            roi: 195
          }
        ],
        serviceAnalysis: [
          { service: 'General Consultation', revenue: 125000, sessions: 850, avgPrice: 147, growth: 8.2 },
          { service: 'Specialist Consultation', revenue: 95000, sessions: 320, avgPrice: 297, growth: 15.1 },
          { service: 'Diagnostic Tests', revenue: 78000, sessions: 450, avgPrice: 173, growth: 12.7 },
          { service: 'Minor Procedures', revenue: 85000, sessions: 180, avgPrice: 472, growth: 22.3 },
          { service: 'Vaccinations', revenue: 42000, sessions: 680, avgPrice: 62, growth: 5.8 }
        ],
        trendData: [
          { month: 'Jan', revenue: 38000, target: 40000, efficiency: 82 },
          { month: 'Feb', revenue: 42000, target: 41000, efficiency: 85 },
          { month: 'Mar', revenue: 45000, target: 42000, efficiency: 88 },
          { month: 'Apr', revenue: 47000, target: 43000, efficiency: 87 },
          { month: 'May', revenue: 52000, target: 44000, efficiency: 92 },
          { month: 'Jun', revenue: 49000, target: 45000, efficiency: 89 }
        ]
      };
    },
    enabled: !!profile?.tenant_id
  });

  const impactColors = {
    High: '#ef4444',
    Medium: '#f59e0b',
    Low: '#10b981'
  };

  const effortColors = {
    High: '#dc2626',
    Medium: '#d97706',
    Low: '#059669'
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
          <DollarSign className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Revenue Optimization</h2>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Revenue</span>
            </div>
            <div className="text-2xl font-bold">${revenueData?.currentMetrics.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">{revenueData?.currentMetrics.growthRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Revenue/Patient</span>
            </div>
            <div className="text-2xl font-bold">${revenueData?.currentMetrics.averagePerPatient}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Conversion Rate</span>
            </div>
            <div className="text-2xl font-bold">{revenueData?.currentMetrics.conversionRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Revenue/Hour</span>
            </div>
            <div className="text-2xl font-bold">${revenueData?.currentMetrics.revenuePerHour}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Growth Rate</span>
            </div>
            <div className="text-2xl font-bold">{revenueData?.currentMetrics.growthRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="opportunities" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="services">Service Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {revenueData?.opportunities.map((opportunity) => (
              <Card key={opportunity.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                    <Badge style={{ backgroundColor: impactColors[opportunity.impact as keyof typeof impactColors] }}>
                      {opportunity.impact} Impact
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Potential Increase</span>
                      <div className="text-lg font-bold text-green-600">
                        +${opportunity.potentialIncrease.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">ROI</span>
                      <div className="text-lg font-bold text-primary">
                        {opportunity.roi}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Implementation Effort</span>
                    <Badge 
                      variant="outline"
                      style={{ borderColor: effortColors[opportunity.effort as keyof typeof effortColors] }}
                    >
                      {opportunity.effort}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-sm font-medium mb-2 block">Action Items:</span>
                    <ul className="space-y-1">
                      {opportunity.actions.map((action, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Implement Strategy
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData?.serviceAnalysis.map((service, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{service.service}</h4>
                      <div className="flex items-center gap-2">
                        {service.growth > 10 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${service.growth > 10 ? 'text-green-500' : 'text-red-500'}`}>
                          {service.growth}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Revenue</span>
                        <div className="font-medium">${service.revenue.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sessions</span>
                        <div className="font-medium">{service.sessions}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Price</span>
                        <div className="font-medium">${service.avgPrice}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Target Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData?.trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Actual Revenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Target"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Efficiency Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData?.trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="efficiency" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      name="Efficiency %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};