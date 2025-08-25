import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, DollarSign, Receipt, Search, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Cashier = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    patientId: '',
    amount: '',
    paymentMethod: '',
    invoiceNumber: '',
    notes: ''
  });
  
  const [pendingPayments] = useState([
    {
      id: 1,
      patientName: 'John Doe',
      patientId: 'P001',
      invoiceNumber: 'INV-2024-001',
      amount: 450.00,
      services: ['Consultation', 'Lab Test'],
      dueDate: '2024-01-15',
      priority: 'normal'
    },
    {
      id: 2,
      patientName: 'Jane Smith',
      patientId: 'P002',
      invoiceNumber: 'INV-2024-002',
      amount: 1200.00,
      services: ['Surgery', 'Medication'],
      dueDate: '2024-01-10',
      priority: 'overdue'
    },
    {
      id: 3,
      patientName: 'Mike Johnson',
      patientId: 'P003',
      invoiceNumber: 'INV-2024-003',
      amount: 275.00,
      services: ['X-Ray', 'Consultation'],
      dueDate: '2024-01-16',
      priority: 'normal'
    }
  ]);

  const [recentTransactions] = useState([
    {
      id: 1,
      receiptNumber: 'REC-2024-001',
      patientName: 'Alice Cooper',
      amount: 350.00,
      paymentMethod: 'Credit Card',
      timestamp: '10:30 AM',
      status: 'completed',
      cashier: 'Sarah Johnson'
    },
    {
      id: 2,
      receiptNumber: 'REC-2024-002',
      patientName: 'David Miller',
      amount: 125.00,
      paymentMethod: 'Cash',
      timestamp: '10:15 AM',
      status: 'completed',
      cashier: 'Sarah Johnson'
    },
    {
      id: 3,
      receiptNumber: 'REC-2024-003',
      patientName: 'Emily Brown',
      amount: 800.00,
      paymentMethod: 'Insurance',
      timestamp: '09:45 AM',
      status: 'processing',
      cashier: 'Sarah Johnson'
    }
  ]);

  const [cashRegister] = useState({
    openingBalance: 1000.00,
    currentBalance: 1875.00,
    totalReceived: 2250.00,
    totalRefunded: 125.00,
    transactionCount: 18
  });

  const [stats] = useState({
    todayRevenue: 12450.00,
    transactionsToday: 42,
    averageTransaction: 296.43,
    pendingPayments: 8,
    refundsProcessed: 3,
    cashOnHand: 1875.00
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePayment = (invoiceNumber: string, amount: number) => {
    toast({
      title: "Payment Processed",
      description: `Payment of $${amount.toFixed(2)} for invoice ${invoiceNumber} has been processed successfully.`
    });
  };

  const handleQuickPayment = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Payment Completed",
      description: `Payment of $${paymentForm.amount} has been processed via ${paymentForm.paymentMethod}.`
    });
    setPaymentForm({
      patientId: '',
      amount: '',
      paymentMethod: '',
      invoiceNumber: '',
      notes: ''
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredPayments = pendingPayments.filter(payment =>
    payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-primary" />
            Cashier Station
          </h1>
          <p className="text-muted-foreground">Process payments, manage cash register, and handle transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.todayRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold text-primary">{stats.transactionsToday}</p>
                </div>
                <Receipt className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Transaction</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.averageTransaction)}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Payments</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Refunds Today</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.refundsProcessed}</p>
                </div>
                <Receipt className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cash on Hand</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.cashOnHand)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Payment Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Payment</CardTitle>
                <CardDescription>Process patient payments quickly</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleQuickPayment} className="space-y-4">
                  <div>
                    <Label htmlFor="patientId">Patient ID / Invoice</Label>
                    <Input
                      id="patientId"
                      placeholder="Enter patient ID or invoice number"
                      value={paymentForm.patientId}
                      onChange={(e) => setPaymentForm({...paymentForm, patientId: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={paymentForm.paymentMethod} onValueChange={(value) => setPaymentForm({...paymentForm, paymentMethod: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="credit">Credit Card</SelectItem>
                        <SelectItem value="debit">Debit Card</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Process Payment
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Cash Register Status */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Cash Register</CardTitle>
                <CardDescription>Current session status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Opening Balance:</span>
                    <span className="font-medium">{formatCurrency(cashRegister.openingBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Received:</span>
                    <span className="font-medium text-green-600">{formatCurrency(cashRegister.totalReceived)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Refunded:</span>
                    <span className="font-medium text-red-600">{formatCurrency(cashRegister.totalRefunded)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Current Balance:</span>
                    <span className="text-primary">{formatCurrency(cashRegister.currentBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Transactions:</span>
                    <span className="font-medium">{cashRegister.transactionCount}</span>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <Button variant="outline" className="w-full">
                    Close Register
                  </Button>
                  <Button variant="outline" className="w-full">
                    Print Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Payments & Recent Transactions */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="pending" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending">Pending Payments</TabsTrigger>
                <TabsTrigger value="recent">Recent Transactions</TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle>Pending Payments</CardTitle>
                        <CardDescription>Outstanding invoices requiring payment</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search payments..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-64"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredPayments.map((payment) => (
                        <div key={payment.id} className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4">
                              <h3 className="font-semibold">{payment.patientName}</h3>
                              <Badge className={getPriorityColor(payment.priority)}>
                                {payment.priority}
                              </Badge>
                              <span className="text-xl font-bold text-primary">
                                {formatCurrency(payment.amount)}
                              </span>
                            </div>
                            <Button 
                              size="sm"
                              onClick={() => handlePayment(payment.invoiceNumber, payment.amount)}
                            >
                              <CreditCard className="mr-2 h-4 w-4" />
                              Process Payment
                            </Button>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            Patient ID: {payment.patientId} • Invoice: {payment.invoiceNumber}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Due Date: {payment.dueDate}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {payment.services.map((service, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recent">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Latest payment transactions processed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <h3 className="font-semibold">{transaction.receiptNumber}</h3>
                              <Badge className={getStatusColor(transaction.status)}>
                                {transaction.status}
                              </Badge>
                              <span className="text-lg font-bold text-green-600">
                                {formatCurrency(transaction.amount)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Patient: {transaction.patientName} • Time: {transaction.timestamp}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Method: {transaction.paymentMethod} • Cashier: {transaction.cashier}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Receipt className="mr-2 h-4 w-4" />
                              Print Receipt
                            </Button>
                            {transaction.status === 'completed' && (
                              <Button size="sm" variant="outline">
                                Refund
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Cashier;