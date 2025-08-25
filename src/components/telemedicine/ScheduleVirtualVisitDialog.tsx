import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Video, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ScheduleVirtualVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ScheduleVirtualVisitDialog = ({ open, onOpenChange }: ScheduleVirtualVisitDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentTime: '',
    duration: '30',
    type: 'consultation',
    platform: 'video',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !formData.patientId || !formData.doctorId || !formData.appointmentTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Virtual Visit Scheduled",
      description: `Appointment scheduled for ${format(selectedDate, 'PPP')} at ${formData.appointmentTime}`,
    });
    
    setIsSubmitting(false);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      patientId: '',
      doctorId: '',
      appointmentTime: '',
      duration: '30',
      type: 'consultation',
      platform: 'video',
      notes: ''
    });
    setSelectedDate(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Schedule Virtual Visit</DialogTitle>
          <DialogDescription>
            Set up a new telemedicine appointment for virtual consultation
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID *</Label>
              <Input
                id="patientId"
                placeholder="Enter patient ID"
                value={formData.patientId}
                onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorId">Doctor *</Label>
              <Select value={formData.doctorId} onValueChange={(value) => setFormData(prev => ({ ...prev, doctorId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dr-johnson">Dr. Sarah Johnson</SelectItem>
                  <SelectItem value="dr-brown">Dr. Michael Brown</SelectItem>
                  <SelectItem value="dr-wilson">Dr. Emily Wilson</SelectItem>
                  <SelectItem value="dr-davis">Dr. Robert Davis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Appointment Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointmentTime">Time *</Label>
              <Input
                id="appointmentTime"
                type="time"
                value={formData.appointmentTime}
                onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Consultation Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="therapy">Therapy</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={formData.platform} onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <div className="flex items-center">
                      <Video className="mr-2 h-4 w-4" />
                      Video Call
                    </div>
                  </SelectItem>
                  <SelectItem value="phone">
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4" />
                      Phone Call
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or notes for this appointment..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Visit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};