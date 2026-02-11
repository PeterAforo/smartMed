import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, Calendar, Users, Clock, FileText, Pill, Loader2, Play, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ViewPatientDialog } from '@/components/doctor/ViewPatientDialog';
import { CreatePrescriptionDialog } from '@/components/doctor/CreatePrescriptionDialog';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Doctor = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  
  const navigate = useNavigate();
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Fetch queue entries for doctor (patients ready for consultation)
  const { data: queueEntries = [], isLoading: queueLoading } = useQuery({
    queryKey: ['queue', 'doctor'],
    queryFn: () => api.getQueue({ department: 'General' }),
    refetchInterval: 10000
  });

  // Fetch today's appointments
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments', 'today', today],
    queryFn: () => api.getAppointments({ date: today }),
    refetchInterval: 15000
  });

  // Fetch recent medical records/consultations
  const { data: recentRecords = [] } = useQuery({
    queryKey: ['emr', 'recent'],
    queryFn: () => api.getMedicalRecords({ limit: 10 }),
    refetchInterval: 30000
  });

  // Fetch prescriptions
  const { data: prescriptions = [] } = useQuery({
    queryKey: ['prescriptions', 'recent'],
    queryFn: () => api.getPrescriptions({ limit: 10 }),
    refetchInterval: 30000
  });

  // Transform queue to patient queue format
  const patientQueue = queueEntries
    .filter((q: any) => q.status === 'waiting' || q.status === 'called' || q.status === 'in_progress')
    .filter((q: any) => q.current_stage === 'doctor' || q.current_stage === 'triage')
    .map((q: any) => ({
      id: q.id,
      patient_id: q.patient_id,
      firstName: q.first_name || '',
      lastName: q.last_name || '',
      name: `${q.first_name || ''} ${q.last_name || ''}`.trim(),
      patientNumber: q.patient_number,
      photoUrl: q.photo_url,
      queueNumber: q.queue_number,
      waitTime: q.check_in_time ? getWaitTime(q.check_in_time) : 'N/A',
      priority: q.priority <= 2 ? 'urgent' : q.priority === 3 ? 'medium' : 'routine',
      priorityNum: q.priority,
      status: q.status,
      currentStage: q.current_stage || 'waiting',
      department: q.department,
      chiefComplaint: q.notes || 'General consultation'
    }));

  // Transform appointments
  const todayAppointments = appointments.map((apt: any) => ({
    id: apt.id,
    time: apt.appointment_time ? new Date(`2000-01-01T${apt.appointment_time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
    patient: `${apt.first_name || ''} ${apt.last_name || ''}`.trim(),
    patientId: apt.patient_id,
    patientNumber: apt.patient_number,
    type: apt.appointment_type || 'Consultation',
    status: apt.status,
    duration: apt.duration_minutes || 30,
    complaint: apt.reason || 'General consultation'
  }));

  // Transform recent consultations
  const recentConsultations = recentRecords.map((rec: any) => ({
    id: rec.id,
    patient: `${rec.first_name || ''} ${rec.last_name || ''}`.trim(),
    patientNumber: rec.patient_number,
    date: rec.visit_date ? new Date(rec.visit_date).toLocaleDateString() : 'N/A',
    diagnosis: rec.diagnosis || 'Pending',
    notes: rec.notes || '',
    followUp: rec.follow_up_date ? new Date(rec.follow_up_date).toLocaleDateString() : 'N/A'
  }));

  function getWaitTime(checkInTime: string): string {
    const now = new Date();
    const checkIn = new Date(checkInTime);
    const diffMs = now.getTime() - checkIn.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min`;
    return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
  }

  // Calculate stats
  const stats = {
    todayAppointments: todayAppointments.length,
    patientsWaiting: patientQueue.length,
    completedToday: queueEntries.filter((q: any) => q.status === 'completed').length,
    inProgress: queueEntries.filter((q: any) => q.status === 'in_progress').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': case 'in-progress': return 'bg-green-100 text-green-800';
      case 'waiting': case 'called': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'routine': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartConsultation = async (patient: any) => {
    // Navigate to consultation page with patient ID and queue ID
    navigate(`/consultation/${patient.patient_id}/${patient.id}`);
  };

  const handleCompleteConsultation = async (patient: any) => {
    try {
      if (patient.id) {
        await api.updateQueueStatus(patient.id, 'completed');
        queryClient.invalidateQueries({ queryKey: ['queue'] });
      }
      toast({
        title: "Consultation Completed",
        description: "Patient consultation has been completed successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete consultation",
        variant: "destructive"
      });
    }
  };

  const handleCallPatient = async (patient: any) => {
    try {
      if (patient.id) {
        await api.updateQueueStatus(patient.id, 'called');
        queryClient.invalidateQueries({ queryKey: ['queue'] });
      }
      toast({
        title: "Patient Called",
        description: `Calling ${patient.name} to consultation room`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to call patient",
        variant: "destructive"
      });
    }
  };

  const handleViewPatient = (patient: any) => {
    setSelectedPatient({
      id: patient.patient_id || patient.patientId,
      name: patient.name || patient.patient,
      patientNumber: patient.patientNumber,
      complaint: patient.chiefComplaint || patient.complaint
    });
    setShowPatientDialog(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            Doctor Portal
          </h1>
          <p className="text-muted-foreground">Manage consultations, prescriptions, and patient care</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Appointments</p>
                  <p className="text-2xl font-bold text-primary">{stats.todayAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Patients Waiting</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.patientsWaiting}</p>
                </div>
                <Users className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedToday}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Queue */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Patient Queue</CardTitle>
                <CardDescription>Patients waiting for consultation</CardDescription>
              </CardHeader>
              <CardContent>
                {queueLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : patientQueue.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No patients in queue
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patientQueue.map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-4 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={patient.photoUrl} alt={patient.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {patient.firstName?.[0]}{patient.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-bold text-lg text-primary">#{patient.queueNumber}</span>
                              <h3 className="font-semibold text-lg">{patient.name}</h3>
                              <Badge className={getPriorityColor(patient.priority)}>
                                {patient.priority}
                              </Badge>
                              <Badge className={getStatusColor(patient.status)}>
                                {patient.currentStage === 'doctor' ? 'With Doctor' : patient.currentStage}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">{patient.patientNumber}</span> • Wait: {patient.waitTime}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Complaint: {patient.chiefComplaint}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {patient.status === 'waiting' && (
                            <Button size="sm" variant="outline" onClick={() => handleCallPatient(patient)}>
                              Call Patient
                            </Button>
                          )}
                          {(patient.status === 'waiting' || patient.status === 'called') && (
                            <Button size="sm" onClick={() => handleStartConsultation(patient)}>
                              <Play className="mr-2 h-4 w-4" />
                              Start
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleViewPatient(patient)}>
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* In Progress */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>In Progress</CardTitle>
                <CardDescription>Current consultations</CardDescription>
              </CardHeader>
              <CardContent>
                {queueEntries.filter((q: any) => q.status === 'in_progress').length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No active consultations
                  </div>
                ) : (
                  <div className="space-y-3">
                    {queueEntries
                      .filter((q: any) => q.status === 'in_progress')
                      .map((q: any) => (
                        <div key={q.id} className="p-3 rounded-lg border bg-green-50 border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold">#{q.queue_number}</span>
                            <Badge className="bg-green-100 text-green-800">In Progress</Badge>
                          </div>
                          <p className="font-medium">{q.first_name} {q.last_name}</p>
                          <p className="text-sm text-muted-foreground">{q.patient_number}</p>
                          <Button 
                            size="sm" 
                            className="w-full mt-2"
                            onClick={() => handleCompleteConsultation({ id: q.id, name: `${q.first_name} ${q.last_name}` })}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Complete
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="consultations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="consultations">Recent Consultations</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="reports">Medical Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="consultations">
            <Card>
              <CardHeader>
                <CardTitle>Recent Consultations</CardTitle>
                <CardDescription>Your recent patient consultations</CardDescription>
              </CardHeader>
              <CardContent>
                {recentConsultations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent consultations
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentConsultations.map((consultation) => (
                      <div key={consultation.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{consultation.patient}</h3>
                          <p className="text-sm text-muted-foreground">
                            Date: {consultation.date} • ID: {consultation.patientNumber}
                          </p>
                          <p className="text-sm">
                            Diagnosis: <span className="font-medium">{consultation.diagnosis}</span>
                          </p>
                          {consultation.notes && (
                            <p className="text-sm text-muted-foreground truncate max-w-md">
                              Notes: {consultation.notes}
                            </p>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Prescriptions</CardTitle>
                    <CardDescription>Recent prescriptions issued</CardDescription>
                  </div>
                  <Button onClick={() => setShowPrescriptionDialog(true)}>
                    <Pill className="mr-2 h-4 w-4" />
                    New Prescription
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {prescriptions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No prescriptions found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {prescriptions.map((rx: any) => (
                      <div key={rx.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{rx.first_name} {rx.last_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Date: {new Date(rx.prescription_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm">
                            Status: <Badge className={rx.status === 'dispensed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{rx.status}</Badge>
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Medical Reports</CardTitle>
                <CardDescription>Generate and manage medical reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    <span>Patient Summary</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Stethoscope className="h-6 w-6 mb-2" />
                    <span>Consultation Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Calendar className="h-6 w-6 mb-2" />
                    <span>Daily Schedule</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    <span>Patient Statistics</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Pill className="h-6 w-6 mb-2" />
                    <span>Prescription History</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    <span>Medical Certificates</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <ViewPatientDialog
          open={showPatientDialog}
          onOpenChange={setShowPatientDialog}
          patient={selectedPatient}
        />
        
        <CreatePrescriptionDialog
          open={showPrescriptionDialog}
          onOpenChange={setShowPrescriptionDialog}
        />
      </div>
    </DashboardLayout>
  );
};

export default Doctor;
