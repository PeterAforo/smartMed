import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Server, Database, Key, Globe, Settings, Activity, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API = () => {
  const { toast } = useToast();

  // Mock API endpoints data
  const [apiEndpoints] = useState([
    {
      id: 1,
      method: 'GET',
      endpoint: '/api/v1/patients',
      description: 'Retrieve patient list',
      status: 'active',
      version: 'v1',
      requests24h: 1247,
      avgResponseTime: '125ms',
      successRate: 99.8,
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      method: 'POST',
      endpoint: '/api/v1/appointments',
      description: 'Create new appointment',
      status: 'active',
      version: 'v1',
      requests24h: 856,
      avgResponseTime: '210ms',
      successRate: 98.5,
      lastUpdated: '2024-01-12'
    },
    {
      id: 3,
      method: 'GET',
      endpoint: '/api/v1/medical-records/{id}',
      description: 'Get specific medical record',
      status: 'active',
      version: 'v1',
      requests24h: 2134,
      avgResponseTime: '95ms',
      successRate: 99.9,
      lastUpdated: '2024-01-10'
    },
    {
      id: 4,
      method: 'PUT',
      endpoint: '/api/v1/prescriptions/{id}',
      description: 'Update prescription details',
      status: 'deprecated',
      version: 'v1',
      requests24h: 45,
      avgResponseTime: '180ms',
      successRate: 95.2,
      lastUpdated: '2023-12-20'
    }
  ]);

  // Mock API keys data
  const [apiKeys] = useState([
    {
      id: 1,
      name: 'Mobile App - iOS',
      keyPrefix: 'hms_ios_...',
      permissions: ['read:patients', 'read:appointments', 'write:appointments'],
      status: 'active',
      createdDate: '2024-01-10',
      lastUsed: '2024-01-18 09:30:00',
      requests30d: 45230
    },
    {
      id: 2,
      name: 'Third-party Integration',
      keyPrefix: 'hms_3rd_...',
      permissions: ['read:patients', 'read:medical-records'],
      status: 'active',
      createdDate: '2024-01-05',
      lastUsed: '2024-01-18 08:15:00',
      requests30d: 12450
    },
    {
      id: 3,
      name: 'Analytics Dashboard',
      keyPrefix: 'hms_analytics_...',
      permissions: ['read:analytics', 'read:reports'],
      status: 'active',
      createdDate: '2023-12-15',
      lastUsed: '2024-01-17 14:20:00',
      requests30d: 8920
    }
  ]);

  const [apiStats] = useState({
    totalEndpoints: 28,
    activeEndpoints: 25,
    deprecatedEndpoints: 3,
    totalRequests: 156420,
    averageResponseTime: '145ms',
    uptime: 99.95
  });

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-500 text-white';
      case 'POST': return 'bg-blue-500 text-white';
      case 'PUT': return 'bg-yellow-500 text-white';
      case 'DELETE': return 'bg-red-500 text-white';
      case 'PATCH': return 'bg-purple-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'deprecated': return 'bg-yellow-500 text-white';
      case 'disabled': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleCreateApiKey = () => {
    toast({
      title: "API Key Created",
      description: "New API key has been generated successfully.",
    });
  };

  const handleRevokeApiKey = (keyId: number) => {
    toast({
      title: "API Key Revoked",
      description: "API key has been revoked and is no longer valid.",
      variant: "destructive",
    });
  };

  const handleTestEndpoint = (endpointId: number) => {
    toast({
      title: "Testing Endpoint",
      description: "API endpoint test initiated...",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">API Management</h1>
          <p className="text-muted-foreground">
            REST API endpoints, authentication keys, and integration management
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiStats.totalEndpoints}</div>
              <p className="text-xs text-muted-foreground">
                {apiStats.activeEndpoints} active, {apiStats.deprecatedEndpoints} deprecated
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiStats.totalRequests.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiStats.averageResponseTime}</div>
              <p className="text-xs text-muted-foreground">
                Across all endpoints
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Uptime</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{apiStats.uptime}%</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiKeys.filter(key => key.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">
                API keys in use
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">0.8%</div>
              <p className="text-xs text-muted-foreground">
                4xx/5xx errors
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="endpoints" className="space-y-4">
          <TabsList>
            <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints Management</CardTitle>
                <CardDescription>
                  Manage REST API endpoints, versions, and performance metrics
                </CardDescription>
                <Button>
                  <Code className="mr-2 h-4 w-4" />
                  Create New Endpoint
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiEndpoints.map((endpoint) => (
                    <div key={endpoint.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge className={getMethodColor(endpoint.method)}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {endpoint.endpoint}
                          </code>
                          <Badge className={getStatusColor(endpoint.status)}>
                            {endpoint.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {endpoint.version}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" onClick={() => handleTestEndpoint(endpoint.id)}>
                            Test
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            Docs
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{endpoint.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Requests (24h):</span>
                          <div className="text-lg font-bold text-blue-600">{endpoint.requests24h.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="font-medium">Avg Response Time:</span>
                          <div className="text-lg font-bold text-green-600">{endpoint.avgResponseTime}</div>
                        </div>
                        <div>
                          <span className="font-medium">Success Rate:</span>
                          <div className={`text-lg font-bold ${endpoint.successRate >= 99 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {endpoint.successRate}%
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Last Updated:</span>
                          <div className="text-sm text-muted-foreground">{endpoint.lastUpdated}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Keys Management</CardTitle>
                <CardDescription>
                  Manage API authentication keys and access permissions
                </CardDescription>
                <Button onClick={handleCreateApiKey}>
                  <Key className="mr-2 h-4 w-4" />
                  Generate New API Key
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{apiKey.name}</h3>
                          <Badge className={getStatusColor(apiKey.status)}>
                            {apiKey.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleRevokeApiKey(apiKey.id)}
                          >
                            Revoke
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">Key: </span>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{apiKey.keyPrefix}</code>
                          </div>
                          <div>
                            <span className="font-medium">Created: </span>
                            {apiKey.createdDate}
                          </div>
                          <div>
                            <span className="font-medium">Last Used: </span>
                            {apiKey.lastUsed}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">Permissions:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {apiKey.permissions.map((permission, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {permission}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Requests (30d): </span>
                            <span className="font-bold text-blue-600">{apiKey.requests30d.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>
                  Interactive API documentation and integration guides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Button variant="outline" className="h-20 flex-col">
                    <Code className="h-6 w-6 mb-2" />
                    Interactive API Explorer
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Database className="h-6 w-6 mb-2" />
                    Schema Documentation
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Globe className="h-6 w-6 mb-2" />
                    Integration Examples
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Key className="h-6 w-6 mb-2" />
                    Authentication Guide
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Settings className="h-6 w-6 mb-2" />
                    Rate Limiting
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Activity className="h-6 w-6 mb-2" />
                    Error Handling
                  </Button>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Quick Start Guide</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>1. Generate an API key from the "API Keys" tab</p>
                    <p>2. Include the key in your request headers: <code className="bg-blue-100 px-1 rounded">Authorization: Bearer YOUR_API_KEY</code></p>
                    <p>3. Make requests to our endpoints: <code className="bg-blue-100 px-1 rounded">https://api.yourhospital.com/v1/</code></p>
                    <p>4. Check our interactive documentation for detailed examples</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Monitoring & Analytics</CardTitle>
                <CardDescription>
                  Real-time monitoring, performance metrics, and usage analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Real-time Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Requests per minute:</span>
                        <span className="text-sm font-medium">47</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Active connections:</span>
                        <span className="text-sm font-medium">156</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Error rate:</span>
                        <span className="text-sm font-medium text-green-600">0.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg response time:</span>
                        <span className="text-sm font-medium text-green-600">142ms</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Top Endpoints</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { endpoint: '/api/v1/patients', requests: '2,134' },
                        { endpoint: '/api/v1/appointments', requests: '1,247' },
                        { endpoint: '/api/v1/medical-records', requests: '856' },
                        { endpoint: '/api/v1/prescriptions', requests: '623' }
                      ].map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <code className="text-xs">{item.endpoint}</code>
                          <span className="text-sm font-medium">{item.requests}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Button variant="outline" className="h-16 flex-col">
                      <Activity className="h-5 w-5 mb-1" />
                      Performance Dashboard
                    </Button>
                    <Button variant="outline" className="h-16 flex-col">
                      <Clock className="h-5 w-5 mb-1" />
                      Response Time Analysis
                    </Button>
                    <Button variant="outline" className="h-16 flex-col">
                      <Globe className="h-5 w-5 mb-1" />
                      Usage Analytics
                    </Button>
                    <Button variant="outline" className="h-16 flex-col">
                      <Server className="h-5 w-5 mb-1" />
                      Error Logs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default API;