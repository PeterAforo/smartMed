import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestTube, Search, Clock, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Laboratory = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [labOrders] = useState([
    {
      id: 1,
      orderId: 'LO001',
      patientName: 'John Doe',
      patientId: 'P001',
      tests: ['Complete Blood Count', 'Lipid Profile'],
      orderDate: '2024-01-15',
      status: 'pending',
      priority: 'routine',
      doctor: 'Dr. Smith'
    },
    {
      id: 2,
      orderId: 'LO002',
      patientName: 'Jane Smith',
      patientId: 'P002',
      tests: ['Glucose Test', 'HbA1c'],
      orderDate: '2024-01-15',
      status: 'in-progress',
      priority: 'urgent',
      doctor: 'Dr. Johnson'
    },
    {
      id: 3,
      orderId: 'LO003',
      patientName: 'Mike Johnson',
      patientId: 'P003',
      tests: ['Liver Function Tests'],
      orderDate: '2024-01-14',
      status: 'completed',
      priority: 'routine',
      doctor: 'Dr. Williams'
    }
  ]);

  const [results] = useState([
    {
      id: 1,
      orderId: 'LO003',
      patientName: 'Mike Johnson',
      testName: 'Liver Function Tests',
      result: 'Normal',
      referenceRange: 'Within normal limits',
      status: 'verified',
      completedDate: '2024-01-15',
      technician: 'Lab Tech 1'
    },
    {
      id: 2,
      orderId: 'LO004',
      patientName: 'Sarah Davis',
      testName: 'Complete Blood Count',
      result: 'Abnormal - Low Hemoglobin',
      referenceRange: '12-15 g/dL',
      status: 'pending-review',
      completedDate: '2024-01-15',
      technician: 'Lab Tech 2'
    }
  ]);

  const [stats] = useState({
    totalOrders: 45,
    pending: 12,
    inProgress: 8,
    completed: 25,
    criticalResults: 3
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending-review': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'stat': return 'bg-red-200 text-red-900';
      case 'routine': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleProcessOrder = (orderId: string) => {
    toast({
      title: "Order Processing Started",
      description: `Lab order ${orderId} is now being processed.`
    });
  };

  const handleCompleteTest = (orderId: string) => {
    toast({
      title: "Test Completed",
      description: `Results for order ${orderId} have been recorded.`
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <TestTube className="h-8 w-8 text-primary" />
            Laboratory Management
          </h1>
          <p className="text-muted-foreground">Manage lab orders, tests, and results</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalOrders}</p>
                </div>
                <TestTube className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <TestTube className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Results</p>
                  <p className="text-2xl font-bold text-red-600">{stats.criticalResults}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Lab Orders</TabsTrigger>
            <TabsTrigger value="results">Test Results</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Laboratory Orders</CardTitle>
                    <CardDescription>Manage and process lab test orders</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {labOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold">{order.orderId}</h3>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Patient: {order.patientName} ({order.patientId}) • Doctor: {order.doctor}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Tests: {order.tests.join(', ')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Order Date: {order.orderDate}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <Button 
                            size="sm"
                            onClick={() => handleProcessOrder(order.orderId)}
                          >
                            Start Processing
                          </Button>
                        )}
                        {order.status === 'in-progress' && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleCompleteTest(order.orderId)}
                          >
                            Complete Test
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>Review and verify laboratory test results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold">{result.orderId}</h3>
                          <Badge className={getStatusColor(result.status)}>
                            {result.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Patient: {result.patientName} • Test: {result.testName}
                        </p>
                        <p className="text-sm">
                          Result: <span className="font-medium">{result.result}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Reference: {result.referenceRange} • Technician: {result.technician}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Completed: {result.completedDate}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {result.status === 'pending-review' && (
                          <Button size="sm">
                            Verify Result
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          Print Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Laboratory Reports</CardTitle>
                <CardDescription>Generate and view laboratory performance reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    <span>Daily Lab Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <TestTube className="h-6 w-6 mb-2" />
                    <span>Test Volume Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Clock className="h-6 w-6 mb-2" />
                    <span>Turnaround Time Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <AlertTriangle className="h-6 w-6 mb-2" />
                    <span>Critical Values Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <CheckCircle className="h-6 w-6 mb-2" />
                    <span>Quality Control Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    <span>Monthly Summary</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Laboratory;