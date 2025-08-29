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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Cloud, 
  Server, 
  Database,
  Monitor,
  Zap,
  Globe,
  Lock,
  CheckCircle,
  AlertTriangle,
  Package,
  Settings,
  Rocket,
  Shield,
  BarChart3,
  Users,
  Timer,
  HardDrive
} from 'lucide-react';

const ProductionReadiness = () => {
  const [deploymentStage, setDeploymentStage] = useState('staging');
  const [autoScaling, setAutoScaling] = useState(true);
  const [monitoring, setMonitoring] = useState(true);

  const readinessChecks = [
    {
      category: 'Security',
      items: [
        { name: 'SSL Certificate', status: 'complete', description: 'Valid SSL certificate configured' },
        { name: 'API Security', status: 'complete', description: 'Rate limiting and authentication enabled' },
        { name: 'Data Encryption', status: 'complete', description: 'All sensitive data encrypted' },
        { name: 'Access Controls', status: 'warning', description: 'Review user permissions' }
      ]
    },
    {
      category: 'Performance',
      items: [
        { name: 'Database Optimization', status: 'complete', description: 'Indexes and query optimization complete' },
        { name: 'Caching Strategy', status: 'complete', description: 'Redis caching implemented' },
        { name: 'CDN Configuration', status: 'pending', description: 'Content delivery network setup required' },
        { name: 'Image Optimization', status: 'complete', description: 'WebP format and compression enabled' }
      ]
    },
    {
      category: 'Monitoring',
      items: [
        { name: 'Error Tracking', status: 'complete', description: 'Comprehensive error logging enabled' },
        { name: 'Performance Monitoring', status: 'complete', description: 'Real-time performance metrics' },
        { name: 'Health Checks', status: 'complete', description: 'Automated health monitoring' },
        { name: 'Alerting System', status: 'warning', description: 'Configure critical alerts' }
      ]
    },
    {
      category: 'Compliance',
      items: [
        { name: 'HIPAA Compliance', status: 'complete', description: 'Healthcare data protection measures' },
        { name: 'Data Backup', status: 'complete', description: 'Automated backup procedures' },
        { name: 'Audit Logging', status: 'complete', description: 'Complete audit trail implementation' },
        { name: 'Disaster Recovery', status: 'pending', description: 'Recovery procedures documentation needed' }
      ]
    }
  ];

  const deploymentEnvironments = [
    {
      name: 'Development',
      url: 'https://dev.smartmed.app',
      status: 'active',
      lastDeploy: '2 hours ago',
      version: '2.1.4-dev',
      uptime: '99.2%'
    },
    {
      name: 'Staging',
      url: 'https://staging.smartmed.app',
      status: 'active',
      lastDeploy: '1 day ago',
      version: '2.1.3',
      uptime: '99.8%'
    },
    {
      name: 'Production',
      url: 'https://smartmed.app',
      status: 'active',
      lastDeploy: '3 days ago',
      version: '2.1.2',
      uptime: '99.9%'
    }
  ];

  const performanceMetrics = [
    { label: 'Load Time', value: '1.2s', target: '<2s', status: 'good' },
    { label: 'Time to Interactive', value: '2.8s', target: '<3s', status: 'good' },
    { label: 'First Contentful Paint', value: '0.9s', target: '<1.5s', status: 'excellent' },
    { label: 'Largest Contentful Paint', value: '2.1s', target: '<2.5s', status: 'good' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'pending': return <Timer className="h-4 w-4 text-red-500" />;
      default: return <Timer className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete': return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Complete</Badge>;
      case 'warning': return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Warning</Badge>;
      case 'pending': return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Pending</Badge>;
      case 'active': return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>;
      case 'excellent': return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Excellent</Badge>;
      case 'good': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Good</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCompletionPercentage = (category: any) => {
    const completed = category.items.filter((item: any) => item.status === 'complete').length;
    return Math.round((completed / category.items.length) * 100);
  };

  const overallReadiness = () => {
    const allItems = readinessChecks.flatMap(category => category.items);
    const completed = allItems.filter(item => item.status === 'complete').length;
    return Math.round((completed / allItems.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Overall Readiness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Production Readiness Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{overallReadiness()}%</span>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Ready for Production</p>
                <p className="text-xs text-green-600">Above 85% threshold</p>
              </div>
            </div>
            <Progress value={overallReadiness()} className="h-3" />
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your healthcare management system is production-ready! Complete remaining tasks for optimal performance.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="readiness" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="readiness">Readiness Checks</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="readiness" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {readinessChecks.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{category.category}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{getCompletionPercentage(category)}%</span>
                      <Progress value={getCompletionPercentage(category)} className="w-16 h-2" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      {getStatusIcon(item.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium">{item.name}</h4>
                          {getStatusBadge(item.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="environments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Deployment Environments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deploymentEnvironments.map((env, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{env.name}</h3>
                        <p className="text-sm text-muted-foreground">{env.url}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(env.status)}
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Version: </span>
                        <span className="font-medium">{env.version}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Deploy: </span>
                        <span className="font-medium">{env.lastDeploy}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Uptime: </span>
                        <span className="font-medium text-green-600">{env.uptime}</span>
                      </div>
                      <div className="text-right">
                        <Button size="sm" variant="outline">
                          Deploy
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Core Web Vitals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{metric.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{metric.value}</span>
                        {getStatusBadge(metric.status)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">Target: {metric.target}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Resource Utilization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium">62%</span>
                  </div>
                  <Progress value={62} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Database Connections</span>
                    <span className="text-sm font-medium">78/100</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Storage Usage</span>
                    <span className="text-sm font-medium">34%</span>
                  </div>
                  <Progress value={34} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monitoring Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Monitoring Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Application Monitoring</p>
                    <p className="text-xs text-muted-foreground">Track application performance and errors</p>
                  </div>
                  <Switch checked={monitoring} onCheckedChange={setMonitoring} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Database Monitoring</p>
                    <p className="text-xs text-muted-foreground">Monitor query performance and connections</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Infrastructure Monitoring</p>
                    <p className="text-xs text-muted-foreground">CPU, memory, and disk usage tracking</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Security Monitoring</p>
                    <p className="text-xs text-muted-foreground">Detect and alert on security threats</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Alerting Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alert Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="errorThreshold">Error Rate Threshold (%)</Label>
                  <Input id="errorThreshold" type="number" defaultValue="5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responseTime">Response Time Threshold (ms)</Label>
                  <Input id="responseTime" type="number" defaultValue="2000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpuThreshold">CPU Usage Threshold (%)</Label>
                  <Input id="cpuThreshold" type="number" defaultValue="80" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alertEmail">Alert Email</Label>
                  <Input id="alertEmail" type="email" placeholder="admin@smartmed.app" />
                </div>
                <Button className="w-full">Save Alert Settings</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deployment Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Deployment Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deployStage">Deployment Stage</Label>
                  <Select value={deploymentStage} onValueChange={setDeploymentStage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto Scaling</p>
                    <p className="text-xs text-muted-foreground">Automatically scale based on load</p>
                  </div>
                  <Switch checked={autoScaling} onCheckedChange={setAutoScaling} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Blue-Green Deployment</p>
                    <p className="text-xs text-muted-foreground">Zero-downtime deployments</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Rollback on Failure</p>
                    <p className="text-xs text-muted-foreground">Automatic rollback if deployment fails</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Button className="w-full">
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy to {deploymentStage}
                </Button>
              </CardContent>
            </Card>

            {/* Production Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Pre-Production Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Environment variables configured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Database migrations applied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">SSL certificate installed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Load testing completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">CDN configuration pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Disaster recovery plan needed</span>
                  </div>
                </div>
                
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Complete all checklist items before production deployment for optimal security and performance.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionReadiness;