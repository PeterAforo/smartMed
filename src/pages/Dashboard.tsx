import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Calendar,
  Bell,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  TestTube,
  FileText
} from "lucide-react";

export default function Dashboard() {
  // Mock data for AI insights and alerts
  const aiInsights = [
    {
      id: 1,
      type: "prediction",
      title: "Bed Occupancy Forecast",
      message: "Expected 15% increase in admissions over next 3 days",
      priority: "medium",
      action: "Prepare additional beds in Ward C"
    },
    {
      id: 2,
      type: "anomaly",
      title: "Unusual Lab Results Pattern",
      message: "10% increase in cardiac enzyme tests detected",
      priority: "high",
      action: "Review cardiology department scheduling"
    },
    {
      id: 3,
      type: "optimization",
      title: "Resource Optimization",
      message: "OR 3 shows 23% efficiency improvement opportunity",
      priority: "low",
      action: "Schedule equipment maintenance"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "admission",
      message: "Patient John Doe admitted to ICU",
      time: "5 minutes ago",
      status: "critical"
    },
    {
      id: 2,
      type: "discharge",
      message: "Patient Sarah Smith discharged from Ward A",
      time: "12 minutes ago",
      status: "success"
    },
    {
      id: 3,
      type: "appointment",
      message: "15 new appointments scheduled for tomorrow",
      time: "25 minutes ago",
      status: "info"
    },
    {
      id: 4,
      type: "alert",
      message: "Low inventory alert: Surgical masks",
      time: "1 hour ago",
      status: "warning"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'low': return 'text-success bg-success/10 border-success/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'success': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-warning" />;
      default: return <Activity className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">
            Hospital Management Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your hospital overview and AI-powered insights.
          </p>
        </div>

        {/* Key Stats */}
        <DashboardStats />

        {/* AI Insights and Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* AI-Powered Insights */}
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                Real-time analytics and predictive recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiInsights.map((insight) => (
                <div key={insight.id} className="flex gap-3 p-3 rounded-lg border bg-card/50">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm text-foreground">
                        {insight.title}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={getPriorityColor(insight.priority)}
                      >
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {insight.message}
                    </p>
                    <p className="text-xs font-medium text-primary">
                      Recommended: {insight.action}
                    </p>
                  </div>
                </div>
              ))}
              <Button className="w-full mt-4 healthcare-gradient text-primary-foreground">
                View All AI Insights
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates from across the hospital
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.message}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                View Activity Log
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="healthcare-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button className="healthcare-gradient text-primary-foreground p-6 h-auto flex-col gap-2">
                <UserPlus className="h-6 w-6" />
                <span className="text-sm font-medium">New Patient</span>
              </Button>
              <Button variant="outline" className="p-6 h-auto flex-col gap-2 border-primary/20 hover:bg-primary/5">
                <Calendar className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Schedule</span>
              </Button>
              <Button variant="outline" className="p-6 h-auto flex-col gap-2 border-primary/20 hover:bg-primary/5">
                <TestTube className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Lab Results</span>
              </Button>
              <Button variant="outline" className="p-6 h-auto flex-col gap-2 border-primary/20 hover:bg-primary/5">
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}