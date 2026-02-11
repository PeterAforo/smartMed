import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pill, Search, Package, AlertTriangle, CheckCircle, Clock, Loader2, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UpdateStockDialog } from '@/components/pharmacy/UpdateStockDialog';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Pharmacy = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [updateStockDialog, setUpdateStockDialog] = useState<{open: boolean, drug: any}>({open: false, drug: null});

  // Fetch prescriptions
  const { data: prescriptionsData = [], isLoading: prescriptionsLoading } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: () => api.getPrescriptions({}),
    refetchInterval: 15000
  });

  // Fetch drug inventory
  const { data: inventoryData = [], isLoading: inventoryLoading } = useQuery({
    queryKey: ['pharmacy', 'inventory'],
    queryFn: () => api.getMedications({}),
    refetchInterval: 30000
  });

  // Transform prescriptions
  const prescriptions = prescriptionsData.map((rx: any) => ({
    id: rx.id,
    prescriptionId: rx.prescription_number || `RX${rx.id}`,
    patientName: `${rx.first_name || ''} ${rx.last_name || ''}`.trim(),
    patientId: rx.patient_number || rx.patient_id,
    doctor: rx.prescriber_name || 'N/A',
    status: rx.status || 'pending',
    dateIssued: rx.prescription_date ? new Date(rx.prescription_date).toLocaleDateString() : 'N/A',
    priority: rx.priority || 'routine',
    items: rx.items || []
  }));

  // Transform inventory
  const inventory = inventoryData.map((drug: any) => ({
    id: drug.id,
    drugName: drug.name || drug.drug_name,
    batchNumber: drug.batch_number || 'N/A',
    expiryDate: drug.expiry_date ? new Date(drug.expiry_date).toLocaleDateString() : 'N/A',
    quantity: drug.quantity_in_stock || drug.quantity || 0,
    minStock: drug.reorder_level || drug.min_stock || 50,
    location: drug.location || 'N/A',
    supplier: drug.supplier || 'N/A',
    unitPrice: drug.unit_price || 0
  }));

  // Calculate stats
  const stats = {
    totalPrescriptions: prescriptions.length,
    pending: prescriptions.filter((p: any) => p.status === 'pending' || p.status === 'ordered').length,
    dispensing: prescriptions.filter((p: any) => p.status === 'dispensing' || p.status === 'processing').length,
    completed: prescriptions.filter((p: any) => p.status === 'dispensed' || p.status === 'completed').length,
    lowStock: inventory.filter((i: any) => i.quantity <= i.minStock).length,
    expiringSoon: inventory.filter((i: any) => isExpiringSoon(i.expiryDate)).length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': case 'ordered': return 'bg-yellow-100 text-yellow-800';
      case 'dispensing': case 'processing': return 'bg-blue-100 text-blue-800';
      case 'dispensed': case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= minStock * 0.5) return { status: 'critical', color: 'bg-red-100 text-red-800' };
    if (quantity <= minStock) return { status: 'low', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'good', color: 'bg-green-100 text-green-800' };
  };

  function isExpiringSoon(expiryDate: string): boolean {
    if (!expiryDate || expiryDate === 'N/A') return false;
    const expiry = new Date(expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiry <= threeMonthsFromNow;
  }

  const handleStartDispensing = async (prescription: any) => {
    try {
      await api.dispensePrescription(prescription.id, { status: 'dispensing' });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast({
        title: "Dispensing Started",
        description: `Started processing prescription ${prescription.prescriptionId}.`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update prescription",
        variant: "destructive"
      });
    }
  };

  const handleCompleteDispensing = async (prescription: any) => {
    try {
      await api.dispensePrescription(prescription.id, { status: 'dispensed' });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast({
        title: "Medication Dispensed",
        description: `Prescription ${prescription.prescriptionId} has been dispensed successfully.`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete dispensing",
        variant: "destructive"
      });
    }
  };

  const handleUpdateStock = (drug: any) => {
    setUpdateStockDialog({open: true, drug: {
      id: drug.id,
      drugName: drug.drugName,
      currentStock: drug.quantity,
      minStock: drug.minStock
    }});
  };

  const filteredPrescriptions = prescriptions.filter((rx: any) =>
    rx.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rx.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rx.prescriptionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Pill className="h-8 w-8 text-primary" />
            Pharmacy Management
          </h1>
          <p className="text-muted-foreground">Manage prescriptions, inventory, and medication dispensing</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Prescriptions</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalPrescriptions}</p>
                </div>
                <Pill className="h-8 w-8 text-primary" />
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
                  <p className="text-sm text-muted-foreground">Dispensing</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.dispensing}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
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
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-red-600">{stats.lowStock}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expiring</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="prescriptions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prescriptions">Prescriptions ({prescriptions.length})</TabsTrigger>
            <TabsTrigger value="inventory">Drug Inventory ({inventory.length})</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Prescription Management</CardTitle>
                    <CardDescription>Process and dispense patient prescriptions</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search prescriptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {prescriptionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredPrescriptions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No prescriptions found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPrescriptions.map((prescription: any) => (
                      <div key={prescription.id} className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <h3 className="font-semibold">{prescription.prescriptionId}</h3>
                            <Badge className={getPriorityColor(prescription.priority)}>
                              {prescription.priority}
                            </Badge>
                            <Badge className={getStatusColor(prescription.status)}>
                              {prescription.status}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            {(prescription.status === 'pending' || prescription.status === 'ordered') && (
                              <Button size="sm" onClick={() => handleStartDispensing(prescription)}>
                                <Play className="mr-2 h-4 w-4" />
                                Start
                              </Button>
                            )}
                            {(prescription.status === 'dispensing' || prescription.status === 'processing') && (
                              <Button size="sm" onClick={() => handleCompleteDispensing(prescription)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Complete
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          Patient: {prescription.patientName} ({prescription.patientId}) • Doctor: {prescription.doctor}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Date: {prescription.dateIssued}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Drug Inventory</CardTitle>
                <CardDescription>Monitor drug stock levels and expiry dates</CardDescription>
              </CardHeader>
              <CardContent>
                {inventoryLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : inventory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No drugs in inventory
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inventory.map((item: any) => {
                      const stockStatus = getStockStatus(item.quantity, item.minStock);
                      const expiring = isExpiringSoon(item.expiryDate);
                      
                      return (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <h3 className="font-semibold">{item.drugName}</h3>
                              <Badge className={stockStatus.color}>
                                {stockStatus.status}
                              </Badge>
                              {expiring && (
                                <Badge className="bg-orange-100 text-orange-800">
                                  Expiring Soon
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Batch: {item.batchNumber} • Location: {item.location}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} • Min: {item.minStock} • Expiry: {item.expiryDate}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStock(item)}>
                              Update
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Pharmacy Reports</CardTitle>
                <CardDescription>Generate pharmacy performance and inventory reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex-col">
                    <Pill className="h-6 w-6 mb-2" />
                    <span>Dispensing Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Package className="h-6 w-6 mb-2" />
                    <span>Inventory Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <AlertTriangle className="h-6 w-6 mb-2" />
                    <span>Low Stock Alert</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Clock className="h-6 w-6 mb-2" />
                    <span>Expiry Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <CheckCircle className="h-6 w-6 mb-2" />
                    <span>Sales Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Pill className="h-6 w-6 mb-2" />
                    <span>Drug Usage</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <UpdateStockDialog 
          open={updateStockDialog.open} 
          onOpenChange={(open) => setUpdateStockDialog({open, drug: null})}
          drug={updateStockDialog.drug}
        />
      </div>
    </DashboardLayout>
  );
};

export default Pharmacy;
