import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface NewLabOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  onSuccess: () => void;
}

export const NewLabOrderDialog: React.FC<NewLabOrderDialogProps> = ({
  open,
  onOpenChange,
  patientId,
  onSuccess
}) => {
  const { toast } = useToast();
  const { profile, currentBranch } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: patientId || '',
    order_number: `LAB-${Date.now()}`,
    ordering_physician: '',
    priority: 'routine',
    clinical_indication: '',
    fasting_required: false,
    patient_preparation: '',
    tests_ordered: [] as string[],
    lab_facility: '',
    special_instructions: ''
  });

  const availableTests = [
    'Complete Blood Count (CBC)',
    'Basic Metabolic Panel (BMP)',
    'Comprehensive Metabolic Panel (CMP)',
    'Lipid Panel',
    'Liver Function Tests (LFTs)',
    'Thyroid Function Tests',
    'Hemoglobin A1C',
    'Urinalysis',
    'Prothrombin Time (PT/INR)',
    'Partial Thromboplastin Time (PTT)',
    'C-Reactive Protein (CRP)',
    'Erythrocyte Sedimentation Rate (ESR)',
    'Vitamin D',
    'Vitamin B12',
    'Folate',
    'Iron Studies',
    'Troponin',
    'BNP/NT-proBNP',
    'PSA',
    'CEA'
  ];

  const handleTestChange = (test: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tests_ordered: checked
        ? [...prev.tests_ordered, test]
        : prev.tests_ordered.filter(t => t !== test)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.tenant_id || !currentBranch?.id) return;

    if (formData.tests_ordered.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one test.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('lab_orders')
        .insert({
          patient_id: formData.patient_id,
          tenant_id: profile.tenant_id,
          branch_id: currentBranch.id,
          order_number: formData.order_number,
          ordered_by: profile.user_id,
          ordering_physician: formData.ordering_physician || null,
          priority: formData.priority,
          clinical_indication: formData.clinical_indication,
          fasting_required: formData.fasting_required,
          patient_preparation: formData.patient_preparation || null,
          tests_ordered: formData.tests_ordered,
          lab_facility: formData.lab_facility || null,
          special_instructions: formData.special_instructions || null,
          status: 'ordered'
        });

      if (error) throw error;

      // Log activity
      await supabase.from('activities').insert({
        user_id: profile.user_id,
        tenant_id: profile.tenant_id,
        branch_id: currentBranch.id,
        entity_type: 'lab_order',
        entity_id: formData.patient_id,
        activity_type: 'create',
        description: `Lab order ${formData.order_number} created with ${formData.tests_ordered.length} tests`
      });

      toast({
        title: "Success",
        description: "Lab order created successfully.",
      });

      // Reset form
      setFormData({
        patient_id: patientId || '',
        order_number: `LAB-${Date.now()}`,
        ordering_physician: '',
        priority: 'routine',
        clinical_indication: '',
        fasting_required: false,
        patient_preparation: '',
        tests_ordered: [],
        lab_facility: '',
        special_instructions: ''
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating lab order:', error);
      toast({
        title: "Error",
        description: "Failed to create lab order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Lab Order</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order_number">Order Number</Label>
              <Input
                id="order_number"
                value={formData.order_number}
                onChange={(e) => setFormData(prev => ({ ...prev, order_number: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ordering_physician">Ordering Physician</Label>
              <Input
                id="ordering_physician"
                value={formData.ordering_physician}
                onChange={(e) => setFormData(prev => ({ ...prev, ordering_physician: e.target.value }))}
                placeholder="Dr. Smith"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
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

            <div className="space-y-2">
              <Label htmlFor="lab_facility">Lab Facility</Label>
              <Input
                id="lab_facility"
                value={formData.lab_facility}
                onChange={(e) => setFormData(prev => ({ ...prev, lab_facility: e.target.value }))}
                placeholder="External lab name (optional)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinical_indication">Clinical Indication</Label>
            <Textarea
              id="clinical_indication"
              value={formData.clinical_indication}
              onChange={(e) => setFormData(prev => ({ ...prev, clinical_indication: e.target.value }))}
              placeholder="Reason for ordering these tests..."
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tests Ordered ({formData.tests_ordered.length} selected)</Label>
            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {availableTests.map((test) => (
                  <div key={test} className="flex items-center space-x-2">
                    <Checkbox
                      id={test}
                      checked={formData.tests_ordered.includes(test)}
                      onCheckedChange={(checked) => handleTestChange(test, !!checked)}
                    />
                    <Label htmlFor={test} className="text-sm">{test}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="fasting_required"
              checked={formData.fasting_required}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, fasting_required: !!checked }))}
            />
            <Label htmlFor="fasting_required">Fasting Required</Label>
          </div>

          {formData.fasting_required && (
            <div className="space-y-2">
              <Label htmlFor="patient_preparation">Patient Preparation Instructions</Label>
              <Textarea
                id="patient_preparation"
                value={formData.patient_preparation}
                onChange={(e) => setFormData(prev => ({ ...prev, patient_preparation: e.target.value }))}
                placeholder="Fast for 12 hours, no food or drink except water..."
                rows={2}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              value={formData.special_instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
              placeholder="Any special handling or collection instructions..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Lab Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};