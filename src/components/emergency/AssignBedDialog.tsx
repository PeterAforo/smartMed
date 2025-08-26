import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Heart, Bed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssignBedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: {
    id: number;
    patientName: string;
    patientId: string;
    triageLevel: string;
  } | null;
}

export const AssignBedDialog = ({ open, onOpenChange, patient }: AssignBedDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBed, setSelectedBed] = useState('');

  const availableBeds = [
    { id: 'ER-03', status: 'available', equipment: ['Monitors', 'Oxygen'] },
    { id: 'ER-05', status: 'available', equipment: ['Monitors'] },
    { id: 'ER-07', status: 'cleaning', equipment: ['Full Equipment'], cleaningETA: '10 min' },
    { id: 'ICU-01', status: 'available', equipment: ['Ventilator', 'Monitors', 'IV Pumps'] },
    { id: 'ICU-03', status: 'available', equipment: ['Full ICU Setup'] }
  ];

  const getTriageColor = (level: string) => {
    switch (level) {
      case '1': return 'bg-red-600 text-white';
      case '2': return 'bg-orange-500 text-white';
      case '3': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getBedStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'cleaning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBed) {
      toast({
        title: "No Bed Selected",
        description: "Please select a bed for the patient.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Bed Assigned",
      description: `${patient?.patientName} has been assigned to bed ${selectedBed}`
    });
    
    setIsSubmitting(false);
    onOpenChange(false);
    setSelectedBed('');
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Assign Emergency Bed
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-2">
              <span>Patient: {patient.patientName} ({patient.patientId})</span>
              <Badge className={getTriageColor(patient.triageLevel)}>
                Triage {patient.triageLevel}
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bed">Select Available Bed</Label>
            <Select value={selectedBed} onValueChange={setSelectedBed}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a bed..." />
              </SelectTrigger>
              <SelectContent>
                {availableBeds.map((bed) => (
                  <SelectItem key={bed.id} value={bed.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{bed.id}</span>
                      <Badge className={getBedStatusColor(bed.status)} variant="outline">
                        {bed.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBed && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Bed {selectedBed} Details
              </h4>
              {(() => {
                const bed = availableBeds.find(b => b.id === selectedBed);
                return bed ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge className={getBedStatusColor(bed.status)}>
                        {bed.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Equipment Available:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {bed.equipment.map((item, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {bed.status === 'cleaning' && bed.cleaningETA && (
                      <div className="text-sm text-yellow-600">
                        Cleaning ETA: {bed.cleaningETA}
                      </div>
                    )}
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Bed Assignment Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Triage 1 patients: ICU or monitored beds preferred</li>
              <li>• Triage 2-3 patients: Standard ER beds acceptable</li>
              <li>• Consider equipment needs based on patient condition</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedBed}>
              {isSubmitting ? "Assigning..." : "Assign Bed"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};