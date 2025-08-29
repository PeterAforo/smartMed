import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, Calendar, Users, Clock, FileText, Pill } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ViewPatientDialog } from '@/components/doctor/ViewPatientDialog';
import { CreatePrescriptionDialog } from '@/components/doctor/CreatePrescriptionDialog';
import { ConsultationInterface } from '@/components/doctor/ConsultationInterface';

const Doctor = () => {
  const { toast } = useToast();
  
  // Dialog states
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [showConsultationInterface, setShowConsultationInterface] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [activeAppointment, setActiveAppointment] = useState<any>(null);
  
  const [todayAppointments] = useState([
    {
      id: 1,
      time: '09:00 AM',
      patient: 'John Doe',
      patientId: 'P001',
      type: 'Consultation',
      status: 'confirmed',
      duration: 30,
      complaint: 'Chest pain'
    },
    {
      id: 2,
      time: '09:30 AM',
      patient: 'Jane Smith',
      patientId: 'P002',
      type: 'Follow-up',
      status: 'in-progress',
      duration: 15,
      complaint: 'Diabetes management'
    },
    {
      id: 3,
      time: '10:00 AM',
      patient: 'Mike Johnson',
      patientId: 'P003',
      type: 'Emergency',
      status: 'waiting',
      duration: 45,
      complaint: 'Severe headache'
    }
  ]);

  const [patientQueue] = useState([
    { id: 1, name: 'Sarah Davis', waitTime: '15 min', priority: 'routine' },
    { id: 2, name: 'Robert Wilson', waitTime: '8 min', priority: 'urgent' },
    { id: 3, name: 'Emily Brown', waitTime: '22 min', priority: 'routine' }
  ]);

  const [recentConsultations] = useState([
    {
      id: 1,
      patient: 'Alice Cooper',
      date: '2024-01-14',
      diagnosis: 'Hypertension',
      prescription: 'Lisinopril 10mg',
      followUp: '2024-02-14'
    },
    {
      id: 2,
      patient: 'David Lee',
      date: '2024-01-14',
      diagnosis: 'Type 2 Diabetes',
      prescription: 'Metformin 500mg',
      followUp: '2024-01-21'
    }
  ]);

  const [stats] = useState({
    todayAppointments: 8,
    patientsWaiting: 3,
    completedToday: 5,
    avgConsultationTime: '25 min'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'routine': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartConsultation = (appointmentId: number) => {
    const appointment = todayAppointments.find(app => app.id === appointmentId);
    if (appointment) {
      setActiveAppointment(appointment);
      setShowConsultationInterface(true);
    }
  };

  const handleCompleteConsultation = (appointmentId: number) => {
    const appointment = todayAppointments.find(app => app.id === appointmentId);
    if (appointment) {
      appointment.status = 'completed';
    }
    toast({
      title: "Consultation Completed",
      description: "Patient consultation has been completed successfully."
    });
  };

  const handleViewPatient = (appointment: any) => {
    setSelectedPatient({
      id: appointment.id,
      name: appointment.patient,
      patientId: appointment.patientId,
      complaint: appointment.complaint
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
          <p className="text-muted-foreground">Manage appointments, consultations, and patient care</p>
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
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedToday}</p>
                </div>
                <Stethoscope className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Consultation</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.avgConsultationTime}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Your appointments for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="font-semibold text-primary">{appointment.time}</span>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status.replace('-', ' ')}
                          </Badge>
                          <Badge variant="outline">{appointment.type}</Badge>
                        </div>
                        <h3 className="font-semibold">{appointment.patient}</h3>
                        <p className="text-sm text-muted-foreground">
                          Patient ID: {appointment.patientId} • Duration: {appointment.duration} min
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Chief Complaint: {appointment.complaint}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {appointment.status === 'confirmed' && (
                          <Button 
                            size="sm"
                            onClick={() => handleStartConsultation(appointment.id)}
                          >
                            Start Consultation
                          </Button>
                        )}
                        {appointment.status === 'in-progress' && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleCompleteConsultation(appointment.id)}
                          >
                            Complete
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleViewPatient(appointment)}>
                          View Patient
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Queue */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Patient Queue</CardTitle>
                <CardDescription>Patients waiting to see you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patientQueue.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Waiting: {patient.waitTime}
                        </p>
                      </div>
                      <Badge className={getPriorityColor(patient.priority)}>
                        {patient.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Users className="mr-2 h-4 w-4" />
                  View Full Queue
                </Button>
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
                <CardDescription>Your recent patient consultations and outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentConsultations.map((consultation) => (
                    <div key={consultation.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{consultation.patient}</h3>
                        <p className="text-sm text-muted-foreground">
                          Date: {consultation.date}
                        </p>
                        <p className="text-sm">
                          Diagnosis: <span className="font-medium">{consultation.diagnosis}</span>
                        </p>
                        <p className="text-sm">
                          Prescription: <span className="font-medium">{consultation.prescription}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Follow-up: {consultation.followUp}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          View Notes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <CardTitle>Prescription Management</CardTitle>
                <CardDescription>Create and manage patient prescriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Prescription Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Create electronic prescriptions for your patients
                  </p>
                  <Button onClick={() => setShowPrescriptionDialog(true)}>
                    <Pill className="mr-2 h-4 w-4" />
                    Create New Prescription
                  </Button>
                </div>
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

        <ConsultationInterface
          open={showConsultationInterface}
          onClose={() => {
            setShowConsultationInterface(false);
            setActiveAppointment(null);
          }}
          appointment={activeAppointment}
        />
      </div>
    </DashboardLayout>
  );
};

export default Doctor;