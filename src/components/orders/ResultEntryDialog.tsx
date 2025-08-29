import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useResults } from '@/hooks/useResults';
import { useOrder } from '@/hooks/useOrders';
import { toast } from 'sonner';

interface ResultEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export function ResultEntryDialog({ isOpen, onClose, orderId }: ResultEntryDialogProps) {
  const [resultData, setResultData] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState('');
  const [criticalFlag, setCriticalFlag] = useState(false);

  const { createResult, isCreating } = useResults();
  const { data: order } = useOrder(orderId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!order) {
      toast.error('Order not found');
      return;
    }

    if (Object.keys(resultData).length === 0) {
      toast.error('Please enter at least one result value');
      return;
    }

    try {
      await createResult({
        order_id: orderId,
        patient_id: order.patient_id,
        result_type: order.order_type === 'lab' ? 'lab' : 
                    order.order_type === 'imaging' ? 'imaging' : 'other',
        result_data: resultData,
        critical_flag: criticalFlag,
        notes: notes.trim() || undefined
      });
      
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating result:', error);
    }
  };

  const resetForm = () => {
    setResultData({});
    setNotes('');
    setCriticalFlag(false);
  };

  const handleResultChange = (key: string, value: string) => {
    setResultData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRemoveResult = (key: string) => {
    setResultData(prev => {
      const newData = { ...prev };
      delete newData[key];
      return newData;
    });
  };

  const getResultFields = () => {
    if (!order) return [];

    switch (order.order_type) {
      case 'lab':
        return getLabFields(order.order_code);
      case 'imaging':
        return getImagingFields();
      default:
        return getGenericFields();
    }
  };

  const getLabFields = (orderCode: string) => {
    switch (orderCode) {
      case 'CBC':
        return [
          { key: 'wbc', label: 'WBC Count', unit: '×10³/μL', normalRange: '4.0-11.0' },
          { key: 'rbc', label: 'RBC Count', unit: '×10⁶/μL', normalRange: '4.2-5.4' },
          { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', normalRange: '12.0-16.0' },
          { key: 'hematocrit', label: 'Hematocrit', unit: '%', normalRange: '36-46' },
          { key: 'platelets', label: 'Platelets', unit: '×10³/μL', normalRange: '150-450' }
        ];
      case 'BMP':
        return [
          { key: 'glucose', label: 'Glucose', unit: 'mg/dL', normalRange: '70-100' },
          { key: 'sodium', label: 'Sodium', unit: 'mEq/L', normalRange: '136-145' },
          { key: 'potassium', label: 'Potassium', unit: 'mEq/L', normalRange: '3.5-5.1' },
          { key: 'chloride', label: 'Chloride', unit: 'mEq/L', normalRange: '98-107' },
          { key: 'bun', label: 'BUN', unit: 'mg/dL', normalRange: '7-20' },
          { key: 'creatinine', label: 'Creatinine', unit: 'mg/dL', normalRange: '0.6-1.2' }
        ];
      default:
        return [
          { key: 'result', label: 'Result', unit: '', normalRange: '' },
          { key: 'reference', label: 'Reference Value', unit: '', normalRange: '' }
        ];
    }
  };

  const getImagingFields = () => {
    return [
      { key: 'findings', label: 'Findings', unit: '', normalRange: '' },
      { key: 'impression', label: 'Impression', unit: '', normalRange: '' },
      { key: 'recommendation', label: 'Recommendations', unit: '', normalRange: '' }
    ];
  };

  const getGenericFields = () => {
    return [
      { key: 'result', label: 'Result', unit: '', normalRange: '' },
      { key: 'observation', label: 'Observations', unit: '', normalRange: '' }
    ];
  };

  if (!order) {
    return null;
  }

  const resultFields = getResultFields();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enter Result</DialogTitle>
        </DialogHeader>
        
        <div className="p-3 bg-muted rounded-lg mb-4">
          <h3 className="font-medium">{order.order_name}</h3>
          <p className="text-sm text-muted-foreground">
            Order: {order.order_number} • Code: {order.order_code}
          </p>
          <p className="text-sm text-muted-foreground">
            Patient: {(order as any)?.patients?.first_name} {(order as any)?.patients?.last_name}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Result Fields */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Result Values</Label>
            
            {resultFields.map((field) => (
              <div key={field.key} className="grid grid-cols-12 gap-3 items-center">
                <Label className="col-span-3 text-sm">{field.label}</Label>
                <div className="col-span-6">
                  {field.key === 'findings' || field.key === 'impression' || field.key === 'recommendation' || field.key === 'observation' ? (
                    <Textarea
                      value={resultData[field.key] || ''}
                      onChange={(e) => handleResultChange(field.key, e.target.value)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      rows={2}
                    />
                  ) : (
                    <Input
                      value={resultData[field.key] || ''}
                      onChange={(e) => handleResultChange(field.key, e.target.value)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>
                <div className="col-span-2 text-xs text-muted-foreground">
                  {field.unit && <div>{field.unit}</div>}
                </div>
                <div className="col-span-1">
                  {resultData[field.key] && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveResult(field.key)}
                      className="text-destructive hover:text-destructive"
                    >
                      ×
                    </Button>
                  )}
                </div>
                {field.normalRange && (
                  <div className="col-span-12 text-xs text-muted-foreground ml-[25%]">
                    Normal: {field.normalRange}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional observations, comments, or interpretations"
              rows={3}
            />
          </div>

          {/* Critical Flag */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="critical"
              checked={criticalFlag}
              onCheckedChange={(checked) => setCriticalFlag(checked as boolean)}
            />
            <Label htmlFor="critical" className="text-sm">
              Mark as critical result (requires immediate attention)
            </Label>
          </div>

          {criticalFlag && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Critical Result:</strong> This result will be flagged for immediate physician review and may trigger automated alerts.
              </p>
            </div>
          )}

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
              {isCreating ? 'Saving...' : 'Save Result'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}