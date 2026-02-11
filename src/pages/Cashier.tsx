import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, Banknote, Receipt, Search, Clock, Loader2, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Cashier = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Fetch pending invoices
  const { data: pendingInvoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices', 'pending'],
    queryFn: () => api.getInvoices({ status: 'pending' }),
    refetchInterval: 15000
  });

  // Fetch today's paid invoices (recent transactions)
  const { data: paidInvoices = [] } = useQuery({
    queryKey: ['invoices', 'paid', today],
    queryFn: () => api.getInvoices({ status: 'paid', from_date: today, to_date: today }),
    refetchInterval: 15000
  });

  // Fetch invoice stats
  const { data: invoiceStats } = useQuery({
    queryKey: ['invoices', 'stats', today],
    queryFn: () => api.getInvoiceStats({ from_date: today, to_date: today }),
    refetchInterval: 30000
  });

  // Calculate stats
  const stats = {
    todayRevenue: parseFloat(invoiceStats?.total_collected || 0),
    transactionsToday: parseInt(invoiceStats?.paid_count || 0),
    pendingPayments: pendingInvoices.length,
    totalOutstanding: parseFloat(invoiceStats?.total_outstanding || 0),
    averageTransaction: invoiceStats?.paid_count > 0 
      ? parseFloat(invoiceStats?.total_collected || 0) / parseInt(invoiceStats?.paid_count || 1)
      : 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const openPaymentDialog = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.balance_due?.toString() || invoice.total_amount?.toString() || '');
    setPaymentMethod('cash');
    setPaymentDialogOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedInvoice || !paymentAmount) return;
    
    setIsProcessing(true);
    try {
      await api.recordPayment(selectedInvoice.id, {
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        notes: `Payment processed at cashier`
      });
      
      toast({
        title: "Payment Processed",
        description: `Payment of ${formatCurrency(parseFloat(paymentAmount))} has been recorded.`
      });
      
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setPaymentDialogOpen(false);
      setSelectedInvoice(null);
      setPaymentAmount('');
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredInvoices = pendingInvoices.filter((invoice: any) =>
    (invoice.first_name + ' ' + invoice.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.patient_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-primary" />
            Cashier Station
          </h1>
          <p className="text-muted-foreground">Process payments and manage billing transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.todayRevenue)}</p>
                </div>
                <Banknote className="h-8 w-8 text-green-600" />
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
                  <p className="text-sm text-muted-foreground">Avg Transaction</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.averageTransaction)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
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
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalOutstanding)}</p>
                </div>
                <CreditCard className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pending Payments ({pendingInvoices.length})</TabsTrigger>
            <TabsTrigger value="recent">Today's Transactions ({paidInvoices.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Pending Invoices</CardTitle>
                    <CardDescription>Outstanding invoices requiring payment</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, ID, or invoice..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredInvoices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending invoices found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredInvoices.map((invoice: any) => (
                      <div key={invoice.id} className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4 flex-wrap">
                            <h3 className="font-semibold">{invoice.first_name} {invoice.last_name}</h3>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                            <span className="text-xl font-bold text-primary">
                              {formatCurrency(parseFloat(invoice.balance_due || invoice.total_amount))}
                            </span>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => openPaymentDialog(invoice)}
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Process Payment
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Patient: {invoice.patient_number} • Invoice: {invoice.invoice_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total: {formatCurrency(parseFloat(invoice.total_amount))} • 
                          Paid: {formatCurrency(parseFloat(invoice.paid_amount || 0))} • 
                          Balance: {formatCurrency(parseFloat(invoice.balance_due || invoice.total_amount))}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Today's Transactions</CardTitle>
                <CardDescription>Payments processed today</CardDescription>
              </CardHeader>
              <CardContent>
                {paidInvoices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions today
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paidInvoices.map((invoice: any) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold">{invoice.invoice_number}</h3>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                            <span className="text-lg font-bold text-green-600">
                              {formatCurrency(parseFloat(invoice.paid_amount || invoice.total_amount))}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Patient: {invoice.first_name} {invoice.last_name} ({invoice.patient_number})
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Method: {invoice.payment_method || 'N/A'} • 
                            Date: {new Date(invoice.updated_at).toLocaleString()}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Receipt className="mr-2 h-4 w-4" />
                          Print Receipt
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Payment</DialogTitle>
              <DialogDescription>
                {selectedInvoice && (
                  <>Invoice {selectedInvoice.invoice_number} for {selectedInvoice.first_name} {selectedInvoice.last_name}</>
                )}
              </DialogDescription>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-4 py-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Total Amount:</span>
                    <span className="font-bold">{formatCurrency(parseFloat(selectedInvoice.total_amount))}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Already Paid:</span>
                    <span className="text-green-600">{formatCurrency(parseFloat(selectedInvoice.paid_amount || 0))}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Balance Due:</span>
                    <span className="text-primary">{formatCurrency(parseFloat(selectedInvoice.balance_due || selectedInvoice.total_amount))}</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="paymentAmount">Payment Amount</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleProcessPayment} disabled={isProcessing || !paymentAmount}>
                {isProcessing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
                ) : (
                  <><CreditCard className="mr-2 h-4 w-4" />Process Payment</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Cashier;
