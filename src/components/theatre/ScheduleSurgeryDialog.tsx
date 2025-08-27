import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, User, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScheduleSurgeryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ScheduleSurgeryDialog = ({ open, onOpenChange }: ScheduleSurgeryDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    procedure: '',
    surgeonId: '',
    anesthesiologistId: '',
    theatreId: '',
    scheduledTime: '',
    estimatedDuration: '',
    priority: 'elective',
    preOpNotes: '',
    equipmentNeeded: [] as string[],
    assistantSurgeons: [] as string[]
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addEquipment = () => {
    setFormData(prev => ({ 
      ...prev, 
      equipmentNeeded: [...prev.equipmentNeeded, ''] 
    }));
  };

  const updateEquipment = (index: number, value: string) => {
    const updated = [...formData.equipmentNeeded];
    updated[index] = value;
    setFormData(prev => ({ ...prev, equipmentNeeded: updated }));
  };

  const removeEquipment = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      equipmentNeeded: prev.equipmentNeeded.filter((_, i) => i !== index) 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Surgery Scheduled",
      description: `Surgery for ${formData.patientName} has been scheduled successfully.`
    });

    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Schedule Surgery
          </DialogTitle>
          <DialogDescription>
            Schedule a new surgical procedure
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  value={formData.patientId}
                  onChange={(e) => handleInputChange('patientId', e.target.value)}
                  placeholder="PAT001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  placeholder="Patient full name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Surgery Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Surgery Details</h3>
            <div className="space-y-2">
              <Label htmlFor="procedure">Surgical Procedure</Label>
              <Select value={formData.procedure} onValueChange={(value) => handleInputChange('procedure', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select procedure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laparoscopic-cholecystectomy">Laparoscopic Cholecystectomy</SelectItem>
                  <SelectItem value="appendectomy">Appendectomy</SelectItem>
                  <SelectItem value="knee-replacement">Total Knee Replacement</SelectItem>
                  <SelectItem value="cataract-surgery">Cataract Surgery</SelectItem>
                  <SelectItem value="hernia-repair">Hernia Repair</SelectItem>
                  <SelectItem value="gallbladder-removal">Gallbladder Removal</SelectItem>
                  <SelectItem value="other">Other (specify in notes)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="elective">Elective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">Estimated Duration (minutes)</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                  placeholder="120"
                  required
                />
              </div>
            </div>
          </div>

          {/* Staff Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Staff Assignment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="surgeonId">Primary Surgeon</Label>
                <Select value={formData.surgeonId} onValueChange={(value) => handleInputChange('surgeonId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select surgeon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr-wilson">Dr. Sarah Wilson</SelectItem>
                    <SelectItem value="dr-brown">Dr. Robert Brown</SelectItem>
                    <SelectItem value="dr-anderson">Dr. Michael Anderson</SelectItem>
                    <SelectItem value="dr-davis">Dr. Lisa Davis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="anesthesiologistId">Anesthesiologist</Label>
                <Select value={formData.anesthesiologistId} onValueChange={(value) => handleInputChange('anesthesiologistId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select anesthesiologist" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr-johnson">Dr. Mike Johnson</SelectItem>
                    <SelectItem value="dr-white">Dr. Jennifer White</SelectItem>
                    <SelectItem value="dr-garcia">Dr. Maria Garcia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Surgery Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Start Time</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theatreId">Operating Theatre</Label>
                  <Select value={formData.theatreId} onValueChange={(value) => handleInputChange('theatreId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theatre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="or-1">OR-1</SelectItem>
                      <SelectItem value="or-2">OR-2</SelectItem>
                      <SelectItem value="or-3">OR-3</SelectItem>
                      <SelectItem value="or-4">OR-4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment Requirements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Equipment Requirements</h3>
              <Button type="button" variant="outline" onClick={addEquipment}>
                Add Equipment
              </Button>
            </div>
            <div className="space-y-2">
              {formData.equipmentNeeded.map((equipment, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={equipment}
                    onChange={(e) => updateEquipment(index, e.target.value)}
                    placeholder="Equipment name"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeEquipment(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preOpNotes">Pre-operative Notes</Label>
            <Textarea
              id="preOpNotes"
              value={formData.preOpNotes}
              onChange={(e) => handleInputChange('preOpNotes', e.target.value)}
              placeholder="Any special instructions or notes for the surgical team..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Surgery"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};