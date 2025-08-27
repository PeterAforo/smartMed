import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Package, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreatePurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OrderItem {
  itemName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export const CreatePurchaseOrderDialog = ({ open, onOpenChange }: CreatePurchaseOrderDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { itemName: '', quantity: 1, unitCost: 0, total: 0 }
  ]);
  const [formData, setFormData] = useState({
    supplier: '',
    priority: 'normal',
    deliveryDate: '',
    department: '',
    approver: '',
    paymentTerms: '30',
    shippingAddress: '',
    specialInstructions: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { itemName: '', quantity: 1, unitCost: 0, total: 0 }]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const updatedItems = [...orderItems];
    if (field === 'itemName') {
      updatedItems[index][field] = value as string;
    } else {
      updatedItems[index][field] = value as number;
    }
    
    if (field === 'quantity' || field === 'unitCost') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitCost;
    }
    
    setOrderItems(updatedItems);
  };

  const calculateGrandTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const orderNumber = `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    toast({
      title: "Purchase Order Created",
      description: `Purchase Order ${orderNumber} has been created successfully. Total: $${calculateGrandTotal().toFixed(2)}`
    });

    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create Purchase Order
          </DialogTitle>
          <DialogDescription>
            Create a new purchase order for medical supplies and equipment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Supplier Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Supplier Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Select value={formData.supplier} onValueChange={(value) => handleInputChange('supplier', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medsupply-co">MedSupply Co.</SelectItem>
                    <SelectItem value="healthcare-supplies">Healthcare Supplies Inc.</SelectItem>
                    <SelectItem value="medtech-supplies">MedTech Supplies</SelectItem>
                    <SelectItem value="medical-equipment">Medical Equipment Ltd.</SelectItem>
                    <SelectItem value="pharma-corp">PharmaCorp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Required Delivery Date</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Requesting Department</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                    <SelectItem value="icu">ICU</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="laboratory">Laboratory</SelectItem>
                    <SelectItem value="radiology">Radiology</SelectItem>
                    <SelectItem value="general">General Supplies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Order Items</h3>
              <Button type="button" variant="outline" onClick={addOrderItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {orderItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                  <div className="col-span-5">
                    <Label className="text-xs">Item Description</Label>
                    <Input
                      value={item.itemName}
                      onChange={(e) => updateOrderItem(index, 'itemName', e.target.value)}
                      placeholder="Item name/description"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity.toString()}
                      onChange={(e) => updateOrderItem(index, 'quantity', Number(e.target.value))}
                      placeholder="1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Unit Cost</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unitCost.toString()}
                      onChange={(e) => updateOrderItem(index, 'unitCost', Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Total</Label>
                    <Input
                      value={`$${item.total.toFixed(2)}`}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="col-span-1">
                    {orderItems.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeOrderItem(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="flex justify-end">
              <div className="w-64 p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Grand Total:</span>
                  <span>${calculateGrandTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="approver">Approving Manager</Label>
                <Select value={formData.approver} onValueChange={(value) => handleInputChange('approver', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select approver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager-johnson">Manager Johnson</SelectItem>
                    <SelectItem value="director-smith">Director Smith</SelectItem>
                    <SelectItem value="supervisor-brown">Supervisor Brown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms (Days)</Label>
                <Select value={formData.paymentTerms} onValueChange={(value) => handleInputChange('paymentTerms', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">Net 15</SelectItem>
                    <SelectItem value="30">Net 30</SelectItem>
                    <SelectItem value="45">Net 45</SelectItem>
                    <SelectItem value="60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingAddress">Shipping Address</Label>
              <Textarea
                id="shippingAddress"
                value={formData.shippingAddress}
                onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                placeholder="Complete shipping address..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                id="specialInstructions"
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                placeholder="Any special delivery or handling instructions..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Purchase Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};