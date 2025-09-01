import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Banknote, AlertTriangle } from "lucide-react";

interface ProcessRefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProcessRefundDialog = ({ open, onOpenChange }: ProcessRefundDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    receiptNumber: '',
    originalAmount: '',
    refundAmount: '',
    refundMethod: '',
    reason: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Refund Processed",
      description: `Refund of ₵${formData.refundAmount} has been processed successfully.`
    });
    
    // Reset form
    setFormData({
      receiptNumber: '',
      originalAmount: '',
      refundAmount: '',
      refundMethod: '',
      reason: '',
      notes: ''
    });
    
    onOpenChange(false);
  };

  const validateRefundAmount = () => {
    const original = parseFloat(formData.originalAmount);
    const refund = parseFloat(formData.refundAmount);
    return refund <= original;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Process Refund
          </DialogTitle>
          <DialogDescription>
            Process a refund for a previous transaction.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="receiptNumber">Receipt Number</Label>
            <Input
              id="receiptNumber"
              placeholder="e.g., REC-2024-001"
              value={formData.receiptNumber}
              onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originalAmount">Original Amount</Label>
              <div className="relative">
                <Banknote className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="originalAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-9"
                  value={formData.originalAmount}
                  onChange={(e) => setFormData({ ...formData, originalAmount: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="refundAmount">Refund Amount</Label>
              <div className="relative">
                <Banknote className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="refundAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-9"
                  value={formData.refundAmount}
                  onChange={(e) => setFormData({ ...formData, refundAmount: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {formData.originalAmount && formData.refundAmount && !validateRefundAmount() && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Refund amount cannot exceed the original transaction amount.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="refundMethod">Refund Method</Label>
            <Select value={formData.refundMethod} onValueChange={(value) => setFormData({ ...formData, refundMethod: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select refund method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original-method">Original Payment Method</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="credit">Credit Card</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="store-credit">Store Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Refund Reason</Label>
            <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select refund reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cancelled-service">Cancelled Service</SelectItem>
                <SelectItem value="billing-error">Billing Error</SelectItem>
                <SelectItem value="duplicate-payment">Duplicate Payment</SelectItem>
                <SelectItem value="patient-request">Patient Request</SelectItem>
                <SelectItem value="insurance-adjustment">Insurance Adjustment</SelectItem>
                <SelectItem value="overpayment">Overpayment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes about the refund..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!validateRefundAmount() || !formData.receiptNumber || !formData.refundAmount}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Process Refund
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};