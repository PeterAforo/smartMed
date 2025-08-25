import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface NewHospitalizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  onSuccess: () => void;
}

export const NewHospitalizationDialog: React.FC<NewHospitalizationDialogProps> = ({
  open,
  onOpenChange,
  patientId,
  onSuccess
}) => {
  const { toast } = useToast();
  const { profile, currentBranch } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    hospital_name: '',
    department: '',
    admission_date: '',
    discharge_date: '',
    attending_physician: '',
    primary_diagnosis: '',
    admission_reason: '',
    discharge_summary: '',
    status: 'completed'
  });

  const calculateLengthOfStay = () => {
    if (formData.admission_date && formData.discharge_date) {
      const admission = new Date(formData.admission_date);
      const discharge = new Date(formData.discharge_date);
      const diffTime = Math.abs(discharge.getTime() - admission.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.tenant_id || !currentBranch?.id) return;

    setIsSubmitting(true);
    try {
      const lengthOfStay = calculateLengthOfStay();

      const { error } = await supabase
        .from('hospitalization_records')
        .insert({
          patient_id: patientId,
          tenant_id: profile.tenant_id,
          branch_id: currentBranch.id,
          hospital_name: formData.hospital_name,
          department: formData.department || null,
          admission_date: formData.admission_date,
          discharge_date: formData.discharge_date || null,
          attending_physician: formData.attending_physician || null,
          primary_diagnosis: formData.primary_diagnosis,
          admission_reason: formData.admission_reason,
          discharge_summary: formData.discharge_summary || null,
          length_of_stay: lengthOfStay,
          status: formData.status,
          recorded_by: profile.user_id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Hospitalization record added successfully.",
      });

      // Reset form
      setFormData({
        hospital_name: '',
        department: '',
        admission_date: '',
        discharge_date: '',
        attending_physician: '',
        primary_diagnosis: '',
        admission_reason: '',
        discharge_summary: '',
        status: 'completed'
      });

      onSuccess();
    } catch (error) {
      console.error('Error adding hospitalization record:', error);
      toast({
        title: "Error",
        description: "Failed to add hospitalization record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Hospitalization Record</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hospital_name">Hospital Name</Label>
              <Input
                id="hospital_name"
                value={formData.hospital_name}
                onChange={(e) => setFormData(prev => ({ ...prev, hospital_name: e.target.value }))}
                placeholder="Hospital or medical facility"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="e.g., Emergency, Cardiology"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="admission_date">Admission Date</Label>
              <Input
                id="admission_date"
                type="date"
                value={formData.admission_date}
                onChange={(e) => setFormData(prev => ({ ...prev, admission_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discharge_date">Discharge Date</Label>
              <Input
                id="discharge_date"
                type="date"
                value={formData.discharge_date}
                onChange={(e) => setFormData(prev => ({ ...prev, discharge_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="attending_physician">Attending Physician</Label>
              <Input
                id="attending_physician"
                value={formData.attending_physician}
                onChange={(e) => setFormData(prev => ({ ...prev, attending_physician: e.target.value }))}
                placeholder="Doctor's name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_diagnosis">Primary Diagnosis</Label>
            <Input
              id="primary_diagnosis"
              value={formData.primary_diagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, primary_diagnosis: e.target.value }))}
              placeholder="Primary diagnosis or condition"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admission_reason">Admission Reason</Label>
            <Textarea
              id="admission_reason"
              value={formData.admission_reason}
              onChange={(e) => setFormData(prev => ({ ...prev, admission_reason: e.target.value }))}
              placeholder="Reason for admission..."
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discharge_summary">Discharge Summary</Label>
            <Textarea
              id="discharge_summary"
              value={formData.discharge_summary}
              onChange={(e) => setFormData(prev => ({ ...prev, discharge_summary: e.target.value }))}
              placeholder="Summary at discharge, follow-up instructions..."
              rows={3}
            />
          </div>

          {formData.admission_date && formData.discharge_date && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Length of Stay:</strong> {calculateLengthOfStay()} days
              </p>
            </div>
          )}

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
              {isSubmitting ? "Adding..." : "Add Hospitalization"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};