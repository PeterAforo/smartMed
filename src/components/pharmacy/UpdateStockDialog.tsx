import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UpdateStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drug?: {
    id: number;
    drugName: string;
    currentStock: number;
    minStock: number;
  } | null;
}

export const UpdateStockDialog = ({ open, onOpenChange, drug }: UpdateStockDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    stockChange: '',
    changeType: 'add',
    batchNumber: '',
    expiryDate: '',
    supplier: '',
    reason: '',
    unitCost: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.stockChange || !formData.reason) {
      toast({
        title: "Missing Information",
        description: "Please provide stock change amount and reason.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newStock = drug ? 
      (formData.changeType === 'add' ? 
        drug.currentStock + parseInt(formData.stockChange) : 
        drug.currentStock - parseInt(formData.stockChange)) : 0;
    
    toast({
      title: "Stock Updated",
      description: `${drug?.drugName} stock updated. New quantity: ${newStock} units`
    });
    
    setIsSubmitting(false);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      stockChange: '',
      changeType: 'add',
      batchNumber: '',
      expiryDate: '',
      supplier: '',
      reason: '',
      unitCost: ''
    });
  };

  if (!drug) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Update Stock - {drug.drugName}
          </DialogTitle>
          <DialogDescription>
            Current Stock: {drug.currentStock} units | Minimum Stock: {drug.minStock} units
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="changeType">Change Type</Label>
              <Select value={formData.changeType} onValueChange={(value) => handleInputChange('changeType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Stock</SelectItem>
                  <SelectItem value="remove">Remove Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockChange">Quantity *</Label>
              <Input
                id="stockChange"
                type="number"
                value={formData.stockChange}
                onChange={(e) => handleInputChange('stockChange', e.target.value)}
                placeholder="Enter quantity"
                min="1"
              />
            </div>
          </div>

          {formData.changeType === 'add' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batchNumber">Batch Number</Label>
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber}
                    onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                    placeholder="Enter batch number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    placeholder="Enter supplier name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitCost">Unit Cost (GHS)</Label>
                  <Input
                    id="unitCost"
                    type="number"
                    step="0.01"
                    value={formData.unitCost}
                    onChange={(e) => handleInputChange('unitCost', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Change *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Enter reason for stock change..."
              rows={3}
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Stock Calculation</p>
            <p className="text-sm text-muted-foreground">
              Current: {drug.currentStock} units
              {formData.stockChange && (
                <>
                  {' → '}
                  New: {formData.changeType === 'add' ? 
                    drug.currentStock + parseInt(formData.stockChange || '0') : 
                    drug.currentStock - parseInt(formData.stockChange || '0')} units
                </>
              )}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};