import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Package, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemCode?: string;
}

export const StockAdjustmentDialog = ({ open, onOpenChange, itemCode }: StockAdjustmentDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    itemCode: itemCode || '',
    itemName: '',
    currentStock: 0,
    adjustmentType: 'increase',
    quantity: 0,
    reason: '',
    reference: '',
    notes: ''
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateNewStock = () => {
    if (formData.adjustmentType === 'increase') {
      return formData.currentStock + formData.quantity;
    } else {
      return Math.max(0, formData.currentStock - formData.quantity);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newStock = calculateNewStock();
    toast({
      title: "Stock Adjusted",
      description: `Stock for ${formData.itemCode} has been adjusted from ${formData.currentStock} to ${newStock} units.`
    });

    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Adjustment
          </DialogTitle>
          <DialogDescription>
            Adjust inventory stock levels for items
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemCode">Item Code</Label>
              <Input
                id="itemCode"
                value={formData.itemCode}
                onChange={(e) => handleInputChange('itemCode', e.target.value)}
                placeholder="SG-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={formData.itemName}
                onChange={(e) => handleInputChange('itemName', e.target.value)}
                placeholder="Surgical Gloves"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentStock">Current Stock</Label>
            <Input
              id="currentStock"
              type="number"
              value={formData.currentStock}
              onChange={(e) => handleInputChange('currentStock', Number(e.target.value))}
              placeholder="Current quantity"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustmentType">Adjustment Type</Label>
            <Select 
              value={formData.adjustmentType} 
              onValueChange={(value) => handleInputChange('adjustmentType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select adjustment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="increase">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-600" />
                    Increase Stock
                  </div>
                </SelectItem>
                <SelectItem value="decrease">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-red-600" />
                    Decrease Stock
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Adjustment Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
              placeholder="Quantity to adjust"
              required
            />
          </div>

          {/* Stock Calculation Display */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span>Current Stock:</span>
              <span className="font-medium">{formData.currentStock} units</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>Adjustment:</span>
              <span className={`font-medium ${formData.adjustmentType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                {formData.adjustmentType === 'increase' ? '+' : '-'}{formData.quantity} units
              </span>
            </div>
            <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
              <span>New Stock:</span>
              <span>{calculateNewStock()} units</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Adjustment</Label>
            <Select value={formData.reason} onValueChange={(value) => handleInputChange('reason', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="damaged">Damaged Items</SelectItem>
                <SelectItem value="expired">Expired Items</SelectItem>
                <SelectItem value="lost">Lost/Stolen Items</SelectItem>
                <SelectItem value="found">Items Found</SelectItem>
                <SelectItem value="recount">Stock Recount</SelectItem>
                <SelectItem value="supplier-error">Supplier Error</SelectItem>
                <SelectItem value="system-error">System Error</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => handleInputChange('reference', e.target.value)}
              placeholder="ADJ-2024-001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about the adjustment..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Adjust Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};