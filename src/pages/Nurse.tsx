import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Users, AlertTriangle, Activity, Thermometer, Pill, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { RecordVitalsDialog } from '@/components/nurse/RecordVitalsDialog';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

const Nurse = () => {
  const { toast } = useToast();
  const [vitalsDialog, setVitalsDialog] = useState<{open: boolean, patient: any}>({open: false, patient: null});
  const today = new Date().toISOString().split('T')[0];

  // Fetch queue entries (patients waiting/in progress)
  const { data: queueEntries = [], isLoading: queueLoading } = useQuery({
    queryKey: ['queue', 'nurse'],
    queryFn: () => api.getQueue({}),
    refetchInterval: 10000
  });

  // Fetch triage assessments
  const { data: triageData = [] } = useQuery({
    queryKey: ['triage', 'today'],
    queryFn: () => api.getTriageAssessments({ date: today }),
    refetchInterval: 15000
  });

  // Fetch recent vitals from EMR
  const { data: vitalsData = [] } = useQuery({
    queryKey: ['emr', 'vitals'],
    queryFn: () => api.getVitals({}),
    refetchInterval: 30000
  });

  // Transform queue entries to assigned patients format
  const assignedPatients = queueEntries
    .filter((q: any) => q.status === 'waiting' || q.status === 'called' || q.status === 'in_progress')
    .map((q: any) => {
      const triage = triageData.find((t: any) => t.patient_id === q.patient_id);
      return {
        id: q.id,
        patient_id: q.patient_id,
        firstName: q.first_name || '',
        lastName: q.last_name || '',
        name: `${q.first_name || ''} ${q.last_name || ''}`.trim() || 'Unknown',
        patientId: q.patient_number || 'N/A',
        photoUrl: q.photo_url,
        room: q.room_number || 'Waiting',
        condition: triage?.chief_complaint || 'Pending triage',
        priority: q.priority <= 2 ? 'high' : q.priority === 3 ? 'medium' : 'low',
        priorityNum: q.priority,
        lastVitals: triage ? 'Triage done' : 'Needs triage',
        queueStatus: q.status,
        currentStage: q.current_stage || 'waiting',
        department: q.department
      };
    });

  // Transform vitals data
  const vitals = vitalsData.map((v: any) => ({
    id: v.id,
    patient: `${v.first_name || ''} ${v.last_name || ''}`.trim() || 'Unknown',
    patient_id: v.patient_id,
    time: v.recorded_at ? new Date(v.recorded_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
    temperature: v.temperature ? `${v.temperature}°${v.temperature_unit || 'C'}` : 'N/A',
    bloodPressure: v.blood_pressure_systolic && v.blood_pressure_diastolic 
      ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}` : 'N/A',
    heartRate: v.pulse_rate ? `${v.pulse_rate} bpm` : 'N/A',
    oxygenSat: v.oxygen_saturation ? `${v.oxygen_saturation}%` : 'N/A',
    status: getVitalStatus(v)
  }));

  function getVitalStatus(v: any): string {
    if (!v.blood_pressure_systolic) return 'normal';
    if (v.blood_pressure_systolic > 140 || v.blood_pressure_diastolic > 90) return 'attention';
    if (v.oxygen_saturation && v.oxygen_saturation < 95) return 'critical';
    if (v.temperature && v.temperature > 38) return 'attention';
    return 'normal';
  }

  // Patients needing triage
  const pendingTriagePatients = queueEntries.filter((q: any) => 
    !triageData.some((t: any) => t.patient_id === q.patient_id) && 
    (q.status === 'waiting' || q.status === 'called')
  );

  // Calculate stats
  const stats = {
    assignedPatients: assignedPatients.length,
    pendingTriage: pendingTriagePatients.length,
    completedToday: queueEntries.filter((q: any) => q.status === 'completed').length,
    criticalAlerts: assignedPatients.filter((p: any) => p.priorityNum <= 2).length
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'routine': case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVitalsStatus = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'attention': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRecordVitals = (patient: any) => {
    setVitalsDialog({open: true, patient});
  };

  const handleViewChart = (patientId: string) => {
    toast({
      title: "Medical Chart",
      description: `Opening medical chart for patient ${patientId}.`
    });
  };

  const handleUpdateVitals = (patientId: string) => {
    toast({
      title: "Update Vitals",
      description: `Opening vitals update for patient ${patientId}.`
    });
  };

  const handleViewMedicationSchedule = () => {
    toast({
      title: "Medication Schedule",
      description: "Opening medication administration schedule."
    });
  };

  const handleGenerateReport = (reportType: string) => {
    toast({
      title: "Report Generated",
      description: `${reportType} has been generated successfully.`
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            Nurse Station
          </h1>
          <p className="text-muted-foreground">Patient care management and nursing tasks</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Patients</p>
                  <p className="text-2xl font-bold text-primary">{stats.assignedPatients}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Triage</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingTriage}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
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
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assigned Patients */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Patients in Queue</CardTitle>
                <CardDescription>Patients currently waiting or being seen</CardDescription>
              </CardHeader>
              <CardContent>
                {queueLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : assignedPatients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No patients currently in queue
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignedPatients.map((patient) => (
                      <div key={patient.id} className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={patient.photoUrl} alt={patient.name} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {patient.firstName?.[0]}{patient.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-lg">{patient.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">{patient.patientId}</span> • {patient.condition}
                              </p>
                            </div>
                            <Badge variant="outline">{patient.room}</Badge>
                            <Badge className={getPriorityColor(patient.priority)}>
                              {patient.priority} priority
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            {patient.lastVitals === 'Needs triage' ? (
                              <Button size="sm" onClick={() => handleRecordVitals(patient)}>
                                <Thermometer className="mr-2 h-4 w-4" />
                                Record Vitals
                              </Button>
                            ) : (
                              <Badge className="bg-green-100 text-green-800">Triage Complete</Badge>
                            )}
                            <Button size="sm" variant="outline" onClick={() => handleViewChart(patient.patientId)}>
                              View Chart
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Status: {patient.queueStatus} • Department: {patient.department}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pending Triage */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Pending Triage</CardTitle>
                <CardDescription>Patients needing assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingTriagePatients.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      All patients triaged
                    </div>
                  ) : (
                    pendingTriagePatients.map((q: any) => (
                      <div key={q.id} className="p-3 rounded-lg border bg-yellow-50 border-yellow-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{q.first_name} {q.last_name}</span>
                          <Badge className="bg-yellow-100 text-yellow-800">Needs Triage</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Queue #{q.queue_number} • {q.department}
                        </p>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleRecordVitals({ 
                            id: q.id,
                            patient_id: q.patient_id,
                            name: `${q.first_name} ${q.last_name}`, 
                            patientId: q.patient_number,
                            room: q.room_number || 'Waiting'
                          })}
                        >
                          <Thermometer className="mr-2 h-4 w-4" />
                          Start Triage
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="vitals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vitals">Recent Vitals</TabsTrigger>
            <TabsTrigger value="medications">Medication Schedule</TabsTrigger>
            <TabsTrigger value="reports">Nursing Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="vitals">
            <Card>
              <CardHeader>
                <CardTitle>Recent Vital Signs</CardTitle>
                <CardDescription>Latest vital signs recorded for patients</CardDescription>
              </CardHeader>
              <CardContent>
                {vitals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No vitals recorded yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vitals.map((vital) => (
                      <div key={vital.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold">{vital.patient}</h3>
                            <span className="text-sm text-muted-foreground">{vital.time}</span>
                            <Badge className={getVitalsStatus(vital.status)}>
                              {vital.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Temperature</p>
                              <p className="font-medium">{vital.temperature}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Blood Pressure</p>
                              <p className="font-medium">{vital.bloodPressure}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Heart Rate</p>
                              <p className="font-medium">{vital.heartRate}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Oxygen Sat</p>
                              <p className="font-medium">{vital.oxygenSat}</p>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleUpdateVitals(vital.patient)}>
                          Update
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <CardTitle>Medication Schedule</CardTitle>
                <CardDescription>Medication administration schedule for patients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Medication Administration</h3>
                  <p className="text-muted-foreground mb-4">
                    View and manage medication schedules for assigned patients
                  </p>
                  <Button onClick={handleViewMedicationSchedule}>
                    <Pill className="mr-2 h-4 w-4" />
                    View Medication Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Nursing Reports</CardTitle>
                <CardDescription>Generate nursing reports and documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex-col" onClick={() => handleGenerateReport('Patient Care Report')}>
                    <Heart className="h-6 w-6 mb-2" />
                    <span>Patient Care Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col" onClick={() => handleGenerateReport('Shift Report')}>
                    <Activity className="h-6 w-6 mb-2" />
                    <span>Shift Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col" onClick={() => handleGenerateReport('Vitals Summary')}>
                    <Thermometer className="h-6 w-6 mb-2" />
                    <span>Vitals Summary</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col" onClick={() => handleGenerateReport('Medication Log')}>
                    <Pill className="h-6 w-6 mb-2" />
                    <span>Medication Log</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col" onClick={() => handleGenerateReport('Incident Report')}>
                    <AlertTriangle className="h-6 w-6 mb-2" />
                    <span>Incident Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col" onClick={() => handleGenerateReport('Patient Handover')}>
                    <Users className="h-6 w-6 mb-2" />
                    <span>Patient Handover</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <RecordVitalsDialog 
          open={vitalsDialog.open} 
          onOpenChange={(open) => setVitalsDialog({open, patient: null})}
          patient={vitalsDialog.patient}
        />
      </div>
    </DashboardLayout>
  );
};

export default Nurse;
