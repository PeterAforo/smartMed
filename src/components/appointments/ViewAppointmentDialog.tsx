import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, MapPin, Phone, FileText, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface ViewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any;
  onEdit?: (appointment: any) => void;
}

export const ViewAppointmentDialog = ({ open, onOpenChange, appointment, onEdit }: ViewAppointmentDialogProps) => {
  if (!appointment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointment Details
          </DialogTitle>
          <DialogDescription>
            View comprehensive appointment information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(appointment.status)}>
              {appointment.status}
            </Badge>
            <Button variant="outline" onClick={() => onEdit?.(appointment)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Appointment
            </Button>
          </div>

          {/* Patient Information */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Patient Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Patient Name</p>
                <p className="font-medium">{appointment.patients?.first_name} {appointment.patients?.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Patient Number</p>
                <p className="font-medium font-mono">{appointment.patients?.patient_number}</p>
              </div>
              {appointment.patients?.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {appointment.patients.phone}
                  </p>
                </div>
              )}
              {appointment.patients?.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{appointment.patients.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Appointment Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {format(new Date(appointment.appointment_date), 'EEEE, MMMM dd, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(`2000-01-01T${appointment.appointment_time}`), 'h:mm a')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">{appointment.appointment_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{appointment.duration_minutes || 30} minutes</p>
              </div>
            </div>
            
            {appointment.notes && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="text-sm bg-background rounded p-2 mt-1">{appointment.notes}</p>
              </div>
            )}
          </div>

          {/* Provider Information */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Provider Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Doctor</p>
                <p className="font-medium">Dr. {appointment.doctor_name || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {appointment.department || 'General'}
                </p>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              System Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p>{format(new Date(appointment.created_at), 'MMM dd, yyyy HH:mm')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p>{format(new Date(appointment.updated_at), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};