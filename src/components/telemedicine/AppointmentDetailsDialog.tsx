import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Phone, Calendar, Clock, User, FileText } from 'lucide-react';

interface AppointmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: {
    id: number;
    patient: string;
    patientId: string;
    doctor: string;
    appointmentTime: string;
    date: string;
    duration: number;
    type: string;
    status: string;
    platform: string;
    roomId: string | null;
  } | null;
}

export const AppointmentDetailsDialog = ({ open, onOpenChange, appointment }: AppointmentDetailsDialogProps) => {
  if (!appointment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500 text-white';
      case 'in-progress': return 'bg-green-500 text-white';
      case 'completed': return 'bg-gray-500 text-white';
      case 'waiting': return 'bg-yellow-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogDescription>
            Complete information for the virtual consultation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient & Doctor Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Patient</span>
              </div>
              <div>
                <p className="font-medium">{appointment.patient}</p>
                <p className="text-sm text-muted-foreground">ID: {appointment.patientId}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Doctor</span>
              </div>
              <p className="font-medium">{appointment.doctor}</p>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Date & Time</span>
              </div>
              <div>
                <p>{appointment.date}</p>
                <p className="text-sm text-muted-foreground">{appointment.appointmentTime}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Duration</span>
              </div>
              <p>{appointment.duration} minutes</p>
            </div>
          </div>

          {/* Status & Platform */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="font-medium">Status</span>
              <div>
                <Badge className={getStatusColor(appointment.status)}>
                  {appointment.status.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <span className="font-medium">Platform</span>
              <div className="flex items-center space-x-2">
                {appointment.platform === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                <span className="capitalize">{appointment.platform} Call</span>
              </div>
            </div>
          </div>

          {/* Consultation Type */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Consultation Type</span>
            </div>
            <p className="capitalize">{appointment.type} consultation</p>
          </div>

          {/* Room ID (if video) */}
          {appointment.platform === 'video' && appointment.roomId && (
            <div className="space-y-2">
              <span className="font-medium">Room ID</span>
              <p className="font-mono text-sm bg-muted p-2 rounded">{appointment.roomId}</p>
            </div>
          )}

          {/* Additional Information */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Session Information</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Session will be recorded for quality assurance</li>
              <li>• Patient consent obtained for telemedicine consultation</li>
              <li>• HIPAA compliant platform with end-to-end encryption</li>
              <li>• Technical support available during session</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};