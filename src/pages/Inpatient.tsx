import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bed, Search, Calendar, User, AlertTriangle, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Inpatient = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [inpatients] = useState([
    {
      id: 1,
      patientName: 'John Doe',
      patientId: 'P001',
      room: '101A',
      bedNumber: '1',
      admissionDate: '2024-01-10',
      condition: 'Post-operative recovery',
      doctor: 'Dr. Smith',
      status: 'stable',
      diet: 'Regular',
      allergies: ['Penicillin'],
      nextRound: '14:00'
    },
    {
      id: 2,
      patientName: 'Jane Smith',
      patientId: 'P002',
      room: '102B',
      bedNumber: '3',
      admissionDate: '2024-01-12',
      condition: 'Pneumonia treatment',
      doctor: 'Dr. Johnson',
      status: 'improving',
      diet: 'Soft diet',
      allergies: [],
      nextRound: '15:30'
    },
    {
      id: 3,
      patientName: 'Mike Johnson',
      patientId: 'P003',
      room: '103A',
      bedNumber: '2',
      admissionDate: '2024-01-14',
      condition: 'Diabetes management',
      doctor: 'Dr. Williams',
      status: 'critical',
      diet: 'Diabetic diet',
      allergies: ['Sulfa'],
      nextRound: '16:00'
    }
  ]);

  const [admissions] = useState([
    {
      id: 1,
      patientName: 'Sarah Davis',
      patientId: 'P004',
      admissionTime: '10:30 AM',
      fromDepartment: 'Emergency',
      assignedRoom: 'Pending',
      doctor: 'Dr. Brown',
      priority: 'urgent',
      condition: 'Acute appendicitis'
    },
    {
      id: 2,
      patientName: 'Robert Wilson',
      patientId: 'P005',
      admissionTime: '11:15 AM',
      fromDepartment: 'Outpatient',
      assignedRoom: '104B',
      doctor: 'Dr. Davis',
      priority: 'routine',
      condition: 'Scheduled surgery'
    }
  ]);

  const [discharges] = useState([
    {
      id: 1,
      patientName: 'Alice Cooper',
      patientId: 'P006',
      room: '105A',
      dischargeTime: '09:00 AM',
      doctor: 'Dr. Lee',
      status: 'completed',
      followUp: '2024-01-25'
    },
    {
      id: 2,
      patientName: 'David Miller',
      patientId: 'P007',
      room: '106B',
      dischargeTime: '10:30 AM',
      doctor: 'Dr. Clark',
      status: 'pending',
      followUp: '2024-01-22'
    }
  ]);

  const [stats] = useState({
    totalBeds: 45,
    occupiedBeds: 38,
    availableBeds: 7,
    admissionsToday: 8,
    dischargesToday: 5,
    criticalPatients: 3
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-100 text-green-800';
      case 'improving': return 'bg-blue-100 text-blue-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'declining': return 'bg-orange-100 text-orange-800';
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

  const getDischargeStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAssignRoom = (patientId: string) => {
    toast({
      title: "Room Assigned",
      description: `Patient ${patientId} has been assigned to an available room.`
    });
  };

  const handleUpdateStatus = (patientId: string) => {
    toast({
      title: "Status Updated",
      description: `Patient status has been updated for ${patientId}.`
    });
  };

  const filteredInpatients = inpatients.filter(patient =>
    patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Bed className="h-8 w-8 text-primary" />
            Inpatient Department
          </h1>
          <p className="text-muted-foreground">Manage admitted patients, admissions, and discharges</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Beds</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalBeds}</p>
                </div>
                <Bed className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Occupied</p>
                  <p className="text-2xl font-bold text-red-600">{stats.occupiedBeds}</p>
                </div>
                <User className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold text-green-600">{stats.availableBeds}</p>
                </div>
                <Bed className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Admissions Today</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.admissionsToday}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Discharges Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats.dischargesToday}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Patients</p>
                  <p className="text-2xl font-bold text-red-600">{stats.criticalPatients}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="current" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current Patients</TabsTrigger>
            <TabsTrigger value="admissions">New Admissions</TabsTrigger>
            <TabsTrigger value="discharges">Discharges</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Current Inpatients</CardTitle>
                    <CardDescription>Patients currently admitted in the hospital</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredInpatients.map((patient) => (
                    <div key={patient.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <h3 className="font-semibold">{patient.patientName}</h3>
                          <Badge variant="outline">Room {patient.room}</Badge>
                          <Badge variant="outline">Bed {patient.bedNumber}</Badge>
                          <Badge className={getStatusColor(patient.status)}>
                            {patient.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateStatus(patient.patientId)}>
                            Update Status
                          </Button>
                          <Button size="sm" variant="outline">
                            View Chart
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Patient ID: {patient.patientId} • Admitted: {patient.admissionDate}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Attending: {patient.doctor}
                          </p>
                          <p className="text-sm mb-2">
                            <strong>Condition:</strong> {patient.condition}
                          </p>
                          <p className="text-sm mb-2">
                            <strong>Diet:</strong> {patient.diet}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm mb-2">
                            <strong>Next Round:</strong> {patient.nextRound}
                          </p>
                          <p className="text-sm">
                            <strong>Allergies:</strong> {patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admissions">
            <Card>
              <CardHeader>
                <CardTitle>New Admissions</CardTitle>
                <CardDescription>Patients being admitted today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {admissions.map((admission) => (
                    <div key={admission.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold">{admission.patientName}</h3>
                          <Badge className={getPriorityColor(admission.priority)}>
                            {admission.priority}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{admission.admissionTime}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Patient ID: {admission.patientId} • From: {admission.fromDepartment}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          Doctor: {admission.doctor}
                        </p>
                        <p className="text-sm">
                          <strong>Condition:</strong> {admission.condition}
                        </p>
                        <p className="text-sm">
                          <strong>Room:</strong> {admission.assignedRoom}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {admission.assignedRoom === 'Pending' && (
                          <Button 
                            size="sm"
                            onClick={() => handleAssignRoom(admission.patientId)}
                          >
                            Assign Room
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          Complete Admission
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discharges">
            <Card>
              <CardHeader>
                <CardTitle>Patient Discharges</CardTitle>
                <CardDescription>Patients being discharged today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {discharges.map((discharge) => (
                    <div key={discharge.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold">{discharge.patientName}</h3>
                          <Badge variant="outline">Room {discharge.room}</Badge>
                          <Badge className={getDischargeStatusColor(discharge.status)}>
                            {discharge.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{discharge.dischargeTime}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Patient ID: {discharge.patientId} • Doctor: {discharge.doctor}
                        </p>
                        <p className="text-sm">
                          <strong>Follow-up:</strong> {discharge.followUp}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {discharge.status === 'pending' && (
                          <Button size="sm">
                            Process Discharge
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          Discharge Summary
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Inpatient;