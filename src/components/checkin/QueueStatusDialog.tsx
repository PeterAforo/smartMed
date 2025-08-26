import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, AlertTriangle } from 'lucide-react';

interface QueueStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QueueStatusDialog = ({ open, onOpenChange }: QueueStatusDialogProps) => {
  const queueData = [
    {
      department: 'Cardiology',
      waiting: 8,
      avgWait: '35 min',
      nextAvailable: '11:30 AM',
      status: 'busy'
    },
    {
      department: 'General Medicine',
      waiting: 3,
      avgWait: '15 min',
      nextAvailable: '10:45 AM',
      status: 'normal'
    },
    {
      department: 'Orthopedics',
      waiting: 12,
      avgWait: '45 min',
      nextAvailable: '12:15 PM',
      status: 'busy'
    },
    {
      department: 'Pediatrics',
      waiting: 2,
      avgWait: '10 min',
      nextAvailable: '10:25 AM',
      status: 'available'
    },
    {
      department: 'Dermatology',
      waiting: 5,
      avgWait: '25 min',
      nextAvailable: '11:00 AM',
      status: 'normal'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'busy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <Users className="h-4 w-4" />;
      case 'normal': return <Clock className="h-4 w-4" />;
      case 'busy': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Queue Status Overview
          </DialogTitle>
          <DialogDescription>
            Current wait times and availability across all departments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {queueData.map((dept, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{dept.department}</h3>
                  <Badge className={getStatusColor(dept.status)}>
                    {getStatusIcon(dept.status)}
                    <span className="ml-1">{dept.status}</span>
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Waiting</p>
                    <p className="font-medium">{dept.waiting} patients</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Wait</p>
                    <p className="font-medium">{dept.avgWait}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Next Available</p>
                    <p className="font-medium">{dept.nextAvailable}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Queue Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <p>Total Waiting</p>
              <p className="font-bold text-lg">30</p>
            </div>
            <div>
              <p>Avg Wait Time</p>
              <p className="font-bold text-lg">26 min</p>
            </div>
            <div>
              <p>Available Now</p>
              <p className="font-bold text-lg">1 dept</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};