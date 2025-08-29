import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Webhook, 
  Plus, 
  Settings, 
  Play, 
  Pause,
  Trash2,
  Eye,
  Copy,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'error';
  secret: string;
  retryAttempts: number;
  timeout: number;
  lastDelivery?: string;
  successRate: number;
  createdAt: string;
  description?: string;
}

const webhookEvents = [
  { id: 'patient.created', name: 'Patient Created', description: 'Triggered when a new patient is registered' },
  { id: 'patient.updated', name: 'Patient Updated', description: 'Triggered when patient information is modified' },
  { id: 'appointment.scheduled', name: 'Appointment Scheduled', description: 'Triggered when an appointment is booked' },
  { id: 'appointment.cancelled', name: 'Appointment Cancelled', description: 'Triggered when an appointment is cancelled' },
  { id: 'appointment.completed', name: 'Appointment Completed', description: 'Triggered when an appointment is marked complete' },
  { id: 'payment.received', name: 'Payment Received', description: 'Triggered when a payment is processed' },
  { id: 'lab.result.ready', name: 'Lab Result Ready', description: 'Triggered when lab results are available' },
  { id: 'prescription.filled', name: 'Prescription Filled', description: 'Triggered when a prescription is dispensed' },
  { id: 'alert.created', name: 'Alert Created', description: 'Triggered when a system alert is generated' },
  { id: 'invoice.generated', name: 'Invoice Generated', description: 'Triggered when an invoice is created' }
];

const sampleWebhooks: WebhookEndpoint[] = [
  {
    id: '1',
    name: 'Patient Portal Notifications',
    url: 'https://api.mypatientportal.com/webhooks/smartmed',
    events: ['patient.created', 'appointment.scheduled', 'lab.result.ready'],
    status: 'active',
    secret: 'whsec_***************',
    retryAttempts: 3,
    timeout: 30,
    lastDelivery: '2024-01-15 10:30:00',
    successRate: 98.5,
    createdAt: '2024-01-01 09:00:00',
    description: 'Sends notifications to patient portal for appointment and result updates'
  },
  {
    id: '2',
    name: 'Billing System Integration',
    url: 'https://billing.healthcare.com/api/webhooks/events',
    events: ['appointment.completed', 'payment.received', 'invoice.generated'],
    status: 'active',
    secret: 'whsec_***************',
    retryAttempts: 5,
    timeout: 45,
    lastDelivery: '2024-01-15 10:25:00',
    successRate: 99.2,
    createdAt: '2024-01-01 08:30:00',
    description: 'Synchronizes billing events with external accounting system'
  },
  {
    id: '3',
    name: 'Pharmacy Integration',
    url: 'https://pharmacy.example.com/webhooks/prescriptions',
    events: ['prescription.filled'],
    status: 'error',
    secret: 'whsec_***************',
    retryAttempts: 3,
    timeout: 30,
    lastDelivery: '2024-01-15 08:15:00',
    successRate: 85.4,
    createdAt: '2024-01-01 10:00:00',
    description: 'Notifies pharmacy when prescriptions are ready for pickup'
  }
];

export function WebhookManager() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(sampleWebhooks);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newWebhook, setNewWebhook] = useState<Partial<WebhookEndpoint>>({
    name: '',
    url: '',
    events: [],
    retryAttempts: 3,
    timeout: 30,
    status: 'active'
  });
  const { toast } = useToast();

  const statusColors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    error: 'bg-red-500'
  };

  const statusIcons = {
    active: CheckCircle,
    inactive: Pause,
    error: AlertCircle
  };

  const createWebhook = () => {
    if (!newWebhook.name || !newWebhook.url || !newWebhook.events?.length) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const webhook: WebhookEndpoint = {
      id: Date.now().toString(),
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events,
      status: 'active',
      secret: `whsec_${Math.random().toString(36).substring(2, 15)}`,
      retryAttempts: newWebhook.retryAttempts || 3,
      timeout: newWebhook.timeout || 30,
      successRate: 0,
      createdAt: new Date().toISOString(),
      description: newWebhook.description
    };

    setWebhooks([...webhooks, webhook]);
    setNewWebhook({
      name: '',
      url: '',
      events: [],
      retryAttempts: 3,
      timeout: 30,
      status: 'active'
    });
    setIsCreating(false);

    toast({
      title: "Webhook Created",
      description: `${webhook.name} has been created successfully`,
    });
  };

  const testWebhook = async (webhook: WebhookEndpoint) => {
    toast({
      title: "Testing Webhook",
      description: `Sending test payload to ${webhook.name}...`,
    });

    // Simulate webhook test
    setTimeout(() => {
      toast({
        title: "Webhook Test",
        description: `Test payload sent successfully to ${webhook.name}`,
      });
    }, 2000);
  };

  const toggleWebhook = (id: string) => {
    setWebhooks(webhooks.map(webhook => 
      webhook.id === id 
        ? { ...webhook, status: webhook.status === 'active' ? 'inactive' : 'active' }
        : webhook
    ));
  };

  const deleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter(webhook => webhook.id !== id));
    if (selectedWebhook?.id === id) {
      setSelectedWebhook(null);
    }
    toast({
      title: "Webhook Deleted",
      description: "Webhook has been removed successfully",
    });
  };

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    toast({
      title: "Copied",
      description: "Webhook secret copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Webhook Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configure and monitor webhook endpoints for real-time event notifications
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Webhook</CardTitle>
            <CardDescription>
              Configure a new webhook endpoint to receive event notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="webhook-name">Name *</Label>
                <Input
                  id="webhook-name"
                  placeholder="e.g., Patient Portal Notifications"
                  value={newWebhook.name || ''}
                  onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Endpoint URL *</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://api.example.com/webhooks"
                  value={newWebhook.url || ''}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe what this webhook is used for..."
                value={newWebhook.description || ''}
                onChange={(e) => setNewWebhook({ ...newWebhook, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Events to Subscribe *</Label>
              <div className="grid gap-2 md:grid-cols-2">
                {webhookEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-2 p-2 border rounded">
                    <input
                      type="checkbox"
                      id={event.id}
                      checked={newWebhook.events?.includes(event.id) || false}
                      onChange={(e) => {
                        const currentEvents = newWebhook.events || [];
                        if (e.target.checked) {
                          setNewWebhook({ ...newWebhook, events: [...currentEvents, event.id] });
                        } else {
                          setNewWebhook({ ...newWebhook, events: currentEvents.filter(id => id !== event.id) });
                        }
                      }}
                      className="rounded"
                    />
                    <label htmlFor={event.id} className="text-sm cursor-pointer">
                      <div className="font-medium">{event.name}</div>
                      <div className="text-xs text-muted-foreground">{event.description}</div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="retry-attempts">Retry Attempts</Label>
                <Input
                  id="retry-attempts"
                  type="number"
                  min="1"
                  max="10"
                  value={newWebhook.retryAttempts || 3}
                  onChange={(e) => setNewWebhook({ ...newWebhook, retryAttempts: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (seconds)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min="5"
                  max="300"
                  value={newWebhook.timeout || 30}
                  onChange={(e) => setNewWebhook({ ...newWebhook, timeout: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={createWebhook}>Create Webhook</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Webhooks List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook Endpoints
              </CardTitle>
              <CardDescription>
                Configured webhook endpoints ({webhooks.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {webhooks.map((webhook) => {
                  const StatusIcon = statusIcons[webhook.status];
                  return (
                    <div
                      key={webhook.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedWebhook?.id === webhook.id ? 'bg-muted border-primary' : ''
                      }`}
                      onClick={() => setSelectedWebhook(webhook)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium truncate">{webhook.name}</span>
                        <StatusIcon className={`h-3 w-3 ${statusColors[webhook.status].replace('bg-', 'text-')}`} />
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 truncate">
                        {webhook.url}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="secondary" 
                          className={`${statusColors[webhook.status]} text-white text-xs`}
                        >
                          {webhook.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {webhook.successRate}% success
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Webhook Details */}
        <div className="lg:col-span-2">
          {selectedWebhook ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Webhook className="h-5 w-5" />
                      {selectedWebhook.name}
                    </CardTitle>
                    <CardDescription>{selectedWebhook.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testWebhook(selectedWebhook)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleWebhook(selectedWebhook.id)}
                    >
                      {selectedWebhook.status === 'active' ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Disable
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Enable
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteWebhook(selectedWebhook.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge 
                          variant="secondary" 
                          className={`${statusColors[selectedWebhook.status]} text-white`}
                        >
                          {selectedWebhook.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Success Rate</Label>
                        <p className="text-sm">{selectedWebhook.successRate}%</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Last Delivery</Label>
                        <p className="text-sm">{selectedWebhook.lastDelivery || 'Never'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Created</Label>
                        <p className="text-sm">{selectedWebhook.createdAt}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Endpoint URL</Label>
                      <div className="flex items-center gap-2">
                        <Input value={selectedWebhook.url} readOnly />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(selectedWebhook.url)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Webhook Secret</Label>
                      <div className="flex items-center gap-2">
                        <Input value={selectedWebhook.secret} type="password" readOnly />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copySecret(selectedWebhook.secret)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="events" className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-4">Subscribed Events ({selectedWebhook.events.length})</h4>
                      <div className="space-y-2">
                        {selectedWebhook.events.map((eventId) => {
                          const event = webhookEvents.find(e => e.id === eventId);
                          return (
                            <div key={eventId} className="p-3 border rounded-lg">
                              <div className="font-medium text-sm">{event?.name}</div>
                              <div className="text-xs text-muted-foreground">{event?.description}</div>
                              <code className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">
                                {eventId}
                              </code>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="deliveries" className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-4">Recent Deliveries</h4>
                      <div className="space-y-2">
                        {[
                          { time: '10:30 AM', event: 'patient.created', status: 'success', responseTime: '125ms' },
                          { time: '10:25 AM', event: 'appointment.scheduled', status: 'success', responseTime: '89ms' },
                          { time: '10:20 AM', event: 'payment.received', status: 'failed', responseTime: '30000ms' },
                          { time: '10:15 AM', event: 'lab.result.ready', status: 'success', responseTime: '156ms' }
                        ].map((delivery, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                delivery.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              <div>
                                <p className="text-sm font-medium">{delivery.event}</p>
                                <p className="text-xs text-muted-foreground">{delivery.time}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={delivery.status === 'success' ? 'default' : 'destructive'}>
                                {delivery.status}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">{delivery.responseTime}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="retry-attempts">Retry Attempts</Label>
                        <Input
                          id="retry-attempts"
                          type="number"
                          min="1"
                          max="10"
                          value={selectedWebhook.retryAttempts}
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timeout">Timeout (seconds)</Label>
                        <Input
                          id="timeout"
                          type="number"
                          value={selectedWebhook.timeout}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          Regenerate Secret
                        </Button>
                        <Button variant="outline" size="sm">
                          Update Configuration
                        </Button>
                        <Button variant="outline" size="sm">
                          View Delivery Logs
                        </Button>
                        <Button variant="outline" size="sm">
                          Export Event History
                        </Button>
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
                  <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Webhook</h3>
                  <p className="text-muted-foreground">
                    Choose a webhook from the list to view its details and configuration
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