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

interface NewImagingOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  onSuccess: () => void;
}

export const NewImagingOrderDialog: React.FC<NewImagingOrderDialogProps> = ({
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
    order_number: `IMG-${Date.now()}`,
    study_type: '',
    body_part: '',
    clinical_indication: '',
    urgency: 'routine',
    contrast_required: false,
    scheduled_date: '',
    scheduled_time: '',
    facility_name: '',
    prep_instructions: '',
    special_instructions: ''
  });

  const studyTypes = [
    { value: 'x_ray', label: 'X-Ray' },
    { value: 'ct_scan', label: 'CT Scan' },
    { value: 'mri', label: 'MRI' },
    { value: 'ultrasound', label: 'Ultrasound' },
    { value: 'mammography', label: 'Mammography' },
    { value: 'nuclear_medicine', label: 'Nuclear Medicine' },
    { value: 'pet_scan', label: 'PET Scan' },
    { value: 'fluoroscopy', label: 'Fluoroscopy' }
  ];

  const bodyParts = [
    'Head/Brain', 'Neck', 'Chest', 'Abdomen', 'Pelvis', 
    'Spine (Cervical)', 'Spine (Thoracic)', 'Spine (Lumbar)',
    'Shoulder', 'Arm', 'Elbow', 'Wrist', 'Hand',
    'Hip', 'Thigh', 'Knee', 'Leg', 'Ankle', 'Foot',
    'Heart', 'Lungs', 'Liver', 'Kidneys', 'Bladder'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.tenant_id || !currentBranch?.id) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('imaging_orders')
        .insert({
          patient_id: formData.patient_id,
          tenant_id: profile.tenant_id,
          branch_id: currentBranch.id,
          order_number: formData.order_number,
          ordered_by: profile.user_id,
          study_type: formData.study_type,
          body_part: formData.body_part,
          clinical_indication: formData.clinical_indication,
          urgency: formData.urgency,
          contrast_required: formData.contrast_required,
          scheduled_date: formData.scheduled_date || null,
          scheduled_time: formData.scheduled_time || null,
          facility_name: formData.facility_name || null,
          prep_instructions: formData.prep_instructions || null,
          special_instructions: formData.special_instructions || null,
          status: 'ordered'
        });

      if (error) throw error;

      // Log activity
      await supabase.from('activities').insert({
        user_id: profile.user_id,
        tenant_id: profile.tenant_id,
        branch_id: currentBranch.id,
        entity_type: 'imaging_order',
        entity_id: formData.patient_id,
        activity_type: 'create',
        description: `Imaging order ${formData.order_number} created for ${formData.study_type} - ${formData.body_part}`
      });

      toast({
        title: "Success",
        description: "Imaging order created successfully.",
      });

      // Reset form
      setFormData({
        patient_id: patientId || '',
        order_number: `IMG-${Date.now()}`,
        study_type: '',
        body_part: '',
        clinical_indication: '',
        urgency: 'routine',
        contrast_required: false,
        scheduled_date: '',
        scheduled_time: '',
        facility_name: '',
        prep_instructions: '',
        special_instructions: ''
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating imaging order:', error);
      toast({
        title: "Error",
        description: "Failed to create imaging order. Please try again.",
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
          <DialogTitle>New Imaging Order</DialogTitle>
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
              <Label htmlFor="urgency">Urgency</Label>
              <Select
                value={formData.urgency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="study_type">Study Type</Label>
              <Select
                value={formData.study_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, study_type: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select study type" />
                </SelectTrigger>
                <SelectContent>
                  {studyTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body_part">Body Part</Label>
              <Select
                value={formData.body_part}
                onValueChange={(value) => setFormData(prev => ({ ...prev, body_part: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select body part" />
                </SelectTrigger>
                <SelectContent>
                  {bodyParts.map(part => (
                    <SelectItem key={part} value={part}>
                      {part}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinical_indication">Clinical Indication</Label>
            <Textarea
              id="clinical_indication"
              value={formData.clinical_indication}
              onChange={(e) => setFormData(prev => ({ ...prev, clinical_indication: e.target.value }))}
              placeholder="Reason for ordering this imaging study..."
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Scheduled Date</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_time">Scheduled Time</Label>
              <Input
                id="scheduled_time"
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="contrast_required"
              checked={formData.contrast_required}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contrast_required: !!checked }))}
            />
            <Label htmlFor="contrast_required">Contrast Required</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facility_name">Imaging Facility</Label>
            <Input
              id="facility_name"
              value={formData.facility_name}
              onChange={(e) => setFormData(prev => ({ ...prev, facility_name: e.target.value }))}
              placeholder="External imaging facility (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prep_instructions">Preparation Instructions</Label>
            <Textarea
              id="prep_instructions"
              value={formData.prep_instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, prep_instructions: e.target.value }))}
              placeholder="Patient preparation instructions..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              value={formData.special_instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
              placeholder="Any special instructions for the imaging study..."
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
              {isSubmitting ? "Creating..." : "Create Imaging Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};