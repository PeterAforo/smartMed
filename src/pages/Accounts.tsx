import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Banknote, FileText, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Accounts = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [invoices] = useState([
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      patientName: 'John Doe',
      patientId: 'P001',
      amount: 1250.00,
      date: '2024-01-15',
      status: 'paid',
      services: ['Consultation', 'Lab Tests', 'Medication'],
      paymentMethod: 'Insurance'
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002',
      patientName: 'Jane Smith',
      patientId: 'P002',
      amount: 850.00,
      date: '2024-01-15',
      status: 'pending',
      services: ['X-Ray', 'Consultation'],
      paymentMethod: 'Cash'
    },
    {
      id: 3,
      invoiceNumber: 'INV-2024-003',
      patientName: 'Mike Johnson',
      patientId: 'P003',
      amount: 2100.00,
      date: '2024-01-14',
      status: 'overdue',
      services: ['Surgery', 'Hospital Stay', 'Medication'],
      paymentMethod: 'Insurance'
    }
  ]);

  const [payments] = useState([
    {
      id: 1,
      receiptNumber: 'REC-2024-001',
      patientName: 'John Doe',
      amount: 1250.00,
      paymentDate: '2024-01-15',
      paymentMethod: 'Insurance Claim',
      invoiceNumber: 'INV-2024-001',
      status: 'completed'
    },
    {
      id: 2,
      receiptNumber: 'REC-2024-002',
      patientName: 'Alice Cooper',
      amount: 450.00,
      paymentDate: '2024-01-15',
      paymentMethod: 'Credit Card',
      invoiceNumber: 'INV-2024-004',
      status: 'completed'
    },
    {
      id: 3,
      receiptNumber: 'REC-2024-003',
      patientName: 'David Miller',
      amount: 300.00,
      paymentDate: '2024-01-15',
      paymentMethod: 'Cash',
      invoiceNumber: 'INV-2024-005',
      status: 'processing'
    }
  ]);

  const [financialData] = useState({
    todayRevenue: 12450.00,
    weeklyRevenue: 85300.00,
    monthlyRevenue: 324750.00,
    outstandingBalance: 45680.00,
    overdueAmount: 15230.00,
    totalInvoices: 156,
    paidInvoices: 142,
    pendingInvoices: 14
  });

  const [expenses] = useState([
    { id: 1, category: 'Medical Supplies', amount: 5800.00, date: '2024-01-15', vendor: 'MedSupply Co.' },
    { id: 2, category: 'Equipment Maintenance', amount: 2300.00, date: '2024-01-14', vendor: 'TechService Ltd.' },
    { id: 3, category: 'Utilities', amount: 1200.00, date: '2024-01-13', vendor: 'Power Company' },
    { id: 4, category: 'Staff Salaries', amount: 45000.00, date: '2024-01-01', vendor: 'Payroll' }
  ]);

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGenerateInvoice = () => {
    toast({
      title: "Invoice Generated",
      description: "New invoice has been created successfully."
    });
  };

  const handleProcessPayment = (invoiceId: string) => {
    toast({
      title: "Payment Processed",
      description: `Payment for invoice ${invoiceId} has been processed.`
    });
  };

  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString('en-GH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-8 w-8 text-primary" />
            Accounts Department
          </h1>
          <p className="text-muted-foreground">Financial management, billing, and revenue tracking</p>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(financialData.todayRevenue)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5% from yesterday
                  </p>
                </div>
                <Banknote className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(financialData.monthlyRevenue)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.3% from last month
                  </p>
                </div>
                <Calculator className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-yellow-600">{formatCurrency(financialData.outstandingBalance)}</p>
                  <p className="text-xs text-yellow-600">From {financialData.pendingInvoices} invoices</p>
                </div>
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue Amount</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(financialData.overdueAmount)}</p>
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Requires attention
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Patient Invoices</CardTitle>
                    <CardDescription>Manage patient billing and invoices</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Button onClick={handleGenerateInvoice}>
                      <FileText className="mr-2 h-4 w-4" />
                      New Invoice
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                          <Badge className={getInvoiceStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                          <span className="text-2xl font-bold text-primary">
                            {formatCurrency(invoice.amount)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {invoice.status === 'pending' && (
                            <Button 
                              size="sm"
                              onClick={() => handleProcessPayment(invoice.invoiceNumber)}
                            >
                              Process Payment
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            View Invoice
                          </Button>
                          <Button size="sm" variant="outline">
                            Print
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Patient: {invoice.patientName} ({invoice.patientId})
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Date: {invoice.date} • Payment: {invoice.paymentMethod}
                          </p>
                          <div>
                            <p className="text-sm font-medium mb-1">Services:</p>
                            <div className="flex flex-wrap gap-1">
                              {invoice.services.map((service, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Records</CardTitle>
                <CardDescription>Track all incoming payments and receipts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold">{payment.receiptNumber}</h3>
                          <Badge className={getPaymentStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Patient: {payment.patientName} • Date: {payment.paymentDate}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Method: {payment.paymentMethod} • Invoice: {payment.invoiceNumber}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          Receipt
                        </Button>
                        <Button size="sm" variant="outline">
                          Refund
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle>Hospital Expenses</CardTitle>
                <CardDescription>Track operational expenses and vendor payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold">{expense.category}</h3>
                          <span className="text-lg font-bold text-red-600">
                            -{formatCurrency(expense.amount)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Vendor: {expense.vendor} • Date: {expense.date}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
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
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>Generate comprehensive financial reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex-col">
                    <Banknote className="h-6 w-6 mb-2" />
                    <span>Revenue Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    <span>Invoice Summary</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <CreditCard className="h-6 w-6 mb-2" />
                    <span>Payment Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <TrendingDown className="h-6 w-6 mb-2" />
                    <span>Expense Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Calculator className="h-6 w-6 mb-2" />
                    <span>P&L Statement</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <TrendingUp className="h-6 w-6 mb-2" />
                    <span>Financial Summary</span>
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

export default Accounts;