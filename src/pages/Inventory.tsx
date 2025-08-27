import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Search, AlertTriangle, TrendingDown, TrendingUp, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StockAdjustmentDialog } from '@/components/inventory/StockAdjustmentDialog';

const Inventory = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [stockAdjustmentOpen, setStockAdjustmentOpen] = useState(false);
  const [selectedItemCode, setSelectedItemCode] = useState('');
  
  const [inventoryItems] = useState([
    {
      id: 1,
      itemName: 'Surgical Gloves (Box)',
      itemCode: 'SG-001',
      category: 'Medical Supplies',
      currentStock: 45,
      minStock: 100,
      maxStock: 500,
      unitPrice: 25.99,
      supplier: 'MedSupply Co.',
      lastRestocked: '2024-01-10',
      expiryDate: '2025-12-31',
      location: 'Store A-1'
    },
    {
      id: 2,
      itemName: 'Disposable Syringes 10ml',
      itemCode: 'DS-010',
      category: 'Medical Supplies',
      currentStock: 250,
      minStock: 200,
      maxStock: 1000,
      unitPrice: 0.85,
      supplier: 'HealthPlus Supplies',
      lastRestocked: '2024-01-12',
      expiryDate: '2026-06-30',
      location: 'Store A-2'
    },
    {
      id: 3,
      itemName: 'Blood Pressure Monitor',
      itemCode: 'BPM-001',
      category: 'Medical Equipment',
      currentStock: 5,
      minStock: 10,
      maxStock: 25,
      unitPrice: 189.99,
      supplier: 'MedTech Solutions',
      lastRestocked: '2024-01-05',
      expiryDate: null,
      location: 'Equipment Room B'
    },
    {
      id: 4,
      itemName: 'Paracetamol 500mg (Strip)',
      itemCode: 'PAR-500',
      category: 'Pharmaceuticals',
      currentStock: 120,
      minStock: 50,
      maxStock: 300,
      unitPrice: 2.50,
      supplier: 'PharmaCorp',
      lastRestocked: '2024-01-08',
      expiryDate: '2025-03-15',
      location: 'Pharmacy Store'
    }
  ]);

  const [lowStockItems] = useState([
    { name: 'Surgical Gloves', currentStock: 45, minStock: 100, shortage: 55 },
    { name: 'Blood Pressure Monitor', currentStock: 5, minStock: 10, shortage: 5 },
    { name: 'Thermometer Digital', currentStock: 8, minStock: 15, shortage: 7 },
    { name: 'Oxygen Masks', currentStock: 12, minStock: 25, shortage: 13 }
  ]);

  const [recentMovements] = useState([
    {
      id: 1,
      item: 'Disposable Syringes 10ml',
      type: 'outbound',
      quantity: 50,
      department: 'Emergency Room',
      timestamp: '2024-01-15 14:30',
      reference: 'REQ-2024-001'
    },
    {
      id: 2,
      item: 'Surgical Gloves',
      type: 'inbound',
      quantity: 200,
      department: 'Supplier Delivery',
      timestamp: '2024-01-15 10:15',
      reference: 'PO-2024-005'
    },
    {
      id: 3,
      item: 'Paracetamol 500mg',
      type: 'outbound',
      quantity: 30,
      department: 'Pharmacy',
      timestamp: '2024-01-15 09:45',
      reference: 'REQ-2024-002'
    }
  ]);

  const [stats] = useState({
    totalItems: 1250,
    lowStockAlerts: 15,
    totalValue: 125000.00,
    expiringItems: 8,
    pendingOrders: 12,
    monthlyConsumption: 45000.00
  });

  const getStockStatus = (currentStock: number, minStock: number, maxStock: number) => {
    const percentage = (currentStock / maxStock) * 100;
    if (currentStock <= minStock * 0.5) return { status: 'critical', color: 'bg-red-100 text-red-800' };
    if (currentStock <= minStock) return { status: 'low', color: 'bg-yellow-100 text-yellow-800' };
    if (percentage >= 90) return { status: 'overstocked', color: 'bg-blue-100 text-blue-800' };
    return { status: 'good', color: 'bg-green-100 text-green-800' };
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'inbound': return 'bg-green-100 text-green-800';
      case 'outbound': return 'bg-red-100 text-red-800';
      case 'transfer': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiry <= threeMonthsFromNow;
  };

  const handleReorderItem = (itemCode: string) => {
    toast({
      title: "Reorder Initiated",
      description: `Reorder request for item ${itemCode} has been submitted.`
    });
  };

  const handleStockAdjustment = (itemCode: string) => {
    setSelectedItemCode(itemCode);
    setStockAdjustmentOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredItems = inventoryItems.filter(item =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            Inventory Management
          </h1>
          <p className="text-muted-foreground">Track stock levels, manage supplies, and monitor inventory movements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalItems}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{stats.lowStockAlerts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expiring Items</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.expiringItems}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.pendingOrders}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Usage</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.monthlyConsumption)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Low Stock Alerts */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription>Items requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockItems.map((item, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          Critical
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p>Current: {item.currentStock}</p>
                        <p>Min: {item.minStock}</p>
                        <p>Shortage: <span className="text-red-600 font-medium">{item.shortage}</span></p>
                      </div>
                      <Button size="sm" className="w-full mt-2 h-7 text-xs">
                        Reorder Now
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Inventory */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="inventory" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="inventory">Inventory Items</TabsTrigger>
                <TabsTrigger value="movements">Stock Movements</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="inventory">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle>Inventory Items</CardTitle>
                        <CardDescription>Manage stock levels and item details</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search items..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-64"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredItems.map((item) => {
                        const stockStatus = getStockStatus(item.currentStock, item.minStock, item.maxStock);
                        const expiring = isExpiringSoon(item.expiryDate);
                        
                        return (
                          <div key={item.id} className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <div>
                                  <h3 className="font-semibold">{item.itemName}</h3>
                                  <p className="text-sm text-muted-foreground">Code: {item.itemCode}</p>
                                </div>
                                <Badge variant="outline">{item.category}</Badge>
                                <Badge className={stockStatus.color}>
                                  {stockStatus.status}
                                </Badge>
                                {expiring && (
                                  <Badge className="bg-orange-100 text-orange-800">
                                    Expiring Soon
                                  </Badge>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm"
                                  onClick={() => handleReorderItem(item.itemCode)}
                                >
                                  Reorder
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleStockAdjustment(item.itemCode)}
                                >
                                  Adjust Stock
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Current Stock</p>
                                <p className="font-medium">{item.currentStock} units</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Min Stock</p>
                                <p className="font-medium">{item.minStock} units</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Unit Price</p>
                                <p className="font-medium">{formatCurrency(item.unitPrice)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Location</p>
                                <p className="font-medium">{item.location}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-2">
                              <div>
                                <p className="text-muted-foreground">Supplier</p>
                                <p className="font-medium">{item.supplier}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Last Restocked</p>
                                <p className="font-medium">{item.lastRestocked}</p>
                              </div>
                              {item.expiryDate && (
                                <div>
                                  <p className="text-muted-foreground">Expiry Date</p>
                                  <p className="font-medium">{item.expiryDate}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="movements">
                <Card>
                  <CardHeader>
                    <CardTitle>Stock Movements</CardTitle>
                    <CardDescription>Track all inventory transactions and transfers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentMovements.map((movement) => (
                        <div key={movement.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <h3 className="font-semibold">{movement.item}</h3>
                              <Badge className={getMovementTypeColor(movement.type)}>
                                {movement.type}
                              </Badge>
                              <span className="font-medium">
                                {movement.type === 'outbound' ? '-' : '+'}{movement.quantity} units
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Department: {movement.department} • Time: {movement.timestamp}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Reference: {movement.reference}
                            </p>
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
                    <CardTitle>Inventory Reports</CardTitle>
                    <CardDescription>Generate comprehensive inventory reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" className="h-24 flex-col">
                        <Package className="h-6 w-6 mb-2" />
                        <span>Stock Level Report</span>
                      </Button>
                      <Button variant="outline" className="h-24 flex-col">
                        <AlertTriangle className="h-6 w-6 mb-2" />
                        <span>Low Stock Report</span>
                      </Button>
                      <Button variant="outline" className="h-24 flex-col">
                        <TrendingDown className="h-6 w-6 mb-2" />
                        <span>Consumption Report</span>
                      </Button>
                      <Button variant="outline" className="h-24 flex-col">
                        <Clock className="h-6 w-6 mb-2" />
                        <span>Expiry Report</span>
                      </Button>
                      <Button variant="outline" className="h-24 flex-col">
                        <TrendingUp className="h-6 w-6 mb-2" />
                        <span>Valuation Report</span>
                      </Button>
                      <Button variant="outline" className="h-24 flex-col">
                        <Package className="h-6 w-6 mb-2" />
                        <span>Movement History</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <StockAdjustmentDialog 
        open={stockAdjustmentOpen}
        onOpenChange={setStockAdjustmentOpen}
        itemCode={selectedItemCode}
      />
    </DashboardLayout>
  );
};

export default Inventory;