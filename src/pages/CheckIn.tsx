import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Search, Clock, User, MapPin, Loader2, Stethoscope, Activity, Pill, CreditCard } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { WalkInRegistrationDialog } from '@/components/checkin/WalkInRegistrationDialog';
import { QueueStatusDialog } from '@/components/checkin/QueueStatusDialog';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Workflow stages with display info
const WORKFLOW_STAGES = {
  waiting: { label: 'Waiting', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  triage: { label: 'Triage/Nurse', color: 'bg-blue-100 text-blue-800', icon: Activity },
  doctor: { label: 'With Doctor', color: 'bg-purple-100 text-purple-800', icon: Stethoscope },
  lab: { label: 'Laboratory', color: 'bg-orange-100 text-orange-800', icon: Activity },
  pharmacy: { label: 'Pharmacy', color: 'bg-green-100 text-green-800', icon: Pill },
  billing: { label: 'Billing', color: 'bg-pink-100 text-pink-800', icon: CreditCard },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckSquare },
  discharged: { label: 'Discharged', color: 'bg-gray-100 text-gray-800', icon: CheckSquare },
};

const CheckIn = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [walkInDialogOpen, setWalkInDialogOpen] = useState(false);
  const [queueDialogOpen, setQueueDialogOpen] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: () => api.getAppointments({ date: today }),
    refetchInterval: 10000
  });

  const { data: queueStats } = useQuery({
    queryKey: ['queue', 'stats'],
    queryFn: () => api.getQueueStats(),
    refetchInterval: 5000
  });

  const { data: queueEntries = [] } = useQuery({
    queryKey: ['queue', 'today'],
    queryFn: () => api.getQueue({ date: today }),
    refetchInterval: 5000
  });

  const stats = {
    totalAppointments: appointments.length,
    checkedIn: queueStats?.in_progress || 0,
    waiting: queueStats?.waiting || 0,
    completed: queueStats?.completed || 0
  };

  // Check if patient already has an active queue entry
  const isPatientInQueue = (patientId: string) => {
    return queueEntries.some((q: any) => 
      q.patient_id === patientId && 
      ['waiting', 'called', 'in_progress'].includes(q.status)
    );
  };

  const appointmentsWithQueue = appointments.map((apt: any) => {
    const queueEntry = queueEntries.find((q: any) => q.appointment_id === apt.id || q.patient_id === apt.patient_id);
    const currentStage = queueEntry?.current_stage || 'waiting';
    const stageInfo = WORKFLOW_STAGES[currentStage as keyof typeof WORKFLOW_STAGES] || WORKFLOW_STAGES.waiting;
    return { ...apt, queueEntry, currentStage, stageInfo };
  });

  const handleCheckIn = async (appointment: any) => {
    if (isPatientInQueue(appointment.patient_id)) {
      toast({ 
        title: "Already Checked In", 
        description: "This patient is already in the queue.", 
        variant: "destructive" 
      });
      return;
    }

    try {
      await api.addToQueue({
        patient_id: appointment.patient_id,
        appointment_id: appointment.id,
        department: appointment.department || 'General',
        service_type: appointment.appointment_type,
        priority: 3
      });
      await api.updateAppointment(appointment.id, { status: 'in_progress' });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      toast({ title: "Patient Checked In", description: "Patient is now waiting for triage." });
    } catch (error: any) {
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        toast({ title: "Already Checked In", description: "This patient is already in the queue.", variant: "destructive" });
      } else {
        toast({ title: "Check-in Failed", description: error.message || "Failed to check in patient", variant: "destructive" });
      }
    }
  };

  const handleSendToTriage = async (queueEntry: any) => {
    try {
      await api.updateQueueStage(queueEntry.id, 'triage');
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      toast({ title: "Sent to Triage", description: "Patient has been sent to the nurse for vitals." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSendToDoctor = async (queueEntry: any) => {
    try {
      await api.updateQueueStage(queueEntry.id, 'doctor');
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      toast({ title: "Sent to Doctor", description: "Patient has been sent to the doctor." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleCompleteVisit = async (queueEntry: any, appointmentId: string) => {
    try {
      await api.updateQueueStage(queueEntry.id, 'completed');
      await api.updateAppointment(appointmentId, { status: 'completed' });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({ title: "Visit Completed", description: "Patient visit has been marked as complete." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handlePatientLookup = () => {
    toast({ title: "Patient Lookup", description: "Use the search bar above to find patients." });
  };

  const filteredAppointments = appointmentsWithQueue.filter((apt: any) =>
    (apt.first_name + ' ' + apt.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (apt.patient_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CheckSquare className="h-8 w-8 text-primary" />
            Patient Check-In
          </h1>
          <p className="text-muted-foreground">Manage patient check-ins and appointment queue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Appointments</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalAppointments}</p>
                </div>
                <User className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Checked In</p>
                  <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Waiting</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.waiting}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Today's Appointments</CardTitle>
                <CardDescription>Manage patient check-ins for scheduled appointments</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, patient ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No appointments found for today
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment: any) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={appointment.photo_url} alt={`${appointment.first_name} ${appointment.last_name}`} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {appointment.first_name?.[0]}{appointment.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{appointment.first_name} {appointment.last_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">{appointment.patient_number}</span> • {appointment.appointment_time}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{appointment.department || 'General'}</span>
                      </div>
                      <Badge variant="outline">{appointment.appointment_type}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      {appointment.queueEntry ? (
                        <Badge className={appointment.stageInfo.color}>
                          {appointment.stageInfo.label}
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800">
                          {appointment.status === 'scheduled' ? 'Scheduled' : appointment.status}
                        </Badge>
                      )}
                      
                      {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && !appointment.queueEntry && (
                        <Button size="sm" onClick={() => handleCheckIn(appointment)}>
                          <CheckSquare className="mr-2 h-4 w-4" />
                          Check In
                        </Button>
                      )}
                      
                      {appointment.queueEntry && appointment.currentStage === 'waiting' && (
                        <Button size="sm" onClick={() => handleSendToTriage(appointment.queueEntry)}>
                          <Activity className="mr-2 h-4 w-4" />
                          Send to Triage
                        </Button>
                      )}
                      
                      {appointment.queueEntry && appointment.currentStage === 'triage' && (
                        <Button size="sm" onClick={() => handleSendToDoctor(appointment.queueEntry)}>
                          <Stethoscope className="mr-2 h-4 w-4" />
                          Send to Doctor
                        </Button>
                      )}
                      
                      {appointment.queueEntry && appointment.currentStage === 'doctor' && (
                        <Button size="sm" variant="outline" onClick={() => handleCompleteVisit(appointment.queueEntry, appointment.id)}>
                          <CheckSquare className="mr-2 h-4 w-4" />
                          Complete Visit
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common check-in operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col" onClick={() => setWalkInDialogOpen(true)}>
                <User className="h-6 w-6 mb-2" />
                <span>Walk-in Registration</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={() => setQueueDialogOpen(true)}>
                <Clock className="h-6 w-6 mb-2" />
                <span>View Queue Status</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={handlePatientLookup}>
                <Search className="h-6 w-6 mb-2" />
                <span>Patient Lookup</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <WalkInRegistrationDialog open={walkInDialogOpen} onOpenChange={setWalkInDialogOpen} />
        <QueueStatusDialog open={queueDialogOpen} onOpenChange={setQueueDialogOpen} />
      </div>
    </DashboardLayout>
  );
};

export default CheckIn;
