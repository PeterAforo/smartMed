import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Truck,
  Clock,
  DollarSign,
  BarChart3,
  ShoppingCart,
  Warehouse,
  RefreshCw,
  Calendar,
  Eye,
  Edit,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unitCost: number;
  supplier: string;
  location: string;
  expiryDate?: string;
  batchNumber?: string;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'expired';
  lastUpdated: string;
}

interface InventoryManagerProps {
  className?: string;
}

const InventoryManager = ({ className }: InventoryManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock inventory data
  const inventoryData: InventoryItem[] = [
    {
      id: 'inv-001',
      itemCode: 'MED-001',
      name: 'Paracetamol 500mg',
      category: 'Medications',
      currentStock: 150,
      minimumStock: 50,
      maximumStock: 500,
      unitCost: 0.25,
      supplier: 'PharmaCorp Ltd',
      location: 'Pharmacy A1',
      expiryDate: '2025-12-31',
      batchNumber: 'BT2024001',
      status: 'available',
      lastUpdated: '2024-01-20'
    },
    {
      id: 'inv-002',
      itemCode: 'MED-002',
      name: 'Amoxicillin 250mg',
      category: 'Medications',
      currentStock: 25,
      minimumStock: 30,
      maximumStock: 200,
      unitCost: 1.50,
      supplier: 'MediSupply Inc',
      location: 'Pharmacy B2',
      expiryDate: '2024-06-30',
      batchNumber: 'BT2023098',
      status: 'low_stock',
      lastUpdated: '2024-01-19'
    },
    {
      id: 'inv-003',
      itemCode: 'SUR-001',
      name: 'Surgical Gloves (Box)',
      category: 'Surgical Supplies',
      currentStock: 0,
      minimumStock: 10,
      maximumStock: 100,
      unitCost: 15.00,
      supplier: 'SurgicalPro',
      location: 'OR Storage',
      status: 'out_of_stock',
      lastUpdated: '2024-01-18'
    },
    {
      id: 'inv-004',
      itemCode: 'LAB-001',
      name: 'Blood Test Tubes',
      category: 'Laboratory',
      currentStock: 75,
      minimumStock: 20,
      maximumStock: 200,
      unitCost: 0.75,
      supplier: 'LabTech Solutions',
      location: 'Lab Storage',
      status: 'available',
      lastUpdated: '2024-01-20'
    },
    {
      id: 'inv-005',
      itemCode: 'EQP-001',
      name: 'Syringes 5ml',
      category: 'Medical Equipment',
      currentStock: 200,
      minimumStock: 100,
      maximumStock: 1000,
      unitCost: 0.30,
      supplier: 'MedEquip Co',
      location: 'General Storage',
      status: 'available',
      lastUpdated: '2024-01-20'
    }
  ];

  const categories = ['All', 'Medications', 'Surgical Supplies', 'Laboratory', 'Medical Equipment', 'Consumables'];
  const statuses = ['All', 'Available', 'Low Stock', 'Out of Stock', 'Expired'];

  // Filter inventory based on search and filters
  const filteredInventory = inventoryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.itemCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus.toLowerCase().replace(' ', '_');
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate summary statistics
  const totalItems = inventoryData.length;
  const lowStockItems = inventoryData.filter(item => item.status === 'low_stock').length;
  const outOfStockItems = inventoryData.filter(item => item.status === 'out_of_stock').length;
  const totalValue = inventoryData.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="default">Available</Badge>;
      case 'low_stock':
        return <Badge variant="secondary">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive">Out of Stock</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStockIndicator = (item: InventoryItem) => {
    const percentage = (item.currentStock / item.maximumStock) * 100;
    let color = 'bg-green-500';
    
    if (item.currentStock <= item.minimumStock) {
      color = 'bg-red-500';
    } else if (percentage < 30) {
      color = 'bg-yellow-500';
    }

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  };

  return (
    <div className={`space-y-6 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Inventory Management</h2>
          <p className="text-muted-foreground">Track and manage medical supplies, equipment, and medications</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">{outOfStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search items by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                {categories.map(category => (
                  <option key={category} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                {statuses.map(status => (
                  <option key={status} value={status.toLowerCase()}>
                    {status}
                  </option>
                ))}
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>
                Showing {filteredInventory.length} of {totalItems} items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock Level</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.itemCode}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.batchNumber && (
                              <p className="text-xs text-muted-foreground">
                                Batch: {item.batchNumber}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{item.currentStock}</span>
                              <span className="text-muted-foreground">/{item.maximumStock}</span>
                            </div>
                            {getStockIndicator(item)}
                            <p className="text-xs text-muted-foreground">
                              Min: {item.minimumStock}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.supplier}</p>
                            <p className="text-xs text-muted-foreground">{item.location}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Purchase Orders</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'PO-001', supplier: 'PharmaCorp Ltd', total: '$2,450', status: 'pending', date: '2024-01-20' },
                  { id: 'PO-002', supplier: 'SurgicalPro', total: '$1,800', status: 'approved', date: '2024-01-19' },
                  { id: 'PO-003', supplier: 'LabTech Solutions', total: '$950', status: 'delivered', date: '2024-01-18' }
                ].map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-blue-100">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{order.id}</h4>
                        <p className="text-sm text-muted-foreground">{order.supplier}</p>
                        <p className="text-xs text-muted-foreground">{order.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">{order.total}</p>
                        <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
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
              <div className="flex items-center justify-between">
                <CardTitle>Suppliers</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'PharmaCorp Ltd', category: 'Pharmaceuticals', orders: 45, rating: 4.8 },
                  { name: 'SurgicalPro', category: 'Surgical Supplies', orders: 23, rating: 4.6 },
                  { name: 'LabTech Solutions', category: 'Laboratory Equipment', orders: 18, rating: 4.9 },
                  { name: 'MedEquip Co', category: 'Medical Equipment', orders: 31, rating: 4.7 }
                ].map((supplier, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-green-100">
                        <Truck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{supplier.name}</h4>
                        <p className="text-sm text-muted-foreground">{supplier.category}</p>
                        <p className="text-xs text-muted-foreground">{supplier.orders} orders</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">Rating: {supplier.rating}/5</p>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Turnover</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Inventory turnover analysis chart</p>
                  <p className="text-sm">Track inventory movement and efficiency</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock Level Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Stock level trend analysis</p>
                  <p className="text-sm">Monitor stock patterns over time</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">$12,450</p>
                  <p className="text-sm text-muted-foreground">Monthly Purchases</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">$8,920</p>
                  <p className="text-sm text-muted-foreground">Inventory Value</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">15%</p>
                  <p className="text-sm text-muted-foreground">Cost Savings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Auto-Reorder Threshold</label>
                  <Input placeholder="10%" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Low Stock Alert Days</label>
                  <Input placeholder="7 days" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expiry Alert Days</label>
                  <Input placeholder="30 days" />
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="low-stock" defaultChecked />
                  <label htmlFor="low-stock" className="text-sm">Low stock alerts</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="expiry" defaultChecked />
                  <label htmlFor="expiry" className="text-sm">Expiry alerts</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="orders" defaultChecked />
                  <label htmlFor="orders" className="text-sm">Order status updates</label>
                </div>
                <Button>Update Notifications</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryManager;