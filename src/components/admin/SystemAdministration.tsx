import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Server, 
  Database, 
  Cpu, 
  HardDrive, 
  Network,
  Users,
  Activity,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Shield
} from 'lucide-react';

const SystemAdministration = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [backupEnabled, setBackupEnabled] = useState(true);

  const systemMetrics = [
    { label: 'CPU Usage', value: 45, unit: '%', status: 'good', icon: Cpu },
    { label: 'Memory Usage', value: 62, unit: '%', status: 'warning', icon: HardDrive },
    { label: 'Disk Usage', value: 78, unit: '%', status: 'warning', icon: Database },
    { label: 'Network I/O', value: 23, unit: 'MB/s', status: 'good', icon: Network }
  ];

  const services = [
    { name: 'Database Server', status: 'running', uptime: '15d 4h', cpu: 25, memory: 45 },
    { name: 'Web Server', status: 'running', uptime: '15d 4h', cpu: 15, memory: 30 },
    { name: 'Authentication Service', status: 'running', uptime: '15d 4h', cpu: 5, memory: 20 },
    { name: 'Backup Service', status: 'running', uptime: '15d 4h', cpu: 10, memory: 15 },
    { name: 'Notification Service', status: 'warning', uptime: '2h 15m', cpu: 8, memory: 25 }
  ];

  const systemLogs = [
    {
      id: '1',
      timestamp: '2024-01-15 10:30:00',
      level: 'INFO',
      service: 'Database',
      message: 'Daily backup completed successfully'
    },
    {
      id: '2',
      timestamp: '2024-01-15 10:25:00',
      level: 'WARNING',
      service: 'Memory',
      message: 'Memory usage exceeded 60% threshold'
    },
    {
      id: '3',
      timestamp: '2024-01-15 10:20:00',
      level: 'INFO',
      service: 'Auth',
      message: 'User session cleanup completed'
    },
    {
      id: '4',
      timestamp: '2024-01-15 10:15:00',
      level: 'ERROR',
      service: 'Notification',
      message: 'Failed to send email notification - retrying'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      case 'running': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running': return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Running</Badge>;
      case 'warning': return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Warning</Badge>;
      case 'stopped': return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Stopped</Badge>;
      case 'INFO': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Info</Badge>;
      case 'WARNING': return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Warning</Badge>;
      case 'ERROR': return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Error</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'INFO': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'WARNING': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'ERROR': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {systemMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{metric.label}</h3>
                  <IconComponent className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{metric.value}{metric.unit}</span>
                    {getStatusBadge(metric.status)}
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    All systems operational. No critical issues detected.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Uptime</span>
                    <span className="text-sm font-medium">15 days, 4 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Users</span>
                    <span className="text-sm font-medium">127 users</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database Connections</span>
                    <span className="text-sm font-medium">45/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Backup</span>
                    <span className="text-sm font-medium">2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Maintenance Mode</p>
                      <p className="text-xs text-muted-foreground">Temporarily disable user access</p>
                    </div>
                    <Switch
                      checked={maintenanceMode}
                      onCheckedChange={setMaintenanceMode}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Auto Backup</p>
                      <p className="text-xs text-muted-foreground">Automatic daily backups</p>
                    </div>
                    <Switch
                      checked={backupEnabled}
                      onCheckedChange={setBackupEnabled}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 pt-4">
                  <Button className="w-full" variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Create Manual Backup
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    System Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{service.name}</h3>
                        {getStatusBadge(service.status)}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">Restart</Button>
                        <Button variant="ghost" size="sm">Stop</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Uptime: </span>
                        <span className="font-medium">{service.uptime}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">CPU: </span>
                        <span className="font-medium">{service.cpu}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Memory: </span>
                        <span className="font-medium">{service.memory}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input placeholder="Search logs..." className="max-w-sm" />
                  <Button variant="outline">Refresh</Button>
                </div>

                <div className="space-y-2">
                  {systemLogs.map((log) => (
                    <div key={log.id} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        {getLevelIcon(log.level)}
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-1">
                            {getStatusBadge(log.level)}
                            <span className="text-sm font-medium">{log.service}</span>
                            <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                          </div>
                          <p className="text-sm">{log.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Maintenance Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                  <Input id="maintenanceMessage" placeholder="System will be down for maintenance..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenanceWindow">Maintenance Window</Label>
                  <Input id="maintenanceWindow" type="datetime-local" />
                </div>
                <Button>Schedule Maintenance</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Firewall Status</p>
                    <p className="text-xs text-muted-foreground">System firewall protection</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">SSL Certificate</p>
                    <p className="text-xs text-muted-foreground">Expires: March 15, 2024</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Valid</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Intrusion Detection</p>
                    <p className="text-xs text-muted-foreground">Real-time threat monitoring</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemAdministration;