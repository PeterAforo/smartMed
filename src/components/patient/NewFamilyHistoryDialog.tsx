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

interface NewFamilyHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  onSuccess: () => void;
}

export const NewFamilyHistoryDialog: React.FC<NewFamilyHistoryDialogProps> = ({
  open,
  onOpenChange,
  patientId,
  onSuccess
}) => {
  const { toast } = useToast();
  const { profile, currentBranch } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    relationship: '',
    condition_name: '',
    age_of_onset: '',
    status: 'confirmed',
    severity: 'moderate',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.tenant_id || !currentBranch?.id) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('family_medical_history')
        .insert({
          patient_id: patientId,
          tenant_id: profile.tenant_id,
          relationship: formData.relationship,
          condition_name: formData.condition_name,
          age_of_onset: formData.age_of_onset ? parseInt(formData.age_of_onset) : null,
          status: formData.status,
          severity: formData.severity,
          notes: formData.notes || null,
          recorded_by: profile.user_id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Family medical history added successfully.",
      });

      // Reset form
      setFormData({
        relationship: '',
        condition_name: '',
        age_of_onset: '',
        status: 'confirmed',
        severity: 'moderate',
        notes: ''
      });

      onSuccess();
    } catch (error) {
      console.error('Error adding family history:', error);
      toast({
        title: "Error",
        description: "Failed to add family medical history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Family Medical History</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Select
                value={formData.relationship}
                onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mother">Mother</SelectItem>
                  <SelectItem value="father">Father</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="maternal_grandmother">Maternal Grandmother</SelectItem>
                  <SelectItem value="maternal_grandfather">Maternal Grandfather</SelectItem>
                  <SelectItem value="paternal_grandmother">Paternal Grandmother</SelectItem>
                  <SelectItem value="paternal_grandfather">Paternal Grandfather</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition_name">Condition</Label>
              <Input
                id="condition_name"
                value={formData.condition_name}
                onChange={(e) => setFormData(prev => ({ ...prev, condition_name: e.target.value }))}
                placeholder="e.g., Diabetes, Heart Disease"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age_of_onset">Age of Onset</Label>
              <Input
                id="age_of_onset"
                type="number"
                value={formData.age_of_onset}
                onChange={(e) => setFormData(prev => ({ ...prev, age_of_onset: e.target.value }))}
                placeholder="Age"
                min="0"
                max="150"
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
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="suspected">Suspected</SelectItem>
                  <SelectItem value="ruled_out">Ruled Out</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              {isSubmitting ? "Adding..." : "Add Family History"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};