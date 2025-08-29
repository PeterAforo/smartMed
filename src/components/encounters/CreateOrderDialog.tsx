import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrders } from '@/hooks/useOrders';
import { useEncounter } from '@/hooks/useEncounters';
import { toast } from 'sonner';

interface CreateOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  encounterId: string;
}

export function CreateOrderDialog({ isOpen, onClose, encounterId }: CreateOrderDialogProps) {
  const [orderType, setOrderType] = useState<'lab' | 'imaging' | 'pharmacy' | 'service' | 'procedure'>('lab');
  const [orderCode, setOrderCode] = useState('');
  const [orderName, setOrderName] = useState('');
  const [priority, setPriority] = useState<'stat' | 'urgent' | 'routine'>('routine');
  const [instructions, setInstructions] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const { createOrder, isCreating } = useOrders();
  const { data: encounter } = useEncounter(encounterId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderCode.trim() || !orderName.trim()) {
      toast.error('Order code and name are required');
      return;
    }

    if (!encounter) {
      toast.error('Encounter not found');
      return;
    }

    try {
      await createOrder({
        encounter_id: encounterId,
        patient_id: encounter.patient_id,
        order_type: orderType,
        order_code: orderCode.trim(),
        order_name: orderName.trim(),
        priority,
        instructions: instructions.trim() || undefined,
        clinical_notes: clinicalNotes.trim() || undefined
      });
      
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const resetForm = () => {
    setOrderType('lab');
    setOrderCode('');
    setOrderName('');
    setPriority('routine');
    setInstructions('');
    setClinicalNotes('');
  };

  const getOrderTypeOptions = () => {
    switch (orderType) {
      case 'lab':
        return [
          { code: 'CBC', name: 'Complete Blood Count' },
          { code: 'BMP', name: 'Basic Metabolic Panel' },
          { code: 'LFT', name: 'Liver Function Tests' },
          { code: 'UA', name: 'Urinalysis' },
          { code: 'HbA1c', name: 'Hemoglobin A1c' }
        ];
      case 'imaging':
        return [
          { code: 'CXR', name: 'Chest X-Ray' },
          { code: 'CT-HEAD', name: 'CT Head' },
          { code: 'CT-CHEST', name: 'CT Chest' },
          { code: 'MRI-BRAIN', name: 'MRI Brain' },
          { code: 'US-ABD', name: 'Ultrasound Abdomen' }
        ];
      case 'pharmacy':
        return [
          { code: 'AMOX', name: 'Amoxicillin 500mg' },
          { code: 'PARA', name: 'Paracetamol 500mg' },
          { code: 'IBUPR', name: 'Ibuprofen 400mg' },
          { code: 'METRO', name: 'Metronidazole 400mg' },
          { code: 'OMEP', name: 'Omeprazole 20mg' }
        ];
      case 'service':
        return [
          { code: 'PHYSIO', name: 'Physiotherapy Session' },
          { code: 'CONSULT', name: 'Specialist Consultation' },
          { code: 'COUNSEL', name: 'Patient Counseling' },
          { code: 'NUTRI', name: 'Nutrition Assessment' }
        ];
      case 'procedure':
        return [
          { code: 'BIOPSY', name: 'Tissue Biopsy' },
          { code: 'ENDO', name: 'Endoscopy' },
          { code: 'COLO', name: 'Colonoscopy' },
          { code: 'ECG', name: 'Electrocardiogram' },
          { code: 'ECHO', name: 'Echocardiogram' }
        ];
      default:
        return [];
    }
  };

  const handleQuickSelect = (code: string, name: string) => {
    setOrderCode(code);
    setOrderName(name);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>
        
        {encounter && (
          <div className="p-3 bg-muted rounded-lg mb-4">
            <p className="font-medium">
              {(encounter as any)?.patients?.first_name} {(encounter as any)?.patients?.last_name}
            </p>
            <p className="text-sm text-muted-foreground">
              Encounter: {encounter.encounter_number} ({encounter.encounter_type})
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderType">Order Type</Label>
            <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lab">Laboratory</SelectItem>
                <SelectItem value="imaging">Imaging</SelectItem>
                <SelectItem value="pharmacy">Pharmacy</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="procedure">Procedure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Select Options */}
          <div className="space-y-2">
            <Label>Quick Select</Label>
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
              {getOrderTypeOptions().map((option) => (
                <Button
                  key={option.code}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => handleQuickSelect(option.code, option.name)}
                >
                  {option.code} - {option.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderCode">Order Code *</Label>
              <Input
                id="orderCode"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder="e.g., CBC, CXR"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="stat">STAT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderName">Order Name *</Label>
            <Input
              id="orderName"
              value={orderName}
              onChange={(e) => setOrderName(e.target.value)}
              placeholder="e.g., Complete Blood Count"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Special instructions for the order"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicalNotes">Clinical Notes</Label>
            <Textarea
              id="clinicalNotes"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Clinical indication or notes"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}