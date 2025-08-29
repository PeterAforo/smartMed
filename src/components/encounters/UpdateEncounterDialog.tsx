import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useEncounter, useEncounters } from '@/hooks/useEncounters';
import { toast } from 'sonner';

interface UpdateEncounterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  encounterId: string;
}

export function UpdateEncounterDialog({ isOpen, onClose, encounterId }: UpdateEncounterDialogProps) {
  const [status, setStatus] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [location, setLocation] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnoses, setDiagnoses] = useState<string[]>([]);
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  const { data: encounter } = useEncounter(encounterId);
  const { updateEncounter, isUpdating } = useEncounters();

  useEffect(() => {
    if (encounter) {
      setStatus(encounter.status as any);
      setLocation(encounter.location || '');
      setChiefComplaint(encounter.chief_complaint || '');
      setDiagnoses((encounter.diagnoses as string[]) || []);
      setNotes(encounter.notes || '');
    }
  }, [encounter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData: any = {
        status,
        location: location.trim() || undefined,
        chief_complaint: chiefComplaint.trim() || undefined,
        diagnoses: diagnoses.filter(d => d.trim()),
        notes: notes.trim() || undefined
      };

      // Set end time if completing the encounter
      if (status === 'completed' && encounter?.status !== 'completed') {
        updateData.end_time = new Date().toISOString();
      }

      await updateEncounter({ id: encounterId, data: updateData });
      
      onClose();
    } catch (error) {
      console.error('Error updating encounter:', error);
    }
  };

  const handleAddDiagnosis = () => {
    if (newDiagnosis.trim() && !diagnoses.includes(newDiagnosis.trim())) {
      setDiagnoses([...diagnoses, newDiagnosis.trim()]);
      setNewDiagnosis('');
    }
  };

  const handleRemoveDiagnosis = (index: number) => {
    setDiagnoses(diagnoses.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDiagnosis();
    }
  };

  if (!encounter) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Encounter</DialogTitle>
        </DialogHeader>
        
        <div className="p-3 bg-muted rounded-lg mb-4">
          <p className="font-medium">
            {(encounter as any)?.patients?.first_name} {(encounter as any)?.patients?.last_name}
          </p>
          <p className="text-sm text-muted-foreground">
            {encounter.encounter_number} ({encounter.encounter_type})
          </p>
          <p className="text-sm text-muted-foreground">
            Started: {new Date(encounter.start_time).toLocaleString()}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Room/Department"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chiefComplaint">Chief Complaint</Label>
            <Textarea
              id="chiefComplaint"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="Patient's primary concern"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Diagnoses</Label>
            
            {diagnoses.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {diagnoses.map((diagnosis, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveDiagnosis(index)}
                  >
                    {diagnosis} ×
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex space-x-2">
              <Input
                value={newDiagnosis}
                onChange={(e) => setNewDiagnosis(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add diagnosis (press Enter)"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddDiagnosis}
                disabled={!newDiagnosis.trim()}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional encounter notes"
              rows={3}
            />
          </div>

          {status === 'completed' && encounter.status !== 'completed' && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Completing this encounter will trigger the discharge workflow and finalize all associated orders.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Encounter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}