import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestTube, Search, Clock, CheckCircle, AlertTriangle, FileText, Plus, Loader2, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NewLabOrderDialog } from '@/components/laboratory/NewLabOrderDialog';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Laboratory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);

  // Fetch lab orders
  const { data: labOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['lab', 'orders'],
    queryFn: () => api.getLabOrders({}),
    refetchInterval: 15000
  });

  // Fetch lab results
  const { data: labResults = [] } = useQuery({
    queryKey: ['lab', 'results'],
    queryFn: () => api.getLabTests({}),
    refetchInterval: 15000
  });

  // Transform orders
  const orders = labOrders.map((order: any) => ({
    id: order.id,
    orderId: order.order_number || `LO${order.id}`,
    patientName: `${order.first_name || ''} ${order.last_name || ''}`.trim(),
    patientId: order.patient_number || order.patient_id,
    tests: order.test_name ? [order.test_name] : ['Pending'],
    orderDate: order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A',
    status: order.status || 'pending',
    priority: order.priority || 'routine',
    doctor: order.ordering_physician || 'N/A'
  }));

  // Transform results
  const results = labResults.map((result: any) => ({
    id: result.id,
    orderId: result.order_number || `LO${result.lab_order_id}`,
    patientName: `${result.first_name || ''} ${result.last_name || ''}`.trim(),
    testName: result.test_name || 'Unknown Test',
    result: result.result_value || 'Pending',
    referenceRange: result.reference_range || 'N/A',
    status: result.status || 'pending',
    completedDate: result.result_date ? new Date(result.result_date).toLocaleDateString() : 'N/A',
    technician: result.performed_by || 'N/A',
    isAbnormal: result.is_abnormal
  }));

  // Calculate stats
  const stats = {
    totalOrders: orders.length,
    pending: orders.filter((o: any) => o.status === 'pending' || o.status === 'ordered').length,
    inProgress: orders.filter((o: any) => o.status === 'in_progress' || o.status === 'processing').length,
    completed: orders.filter((o: any) => o.status === 'completed').length,
    criticalResults: results.filter((r: any) => r.isAbnormal).length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': case 'ordered': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': case 'verified': return 'bg-green-100 text-green-800';
      case 'pending_review': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': case 'stat': return 'bg-red-100 text-red-800';
      case 'routine': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleProcessOrder = async (order: any) => {
    try {
      await api.updateLabOrder(order.id, { status: 'in_progress' });
      queryClient.invalidateQueries({ queryKey: ['lab'] });
      toast({
        title: "Processing Started",
        description: `Lab order ${order.orderId} is now being processed.`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order",
        variant: "destructive"
      });
    }
  };

  const handleCompleteTest = async (order: any) => {
    try {
      await api.updateLabOrder(order.id, { status: 'completed' });
      queryClient.invalidateQueries({ queryKey: ['lab'] });
      toast({
        title: "Test Completed",
        description: `Results for order ${order.orderId} have been recorded.`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete test",
        variant: "destructive"
      });
    }
  };

  const handleVerifyResult = async (result: any) => {
    try {
      await api.updateLabTestResult(result.id, { status: 'verified' });
      queryClient.invalidateQueries({ queryKey: ['lab'] });
      toast({
        title: "Result Verified",
        description: `Result for ${result.testName} has been verified.`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify result",
        variant: "destructive"
      });
    }
  };

  const filteredOrders = orders.filter((order: any) =>
    order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <p className="text-sm text-muted-foreground">Abnormal</p>
                  <p className="text-2xl font-bold text-red-600">{stats.criticalResults}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Lab Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="results">Test Results ({results.length})</TabsTrigger>
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
                    <Button onClick={() => setShowNewOrderDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Order
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No lab orders found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold">{order.orderId}</h3>
                            <Badge className={getPriorityColor(order.priority)}>
                              {order.priority}
                            </Badge>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Patient: {order.patientName} ({order.patientId})
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Tests: {order.tests.join(', ')} • Doctor: {order.doctor}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Order Date: {order.orderDate}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          {(order.status === 'pending' || order.status === 'ordered') && (
                            <Button size="sm" onClick={() => handleProcessOrder(order)}>
                              <Play className="mr-2 h-4 w-4" />
                              Start
                            </Button>
                          )}
                          {(order.status === 'in_progress' || order.status === 'processing') && (
                            <Button size="sm" variant="outline" onClick={() => handleCompleteTest(order)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Complete
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                {results.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No results available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((result: any) => (
                      <div key={result.id} className={`flex items-center justify-between p-4 rounded-lg ${result.isAbnormal ? 'bg-red-50 border border-red-200' : 'bg-muted'}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold">{result.orderId}</h3>
                            <Badge className={getStatusColor(result.status)}>
                              {result.status.replace('_', ' ')}
                            </Badge>
                            {result.isAbnormal && (
                              <Badge className="bg-red-100 text-red-800">Abnormal</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Patient: {result.patientName} • Test: {result.testName}
                          </p>
                          <p className="text-sm">
                            Result: <span className={`font-medium ${result.isAbnormal ? 'text-red-600' : ''}`}>{result.result}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Reference: {result.referenceRange} • Tech: {result.technician}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Completed: {result.completedDate}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          {result.status === 'pending_review' && (
                            <Button size="sm" onClick={() => handleVerifyResult(result)}>
                              Verify
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Print
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    <span>Turnaround Time</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <AlertTriangle className="h-6 w-6 mb-2" />
                    <span>Critical Values</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <CheckCircle className="h-6 w-6 mb-2" />
                    <span>Quality Control</span>
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

        {/* Dialogs */}
        <NewLabOrderDialog
          open={showNewOrderDialog}
          onOpenChange={setShowNewOrderDialog}
        />
      </div>
    </DashboardLayout>
  );
};

export default Laboratory;
