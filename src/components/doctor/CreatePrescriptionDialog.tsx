import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Pill, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreatePrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export const CreatePrescriptionDialog = ({ open, onOpenChange }: CreatePrescriptionDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [medications, setMedications] = useState<Medication[]>([{
    id: '1',
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  }]);
  const [notes, setNotes] = useState('');

  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    };
    setMedications([...medications, newMedication]);
  };

  const removeMedication = (id: string) => {
    if (medications.length > 1) {
      setMedications(medications.filter(med => med.id !== id));
    }
  };

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId) {
      toast({
        title: "Missing Information",
        description: "Please select a patient.",
        variant: "destructive"
      });
      return;
    }

    const hasValidMedication = medications.some(med => 
      med.name && med.dosage && med.frequency && med.duration
    );

    if (!hasValidMedication) {
      toast({
        title: "Missing Information",
        description: "Please add at least one complete medication.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Prescription Created",
      description: `Prescription created for patient ${patientId} with ${medications.filter(m => m.name).length} medications.`,
    });
    
    setIsSubmitting(false);
    onOpenChange(false);
    
    // Reset form
    setPatientId('');
    setMedications([{
      id: '1',
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }]);
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Create New Prescription
          </DialogTitle>
          <DialogDescription>
            Create electronic prescription for patient medication
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label htmlFor="patientId">Patient *</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P001">John Doe (P001)</SelectItem>
                <SelectItem value="P002">Jane Smith (P002)</SelectItem>
                <SelectItem value="P003">Mike Johnson (P003)</SelectItem>
                <SelectItem value="P004">Sarah Davis (P004)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Medications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Medications</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMedication}>
                <Plus className="mr-2 h-4 w-4" />
                Add Medication
              </Button>
            </div>

            {medications.map((medication, index) => (
              <div key={medication.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Medication {index + 1}</span>
                  {medications.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedication(medication.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Medication Name *</Label>
                    <Input
                      placeholder="e.g., Amoxicillin"
                      value={medication.name}
                      onChange={(e) => updateMedication(medication.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dosage *</Label>
                    <Input
                      placeholder="e.g., 500mg"
                      value={medication.dosage}
                      onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Frequency *</Label>
                    <Select 
                      value={medication.frequency} 
                      onValueChange={(value) => updateMedication(medication.id, 'frequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once-daily">Once daily</SelectItem>
                        <SelectItem value="twice-daily">Twice daily</SelectItem>
                        <SelectItem value="three-times-daily">Three times daily</SelectItem>
                        <SelectItem value="four-times-daily">Four times daily</SelectItem>
                        <SelectItem value="every-6-hours">Every 6 hours</SelectItem>
                        <SelectItem value="every-8-hours">Every 8 hours</SelectItem>
                        <SelectItem value="as-needed">As needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration *</Label>
                    <Select 
                      value={medication.duration} 
                      onValueChange={(value) => updateMedication(medication.id, 'duration', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3-days">3 days</SelectItem>
                        <SelectItem value="5-days">5 days</SelectItem>
                        <SelectItem value="7-days">7 days</SelectItem>
                        <SelectItem value="10-days">10 days</SelectItem>
                        <SelectItem value="14-days">14 days</SelectItem>
                        <SelectItem value="30-days">30 days</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Special Instructions</Label>
                  <Textarea
                    placeholder="e.g., Take with food, Avoid alcohol..."
                    value={medication.instructions}
                    onChange={(e) => updateMedication(medication.id, 'instructions', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional instructions or notes for the patient..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Prescription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};