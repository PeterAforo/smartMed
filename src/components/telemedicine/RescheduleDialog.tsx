import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: {
    id: number;
    patient: string;
    doctor: string;
    appointmentTime: string;
    date: string;
  } | null;
}

export const RescheduleDialog = ({ open, onOpenChange, appointment }: RescheduleDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [newTime, setNewTime] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !newTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Appointment Rescheduled",
      description: `${appointment?.patient}'s appointment moved to ${format(selectedDate, 'PPP')} at ${newTime}`,
    });
    
    setIsSubmitting(false);
    onOpenChange(false);
    setSelectedDate(undefined);
    setNewTime('');
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Change the date and time for {appointment.patient}'s appointment with {appointment.doctor}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Current Appointment</h4>
            <p className="text-sm text-muted-foreground">
              {appointment.date} at {appointment.appointmentTime}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>New Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a new date"}
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
              <Label htmlFor="newTime">New Time</Label>
              <Input
                id="newTime"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Rescheduling..." : "Reschedule"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};