import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Calendar,
  Download,
  Eye,
  Users,
  Lock,
  Clock
} from 'lucide-react';

const ComplianceManager = () => {
  const [selectedAudit, setSelectedAudit] = useState<string | null>(null);

  const complianceMetrics = [
    { label: 'HIPAA Compliance', score: 98, status: 'excellent' },
    { label: 'Data Security', score: 94, status: 'good' },
    { label: 'Access Controls', score: 96, status: 'excellent' },
    { label: 'Audit Readiness', score: 89, status: 'good' }
  ];

  const auditTrails = [
    {
      id: '1',
      action: 'Patient Record Access',
      user: 'Dr. Smith',
      timestamp: '2024-01-15 10:30:00',
      resource: 'Patient ID: 12345',
      status: 'approved'
    },
    {
      id: '2',
      action: 'Prescription Update',
      user: 'Nurse Johnson',
      timestamp: '2024-01-15 10:25:00',
      resource: 'RX-789456',
      status: 'approved'
    },
    {
      id: '3',
      action: 'Data Export Request',
      user: 'Admin User',
      timestamp: '2024-01-15 10:20:00',
      resource: 'Analytics Report',
      status: 'pending'
    }
  ];

  const complianceReports = [
    {
      id: '1',
      name: 'HIPAA Risk Assessment',
      type: 'Risk Assessment',
      lastUpdated: '2024-01-10',
      status: 'current',
      nextDue: '2024-04-10'
    },
    {
      id: '2',
      name: 'SOC 2 Compliance Review',
      type: 'Security Audit',
      lastUpdated: '2024-01-05',
      status: 'current',
      nextDue: '2024-07-05'
    },
    {
      id: '3',
      name: 'Data Breach Response Plan',
      type: 'Incident Response',
      lastUpdated: '2023-12-15',
      status: 'needs-update',
      nextDue: '2024-02-15'
    }
  ];

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
      case 'current': return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Current</Badge>;
      case 'needs-update': return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Needs Update</Badge>;
      case 'approved': return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Approved</Badge>;
      case 'pending': return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {complianceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">{metric.label}</h3>
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{metric.score}%</span>
                  {getStatusBadge(metric.status)}
                </div>
                <Progress value={metric.score} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audit-trails">Audit Trails</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    All critical compliance requirements are met. System is audit-ready.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">HIPAA Compliance</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Compliant</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SOC 2 Type II</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Certified</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Encryption</span>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">AES-256</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Compliance Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditTrails.slice(0, 5).map((trail) => (
                    <div key={trail.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{trail.action}</p>
                        <p className="text-xs text-muted-foreground">{trail.user} • {trail.timestamp}</p>
                      </div>
                      {getStatusBadge(trail.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit-trails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Trail Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input placeholder="Search audit logs..." className="max-w-sm" />
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="space-y-2">
                  {auditTrails.map((trail) => (
                    <div key={trail.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <span className="font-medium">{trail.action}</span>
                            {getStatusBadge(trail.status)}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            <span>{trail.user}</span> • <span>{trail.resource}</span> • <span>{trail.timestamp}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Compliance Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceReports.map((report) => (
                  <div key={report.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-medium">{report.name}</h3>
                          {getStatusBadge(report.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span>{report.type}</span> • 
                          <span> Last Updated: {report.lastUpdated}</span> • 
                          <span> Next Due: {report.nextDue}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Policy Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="policyName">Policy Name</Label>
                  <Input id="policyName" placeholder="Enter policy name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policyDescription">Description</Label>
                  <Textarea id="policyDescription" placeholder="Policy description" rows={4} />
                </div>
                <Button>Create Policy</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceManager;