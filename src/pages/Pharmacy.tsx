import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pill, Search, Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UpdateStockDialog } from '@/components/pharmacy/UpdateStockDialog';

const Pharmacy = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [updateStockDialog, setUpdateStockDialog] = useState<{open: boolean, drug: any}>({open: false, drug: null});
  
  const [prescriptions] = useState([
    {
      id: 1,
      prescriptionId: 'RX001',
      patientName: 'John Doe',
      patientId: 'P001',
      doctor: 'Dr. Smith',
      medications: [
        { name: 'Amoxicillin 500mg', quantity: '21 tablets', instructions: 'Take 1 tablet 3 times daily' },
        { name: 'Paracetamol 500mg', quantity: '20 tablets', instructions: 'Take 1-2 tablets as needed' }
      ],
      status: 'pending',
      dateIssued: '2024-01-15',
      priority: 'routine'
    },
    {
      id: 2,
      prescriptionId: 'RX002',
      patientName: 'Jane Smith',
      patientId: 'P002',
      doctor: 'Dr. Johnson',
      medications: [
        { name: 'Metformin 500mg', quantity: '30 tablets', instructions: 'Take 1 tablet twice daily with meals' }
      ],
      status: 'dispensing',
      dateIssued: '2024-01-15',
      priority: 'urgent'
    },
    {
      id: 3,
      prescriptionId: 'RX003',
      patientName: 'Mike Johnson',
      patientId: 'P003',
      doctor: 'Dr. Williams',
      medications: [
        { name: 'Lisinopril 10mg', quantity: '30 tablets', instructions: 'Take 1 tablet daily' }
      ],
      status: 'completed',
      dateIssued: '2024-01-14',
      priority: 'routine'
    }
  ]);

  const [inventory] = useState([
    {
      id: 1,
      drugName: 'Amoxicillin 500mg',
      batchNumber: 'AMX2024001',
      expiryDate: '2025-12-31',
      quantity: 500,
      minStock: 100,
      location: 'A1-03',
      supplier: 'PharmaCorp'
    },
    {
      id: 2,
      drugName: 'Paracetamol 500mg',
      batchNumber: 'PAR2024002',
      expiryDate: '2025-06-30',
      quantity: 50,
      minStock: 200,
      location: 'B2-15',
      supplier: 'MediSupply'
    },
    {
      id: 3,
      drugName: 'Metformin 500mg',
      batchNumber: 'MET2024003',
      expiryDate: '2024-03-15',
      quantity: 300,
      minStock: 150,
      location: 'C1-08',
      supplier: 'HealthPlus'
    }
  ]);

  const [stats] = useState({
    totalPrescriptions: 156,
    pending: 23,
    dispensing: 8,
    completed: 125,
    lowStock: 12,
    expiringSoon: 5
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'dispensing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'routine': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= minStock * 0.5) return { status: 'critical', color: 'bg-red-100 text-red-800' };
    if (quantity <= minStock) return { status: 'low', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'good', color: 'bg-green-100 text-green-800' };
  };

  const handleDispenseMedication = (prescriptionId: string) => {
    toast({
      title: "Medication Dispensed",
      description: `Prescription ${prescriptionId} has been dispensed successfully.`
    });
  };

  const handleStartDispensing = (prescriptionId: string) => {
    toast({
      title: "Dispensing Started",
      description: `Started processing prescription ${prescriptionId}.`
    });
  };

  const handleViewPrescriptionDetails = (prescriptionId: string) => {
    toast({
      title: "Prescription Details",
      description: `Viewing details for prescription ${prescriptionId}.`
    });
  };

  const handleReorderStock = (drugName: string) => {
    toast({
      title: "Reorder Initiated",
      description: `Reorder request sent for ${drugName}.`
    });
  };

  const handleUpdateStock = (drug: any) => {
    setUpdateStockDialog({open: true, drug: {
      id: drug.id,
      drugName: drug.drugName,
      currentStock: drug.quantity,
      minStock: drug.minStock
    }});
  };

  const handleGenerateReport = (reportType: string) => {
    toast({
      title: "Report Generated",
      description: `${reportType} has been generated successfully.`
    });
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiry <= threeMonthsFromNow;
  };

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
                  <p className="text-sm text-muted-foreground">Total Prescriptions</p>
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
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="prescriptions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="inventory">Drug Inventory</TabsTrigger>
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
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
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
                          {prescription.status === 'pending' && (
                            <Button size="sm" onClick={() => handleStartDispensing(prescription.prescriptionId)}>
                              Start Dispensing
                            </Button>
                          )}
                          {prescription.status === 'dispensing' && (
                            <Button 
                              size="sm"
                              onClick={() => handleDispenseMedication(prescription.prescriptionId)}
                            >
                              Complete Dispensing
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleViewPrescriptionDetails(prescription.prescriptionId)}>
                            View Details
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        Patient: {prescription.patientName} ({prescription.patientId}) • Doctor: {prescription.doctor}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Date Issued: {prescription.dateIssued}
                      </p>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Medications:</p>
                        {prescription.medications.map((med, index) => (
                          <div key={index} className="pl-4 border-l-2 border-primary/20">
                            <p className="text-sm font-medium">{med.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {med.quantity} • Instructions: {med.instructions}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-4">
                  {inventory.map((item) => {
                    const stockStatus = getStockStatus(item.quantity, item.minStock);
                    const expiring = isExpiringSoon(item.expiryDate);
                    
                    return (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold">{item.drugName}</h3>
                            <Badge className={stockStatus.color}>
                              {stockStatus.status} stock
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
                            Quantity: {item.quantity} units • Min Stock: {item.minStock} units
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Expiry: {item.expiryDate} • Supplier: {item.supplier}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleReorderStock(item.drugName)}>
                            Reorder
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleUpdateStock(item)}>
                            Update Stock
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                  <Button variant="outline" className="h-24 flex-col" onClick={() => handleGenerateReport('Dispensing Report')}>
                    <Pill className="h-6 w-6 mb-2" />
                    <span>Dispensing Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col" onClick={() => handleGenerateReport('Inventory Report')}>
                    <Package className="h-6 w-6 mb-2" />
                    <span>Inventory Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col" onClick={() => handleGenerateReport('Low Stock Alert')}>
                    <AlertTriangle className="h-6 w-6 mb-2" />
                    <span>Low Stock Alert</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col" onClick={() => handleGenerateReport('Expiry Report')}>
                    <Clock className="h-6 w-6 mb-2" />
                    <span>Expiry Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col" onClick={() => handleGenerateReport('Sales Report')}>
                    <CheckCircle className="h-6 w-6 mb-2" />
                    <span>Sales Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col" onClick={() => handleGenerateReport('Drug Usage Report')}>
                    <Pill className="h-6 w-6 mb-2" />
                    <span>Drug Usage Report</span>
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