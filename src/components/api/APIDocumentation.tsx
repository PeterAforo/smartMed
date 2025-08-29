import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Play, Globe, Key, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  requestBody?: {
    type: string;
    example: string;
  };
  responses: Array<{
    status: number;
    description: string;
    example: string;
  }>;
  authentication: 'required' | 'optional' | 'none';
  category: string;
}

const apiEndpoints: APIEndpoint[] = [
  {
    id: 'patients-list',
    method: 'GET',
    path: '/api/patients',
    summary: 'List patients',
    description: 'Retrieve a paginated list of patients with optional filtering',
    parameters: [
      { name: 'page', type: 'integer', required: false, description: 'Page number for pagination' },
      { name: 'limit', type: 'integer', required: false, description: 'Number of items per page' },
      { name: 'search', type: 'string', required: false, description: 'Search by name, phone, or email' },
    ],
    responses: [
      {
        status: 200,
        description: 'Success',
        example: `{
  "data": [
    {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "date_of_birth": "1990-01-01"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}`
      }
    ],
    authentication: 'required',
    category: 'Patients'
  },
  {
    id: 'appointments-create',
    method: 'POST',
    path: '/api/appointments',
    summary: 'Create appointment',
    description: 'Schedule a new appointment for a patient',
    requestBody: {
      type: 'application/json',
      example: `{
  "patient_id": "uuid",
  "staff_id": "uuid",
  "appointment_date": "2024-01-15",
  "appointment_time": "10:30",
  "appointment_type": "consultation",
  "duration_minutes": 30,
  "notes": "Annual checkup"
}`
    },
    responses: [
      {
        status: 201,
        description: 'Appointment created successfully',
        example: `{
  "id": "uuid",
  "patient_id": "uuid",
  "staff_id": "uuid",
  "appointment_date": "2024-01-15",
  "appointment_time": "10:30",
  "status": "scheduled"
}`
      }
    ],
    authentication: 'required',
    category: 'Appointments'
  }
];

export function APIDocumentation() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [testRequest, setTestRequest] = useState('');
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Code copied to clipboard",
    });
  };

  const testEndpoint = async () => {
    if (!selectedEndpoint) return;
    
    toast({
      title: "API Test",
      description: "This would send a test request to the endpoint",
    });
  };

  const methodColors = {
    GET: 'bg-green-500',
    POST: 'bg-blue-500',
    PUT: 'bg-yellow-500',
    DELETE: 'bg-red-500',
    PATCH: 'bg-purple-500'
  };

  const categories = Array.from(new Set(apiEndpoints.map(e => e.category)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          API Documentation
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Comprehensive REST API documentation for SmartMed integration
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* API Endpoints List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                API Endpoints
              </CardTitle>
              <CardDescription>
                Browse available API endpoints by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={categories[0]} orientation="vertical">
                <TabsList className="grid w-full grid-cols-1 h-auto">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category} className="justify-start">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {categories.map((category) => (
                  <TabsContent key={category} value={category} className="mt-4 space-y-2">
                    {apiEndpoints
                      .filter(endpoint => endpoint.category === category)
                      .map((endpoint) => (
                        <div
                          key={endpoint.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedEndpoint?.id === endpoint.id ? 'bg-muted border-primary' : ''
                          }`}
                          onClick={() => setSelectedEndpoint(endpoint)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant="secondary" 
                              className={`${methodColors[endpoint.method]} text-white text-xs px-2 py-0`}
                            >
                              {endpoint.method}
                            </Badge>
                            <span className="text-sm font-medium">{endpoint.summary}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{endpoint.path}</p>
                        </div>
                      ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Endpoint Details */}
        <div className="lg:col-span-2">
          {selectedEndpoint ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant="secondary" 
                    className={`${methodColors[selectedEndpoint.method]} text-white`}
                  >
                    {selectedEndpoint.method}
                  </Badge>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {selectedEndpoint.path}
                  </code>
                </div>
                <CardTitle>{selectedEndpoint.summary}</CardTitle>
                <CardDescription>{selectedEndpoint.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="request">Request</TabsTrigger>
                    <TabsTrigger value="response">Response</TabsTrigger>
                    <TabsTrigger value="test">Test</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Authentication
                      </h4>
                      <Badge variant={selectedEndpoint.authentication === 'required' ? 'destructive' : 'secondary'}>
                        {selectedEndpoint.authentication}
                      </Badge>
                    </div>

                    {selectedEndpoint.parameters && (
                      <div>
                        <h4 className="font-semibold mb-2">Parameters</h4>
                        <div className="space-y-2">
                          {selectedEndpoint.parameters.map((param) => (
                            <div key={param.name} className="p-2 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="text-sm">{param.name}</code>
                                <Badge variant="outline" className="text-xs">
                                  {param.type}
                                </Badge>
                                {param.required && (
                                  <Badge variant="destructive" className="text-xs">
                                    required
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{param.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="request" className="space-y-4">
                    {selectedEndpoint.requestBody && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Request Body</h4>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(selectedEndpoint.requestBody!.example)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                          <code>{selectedEndpoint.requestBody.example}</code>
                        </pre>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="response" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Responses</h4>
                      {selectedEndpoint.responses.map((response) => (
                        <div key={response.status} className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={response.status === 200 || response.status === 201 ? 'default' : 'destructive'}>
                                {response.status}
                              </Badge>
                              <span className="text-sm">{response.description}</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copyToClipboard(response.example)}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                            <code>{response.example}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="test" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Test Request</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Test this endpoint with custom parameters or request body
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Request Data</label>
                          <Textarea
                            placeholder="Enter JSON request data..."
                            value={testRequest}
                            onChange={(e) => setTestRequest(e.target.value)}
                            className="mt-2"
                            rows={8}
                          />
                        </div>
                        
                        <Button onClick={testEndpoint} className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Send Test Request
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
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select an Endpoint</h3>
                  <p className="text-muted-foreground">
                    Choose an API endpoint from the list to view its documentation
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