import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, AlertTriangle, TrendingUp, ShoppingCart, Search, Plus, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Stores = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for inventory items
  const [inventory] = useState([
    {
      id: 1,
      name: 'Medical Masks N95',
      category: 'PPE',
      currentStock: 450,
      minStock: 100,
      maxStock: 1000,
      unit: 'boxes',
      cost: 25.99,
      supplier: 'MedSupply Co.',
      lastOrdered: '2024-01-10',
      status: 'adequate'
    },
    {
      id: 2,
      name: 'Surgical Gloves (L)',
      category: 'PPE',
      currentStock: 75,
      minStock: 200,
      maxStock: 800,
      unit: 'boxes',
      cost: 12.50,
      supplier: 'Healthcare Supplies Inc.',
      lastOrdered: '2024-01-08',
      status: 'low'
    },
    {
      id: 3,
      name: 'Disposable Syringes 10ml',
      category: 'Medical Supplies',
      currentStock: 850,
      minStock: 300,
      maxStock: 1500,
      unit: 'units',
      cost: 0.85,
      supplier: 'MedTech Supplies',
      lastOrdered: '2024-01-12',
      status: 'adequate'
    },
    {
      id: 4,
      name: 'Blood Pressure Cuffs',
      category: 'Equipment',
      currentStock: 25,
      minStock: 50,
      maxStock: 100,
      unit: 'units',
      cost: 45.00,
      supplier: 'Medical Equipment Ltd.',
      lastOrdered: '2024-01-05',
      status: 'critical'
    }
  ]);

  // Mock data for pending orders
  const [pendingOrders] = useState([
    {
      id: 1,
      orderNumber: 'PO-2024-001',
      supplier: 'MedSupply Co.',
      items: 5,
      totalValue: 2850.50,
      orderDate: '2024-01-15',
      expectedDelivery: '2024-01-22',
      status: 'pending'
    },
    {
      id: 2,
      orderNumber: 'PO-2024-002',
      supplier: 'Healthcare Supplies Inc.',
      items: 3,
      totalValue: 1250.00,
      orderDate: '2024-01-14',
      expectedDelivery: '2024-01-20',
      status: 'shipped'
    }
  ]);

  const [storeStats] = useState({
    totalItems: 1245,
    lowStockItems: 8,
    criticalItems: 3,
    monthlyConsumption: 45000,
    pendingOrders: 12,
    totalValue: 125000
  });

  const getStockStatus = (item: any) => {
    if (item.currentStock <= item.minStock * 0.5) return 'critical';
    if (item.currentStock <= item.minStock) return 'low';
    return 'adequate';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500 text-white';
      case 'low': return 'bg-yellow-500 text-white';
      case 'adequate': return 'bg-green-500 text-white';
      case 'pending': return 'bg-blue-500 text-white';
      case 'shipped': return 'bg-purple-500 text-white';
      case 'delivered': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleReorderItem = (itemId: number) => {
    toast({
      title: "Reorder Initiated",
      description: "Purchase order has been created for this item.",
    });
  };

  const handleReceiveOrder = (orderId: number) => {
    toast({
      title: "Order Received",
      description: "Order has been marked as received and inventory updated.",
    });
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stores & Inventory</h1>
          <p className="text-muted-foreground">
            Manage medical supplies, equipment inventory, and procurement
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{storeStats.totalItems}</div>
              <p className="text-xs text-muted-foreground">
                Active inventory items
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{storeStats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">
                {storeStats.criticalItems} critical level
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Consumption</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(storeStats.monthlyConsumption)}</div>
              <p className="text-xs text-muted-foreground">
                Supply consumption value
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{storeStats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                Purchase orders pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(storeStats.totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                Current stock value
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">
                Optimal stock levels
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>
                  Monitor stock levels and manage medical supplies inventory
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items, categories, or suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredInventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{item.name}</h3>
                          <Badge variant="outline">{item.category}</Badge>
                          <Badge className={getStatusColor(getStockStatus(item))}>
                            {getStockStatus(item).toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Stock: {item.currentStock} {item.unit}</span>
                          <span>Min: {item.minStock}</span>
                          <span>Cost: {formatCurrency(item.cost)}</span>
                          <span>Supplier: {item.supplier}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-muted rounded-full h-2 max-w-xs">
                            <div 
                              className={`h-2 rounded-full ${
                                getStockStatus(item) === 'critical' ? 'bg-red-500' :
                                getStockStatus(item) === 'low' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(100, (item.currentStock / item.maxStock) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round((item.currentStock / item.maxStock) * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStockStatus(item) !== 'adequate' && (
                          <Button size="sm" onClick={() => handleReorderItem(item.id)}>
                            Reorder
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          History
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Purchase Orders</CardTitle>
                <CardDescription>
                  Track purchase orders and manage supplier deliveries
                </CardDescription>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Purchase Order
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{order.orderNumber}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.supplier}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Items: {order.items}</span>
                          <span>Value: {formatCurrency(order.totalValue)}</span>
                          <span>Ordered: {order.orderDate}</span>
                          <span>Expected: {order.expectedDelivery}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {order.status === 'shipped' && (
                          <Button size="sm" onClick={() => handleReceiveOrder(order.id)}>
                            <Truck className="mr-2 h-4 w-4" />
                            Receive
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Track
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Management</CardTitle>
                <CardDescription>
                  Manage supplier relationships and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { name: 'MedSupply Co.', performance: 95, orders: 24, avgDelivery: 3.2 },
                    { name: 'Healthcare Supplies Inc.', performance: 92, orders: 18, avgDelivery: 2.8 },
                    { name: 'MedTech Supplies', performance: 88, orders: 15, avgDelivery: 4.1 },
                    { name: 'Medical Equipment Ltd.', performance: 91, orders: 12, avgDelivery: 3.5 }
                  ].map((supplier, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{supplier.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Performance:</span>
                            <span className="font-medium">{supplier.performance}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Orders (YTD):</span>
                            <span>{supplier.orders}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Avg Delivery:</span>
                            <span>{supplier.avgDelivery} days</span>
                          </div>
                          <Button className="w-full mt-2" variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Reports</CardTitle>
                <CardDescription>
                  Generate comprehensive inventory and procurement reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Button variant="outline" className="h-20 flex-col">
                    <Package className="h-6 w-6 mb-2" />
                    Stock Level Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <TrendingUp className="h-6 w-6 mb-2" />
                    Consumption Analysis
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <ShoppingCart className="h-6 w-6 mb-2" />
                    Purchase Order History
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <AlertTriangle className="h-6 w-6 mb-2" />
                    Reorder Alerts
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Truck className="h-6 w-6 mb-2" />
                    Supplier Performance
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Package className="h-6 w-6 mb-2" />
                    Inventory Valuation
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

export default Stores;