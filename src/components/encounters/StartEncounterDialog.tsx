import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEncounters } from '@/hooks/useEncounters';
import { usePatients } from '@/hooks/usePatients';
import { toast } from 'sonner';

interface StartEncounterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
}

export function StartEncounterDialog({ isOpen, onClose, patientId }: StartEncounterDialogProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(patientId || '');
  const [encounterType, setEncounterType] = useState<'OPD' | 'IPD' | 'ER'>('OPD');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const { createEncounter, isCreating } = useEncounters();
  const { patients } = usePatients();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }

    if (!chiefComplaint.trim()) {
      toast.error('Chief complaint is required');
      return;
    }

    try {
      await createEncounter({
        patient_id: selectedPatientId,
        encounter_type: encounterType,
        chief_complaint: chiefComplaint,
        location: location || undefined,
        notes: notes || undefined
      });
      
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating encounter:', error);
    }
  };

  const resetForm = () => {
    setSelectedPatientId(patientId || '');
    setEncounterType('OPD');
    setChiefComplaint('');
    setLocation('');
    setNotes('');
  };

  const selectedPatient = patients?.find(p => p.id === selectedPatientId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Encounter</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!patientId && (
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients?.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name} - {patient.medical_record_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedPatient && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{selectedPatient.first_name} {selectedPatient.last_name}</p>
              <p className="text-sm text-muted-foreground">MRN: {selectedPatient.medical_record_number}</p>
              <p className="text-sm text-muted-foreground">
                {selectedPatient.gender} • {new Date().getFullYear() - new Date(selectedPatient.date_of_birth).getFullYear()} years
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="encounterType">Encounter Type</Label>
            <Select value={encounterType} onValueChange={(value: 'OPD' | 'IPD' | 'ER') => setEncounterType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPD">Outpatient (OPD)</SelectItem>
                <SelectItem value="IPD">Inpatient (IPD)</SelectItem>
                <SelectItem value="ER">Emergency (ER)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
            <Textarea
              id="chiefComplaint"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="Patient's primary concern or reason for visit"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Room/Department (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Initial Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes (optional)"
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
              {isCreating ? 'Starting...' : 'Start Encounter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}