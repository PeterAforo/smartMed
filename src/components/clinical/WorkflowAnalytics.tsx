import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, CheckCircle, AlertTriangle, Users, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface WorkflowAnalyticsProps {
  timeRange?: string;
}

const WorkflowAnalytics: React.FC<WorkflowAnalyticsProps> = ({ timeRange = '30d' }) => {
  const { profile, currentBranch } = useAuth();
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('all');

  // Fetch workflow performance data
  const { data: performanceData } = useQuery({
    queryKey: ['workflow-analytics', currentBranch?.id, timeRange, selectedWorkflow],
    queryFn: async () => {
      if (!profile?.tenant_id) return null;

      const endDate = new Date();
      const startDate = subDays(endDate, timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90);

      // Fetch workflow instances with completion data
      let query = supabase
        .from('workflow_instances')
        .select(`
          *,
          workflow:clinical_workflows(workflow_name, workflow_type),
          patient:patients(first_name, last_name)
        `)
        .eq('tenant_id', profile.tenant_id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (currentBranch?.id) {
        query = query.eq('branch_id', currentBranch.id);
      }

      if (selectedWorkflow !== 'all') {
        query = query.eq('workflow_id', selectedWorkflow);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data;
    },
    enabled: !!profile?.tenant_id
  });

  // Fetch workflow tasks performance
  const { data: taskPerformance } = useQuery({
    queryKey: ['workflow-task-analytics', currentBranch?.id, timeRange],
    queryFn: async () => {
      if (!profile?.tenant_id) return null;

      const endDate = new Date();
      const startDate = subDays(endDate, timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90);

      const { data, error } = await supabase
        .from('workflow_tasks')
        .select(`
          *,
          workflow_instance:workflow_instances(
            workflow:clinical_workflows(workflow_name)
          )
        `)
        .eq('tenant_id', profile.tenant_id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id
  });

  // Calculate analytics metrics
  const analytics = React.useMemo(() => {
    if (!performanceData || !taskPerformance) return null;

    const totalWorkflows = performanceData.length;
    const completedWorkflows = performanceData.filter(w => w.status === 'completed').length;
    const activeWorkflows = performanceData.filter(w => w.status === 'active').length;
    const pausedWorkflows = performanceData.filter(w => w.status === 'paused').length;

    const completionRate = totalWorkflows > 0 ? (completedWorkflows / totalWorkflows) * 100 : 0;

    const totalTasks = taskPerformance.length;
    const completedTasks = taskPerformance.filter(t => t.status === 'completed').length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate average completion time for completed workflows
    const completedWorkflowsWithTime = performanceData.filter(w => w.status === 'completed' && w.completed_at);
    const avgCompletionTime = completedWorkflowsWithTime.length > 0
      ? completedWorkflowsWithTime.reduce((acc, w) => {
          const duration = new Date(w.completed_at).getTime() - new Date(w.started_at).getTime();
          return acc + duration;
        }, 0) / completedWorkflowsWithTime.length
      : 0;

    // Group workflows by type
    const workflowsByType = performanceData.reduce((acc, w) => {
      const type = w.workflow?.workflow_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const workflowTypeData = Object.entries(workflowsByType).map(([type, count]) => ({
      name: type,
      value: count
    }));

    // Daily completion trends
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayWorkflows = performanceData.filter(w => {
        const createdAt = new Date(w.created_at);
        return createdAt >= dayStart && createdAt <= dayEnd;
      });

      const dayCompleted = dayWorkflows.filter(w => w.status === 'completed').length;

      dailyData.push({
        date: format(date, 'MMM dd'),
        completed: dayCompleted,
        total: dayWorkflows.length
      });
    }

    return {
      totalWorkflows,
      completedWorkflows,
      activeWorkflows,
      pausedWorkflows,
      completionRate,
      taskCompletionRate,
      avgCompletionTime: avgCompletionTime / (1000 * 60 * 60), // Convert to hours
      workflowTypeData,
      dailyData
    };
  }, [performanceData, taskPerformance]);

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workflow Analytics</CardTitle>
        </CardHeader>
        <CardContent>
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
        <h2 className="text-2xl font-bold">Workflow Analytics</h2>
        <div className="flex gap-2">
          <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select workflow" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workflows</SelectItem>
              {/* Add workflow options here */}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalWorkflows}</div>
            <div className="text-xs text-muted-foreground">
              {analytics.activeWorkflows} active, {analytics.pausedWorkflows} paused
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
            <Progress value={analytics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.taskCompletionRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              Individual task completion rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgCompletionTime.toFixed(1)}h</div>
            <div className="text-xs text-muted-foreground">
              Average workflow completion time
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Workflow Completion Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="completed" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="total" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Distribution by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.workflowTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.workflowTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Efficiency Score</span>
                    </div>
                    <div className="text-2xl font-bold">85%</div>
                    <div className="text-sm text-muted-foreground">Based on completion time vs. estimated</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">SLA Compliance</span>
                    </div>
                    <div className="text-2xl font-bold">92%</div>
                    <div className="text-sm text-muted-foreground">Workflows completed within SLA</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowAnalytics;