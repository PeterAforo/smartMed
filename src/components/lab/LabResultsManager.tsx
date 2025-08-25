import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Plus, TestTube, Clock, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { NewLabOrderDialog } from './NewLabOrderDialog';

interface LabResultsManagerProps {
  patientId?: string;
}

export const LabResultsManager: React.FC<LabResultsManagerProps> = ({ patientId }) => {
  const { profile, currentBranch } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch lab orders
  const { data: labOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['lab-orders', patientId, currentBranch?.id],
    queryFn: async () => {
      let query = supabase
        .from('lab_orders')
        .select('*')
        .eq('tenant_id', profile?.tenant_id)
        .order('order_date', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      if (currentBranch?.id) {
        query = query.eq('branch_id', currentBranch.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id
  });

  // Fetch lab results
  const { data: labResults, isLoading: resultsLoading } = useQuery({
    queryKey: ['lab-results', patientId, currentBranch?.id],
    queryFn: async () => {
      let query = supabase
        .from('lab_results')
        .select('*')
        .eq('tenant_id', profile?.tenant_id)
        .order('ordered_at', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      if (currentBranch?.id) {
        query = query.eq('branch_id', currentBranch.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id
  });

  // Fetch patients data
  const { data: patients } = useQuery({
    queryKey: ['patients', profile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, patient_number')
        .eq('tenant_id', profile?.tenant_id);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id
  });

  // Create patient lookup map
  const patientMap = patients?.reduce((acc, patient) => {
    acc[patient.id] = patient;
    return acc;
  }, {} as Record<string, any>) || {};

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const updateData: any = { status };
      if (status === 'collected') {
        updateData.collection_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('lab_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Lab order status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
    }
  });

  // Update result status mutation
  const updateResultStatusMutation = useMutation({
    mutationFn: async ({ resultId, status }: { resultId: string; status: string }) => {
      const updateData: any = { status };
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('lab_results')
        .update(updateData)
        .eq('id', resultId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Lab result status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['lab-results'] });
    }
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'collected': return 'secondary';
      case 'ordered': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'stat': return 'destructive';
      case 'urgent': return 'default';
      case 'routine': return 'secondary';
      default: return 'outline';
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'ordered': return 25;
      case 'collected': return 50;
      case 'in_progress': return 75;
      case 'completed': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  const filteredOrders = labOrders?.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  }) || [];

  const criticalResults = labResults?.filter(result => result.critical_values) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Lab Results Manager
          </CardTitle>
          <Button onClick={() => setShowNewOrderDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Lab Order
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {criticalResults.length > 0 && (
          <div className="mb-4 p-4 border border-destructive rounded-lg bg-destructive/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="font-medium text-destructive">Critical Lab Values Detected</span>
            </div>
            <div className="space-y-2">
              {criticalResults.slice(0, 3).map((result) => (
                <div key={result.id} className="text-sm">
                  <span className="font-medium">{result.test_name}</span>
                  {patientMap[result.patient_id] && (
                    <span className="text-muted-foreground"> - {patientMap[result.patient_id].first_name} {patientMap[result.patient_id].last_name}</span>
                  )}
                </div>
              ))}
              {criticalResults.length > 3 && (
                <p className="text-sm text-muted-foreground">+{criticalResults.length - 3} more critical results</p>
              )}
            </div>
          </div>
        )}

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Lab Orders</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="collected">Collected</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">Order #{order.order_number}</h4>
                          {patientMap[order.patient_id] && (
                            <p className="text-sm text-muted-foreground">
                              {patientMap[order.patient_id].first_name} {patientMap[order.patient_id].last_name} ({patientMap[order.patient_id].patient_number})
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                          <Badge variant={getPriorityBadgeVariant(order.priority)}>
                            {order.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{getProgressValue(order.status)}%</span>
                        </div>
                        <Progress value={getProgressValue(order.status)} className="h-2" />
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Order Date:</strong> {format(new Date(order.order_date), 'MMM dd, yyyy')}</p>
                        {order.collection_date && (
                          <p><strong>Collection Date:</strong> {format(new Date(order.collection_date), 'MMM dd, yyyy')}</p>
                        )}
                        <p><strong>Clinical Indication:</strong> {order.clinical_indication}</p>
                        {order.fasting_required && (
                          <p><strong>Fasting Required:</strong> Yes</p>
                        )}
                        {order.lab_facility && (
                          <p><strong>Lab Facility:</strong> {order.lab_facility}</p>
                        )}
                        {Array.isArray(order.tests_ordered) && order.tests_ordered.length > 0 && (
                          <p><strong>Tests:</strong> {order.tests_ordered.join(', ')}</p>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        {order.status === 'ordered' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatusMutation.mutate({
                              orderId: order.id,
                              status: 'collected'
                            })}
                          >
                            Mark Collected
                          </Button>
                        )}
                        {order.status === 'collected' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatusMutation.mutate({
                              orderId: order.id,
                              status: 'in_progress'
                            })}
                          >
                            Start Processing
                          </Button>
                        )}
                        {order.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatusMutation.mutate({
                              orderId: order.id,
                              status: 'completed'
                            })}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateOrderStatusMutation.mutate({
                            orderId: order.id,
                            status: 'cancelled'
                          })}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                {!ordersLoading && filteredOrders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No lab orders found.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {resultsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  labResults?.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{result.test_name}</h4>
                          {patientMap[result.patient_id] && (
                            <p className="text-sm text-muted-foreground">
                              {patientMap[result.patient_id].first_name} {patientMap[result.patient_id].last_name}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(result.status)}>
                            {result.status}
                          </Badge>
                          {result.critical_values && (
                            <Badge variant="destructive">
                              Critical
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Test Type:</strong> {result.test_type}</p>
                        <p><strong>Ordered:</strong> {format(new Date(result.ordered_at), 'MMM dd, yyyy HH:mm')}</p>
                        {result.completed_at && (
                          <p><strong>Completed:</strong> {format(new Date(result.completed_at), 'MMM dd, yyyy HH:mm')}</p>
                        )}
                        {result.notes && (
                          <p><strong>Notes:</strong> {result.notes}</p>
                        )}
                      </div>

                      {result.status === 'pending' && (
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => updateResultStatusMutation.mutate({
                              resultId: result.id,
                              status: 'completed'
                            })}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Complete
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
                {!resultsLoading && (!labResults || labResults.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No lab results found.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TestTube className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Total Orders</span>
                  </div>
                  <div className="text-2xl font-bold">{labOrders?.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {labOrders?.filter(o => ['ordered', 'collected', 'in_progress'].includes(o.status)).length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Critical Results</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {criticalResults.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Advanced analytics and trending will be available soon.</p>
              <p className="text-sm">This will include test volume trends, turnaround times, and quality metrics.</p>
            </div>
          </TabsContent>
        </Tabs>

        <NewLabOrderDialog
          open={showNewOrderDialog}
          onOpenChange={setShowNewOrderDialog}
          patientId={patientId}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
            setShowNewOrderDialog(false);
          }}
        />
      </CardContent>
    </Card>
  );
};