import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Settings, 
  Shield, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  Zap,
  Database,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'pharmacy' | 'laboratory' | 'insurance' | 'payment' | 'communication' | 'ehr';
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  icon: React.ComponentType<{ className?: string }>;
  config: Record<string, any>;
  lastSync?: string;
  syncFrequency?: string;
}

const integrations: Integration[] = [
  {
    id: 'surescripts',
    name: 'Surescripts',
    description: 'Electronic prescribing and pharmacy network',
    category: 'pharmacy',
    status: 'connected',
    icon: Globe,
    config: {
      apiKey: '***************',
      environment: 'sandbox',
      enableRealTime: true,
      drugDatabase: 'rxnorm'
    },
    lastSync: '2024-01-15 09:30:00',
    syncFrequency: 'Real-time'
  },
  {
    id: 'quest',
    name: 'Quest Diagnostics',
    description: 'Laboratory test ordering and results',
    category: 'laboratory',
    status: 'connected',
    icon: Activity,
    config: {
      facilityId: 'QUEST001',
      apiEndpoint: 'https://api.questdiagnostics.com',
      enableHl7: true,
      resultFormat: 'HL7v2.5'
    },
    lastSync: '2024-01-15 08:15:00',
    syncFrequency: 'Every 15 minutes'
  },
  {
    id: 'aetna',
    name: 'Aetna Insurance',
    description: 'Insurance eligibility and claims processing',
    category: 'insurance',
    status: 'testing',
    icon: Shield,
    config: {
      providerId: 'AETNA123',
      submitterId: 'SUB001',
      enableRealTime: false,
      claimsFormat: 'X12_837'
    },
    lastSync: '2024-01-15 07:00:00',
    syncFrequency: 'Daily'
  },
  {
    id: 'stripe',
    name: 'Stripe Payments',
    description: 'Payment processing and billing',
    category: 'payment',
    status: 'connected',
    icon: Zap,
    config: {
      publishableKey: 'pk_test_***************',
      webhookSecret: 'whsec_***************',
      enableAutomaticTax: true,
      currency: 'USD'
    },
    lastSync: '2024-01-15 09:45:00',
    syncFrequency: 'Real-time'
  }
];

const statusColors = {
  connected: 'bg-green-500',
  disconnected: 'bg-gray-500',
  error: 'bg-red-500',
  testing: 'bg-yellow-500'
};

const statusIcons = {
  connected: CheckCircle,
  disconnected: AlertCircle,
  error: AlertCircle,
  testing: RefreshCw
};

export function ExternalServiceManager() {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const { toast } = useToast();

  const testConnection = async (integration: Integration) => {
    toast({
      title: "Testing Connection",
      description: `Testing connection to ${integration.name}...`,
    });
    
    // Simulate API test
    setTimeout(() => {
      toast({
        title: "Connection Test",
        description: `Connection to ${integration.name} successful`,
      });
    }, 2000);
  };

  const syncNow = async (integration: Integration) => {
    toast({
      title: "Syncing Data",
      description: `Initiating sync with ${integration.name}...`,
    });
  };

  const saveConfiguration = () => {
    if (selectedIntegration) {
      toast({
        title: "Configuration Saved",
        description: `Settings for ${selectedIntegration.name} have been updated`,
      });
      setIsConfiguring(false);
    }
  };

  const categories = Array.from(new Set(integrations.map(i => i.category)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          External Integrations
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage connections to external healthcare services and APIs
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Integrations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Service Integrations
              </CardTitle>
              <CardDescription>
                Configured external service connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={categories[0]} orientation="vertical">
                <TabsList className="grid w-full grid-cols-1 h-auto">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category} className="justify-start capitalize">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {categories.map((category) => (
                  <TabsContent key={category} value={category} className="mt-4 space-y-2">
                    {integrations
                      .filter(integration => integration.category === category)
                      .map((integration) => {
                        const StatusIcon = statusIcons[integration.status];
                        return (
                          <div
                            key={integration.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedIntegration?.id === integration.id ? 'bg-muted border-primary' : ''
                            }`}
                            onClick={() => setSelectedIntegration(integration)}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <integration.icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{integration.name}</span>
                              <StatusIcon className={`h-3 w-3 ${statusColors[integration.status].replace('bg-', 'text-')}`} />
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {integration.description}
                            </p>
                            <Badge 
                              variant="secondary" 
                              className={`${statusColors[integration.status]} text-white text-xs`}
                            >
                              {integration.status}
                            </Badge>
                          </div>
                        );
                      })}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Integration Details */}
        <div className="lg:col-span-2">
          {selectedIntegration ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <selectedIntegration.icon className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle>{selectedIntegration.name}</CardTitle>
                      <CardDescription>{selectedIntegration.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection(selectedIntegration)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncNow(selectedIntegration)}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Sync
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="configuration">Configuration</TabsTrigger>
                    <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={`${statusColors[selectedIntegration.status]} text-white`}
                          >
                            {selectedIntegration.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Category</Label>
                        <p className="text-sm capitalize">{selectedIntegration.category}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Last Sync</Label>
                        <p className="text-sm">{selectedIntegration.lastSync || 'Never'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Sync Frequency</Label>
                        <p className="text-sm">{selectedIntegration.syncFrequency || 'Manual'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Quick Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          View Logs
                        </Button>
                        <Button variant="outline" size="sm">
                          Test Connection
                        </Button>
                        <Button variant="outline" size="sm">
                          Sync Now
                        </Button>
                        <Button variant="outline" size="sm">
                          Reset Configuration
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="configuration" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Integration Settings</h4>
                      <Button
                        variant={isConfiguring ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsConfiguring(!isConfiguring)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        {isConfiguring ? 'Save' : 'Edit'}
                      </Button>
                    </div>

                    <div className="grid gap-4">
                      {Object.entries(selectedIntegration.config).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <Label className="text-sm font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </Label>
                          {typeof value === 'boolean' ? (
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={value}
                                disabled={!isConfiguring}
                              />
                              <span className="text-sm">{value ? 'Enabled' : 'Disabled'}</span>
                            </div>
                          ) : (
                            <Input
                              type={key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') ? 'password' : 'text'}
                              value={value}
                              disabled={!isConfiguring}
                              className="w-full"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {isConfiguring && (
                      <div className="flex gap-2">
                        <Button onClick={saveConfiguration}>
                          Save Configuration
                        </Button>
                        <Button variant="outline" onClick={() => setIsConfiguring(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="monitoring" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Connection Health</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Uptime</span>
                              <span className="text-green-600">99.9%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Response Time</span>
                              <span>125ms</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Error Rate</span>
                              <span className="text-red-600">0.1%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Data Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Requests Today</span>
                              <span>1,247</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Data Transferred</span>
                              <span>2.4 MB</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Rate Limit</span>
                              <span>5,000/hour</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-4">Recent Activity</h4>
                      <div className="space-y-2">
                        {[
                          { time: '10:30 AM', event: 'Successful sync - 24 records updated', status: 'success' },
                          { time: '09:15 AM', event: 'API rate limit warning - 80% threshold', status: 'warning' },
                          { time: '08:45 AM', event: 'Connection established', status: 'success' },
                          { time: '08:30 AM', event: 'Configuration updated', status: 'info' }
                        ].map((activity, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 rounded border">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.status === 'success' ? 'bg-green-500' :
                              activity.status === 'warning' ? 'bg-yellow-500' :
                              activity.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm">{activity.event}</p>
                              <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select an Integration</h3>
                  <p className="text-muted-foreground">
                    Choose an integration from the list to view its details and configuration
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}