import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Users, AlertTriangle, Activity, Thermometer, Pill } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RecordVitalsDialog } from '@/components/nurse/RecordVitalsDialog';

const Nurse = () => {
  const { toast } = useToast();
  const [vitalsDialog, setVitalsDialog] = useState<{open: boolean, patient: any}>({open: false, patient: null});
  
  const [assignedPatients] = useState([
    {
      id: 1,
      name: 'John Doe',
      patientId: 'P001',
      room: '101A',
      condition: 'Post-operative care',
      priority: 'high',
      lastVitals: '2 hours ago',
      medications: ['Antibiotics', 'Pain relief']
    },
    {
      id: 2,
      name: 'Jane Smith',
      patientId: 'P002',
      room: '102B',
      condition: 'Diabetes monitoring',
      priority: 'medium',
      lastVitals: '4 hours ago',
      medications: ['Insulin', 'Metformin']
    },
    {
      id: 3,
      name: 'Mike Johnson',
      patientId: 'P003',
      room: '103A',
      condition: 'Recovery',
      priority: 'low',
      lastVitals: '1 hour ago',
      medications: ['Vitamins']
    }
  ]);

  const [tasks] = useState([
    { id: 1, task: 'Administer medication to John Doe', time: '10:00 AM', priority: 'urgent', completed: false },
    { id: 2, task: 'Check vital signs - Room 102B', time: '10:30 AM', priority: 'routine', completed: false },
    { id: 3, task: 'Wound dressing change - Room 101A', time: '11:00 AM', priority: 'routine', completed: true },
    { id: 4, task: 'Patient education - Jane Smith', time: '11:30 AM', priority: 'routine', completed: false }
  ]);

  const [vitals] = useState([
    {
      id: 1,
      patient: 'John Doe',
      time: '08:00 AM',
      temperature: '98.6°F',
      bloodPressure: '120/80',
      heartRate: '72 bpm',
      oxygenSat: '98%',
      status: 'normal'
    },
    {
      id: 2,
      patient: 'Jane Smith',
      time: '06:00 AM',
      temperature: '99.2°F',
      bloodPressure: '140/90',
      heartRate: '85 bpm',
      oxygenSat: '96%',
      status: 'attention'
    }
  ]);

  const [stats] = useState({
    assignedPatients: 12,
    pendingTasks: 8,
    completedTasks: 15,
    criticalAlerts: 2
  });

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

  const handleCompleteTask = (taskId: number) => {
    toast({
      title: "Task Completed",
      description: "Task has been marked as completed."
    });
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
                  <p className="text-sm text-muted-foreground">Pending Tasks</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Tasks</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
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
                <CardTitle>Assigned Patients</CardTitle>
                <CardDescription>Patients under your care</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignedPatients.map((patient) => (
                    <div key={patient.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <h3 className="font-semibold">{patient.name}</h3>
                          <Badge variant="outline">Room {patient.room}</Badge>
                          <Badge className={getPriorityColor(patient.priority)}>
                            {patient.priority} priority
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleRecordVitals(patient)}>
                            <Thermometer className="mr-2 h-4 w-4" />
                            Record Vitals
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleViewChart(patient.patientId)}>
                            View Chart
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        Patient ID: {patient.patientId} • Condition: {patient.condition}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Last vitals: {patient.lastVitals}
                      </p>
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">Medications: {patient.medications.join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Task List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Today's Tasks</CardTitle>
                <CardDescription>Your nursing tasks and schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className={`p-3 rounded-lg border ${task.completed ? 'bg-green-50 border-green-200' : 'bg-muted'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-primary">{task.time}</span>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{task.task}</p>
                      {!task.completed && (
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          Mark Complete
                        </Button>
                      )}
                      {task.completed && (
                        <div className="text-center text-sm text-green-600 font-medium">
                          ✓ Completed
                        </div>
                      )}
                    </div>
                  ))}
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
                <CardDescription>Latest vital signs recorded for your patients</CardDescription>
              </CardHeader>
              <CardContent>
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
                        Update Vitals
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <CardTitle>Medication Schedule</CardTitle>
                <CardDescription>Medication administration schedule for your patients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Medication Administration</h3>
                  <p className="text-muted-foreground mb-4">
                    View and manage medication schedules for your assigned patients
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