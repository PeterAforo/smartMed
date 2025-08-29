import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrders } from '@/hooks/useOrders';
import { CreateOrderDialog } from '../encounters/CreateOrderDialog';
import { ResultEntryDialog } from './ResultEntryDialog';
import { Clock, Search, Filter, FileText, Activity, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface OrderWorkflowDashboardProps {
  patientId?: string;
  encounterId?: string;
}

export function OrderWorkflowDashboard({ patientId, encounterId }: OrderWorkflowDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { orders, isLoading, updateOrder, cancelOrder } = useOrders({
    patientId,
    encounterId,
    orderType: filterType !== 'all' ? filterType : undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined
  });

  const filteredOrders = orders?.filter(order => 
    searchTerm === '' || 
    order.order_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleMarkInProgress = async (orderId: string) => {
    await updateOrder({
      id: orderId,
      data: { status: 'in_progress' }
    });
  };

  const handleMarkCompleted = async (orderId: string) => {
    await updateOrder({
      id: orderId,
      data: { status: 'completed' }
    });
  };

  const handleAddResult = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowResultDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered': return 'default';
      case 'in_progress': return 'secondary';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lab': return 'blue';
      case 'imaging': return 'purple';
      case 'pharmacy': return 'green';
      case 'service': return 'orange';
      case 'procedure': return 'red';
      default: return 'gray';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'stat': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'urgent': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold">Order Workflow</h2>
        {encounterId && (
          <Button onClick={() => setShowCreateDialog(true)}>
            Create Order
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lab">Laboratory</SelectItem>
                <SelectItem value="imaging">Imaging</SelectItem>
                <SelectItem value="pharmacy">Pharmacy</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="procedure">Procedure</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {orders?.length === 0 ? 'No orders found' : 'No orders match your filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    {/* Order Header */}
                    <div className="flex items-center space-x-3">
                      {getPriorityIcon(order.priority)}
                      <Badge variant={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className={`border-${getTypeColor(order.order_type)}-200`}>
                        {order.order_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        #{order.order_number}
                      </span>
                    </div>

                    {/* Order Details */}
                    <div>
                      <h3 className="font-medium">{order.order_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Code: {order.order_code}
                      </p>
                    </div>

                    {/* Patient and Encounter Info */}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>
                        Patient: {order.patients.first_name} {order.patients.last_name}
                      </span>
                      <span>•</span>
                      <span>
                        Encounter: {order.encounters.encounter_number}
                      </span>
                      <span>•</span>
                      <span>
                        Ordered: {format(new Date(order.ordered_at), 'MMM dd, HH:mm')}
                      </span>
                    </div>

                    {/* Instructions and Notes */}
                    {(order.instructions || order.clinical_notes) && (
                      <div className="space-y-1">
                        {order.instructions && (
                          <div className="flex items-start">
                            <FileText className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                            <p className="text-sm">
                              <span className="font-medium">Instructions:</span> {order.instructions}
                            </p>
                          </div>
                        )}
                        {order.clinical_notes && (
                          <div className="flex items-start">
                            <FileText className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                            <p className="text-sm">
                              <span className="font-medium">Clinical Notes:</span> {order.clinical_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ordered By */}
                    {order.profiles && (
                      <p className="text-sm text-muted-foreground">
                        Ordered by: {order.profiles.first_name} {order.profiles.last_name}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 ml-4">
                    {order.status === 'ordered' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkInProgress(order.id)}
                      >
                        Start
                      </Button>
                    )}
                    
                    {order.status === 'in_progress' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddResult(order.id)}
                        >
                          Add Result
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleMarkCompleted(order.id)}
                        >
                          Complete
                        </Button>
                      </>
                    )}

                    {(order.status === 'ordered' || order.status === 'in_progress') && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cancelOrder(order.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialogs */}
      {encounterId && (
        <CreateOrderDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          encounterId={encounterId}
        />
      )}

      {selectedOrderId && (
        <ResultEntryDialog
          isOpen={showResultDialog}
          onClose={() => {
            setShowResultDialog(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
        />
      )}
    </div>
  );
}