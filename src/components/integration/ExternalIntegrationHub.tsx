import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Webhook, 
  Globe, 
  Key,
  Shield,
  Zap,
  Server,
  Database,
  Cloud,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Settings,
  Plus,
  Trash2,
  Play,
  Pause
} from 'lucide-react';

const ExternalIntegrationHub = () => {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  const integrations = [
    {
      id: '1',
      name: 'HL7 FHIR Gateway',
      description: 'Healthcare data exchange protocol',
      status: 'active',
      type: 'healthcare',
      endpoint: 'https://api.smartmed.com/fhir',
      lastSync: '2 minutes ago',
      successRate: 99.5,
      icon: Database
    },
    {
      id: '2',
      name: 'Insurance Claims API',
      description: 'Automated insurance claim processing',
      status: 'active',
      type: 'insurance',
      endpoint: 'https://api.insurance.com/claims',
      lastSync: '5 minutes ago',
      successRate: 97.8,
      icon: Shield
    },
    {
      id: '3',
      name: 'Lab Results Integration',
      description: 'Real-time laboratory results',
      status: 'warning',
      type: 'laboratory',
      endpoint: 'https://lab.example.com/api',
      lastSync: '1 hour ago',
      successRate: 89.2,
      icon: Server
    },
    {
      id: '4',
      name: 'Pharmacy Network',
      description: 'Prescription fulfillment network',
      status: 'inactive',
      type: 'pharmacy',
      endpoint: 'https://pharmacy.network/api',
      lastSync: 'Never',
      successRate: 0,
      icon: Globe
    }
  ];

  const webhooks = [
    {
      id: '1',
      name: 'Patient Registration',
      url: 'https://external.system.com/webhooks/patient',
      events: ['patient.created', 'patient.updated'],
      status: 'active',
      deliveries: 1247,
      failures: 3
    },
    {
      id: '2',
      name: 'Appointment Notifications',
      url: 'https://notification.service.com/appointments',
      events: ['appointment.scheduled', 'appointment.cancelled'],
      status: 'active',
      deliveries: 2890,
      failures: 12
    },
    {
      id: '3',
      name: 'Billing Updates',
      url: 'https://billing.system.com/updates',
      events: ['invoice.created', 'payment.received'],
      status: 'warning',
      deliveries: 456,
      failures: 23
    }
  ];

  const apiEndpoints = [
    {
      path: '/api/v1/patients',
      method: 'GET',
      description: 'Retrieve patient information',
      rateLimit: '1000/hour',
      authentication: 'API Key',
      status: 'active'
    },
    {
      path: '/api/v1/appointments',
      method: 'POST',
      description: 'Create new appointment',
      rateLimit: '500/hour',
      authentication: 'OAuth 2.0',
      status: 'active'
    },
    {
      path: '/api/v1/medical-records',
      method: 'GET',
      description: 'Access medical records',
      rateLimit: '200/hour',
      authentication: 'API Key + HIPAA',
      status: 'active'
    },
    {
      path: '/api/v1/lab-results',
      method: 'POST',
      description: 'Submit lab results',
      rateLimit: '100/hour',
      authentication: 'Client Certificate',
      status: 'beta'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'inactive': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'beta': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>;
      case 'warning': return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Warning</Badge>;
      case 'inactive': return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Inactive</Badge>;
      case 'beta': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Beta</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      GET: 'bg-green-500/10 text-green-600 border-green-500/20',
      POST: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      PUT: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      DELETE: 'bg-red-500/10 text-red-600 border-red-500/20'
    };
    return <Badge className={colors[method as keyof typeof colors] || 'bg-gray-500/10 text-gray-600 border-gray-500/20'}>{method}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="integrations">External APIs</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">External Integrations</h3>
              <p className="text-sm text-muted-foreground">Manage third-party system connections</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {integrations.map((integration) => {
              const IconComponent = integration.icon;
              return (
                <Card key={integration.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle className="text-base">{integration.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      {getStatusIcon(integration.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      {getStatusBadge(integration.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Success Rate</span>
                      <span className="text-sm font-medium">{integration.successRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Sync</span>
                      <span className="text-sm font-medium">{integration.lastSync}</span>
                    </div>
                    <div className="text-xs text-muted-foreground break-all">
                      {integration.endpoint}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline">
                        {integration.status === 'active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Webhook Management</h3>
              <p className="text-sm text-muted-foreground">Configure outbound notifications</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Active Webhooks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{webhook.name}</h4>
                        <p className="text-sm text-muted-foreground">{webhook.url}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(webhook.status)}
                        <Button size="sm" variant="ghost">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Events: </span>
                        <span className="font-medium">{webhook.events.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Deliveries: </span>
                        <span className="font-medium">{webhook.deliveries.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Failures: </span>
                        <span className="font-medium text-red-600">{webhook.failures}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success Rate: </span>
                        <span className="font-medium text-green-600">
                          {((webhook.deliveries - webhook.failures) / webhook.deliveries * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-1">Events:</p>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{event}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">API Endpoints</h3>
              <p className="text-sm text-muted-foreground">Manage public API access</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Endpoint
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Available Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getMethodBadge(endpoint.method)}
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{endpoint.path}</code>
                        {getStatusBadge(endpoint.status)}
                      </div>
                      <Button size="sm" variant="ghost">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{endpoint.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Rate Limit: </span>
                        <span className="font-medium">{endpoint.rateLimit}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Auth: </span>
                        <span className="font-medium">{endpoint.authentication}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status: </span>
                        <span className="font-medium capitalize">{endpoint.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Master API Key</Label>
                  <Input id="apiKey" type="password" value="sk_test_..." readOnly />
                  <Button size="sm" variant="outline">Regenerate Key</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Rate Limiting</p>
                    <p className="text-xs text-muted-foreground">Protect against API abuse</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">IP Whitelisting</p>
                    <p className="text-xs text-muted-foreground">Restrict access by IP address</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">CORS Protection</p>
                    <p className="text-xs text-muted-foreground">Control cross-origin requests</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Integration Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Integration Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="encryptionKey">Webhook Encryption Key</Label>
                  <Input id="encryptionKey" type="password" value="wh_..." readOnly />
                  <Button size="sm" variant="outline">Rotate Key</Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeout">Request Timeout (seconds)</Label>
                  <Input id="timeout" type="number" defaultValue="30" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="retries">Max Retry Attempts</Label>
                  <Input id="retries" type="number" defaultValue="3" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">SSL Verification</p>
                    <p className="text-xs text-muted-foreground">Verify SSL certificates</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExternalIntegrationHub;