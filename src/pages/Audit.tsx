import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Eye, FileText, User, Clock, AlertTriangle, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GenerateAuditReportDialog } from '@/components/audit/GenerateAuditReportDialog';

const Audit = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [generateReportDialogOpen, setGenerateReportDialogOpen] = useState(false);

  // Mock audit log data
  const [auditLogs] = useState([
    {
      id: 1,
      timestamp: '2024-01-18 10:30:25',
      user: 'Dr. Sarah Johnson',
      userId: 'USR001',
      action: 'viewed_patient_record',
      resource: 'Patient Record - PAT001',
      ipAddress: '192.168.1.100',
      outcome: 'success',
      details: 'Accessed medical history for routine checkup',
      category: 'data_access'
    },
    {
      id: 2,
      timestamp: '2024-01-18 10:28:15',
      user: 'Nurse Mary Smith',
      userId: 'USR002',
      action: 'updated_vitals',
      resource: 'Patient Vitals - PAT002',
      ipAddress: '192.168.1.101',
      outcome: 'success',
      details: 'Updated blood pressure and temperature readings',
      category: 'data_modification'
    },
    {
      id: 3,
      timestamp: '2024-01-18 10:25:45',
      user: 'Admin Tom Wilson',
      userId: 'USR003',
      action: 'failed_login',
      resource: 'Authentication System',
      ipAddress: '192.168.1.102',
      outcome: 'failure',
      details: 'Multiple failed login attempts detected',
      category: 'security_event'
    },
    {
      id: 4,
      timestamp: '2024-01-18 10:20:30',
      user: 'Dr. Michael Brown',
      userId: 'USR004',
      action: 'prescribed_medication',
      resource: 'Prescription - RX001',
      ipAddress: '192.168.1.103',
      outcome: 'success',
      details: 'Prescribed Lisinopril 10mg for hypertension',
      category: 'clinical_action'
    }
  ]);

  // Mock compliance checks
  const [complianceChecks] = useState([
    {
      id: 1,
      checkName: 'HIPAA Data Access Review',
      lastRun: '2024-01-18 06:00:00',
      status: 'passed',
      score: 98,
      issues: 2,
      category: 'privacy'
    },
    {
      id: 2,
      checkName: 'User Access Permissions',
      lastRun: '2024-01-18 06:15:00',
      status: 'warning',
      score: 85,
      issues: 8,
      category: 'security'
    },
    {
      id: 3,
      checkName: 'Data Backup Verification',
      lastRun: '2024-01-18 06:30:00',
      status: 'passed',
      score: 100,
      issues: 0,
      category: 'data_integrity'
    },
    {
      id: 4,
      checkName: 'Clinical Documentation',
      lastRun: '2024-01-18 06:45:00',
      status: 'failed',
      score: 72,
      issues: 15,
      category: 'clinical'
    }
  ]);

  const [auditStats] = useState({
    totalLogs: 15420,
    todaysEvents: 342,
    securityAlerts: 5,
    complianceScore: 92,
    failedLogins: 12,
    dataAccesses: 1847
  });

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'success': return 'bg-green-500 text-white';
      case 'failure': return 'bg-red-500 text-white';
      case 'warning': return 'bg-yellow-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'data_access': return 'bg-blue-100 text-blue-800';
      case 'data_modification': return 'bg-green-100 text-green-800';
      case 'security_event': return 'bg-red-100 text-red-800';
      case 'clinical_action': return 'bg-purple-100 text-purple-800';
      case 'privacy': return 'bg-indigo-100 text-indigo-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'data_integrity': return 'bg-green-100 text-green-800';
      case 'clinical': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-500 text-white';
      case 'warning': return 'bg-yellow-500 text-white';
      case 'failed': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleExportLogs = () => {
    toast({
      title: "Export Started",
      description: "Audit logs are being exported. You will receive a notification when complete.",
    });
  };

  const handleRunCompliance = () => {
    toast({
      title: "Compliance Check Started",
      description: "Running comprehensive compliance check...",
    });
  };

  const filteredLogs = auditLogs.filter(log =>
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit & Compliance</h1>
          <p className="text-muted-foreground">
            Security monitoring, compliance tracking, and audit trail management
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Audit Logs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditStats.totalLogs.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All-time records
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditStats.todaysEvents}</div>
              <p className="text-xs text-muted-foreground">
                System activities today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{auditStats.securityAlerts}</div>
              <p className="text-xs text-muted-foreground">
                Requiring attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{auditStats.complianceScore}%</div>
              <p className="text-xs text-muted-foreground">
                Overall compliance rating
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{auditStats.failedLogins}</div>
              <p className="text-xs text-muted-foreground">
                Last 24 hours
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Accesses</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditStats.dataAccesses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Patient record views today
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="audit-logs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Checks</TabsTrigger>
            <TabsTrigger value="security">Security Monitoring</TabsTrigger>
            <TabsTrigger value="reports">Audit Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="audit-logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Audit Logs</CardTitle>
                <CardDescription>
                  Comprehensive log of all system activities and user actions
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs by user, action, or resource..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                  <Button onClick={handleExportLogs}>
                    Export Logs
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getOutcomeColor(log.outcome)}>
                            {log.outcome.toUpperCase()}
                          </Badge>
                          <Badge className={getCategoryColor(log.category)}>
                            {log.category.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{log.timestamp}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{log.user}</span>
                            <span className="text-muted-foreground">({log.userId})</span>
                          </div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">Action:</span>
                            <span>{log.action.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Resource:</span>
                            <span>{log.resource}</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">IP Address:</span>
                            <span>{log.ipAddress}</span>
                          </div>
                          <div className="mt-2">
                            <span className="font-medium">Details:</span>
                            <p className="text-muted-foreground mt-1">{log.details}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Monitoring</CardTitle>
                <CardDescription>
                  Automated compliance checks and regulatory monitoring
                </CardDescription>
                <Button onClick={handleRunCompliance}>
                  <Shield className="mr-2 h-4 w-4" />
                  Run Full Compliance Check
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceChecks.map((check) => (
                    <div key={check.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{check.checkName}</h3>
                          <Badge className={getStatusColor(check.status)}>
                            {check.status.toUpperCase()}
                          </Badge>
                          <Badge className={getCategoryColor(check.category)}>
                            {check.category.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg font-bold ${
                            check.score >= 90 ? 'text-green-600' : 
                            check.score >= 75 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {check.score}%
                          </span>
                          <Button variant="outline" size="sm">
                            View Report
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Last Run: {check.lastRun}</span>
                        <span className={check.issues > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                          {check.issues} issues found
                        </span>
                      </div>
                      
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              check.score >= 90 ? 'bg-green-500' : 
                              check.score >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${check.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Event Monitoring</CardTitle>
                <CardDescription>
                  Real-time security alerts and threat detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Active Security Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { type: 'Multiple Failed Logins', severity: 'high', count: 5, time: '10 min ago' },
                        { type: 'Unusual Data Access Pattern', severity: 'medium', count: 2, time: '1 hour ago' },
                        { type: 'Privileged Account Usage', severity: 'low', count: 1, time: '3 hours ago' }
                      ].map((alert, index) => (
                        <div key={index} className="p-3 border rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{alert.type}</p>
                              <p className="text-xs text-muted-foreground">{alert.time}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={
                                alert.severity === 'high' ? 'bg-red-500 text-white' :
                                alert.severity === 'medium' ? 'bg-yellow-500 text-white' :
                                'bg-blue-500 text-white'
                              }>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">{alert.count} events</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Security Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Failed Login Rate:</span>
                        <span className="text-sm font-medium">2.1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Suspicious Activities:</span>
                        <span className="text-sm font-medium">8</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Blocked IP Addresses:</span>
                        <span className="text-sm font-medium">15</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Security Score:</span>
                        <span className="text-sm font-medium text-green-600">95%</span>
                      </div>
                      <Button className="w-full" variant="outline">
                        View Security Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit Reports & Analytics</CardTitle>
                <CardDescription>
                  Generate comprehensive audit reports and compliance documentation
                </CardDescription>
                <Button onClick={() => setGenerateReportDialogOpen(true)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Custom Report
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Button variant="outline" className="h-20 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    Audit Trail Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Shield className="h-6 w-6 mb-2" />
                    Compliance Summary
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <AlertTriangle className="h-6 w-6 mb-2" />
                    Security Incidents
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <User className="h-6 w-6 mb-2" />
                    User Activity Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Eye className="h-6 w-6 mb-2" />
                    Data Access Log
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Clock className="h-6 w-6 mb-2" />
                    System Performance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog */}
        <GenerateAuditReportDialog 
          open={generateReportDialogOpen} 
          onOpenChange={setGenerateReportDialogOpen} 
        />
      </div>
    </DashboardLayout>
  );
};

export default Audit;