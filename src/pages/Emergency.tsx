import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Siren, Clock, AlertTriangle, Activity, Users, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Emergency = () => {
  const { toast } = useToast();
  
  const [emergencyQueue] = useState([
    {
      id: 1,
      patientName: 'John Emergency',
      patientId: 'E001',
      arrivalTime: '14:30',
      triageLevel: '1',
      complaint: 'Chest pain, difficulty breathing',
      vitals: { bp: '180/120', hr: '110', temp: '98.6°F', spo2: '92%' },
      assignedTo: 'Dr. Smith',
      status: 'treatment'
    },
    {
      id: 2,
      patientName: 'Sarah Urgent',
      patientId: 'E002',
      arrivalTime: '14:45',
      triageLevel: '2',
      complaint: 'Severe abdominal pain',
      vitals: { bp: '140/90', hr: '95', temp: '99.2°F', spo2: '98%' },
      assignedTo: 'Dr. Johnson',
      status: 'waiting'
    },
    {
      id: 3,
      patientName: 'Mike Minor',
      patientId: 'E003',
      arrivalTime: '15:00',
      triageLevel: '3',
      complaint: 'Minor laceration on hand',
      vitals: { bp: '120/80', hr: '72', temp: '98.6°F', spo2: '99%' },
      assignedTo: 'Nurse Williams',
      status: 'triage'
    }
  ]);

  const [beds] = useState([
    { id: 1, number: 'ER-01', status: 'occupied', patient: 'John Emergency', since: '14:35' },
    { id: 2, number: 'ER-02', status: 'cleaning', patient: null, since: '14:20' },
    { id: 3, number: 'ER-03', status: 'available', patient: null, since: null },
    { id: 4, number: 'ER-04', status: 'occupied', patient: 'Sarah Urgent', since: '14:50' },
    { id: 5, number: 'ER-05', status: 'available', patient: null, since: null },
    { id: 6, number: 'ER-06', status: 'maintenance', patient: null, since: '12:00' }
  ]);

  const [staff] = useState([
    { id: 1, name: 'Dr. Smith', role: 'Emergency Physician', status: 'busy', currentPatient: 'John Emergency' },
    { id: 2, name: 'Dr. Johnson', role: 'Emergency Physician', status: 'available', currentPatient: null },
    { id: 3, name: 'Nurse Williams', role: 'ER Nurse', status: 'busy', currentPatient: 'Mike Minor' },
    { id: 4, name: 'Nurse Davis', role: 'ER Nurse', status: 'available', currentPatient: null }
  ]);

  const [stats] = useState({
    currentPatients: 15,
    waitingTriage: 3,
    inTreatment: 8,
    avgWaitTime: '25 min',
    availableBeds: 2,
    criticalCases: 1
  });

  const getTriageColor = (level: string) => {
    switch (level) {
      case '1': return 'bg-red-600 text-white'; // Immediate
      case '2': return 'bg-orange-500 text-white'; // Urgent
      case '3': return 'bg-yellow-500 text-black'; // Less urgent
      case '4': return 'bg-green-500 text-white'; // Non-urgent
      case '5': return 'bg-blue-500 text-white'; // Non-urgent
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'triage': return 'bg-blue-100 text-blue-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'treatment': return 'bg-green-100 text-green-800';
      case 'discharge': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBedStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'available': return 'bg-green-100 text-green-800';
      case 'cleaning': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStaffStatusColor = (status: string) => {
    switch (status) {
      case 'busy': return 'bg-red-100 text-red-800';
      case 'available': return 'bg-green-100 text-green-800';
      case 'break': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAssignBed = (patientId: string) => {
    toast({
      title: "Bed Assigned",
      description: `Patient ${patientId} has been assigned to an available bed.`
    });
  };

  const handleUpdateTriage = (patientId: string) => {
    toast({
      title: "Triage Updated",
      description: `Triage assessment updated for patient ${patientId}.`
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Siren className="h-8 w-8 text-red-600" />
            Emergency Room
          </h1>
          <p className="text-muted-foreground">Emergency department management and patient triage</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Patients</p>
                  <p className="text-2xl font-bold text-primary">{stats.currentPatients}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Waiting Triage</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.waitingTriage}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Treatment</p>
                  <p className="text-2xl font-bold text-green-600">{stats.inTreatment}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Wait Time</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.avgWaitTime}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Beds</p>
                  <p className="text-2xl font-bold text-green-600">{stats.availableBeds}</p>
                </div>
                <Heart className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Cases</p>
                  <p className="text-2xl font-bold text-red-600">{stats.criticalCases}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="patients" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patients">Patient Queue</TabsTrigger>
            <TabsTrigger value="beds">Bed Management</TabsTrigger>
            <TabsTrigger value="staff">Staff Status</TabsTrigger>
            <TabsTrigger value="reports">ER Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Patient Queue</CardTitle>
                <CardDescription>Current patients in the emergency department by triage level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emergencyQueue.map((patient) => (
                    <div key={patient.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Badge className={getTriageColor(patient.triageLevel)}>
                            Triage {patient.triageLevel}
                          </Badge>
                          <h3 className="font-semibold">{patient.patientName}</h3>
                          <Badge className={getStatusColor(patient.status)}>
                            {patient.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateTriage(patient.patientId)}>
                            Update Triage
                          </Button>
                          <Button size="sm" onClick={() => handleAssignBed(patient.patientId)}>
                            Assign Bed
                          </Button>
                          <Button size="sm" variant="outline">
                            View Chart
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Patient ID: {patient.patientId} • Arrival: {patient.arrivalTime}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Assigned to: {patient.assignedTo}
                          </p>
                          <p className="text-sm mb-2">
                            <strong>Chief Complaint:</strong> {patient.complaint}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-1">Vital Signs:</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <span>BP: {patient.vitals.bp}</span>
                            <span>HR: {patient.vitals.hr}</span>
                            <span>Temp: {patient.vitals.temp}</span>
                            <span>SpO2: {patient.vitals.spo2}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="beds">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Room Beds</CardTitle>
                <CardDescription>Current bed availability and patient assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {beds.map((bed) => (
                    <div key={bed.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{bed.number}</h3>
                        <Badge className={getBedStatusColor(bed.status)}>
                          {bed.status}
                        </Badge>
                      </div>
                      
                      {bed.patient && (
                        <div>
                          <p className="text-sm">Patient: {bed.patient}</p>
                          <p className="text-sm text-muted-foreground">Since: {bed.since}</p>
                        </div>
                      )}
                      
                      {bed.status === 'available' && (
                        <Button size="sm" className="w-full mt-2">
                          Assign Patient
                        </Button>
                      )}
                      
                      {bed.status === 'cleaning' && (
                        <div className="text-sm text-muted-foreground mt-2">
                          Cleaning in progress...
                        </div>
                      )}
                      
                      {bed.status === 'maintenance' && (
                        <div className="text-sm text-muted-foreground mt-2">
                          Under maintenance since {bed.since}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Staff Status</CardTitle>
                <CardDescription>Current staff availability and assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staff.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                        <Badge className={getStaffStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                      </div>
                      
                      <div className="text-right">
                        {member.currentPatient && (
                          <p className="text-sm">
                            Current Patient: <span className="font-medium">{member.currentPatient}</span>
                          </p>
                        )}
                        {member.status === 'available' && (
                          <Button size="sm">
                            Assign Patient
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Department Reports</CardTitle>
                <CardDescription>Generate and view emergency department reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex-col">
                    <Siren className="h-6 w-6 mb-2" />
                    <span>Daily ER Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Clock className="h-6 w-6 mb-2" />
                    <span>Wait Time Analysis</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <AlertTriangle className="h-6 w-6 mb-2" />
                    <span>Triage Statistics</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Activity className="h-6 w-6 mb-2" />
                    <span>Patient Flow Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    <span>Staff Utilization</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Heart className="h-6 w-6 mb-2" />
                    <span>Critical Case Summary</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Emergency;