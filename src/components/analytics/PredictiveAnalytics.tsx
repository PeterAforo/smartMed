import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Brain, 
  Calendar,
  DollarSign,
  Users,
  Activity,
  Zap
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PredictiveAnalyticsProps {
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ dateRange }) => {
  const { profile, currentBranch } = useAuth();
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [predictionPeriod, setPredictionPeriod] = useState('30');

  // Mock predictive data - in real implementation, this would come from ML models
  const { data: predictiveData, isLoading } = useQuery({
    queryKey: ['predictive-analytics', selectedMetric, predictionPeriod, currentBranch?.id],
    queryFn: async () => {
      // Simulate API call for predictive analytics
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        revenue: {
          current: 125000,
          predicted: 138000,
          confidence: 87,
          trend: 'up',
          change: 10.4,
          factors: [
            { name: 'Seasonal patterns', impact: 85 },
            { name: 'Historical growth', impact: 78 },
            { name: 'Market trends', impact: 65 },
            { name: 'Capacity utilization', impact: 92 }
          ]
        },
        patients: {
          current: 450,
          predicted: 485,
          confidence: 82,
          trend: 'up',
          change: 7.8,
          factors: [
            { name: 'Referral patterns', impact: 88 },
            { name: 'Marketing campaigns', impact: 72 },
            { name: 'Service expansion', impact: 69 },
            { name: 'Patient satisfaction', impact: 95 }
          ]
        },
        appointments: {
          current: 340,
          predicted: 375,
          confidence: 91,
          trend: 'up',
          change: 10.3,
          factors: [
            { name: 'Booking trends', impact: 93 },
            { name: 'Staff availability', impact: 87 },
            { name: 'Seasonal demand', impact: 76 },
            { name: 'Wait times', impact: 81 }
          ]
        },
        risks: [
          {
            type: 'capacity',
            severity: 'high',
            probability: 78,
            description: 'Appointment capacity may be exceeded in 2-3 weeks',
            recommendation: 'Consider adding evening slots or weekend availability'
          },
          {
            type: 'revenue',
            severity: 'medium',
            probability: 65,
            description: 'Revenue growth may slow due to seasonal patterns',
            recommendation: 'Focus on high-value services and patient retention'
          },
          {
            type: 'staffing',
            severity: 'low',
            probability: 45,
            description: 'Potential staff shortage during holiday period',
            recommendation: 'Plan temporary staffing or adjust schedules'
          }
        ]
      };
    },
    enabled: !!profile?.tenant_id
  });

  const chartData = [
    { period: 'Week 1', actual: 28000, predicted: 29500 },
    { period: 'Week 2', actual: 32000, predicted: 33000 },
    { period: 'Week 3', actual: 26000, predicted: 27500 },
    { period: 'Week 4', actual: 35000, predicted: 36000 },
    { period: 'Week 5', predicted: 37500 },
    { period: 'Week 6', predicted: 39000 },
    { period: 'Week 7', predicted: 40500 },
    { period: 'Week 8', predicted: 42000 }
  ];

  const riskColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981'
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

  const currentMetricData = predictiveData && typeof predictiveData === 'object' && selectedMetric in predictiveData 
    ? (predictiveData as any)[selectedMetric] 
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Predictive Analytics</h2>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="patients">Patients</SelectItem>
              <SelectItem value="appointments">Appointments</SelectItem>
            </SelectContent>
          </Select>
          <Select value={predictionPeriod} onValueChange={setPredictionPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current vs Predicted */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Current</span>
                  <span className="text-sm font-medium">
                    {selectedMetric === 'revenue' ? '$' : ''}{currentMetricData?.current.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Predicted</span>
                  <span className="text-sm font-medium text-primary">
                    {selectedMetric === 'revenue' ? '$' : ''}{currentMetricData?.predicted.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {currentMetricData?.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${currentMetricData?.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {currentMetricData?.change}%
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Confidence</span>
                  <span className="text-xs font-medium">{currentMetricData?.confidence}%</span>
                </div>
                <Progress value={currentMetricData?.confidence} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Factors */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Impact Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {currentMetricData?.factors.map((factor, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{factor.name}</span>
                      <span className="text-xs font-medium">{factor.impact}%</span>
                    </div>
                    <Progress value={factor.impact} className="h-1" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {predictiveData?.risks.slice(0, 3).map((risk, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={risk.severity === 'high' ? 'destructive' : risk.severity === 'medium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {risk.severity}
                      </Badge>
                      <span className="text-xs font-medium">{risk.probability}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{risk.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Prediction Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Forecast Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Actual"
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Predicted"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Analysis & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictiveData?.risks.map((risk, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={risk.severity === 'high' ? 'destructive' : risk.severity === 'medium' ? 'default' : 'secondary'}
                    >
                      {risk.severity.toUpperCase()}
                    </Badge>
                    <span className="font-medium capitalize">{risk.type} Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{risk.probability}% probability</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{risk.description}</p>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm"><strong>Recommendation:</strong> {risk.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};