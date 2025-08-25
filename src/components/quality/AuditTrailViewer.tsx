import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  User,
  FileText,
  Lock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

const auditTrailData = [
  {
    id: 'audit_001',
    timestamp: '2024-02-28T14:30:00Z',
    user: 'Dr. Sarah Johnson',
    userId: 'user_123',
    action: 'PATIENT_RECORD_ACCESSED',
    resource: 'Patient Record',
    resourceId: 'patient_456',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    outcome: 'SUCCESS',
    details: 'Accessed patient medical history for appointment review',
    riskLevel: 'low',
    compliance: ['HIPAA', 'SOX']
  },
  {
    id: 'audit_002',
    timestamp: '2024-02-28T14:25:00Z',
    user: 'Admin User',
    userId: 'admin_001',
    action: 'USER_PERMISSION_MODIFIED',
    resource: 'User Account',
    resourceId: 'user_789',
    ipAddress: '192.168.1.50',
    userAgent: 'Mozilla/5.0 (macOS; Intel Mac OS X 10_15_7)',
    outcome: 'SUCCESS',
    details: 'Updated user role from Nurse to Senior Nurse',
    riskLevel: 'medium',
    compliance: ['RBAC', 'SOD']
  },
  {
    id: 'audit_003',
    timestamp: '2024-02-28T14:20:00Z',
    user: 'System',
    userId: 'system',
    action: 'LOGIN_FAILED',
    resource: 'Authentication System',
    resourceId: 'auth_001',
    ipAddress: '203.0.113.1',
    userAgent: 'Unknown',
    outcome: 'FAILURE',
    details: 'Multiple failed login attempts detected',
    riskLevel: 'high',
    compliance: ['SECURITY', 'ACCESS_CONTROL']
  },
  {
    id: 'audit_004',
    timestamp: '2024-02-28T14:15:00Z',
    user: 'Nurse Mary Smith',
    userId: 'nurse_456',
    action: 'MEDICATION_ADMINISTERED',
    resource: 'Medication Record',
    resourceId: 'med_789',
    ipAddress: '192.168.1.75',
    userAgent: 'Mobile App v2.1.0',
    outcome: 'SUCCESS',
    details: 'Administered prescribed medication to patient',
    riskLevel: 'low',
    compliance: ['MEDICATION_SAFETY', 'DOCUMENTATION']
  },
  {
    id: 'audit_005',
    timestamp: '2024-02-28T14:10:00Z',
    user: 'Dr. Michael Brown',
    userId: 'doc_789',
    action: 'PRESCRIPTION_CREATED',
    resource: 'Prescription',
    resourceId: 'rx_123',
    ipAddress: '192.168.1.120',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    outcome: 'SUCCESS',
    details: 'Created new prescription for patient treatment',
    riskLevel: 'low',
    compliance: ['DEA', 'PRESCRIPTION_MONITORING']
  }
];

const riskLevelColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const outcomeIcons = {
  SUCCESS: <CheckCircle className="h-4 w-4 text-green-500" />,
  FAILURE: <XCircle className="h-4 w-4 text-red-500" />,
  WARNING: <AlertCircle className="h-4 w-4 text-yellow-500" />
};

export const AuditTrailViewer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [selectedAuditLog, setSelectedAuditLog] = useState<any>(null);

  const filteredData = auditTrailData.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesRisk = filterRisk === 'all' || log.riskLevel === filterRisk;
    
    return matchesSearch && matchesAction && matchesRisk;
  });

  const uniqueActions = Array.from(new Set(auditTrailData.map(log => log.action)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Trail Viewer</h2>
          <p className="text-muted-foreground">
            View and analyze system access logs and user activities
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Audit Logs</CardTitle>
                  <CardDescription>
                    Complete record of system access and user activities
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {uniqueActions.map(action => (
                        <SelectItem key={action} value={action}>{action}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterRisk} onValueChange={setFilterRisk}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{log.user}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{log.resource}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {outcomeIcons[log.outcome as keyof typeof outcomeIcons]}
                          <span>{log.outcome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={riskLevelColors[log.riskLevel as keyof typeof riskLevelColors]}>
                          {log.riskLevel.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedAuditLog(log)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Audit Log Details</DialogTitle>
                              <DialogDescription>
                                Complete information for audit log {log.id}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedAuditLog && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Timestamp</label>
                                    <p className="text-sm font-mono">{format(new Date(selectedAuditLog.timestamp), 'PPpp')}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">User</label>
                                    <p className="text-sm">{selectedAuditLog.user} ({selectedAuditLog.userId})</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Action</label>
                                    <p className="text-sm font-mono">{selectedAuditLog.action}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Resource</label>
                                    <p className="text-sm">{selectedAuditLog.resource} ({selectedAuditLog.resourceId})</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">IP Address</label>
                                    <p className="text-sm font-mono">{selectedAuditLog.ipAddress}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Risk Level</label>
                                    <Badge className={riskLevelColors[selectedAuditLog.riskLevel as keyof typeof riskLevelColors]}>
                                      {selectedAuditLog.riskLevel.toUpperCase()}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Details</label>
                                  <p className="text-sm text-muted-foreground">{selectedAuditLog.details}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">User Agent</label>
                                  <p className="text-xs font-mono text-muted-foreground">{selectedAuditLog.userAgent}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Compliance Tags</label>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {selectedAuditLog.compliance.map((tag: string) => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events Today</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditTrailData.length}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk Events</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {auditTrailData.filter(log => log.riskLevel === 'high').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Require review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Attempts</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {auditTrailData.filter(log => log.outcome === 'FAILURE').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Security incidents
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activity Analytics</CardTitle>
              <CardDescription>Detailed breakdown of system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Activity charts and analytics would be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Mapping</CardTitle>
              <CardDescription>
                How audit logs map to regulatory compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['HIPAA', 'SOX', 'RBAC', 'SOD', 'SECURITY'].map((standard) => {
                  const relatedLogs = auditTrailData.filter(log => 
                    log.compliance.includes(standard)
                  );
                  return (
                    <div key={standard} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{standard}</div>
                          <div className="text-sm text-muted-foreground">
                            {relatedLogs.length} related events today
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {relatedLogs.length} events
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};