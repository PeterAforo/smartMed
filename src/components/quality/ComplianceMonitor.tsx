import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Users, 
  Lock,
  Calendar as CalendarIcon,
  Download,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

const complianceStandards = [
  {
    id: 'hipaa',
    name: 'HIPAA Compliance',
    status: 'compliant',
    score: 98,
    lastAudit: '2024-01-15',
    nextAudit: '2024-07-15',
    requirements: [
      { name: 'Staff Training', status: 'compliant', completionRate: 100 },
      { name: 'Access Controls', status: 'compliant', completionRate: 95 },
      { name: 'Data Encryption', status: 'compliant', completionRate: 100 },
      { name: 'Audit Logs', status: 'warning', completionRate: 85 }
    ]
  },
  {
    id: 'jcaho',
    name: 'Joint Commission Standards',
    status: 'warning',
    score: 87,
    lastAudit: '2024-02-01',
    nextAudit: '2024-08-01',
    requirements: [
      { name: 'Patient Safety Goals', status: 'compliant', completionRate: 92 },
      { name: 'Medication Management', status: 'warning', completionRate: 78 },
      { name: 'Infection Control', status: 'compliant', completionRate: 96 },
      { name: 'Emergency Management', status: 'compliant', completionRate: 88 }
    ]
  },
  {
    id: 'osha',
    name: 'OSHA Workplace Safety',
    status: 'compliant',
    score: 94,
    lastAudit: '2024-01-30',
    nextAudit: '2024-07-30',
    requirements: [
      { name: 'Hazard Communication', status: 'compliant', completionRate: 100 },
      { name: 'PPE Training', status: 'compliant', completionRate: 94 },
      { name: 'Bloodborne Pathogens', status: 'compliant', completionRate: 97 },
      { name: 'Emergency Procedures', status: 'warning', completionRate: 83 }
    ]
  }
];

const recentAlerts = [
  {
    id: 1,
    type: 'warning',
    title: 'Staff Training Deadline Approaching',
    description: '15 staff members need to complete annual HIPAA training by March 15th',
    timestamp: '2024-02-28T10:30:00Z',
    priority: 'medium'
  },
  {
    id: 2,
    type: 'critical',
    title: 'Medication Reconciliation Audit',
    description: 'Non-compliance detected in medication reconciliation process',
    timestamp: '2024-02-27T14:15:00Z',
    priority: 'high'
  },
  {
    id: 3,
    type: 'info',
    title: 'Security Assessment Completed',
    description: 'Annual cybersecurity assessment completed with recommendations',
    timestamp: '2024-02-26T09:00:00Z',
    priority: 'low'
  }
];

export const ComplianceMonitor: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-green-100 text-green-800">Compliant</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Needs Attention</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default:
        return <Badge>Under Review</Badge>;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Compliance Monitor</h2>
          <p className="text-muted-foreground">
            Track regulatory compliance and audit requirements
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="standards">Standards</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">93%</div>
                <p className="text-xs text-muted-foreground">
                  +2% from last month
                </p>
                <Progress value={93} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Standards</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceStandards.length}</div>
                <p className="text-xs text-muted-foreground">
                  Regulatory frameworks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Compliance by Standard</CardTitle>
                <CardDescription>Current status across all regulatory standards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {complianceStandards.map((standard) => (
                  <div key={standard.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(standard.status)}
                      <div>
                        <div className="font-medium">{standard.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Score: {standard.score}%
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(standard.status)}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Latest compliance notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentAlerts.slice(0, 3).map((alert) => (
                  <Alert key={alert.id}>
                    {getAlertIcon(alert.type)}
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertDescription>
                      {alert.description}
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="standards" className="space-y-4">
          <div className="grid gap-4">
            {complianceStandards.map((standard) => (
              <Card key={standard.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{standard.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">{standard.score}%</span>
                      {getStatusBadge(standard.status)}
                    </div>
                  </div>
                  <CardDescription>
                    Last audit: {format(new Date(standard.lastAudit), 'PPP')} | 
                    Next audit: {format(new Date(standard.nextAudit), 'PPP')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {standard.requirements.map((req, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(req.status)}
                          <span className="text-sm">{req.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {req.completionRate}%
                          </span>
                          <Progress value={req.completionRate} className="w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <Alert key={alert.id}>
                {getAlertIcon(alert.type)}
                <AlertTitle className="flex items-center justify-between">
                  {alert.title}
                  <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>
                    {alert.priority} priority
                  </Badge>
                </AlertTitle>
                <AlertDescription>
                  <div>{alert.description}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {format(new Date(alert.timestamp), 'PPp')}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audits" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Audit Schedule</CardTitle>
                <CardDescription>Upcoming compliance audits</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit History</CardTitle>
                <CardDescription>Recent audit results and findings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceStandards.map((standard) => (
                    <div key={standard.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{standard.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(standard.lastAudit), 'PPP')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{standard.score}%</div>
                        {getStatusIcon(standard.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};