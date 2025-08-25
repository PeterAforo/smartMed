import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Building2, 
  Link, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Plus,
  RefreshCw,
  Globe,
  Shield,
  Key,
  Database,
  Zap,
  Clock,
  Activity,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ExternalIntegrationsProps {
  tenantId?: string;
}

export const ExternalIntegrations: React.FC<ExternalIntegrationsProps> = ({ tenantId }) => {
  const { profile, currentBranch } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewIntegrationDialog, setShowNewIntegrationDialog] = useState(false);
  const [selectedIntegrationType, setSelectedIntegrationType] = useState('');
  const [configData, setConfigData] = useState<Record<string, string>>({});

  // Fetch current integrations
  const { data: integrations, isLoading: integrationsLoading } = useQuery({
    queryKey: ['external-integrations', profile?.tenant_id],
    queryFn: async () => {
      // Mock integration data
      return [
        {
          id: 'int_001',
          name: 'Epic Healthcare System',
          type: 'ehr',
          status: 'connected',
          lastSync: new Date('2024-01-20T10:30:00'),
          description: 'Electronic Health Records integration for patient data synchronization',
          endpoint: 'https://api.epic.com/fhir/r4',
          features: ['Patient Records', 'Appointments', 'Lab Results'],
          dataSync: {
            patientsLastSync: new Date('2024-01-20T10:30:00'),
            appointmentsLastSync: new Date('2024-01-20T10:25:00'),
            labResultsLastSync: new Date('2024-01-20T10:20:00')
          }
        },
        {
          id: 'int_002',
          name: 'LabCorp Integration',
          type: 'laboratory',
          status: 'connected',
          lastSync: new Date('2024-01-20T09:45:00'),
          description: 'Laboratory results integration with automatic result importing',
          endpoint: 'https://api.labcorp.com/v1',
          features: ['Lab Orders', 'Results', 'Status Updates'],
          dataSync: {
            ordersLastSync: new Date('2024-01-20T09:45:00'),
            resultsLastSync: new Date('2024-01-20T09:40:00')
          }
        },
        {
          id: 'int_003',
          name: 'CVS Pharmacy',
          type: 'pharmacy',
          status: 'error',
          lastSync: new Date('2024-01-19T16:00:00'),
          description: 'Prescription management and pharmacy integration',
          endpoint: 'https://api.cvs.com/pharmacy',
          features: ['Prescription Orders', 'Medication Status', 'Refill Requests'],
          error: 'Authentication failed - API key expired'
        },
        {
          id: 'int_004',
          name: 'Aetna Insurance',
          type: 'insurance',
          status: 'pending',
          lastSync: null,
          description: 'Insurance verification and claims processing',
          endpoint: 'https://api.aetna.com/insurance',
          features: ['Eligibility Verification', 'Claims Processing', 'Prior Authorization']
        },
        {
          id: 'int_005',
          name: 'Twilio SMS Service',
          type: 'communication',
          status: 'connected',
          lastSync: new Date('2024-01-20T11:00:00'),
          description: 'SMS messaging service for patient notifications',
          endpoint: 'https://api.twilio.com/2010-04-01',
          features: ['SMS Messaging', 'Delivery Status', 'Phone Verification']
        }
      ];
    },
    enabled: !!profile?.tenant_id
  });

  // Available integration types
  const integrationTypes = [
    {
      type: 'ehr',
      name: 'Electronic Health Records',
      icon: <Database className="h-5 w-5" />,
      description: 'Connect with EHR systems like Epic, Cerner, Allscripts',
      providers: ['Epic', 'Cerner', 'Allscripts', 'athenahealth', 'NextGen']
    },
    {
      type: 'laboratory',
      name: 'Laboratory Systems',
      icon: <Activity className="h-5 w-5" />,
      description: 'Integrate with lab providers for automated result importing',
      providers: ['LabCorp', 'Quest Diagnostics', 'BioReference', 'ARUP']
    },
    {
      type: 'pharmacy',
      name: 'Pharmacy Networks',
      icon: <Building2 className="h-5 w-5" />,
      description: 'Connect with pharmacy systems for prescription management',
      providers: ['CVS', 'Walgreens', 'Rite Aid', 'Express Scripts']
    },
    {
      type: 'insurance',
      name: 'Insurance Providers',
      icon: <Shield className="h-5 w-5" />,
      description: 'Verify eligibility and process claims automatically',
      providers: ['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealth', 'Humana']
    },
    {
      type: 'communication',
      name: 'Communication Services',
      icon: <Globe className="h-5 w-5" />,
      description: 'SMS, email, and voice communication services',
      providers: ['Twilio', 'SendGrid', 'Mailgun', 'Amazon SES']
    },
    {
      type: 'imaging',
      name: 'Medical Imaging',
      icon: <Zap className="h-5 w-5" />,
      description: 'DICOM and medical imaging system integrations',
      providers: ['Philips', 'GE Healthcare', 'Siemens', 'Canon Medical']
    }
  ];

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      // Simulate API call to test connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { status: 'success', message: 'Connection successful' };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Connection test passed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Connection test failed. Please check configuration.",
        variant: "destructive"
      });
    }
  });

  // Sync data mutation
  const syncDataMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      // Simulate API call to sync data
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { status: 'success', recordsProcessed: 150 };
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Data sync completed. ${data.recordsProcessed} records processed.`,
      });
      queryClient.invalidateQueries({ queryKey: ['external-integrations'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Data sync failed. Please try again.",
        variant: "destructive"
      });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'error': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            External Integrations
          </CardTitle>
          <Dialog open={showNewIntegrationDialog} onOpenChange={setShowNewIntegrationDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Integration</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Integration Type</Label>
                  <Select value={selectedIntegrationType} onValueChange={setSelectedIntegrationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select integration type" />
                    </SelectTrigger>
                    <SelectContent>
                      {integrationTypes.map((type) => (
                        <SelectItem key={type.type} value={type.type}>
                          <div className="flex items-center gap-2">
                            {type.icon}
                            {type.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedIntegrationType && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Provider</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            {integrationTypes
                              .find(t => t.type === selectedIntegrationType)
                              ?.providers.map((provider) => (
                                <SelectItem key={provider} value={provider.toLowerCase()}>
                                  {provider}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Environment</Label>
                        <Select defaultValue="production">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sandbox">Sandbox</SelectItem>
                            <SelectItem value="production">Production</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>API Endpoint</Label>
                      <Input placeholder="https://api.provider.com/v1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>API Key</Label>
                        <Input type="password" placeholder="Enter API key" />
                      </div>
                      <div className="space-y-2">
                        <Label>Client ID</Label>
                        <Input placeholder="Enter client ID" />
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewIntegrationDialog(false)}>
                    Cancel
                  </Button>
                  <Button>Add Integration</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Integrations</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {integrationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  integrations?.map((integration) => (
                    <Card key={integration.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              {integrationTypes.find(t => t.type === integration.type)?.icon}
                            </div>
                            <div>
                              <h4 className="font-medium">{integration.name}</h4>
                              <p className="text-sm text-muted-foreground">{integration.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadgeVariant(integration.status)}>
                              {integration.status}
                            </Badge>
                            {getStatusIcon(integration.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-xs text-muted-foreground">Type</span>
                            <p className="text-sm font-medium capitalize">{integration.type}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Last Sync</span>
                            <p className="text-sm font-medium">
                              {integration.lastSync ? format(integration.lastSync, 'MMM dd, HH:mm') : 'Never'}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Endpoint</span>
                            <p className="text-sm font-medium flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {new URL(integration.endpoint).hostname}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Features</span>
                            <p className="text-sm font-medium">{integration.features.length} active</p>
                          </div>
                        </div>

                        {integration.features && (
                          <div className="mb-4">
                            <span className="text-xs text-muted-foreground mb-2 block">Enabled Features</span>
                            <div className="flex flex-wrap gap-1">
                              {integration.features.map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {integration.error && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium text-red-700">Error</span>
                            </div>
                            <p className="text-sm text-red-600 mt-1">{integration.error}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => testConnectionMutation.mutate(integration.id)}
                              disabled={testConnectionMutation.isPending}
                            >
                              {testConnectionMutation.isPending ? (
                                <Clock className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Zap className="h-4 w-4 mr-1" />
                              )}
                              Test Connection
                            </Button>
                            {integration.status === 'connected' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => syncDataMutation.mutate(integration.id)}
                                disabled={syncDataMutation.isPending}
                              >
                                {syncDataMutation.isPending ? (
                                  <Clock className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4 mr-1" />
                                )}
                                Sync Now
                              </Button>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-1" />
                              Configure
                            </Button>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Logs
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="available" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {integrationTypes.map((type) => (
                <Card key={type.type}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        {type.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{type.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium mb-2 block">Supported Providers</span>
                      <div className="flex flex-wrap gap-1">
                        {type.providers.map((provider) => (
                          <Badge key={provider} variant="outline" className="text-xs">
                            {provider}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setSelectedIntegrationType(type.type);
                        setShowNewIntegrationDialog(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add {type.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Epic Healthcare System - Data Sync</span>
                  <Badge variant="outline">Success</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  Synchronized 45 patient records and 12 appointments
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date('2024-01-20T10:30:00'), 'MMM dd, yyyy HH:mm:ss')}
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="font-medium">CVS Pharmacy - Authentication</span>
                  <Badge variant="destructive">Failed</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  API authentication failed - invalid or expired API key
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date('2024-01-19T16:00:00'), 'MMM dd, yyyy HH:mm:ss')}
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">LabCorp Integration - Lab Results</span>
                  <Badge variant="outline">Success</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  Imported 23 new lab results
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date('2024-01-20T09:45:00'), 'MMM dd, yyyy HH:mm:ss')}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};