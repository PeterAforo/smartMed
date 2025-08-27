import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScheduleImagingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ScheduleImagingDialog = ({ open, onOpenChange }: ScheduleImagingDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    examType: '',
    bodyPart: '',
    priority: 'routine',
    clinicalHistory: '',
    orderingPhysician: '',
    scheduledTime: '',
    contrast: false,
    preparation: '',
    allergies: '',
    specialInstructions: '',
    insurance: '',
    preAuthNumber: ''
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Imaging Exam Scheduled",
      description: `${formData.examType} scheduled for ${formData.patientName} on ${selectedDate?.toLocaleDateString()} at ${formData.scheduledTime}.`
    });

    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Schedule Imaging Exam
          </DialogTitle>
          <DialogDescription>
            Schedule a new imaging examination for a patient
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
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
          </div>

          {/* Examination Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Examination Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="examType">Examination Type</Label>
                <Select value={formData.examType} onValueChange={(value) => handleInputChange('examType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="x-ray">X-Ray</SelectItem>
                    <SelectItem value="ct-scan">CT Scan</SelectItem>
                    <SelectItem value="mri">MRI</SelectItem>
                    <SelectItem value="ultrasound">Ultrasound</SelectItem>
                    <SelectItem value="mammography">Mammography</SelectItem>
                    <SelectItem value="fluoroscopy">Fluoroscopy</SelectItem>
                    <SelectItem value="nuclear-medicine">Nuclear Medicine</SelectItem>
                    <SelectItem value="pet-scan">PET Scan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bodyPart">Body Part/Region</Label>
                <Select value={formData.bodyPart} onValueChange={(value) => handleInputChange('bodyPart', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select body part" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="head">Head</SelectItem>
                    <SelectItem value="neck">Neck</SelectItem>
                    <SelectItem value="chest">Chest</SelectItem>
                    <SelectItem value="abdomen">Abdomen</SelectItem>
                    <SelectItem value="pelvis">Pelvis</SelectItem>
                    <SelectItem value="spine">Spine</SelectItem>
                    <SelectItem value="upper-extremity">Upper Extremity</SelectItem>
                    <SelectItem value="lower-extremity">Lower Extremity</SelectItem>
                    <SelectItem value="whole-body">Whole Body</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stat">STAT (Emergency)</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="routine">Routine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderingPhysician">Ordering Physician</Label>
                <Select value={formData.orderingPhysician} onValueChange={(value) => handleInputChange('orderingPhysician', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select physician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr-smith">Dr. Smith</SelectItem>
                    <SelectItem value="dr-johnson">Dr. Johnson</SelectItem>
                    <SelectItem value="dr-williams">Dr. Williams</SelectItem>
                    <SelectItem value="dr-brown">Dr. Brown</SelectItem>
                    <SelectItem value="dr-davis">Dr. Davis</SelectItem>
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
                <Label>Examination Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Preferred Time</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contrast">Contrast Required</Label>
                  <Select value={formData.contrast ? 'yes' : 'no'} onValueChange={(value) => handleInputChange('contrast', value === 'yes')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No Contrast</SelectItem>
                      <SelectItem value="yes">With Contrast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Clinical Information</h3>
            <div className="space-y-2">
              <Label htmlFor="clinicalHistory">Clinical History/Indication</Label>
              <Textarea
                id="clinicalHistory"
                value={formData.clinicalHistory}
                onChange={(e) => handleInputChange('clinicalHistory', e.target.value)}
                placeholder="Relevant clinical history and reason for examination..."
                rows={3}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="allergies">Known Allergies</Label>
              <Input
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="List any known allergies (especially contrast allergies)"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insurance">Insurance Information</Label>
                <Input
                  id="insurance"
                  value={formData.insurance}
                  onChange={(e) => handleInputChange('insurance', e.target.value)}
                  placeholder="Insurance provider/policy number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preAuthNumber">Pre-Authorization Number</Label>
                <Input
                  id="preAuthNumber"
                  value={formData.preAuthNumber}
                  onChange={(e) => handleInputChange('preAuthNumber', e.target.value)}
                  placeholder="If pre-authorization required"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preparation">Patient Preparation Instructions</Label>
              <Textarea
                id="preparation"
                value={formData.preparation}
                onChange={(e) => handleInputChange('preparation', e.target.value)}
                placeholder="Special preparation requirements (fasting, medication restrictions, etc.)"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                id="specialInstructions"
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                placeholder="Any additional instructions or special considerations..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              {isSubmitting ? "Scheduling..." : "Schedule Exam"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};