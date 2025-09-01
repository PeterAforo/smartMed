import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DollarSign, 
  CreditCard, 
  FileText, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Receipt,
  Calculator,
  Calendar,
  Download,
  Send,
  Eye,
  Edit,
  Plus,
  Search,
  Filter,
  PieChart,
  BarChart3
} from 'lucide-react';
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface Invoice {
  id: string;
  invoiceNumber: string;
  patientName: string;
  patientId: string;
  dateIssued: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'paid' | 'partial' | 'overdue' | 'pending';
  services: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  insuranceClaim?: string;
}

interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'cash' | 'card' | 'insurance' | 'transfer';
  transactionId: string;
  processedBy: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

interface FinancialManagerProps {
  className?: string;
}

const FinancialManager = ({ className }: FinancialManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

  // Mock invoice data
  const invoicesData: Invoice[] = [
    {
      id: 'inv-001',
      invoiceNumber: 'INV-2024-001',
      patientName: 'Sarah Johnson',
      patientId: 'PT-001',
      dateIssued: '2024-01-20',
      dueDate: '2024-02-19',
      amount: 850.00,
      paidAmount: 850.00,
      status: 'paid',
      services: [
        { description: 'Consultation - Cardiology', quantity: 1, unitPrice: 300.00, total: 300.00 },
        { description: 'ECG Test', quantity: 1, unitPrice: 150.00, total: 150.00 },
        { description: 'Blood Tests', quantity: 1, unitPrice: 200.00, total: 200.00 },
        { description: 'Prescription', quantity: 1, unitPrice: 200.00, total: 200.00 }
      ],
      insuranceClaim: 'CLM-2024-001'
    },
    {
      id: 'inv-002',
      invoiceNumber: 'INV-2024-002',
      patientName: 'Michael Chen',
      patientId: 'PT-002',
      dateIssued: '2024-01-18',
      dueDate: '2024-02-17',
      amount: 1200.00,
      paidAmount: 600.00,
      status: 'partial',
      services: [
        { description: 'Emergency Consultation', quantity: 1, unitPrice: 500.00, total: 500.00 },
        { description: 'X-Ray Chest', quantity: 1, unitPrice: 200.00, total: 200.00 },
        { description: 'IV Fluids', quantity: 2, unitPrice: 150.00, total: 300.00 },
        { description: 'Medication', quantity: 1, unitPrice: 200.00, total: 200.00 }
      ]
    },
    {
      id: 'inv-003',
      invoiceNumber: 'INV-2024-003',
      patientName: 'Emily Davis',
      patientId: 'PT-003',
      dateIssued: '2024-01-15',
      dueDate: '2024-01-30',
      amount: 2500.00,
      paidAmount: 0.00,
      status: 'overdue',
      services: [
        { description: 'Surgical Procedure', quantity: 1, unitPrice: 2000.00, total: 2000.00 },
        { description: 'Anesthesia', quantity: 1, unitPrice: 300.00, total: 300.00 },
        { description: 'Post-op Care', quantity: 1, unitPrice: 200.00, total: 200.00 }
      ]
    },
    {
      id: 'inv-004',
      invoiceNumber: 'INV-2024-004',
      patientName: 'Robert Wilson',
      patientId: 'PT-004',
      dateIssued: '2024-01-22',
      dueDate: '2024-02-21',
      amount: 450.00,
      paidAmount: 0.00,
      status: 'pending',
      services: [
        { description: 'Routine Checkup', quantity: 1, unitPrice: 200.00, total: 200.00 },
        { description: 'Lab Tests', quantity: 1, unitPrice: 250.00, total: 250.00 }
      ]
    }
  ];

  // Mock payment data
  const paymentsData: Payment[] = [
    {
      id: 'pay-001',
      invoiceId: 'inv-001',
      amount: 850.00,
      method: 'insurance',
      transactionId: 'INS-2024-001',
      processedBy: 'Lisa Johnson',
      timestamp: '2024-01-21 10:30:00',
      status: 'completed'
    },
    {
      id: 'pay-002',
      invoiceId: 'inv-002',
      amount: 600.00,
      method: 'card',
      transactionId: 'CC-2024-002',
      processedBy: 'Mark Davis',
      timestamp: '2024-01-19 14:15:00',
      status: 'completed'
    },
    {
      id: 'pay-003',
      invoiceId: 'inv-004',
      amount: 450.00,
      method: 'cash',
      transactionId: 'CASH-2024-003',
      processedBy: 'Sarah Wilson',
      timestamp: '2024-01-22 16:45:00',
      status: 'pending'
    }
  ];

  // Filter invoices
  const filteredInvoices = invoicesData.filter(invoice => {
    const matchesSearch = invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate financial metrics
  const totalRevenue = invoicesData.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoicesData.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOutstanding = totalRevenue - totalPaid;
  const overdueAmount = invoicesData
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default">Paid</Badge>;
      case 'partial':
        return <Badge variant="secondary">Partial</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'cash':
        return <Badge variant="outline">Cash</Badge>;
      case 'card':
        return <Badge variant="secondary">Card</Badge>;
      case 'insurance':
        return <Badge variant="default">Insurance</Badge>;
      case 'transfer':
        return <Badge variant="outline">Transfer</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className={`space-y-6 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Financial Management</h2>
          <p className="text-muted-foreground">Billing, invoicing, payments, and financial reporting</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-green-600">+12% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Collected</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
                <p className="text-xs text-blue-600">{Math.round((totalPaid / totalRevenue) * 100)}% of total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</p>
                <p className="text-xs text-yellow-600">{Math.round((totalOutstanding / totalRevenue) * 100)}% pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{formatCurrency(overdueAmount)}</p>
                <p className="text-xs text-red-600">Requires follow-up</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="accounting">Accounting</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search invoices by patient name or invoice number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisQuarter">This Quarter</option>
                <option value="thisYear">This Year</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>
                Showing {filteredInvoices.length} of {invoicesData.length} invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date Issued</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.patientName}</p>
                            <p className="text-sm text-muted-foreground">{invoice.patientId}</p>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(invoice.dateIssued).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{formatCurrency(invoice.paidAmount)}</p>
                            {invoice.amount > invoice.paidAmount && (
                              <p className="text-sm text-red-600">
                                {formatCurrency(invoice.amount - invoice.paidAmount)} due
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Send className="h-4 w-4" />
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

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
              <CardDescription>Recent payment activities and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Processed By</TableHead>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsData.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.transactionId}</TableCell>
                        <TableCell>{payment.invoiceId.toUpperCase()}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{getPaymentMethodBadge(payment.method)}</TableCell>
                        <TableCell>{payment.processedBy}</TableCell>
                        <TableCell>{new Date(payment.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Monthly revenue trends chart</p>
                  <p className="text-sm">Track income patterns over time</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Payment method distribution</p>
                  <p className="text-sm">Cash vs Card vs Insurance breakdown</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-xs text-green-600">+12% vs last month</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalPaid)}</p>
                  <p className="text-sm text-muted-foreground">Collections</p>
                  <p className="text-xs text-blue-600">{Math.round((totalPaid / totalRevenue) * 100)}% collection rate</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600">{formatCurrency(totalOutstanding)}</p>
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-xs text-yellow-600">Accounts receivable</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{formatCurrency(overdueAmount)}</p>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-xs text-red-600">Needs attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { claimId: 'CLM-2024-001', patient: 'Sarah Johnson', amount: '$850', status: 'approved', date: '2024-01-20' },
                  { claimId: 'CLM-2024-002', patient: 'Michael Chen', amount: '$600', status: 'pending', date: '2024-01-18' },
                  { claimId: 'CLM-2024-003', patient: 'Emily Davis', amount: '$2500', status: 'rejected', date: '2024-01-15' }
                ].map((claim) => (
                  <div key={claim.claimId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Receipt className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{claim.claimId}</h4>
                        <p className="text-sm text-muted-foreground">{claim.patient}</p>
                        <p className="text-xs text-muted-foreground">{claim.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">{claim.amount}</p>
                        <Badge variant={claim.status === 'approved' ? 'default' : claim.status === 'pending' ? 'secondary' : 'destructive'}>
                          {claim.status}
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

        <TabsContent value="accounting" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Accounts Receivable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>0-30 days</span>
                    <span className="font-bold">${(totalOutstanding * 0.6).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>31-60 days</span>
                    <span className="font-bold">${(totalOutstanding * 0.25).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>61-90 days</span>
                    <span className="font-bold">${(totalOutstanding * 0.10).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>90+ days</span>
                    <span className="font-bold text-red-600">${(totalOutstanding * 0.05).toFixed(0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Revenue Target</span>
                    <span className="font-bold">$15,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actual Revenue</span>
                    <span className="font-bold text-green-600">{formatCurrency(totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Collection Rate</span>
                    <span className="font-bold">{Math.round((totalPaid / totalRevenue) * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Achievement</span>
                    <span className="font-bold text-blue-600">{Math.round((totalRevenue / 15000) * 100)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Invoice Prefix</label>
                  <Input placeholder="INV-" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Terms (Days)</label>
                  <Input placeholder="30" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Late Fee (%)</label>
                  <Input placeholder="2" />
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="cash" defaultChecked />
                  <label htmlFor="cash" className="text-sm">Cash payments</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="card" defaultChecked />
                  <label htmlFor="card" className="text-sm">Credit/Debit cards</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="insurance" defaultChecked />
                  <label htmlFor="insurance" className="text-sm">Insurance billing</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="transfer" defaultChecked />
                  <label htmlFor="transfer" className="text-sm">Bank transfers</label>
                </div>
                <Button>Update Methods</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialManager;