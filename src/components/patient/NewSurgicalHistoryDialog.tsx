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

interface NewSurgicalHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  onSuccess: () => void;
}

export const NewSurgicalHistoryDialog: React.FC<NewSurgicalHistoryDialogProps> = ({
  open,
  onOpenChange,
  patientId,
  onSuccess
}) => {
  const { toast } = useToast();
  const { profile, currentBranch } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    procedure_name: '',
    procedure_code: '',
    surgery_date: '',
    surgeon_name: '',
    hospital_name: '',
    anesthesia_type: '',
    outcome: 'successful',
    complications: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.tenant_id || !currentBranch?.id) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('surgical_history')
        .insert({
          patient_id: patientId,
          tenant_id: profile.tenant_id,
          branch_id: currentBranch.id,
          procedure_name: formData.procedure_name,
          procedure_code: formData.procedure_code || null,
          surgery_date: formData.surgery_date,
          surgeon_name: formData.surgeon_name || null,
          hospital_name: formData.hospital_name || null,
          anesthesia_type: formData.anesthesia_type || null,
          outcome: formData.outcome,
          complications: formData.complications || null,
          notes: formData.notes || null,
          recorded_by: profile.user_id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Surgical history added successfully.",
      });

      // Reset form
      setFormData({
        procedure_name: '',
        procedure_code: '',
        surgery_date: '',
        surgeon_name: '',
        hospital_name: '',
        anesthesia_type: '',
        outcome: 'successful',
        complications: '',
        notes: ''
      });

      onSuccess();
    } catch (error) {
      console.error('Error adding surgical history:', error);
      toast({
        title: "Error",
        description: "Failed to add surgical history. Please try again.",
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
          <DialogTitle>Add Surgical History</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="procedure_name">Procedure Name</Label>
              <Input
                id="procedure_name"
                value={formData.procedure_name}
                onChange={(e) => setFormData(prev => ({ ...prev, procedure_name: e.target.value }))}
                placeholder="e.g., Appendectomy, Knee Replacement"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="procedure_code">Procedure Code</Label>
              <Input
                id="procedure_code"
                value={formData.procedure_code}
                onChange={(e) => setFormData(prev => ({ ...prev, procedure_code: e.target.value }))}
                placeholder="CPT Code (optional)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="surgery_date">Surgery Date</Label>
              <Input
                id="surgery_date"
                type="date"
                value={formData.surgery_date}
                onChange={(e) => setFormData(prev => ({ ...prev, surgery_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome</Label>
              <Select
                value={formData.outcome}
                onValueChange={(value) => setFormData(prev => ({ ...prev, outcome: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="successful">Successful</SelectItem>
                  <SelectItem value="complications">Complications</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="surgeon_name">Surgeon Name</Label>
              <Input
                id="surgeon_name"
                value={formData.surgeon_name}
                onChange={(e) => setFormData(prev => ({ ...prev, surgeon_name: e.target.value }))}
                placeholder="Surgeon's name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospital_name">Hospital/Facility</Label>
              <Input
                id="hospital_name"
                value={formData.hospital_name}
                onChange={(e) => setFormData(prev => ({ ...prev, hospital_name: e.target.value }))}
                placeholder="Hospital or surgical facility"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="anesthesia_type">Anesthesia Type</Label>
            <Input
              id="anesthesia_type"
              value={formData.anesthesia_type}
              onChange={(e) => setFormData(prev => ({ ...prev, anesthesia_type: e.target.value }))}
              placeholder="e.g., General, Local, Spinal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="complications">Complications</Label>
            <Textarea
              id="complications"
              value={formData.complications}
              onChange={(e) => setFormData(prev => ({ ...prev, complications: e.target.value }))}
              placeholder="Any complications that occurred..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or details..."
              rows={3}
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
              {isSubmitting ? "Adding..." : "Add Surgery"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};