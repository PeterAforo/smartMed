import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scissors, Clock, Users, AlertTriangle, Calendar, CheckCircle, Activity, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScheduleSurgeryDialog } from '@/components/theatre/ScheduleSurgeryDialog';

const Theatre = () => {
  const { toast } = useToast();
  const [scheduleSurgeryOpen, setScheduleSurgeryOpen] = useState(false);

  // Mock data for surgical schedule
  const [surgicalSchedule] = useState([
    {
      id: 1,
      patient: 'John Smith',
      patientId: 'PAT001',
      procedure: 'Laparoscopic Cholecystectomy',
      surgeon: 'Dr. Sarah Wilson',
      anesthesiologist: 'Dr. Mike Johnson',
      theatre: 'OR-1',
      scheduledTime: '08:00 AM',
      duration: 120,
      status: 'scheduled',
      priority: 'elective',
      equipmentNeeded: ['Laparoscope', 'Insufflator', 'Electrocautery']
    },
    {
      id: 2,
      patient: 'Maria Garcia',
      patientId: 'PAT002',
      procedure: 'Emergency Appendectomy',
      surgeon: 'Dr. Robert Brown',
      anesthesiologist: 'Dr. Lisa Davis',
      theatre: 'OR-2',
      scheduledTime: '10:30 AM',
      duration: 90,
      status: 'in-progress',
      priority: 'emergency',
      equipmentNeeded: ['Standard Surgical Set', 'Electrocautery']
    },
    {
      id: 3,
      patient: 'David Lee',
      patientId: 'PAT003',
      procedure: 'Total Knee Replacement',
      surgeon: 'Dr. Michael Anderson',
      anesthesiologist: 'Dr. Jennifer White',
      theatre: 'OR-3',
      scheduledTime: '01:00 PM',
      duration: 180,
      status: 'prep',
      priority: 'scheduled',
      equipmentNeeded: ['Orthopedic Set', 'Cement Mixer', 'C-Arm']
    }
  ]);

  // Mock data for operating theatres
  const [theatres] = useState([
    {
      id: 1,
      name: 'OR-1',
      status: 'occupied',
      currentProcedure: 'Laparoscopic Surgery',
      surgeon: 'Dr. Sarah Wilson',
      startTime: '08:00 AM',
      estimatedEnd: '10:00 AM',
      utilization: 85
    },
    {
      id: 2,
      name: 'OR-2',
      status: 'cleaning',
      currentProcedure: 'Post-op Cleaning',
      nextProcedure: 'Emergency Appendectomy',
      nextTime: '10:30 AM',
      utilization: 92
    },
    {
      id: 3,
      name: 'OR-3',
      status: 'available',
      nextProcedure: 'Total Knee Replacement',
      nextTime: '01:00 PM',
      utilization: 78
    },
    {
      id: 4,
      name: 'OR-4',
      status: 'maintenance',
      expectedAvailable: '02:00 PM',
      utilization: 65
    }
  ]);

  const [theatreStats] = useState({
    todaysSurgeries: 12,
    completedSurgeries: 8,
    emergencyCases: 3,
    averageDuration: 95,
    onTimePerformance: 89,
    availableTheatres: 2
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500 text-white';
      case 'in-progress': return 'bg-green-500 text-white';
      case 'completed': return 'bg-gray-500 text-white';
      case 'prep': return 'bg-yellow-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      case 'occupied': return 'bg-red-500 text-white';
      case 'available': return 'bg-green-500 text-white';
      case 'cleaning': return 'bg-yellow-500 text-white';
      case 'maintenance': return 'bg-orange-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-500 text-white';
      case 'urgent': return 'bg-orange-500 text-white';
      case 'scheduled': return 'bg-blue-500 text-white';
      case 'elective': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleStartSurgery = (surgeryId: number) => {
    toast({
      title: "Surgery Started",
      description: "Patient has been taken to the operating theatre.",
    });
  };

  const handleCompleteSurgery = (surgeryId: number) => {
    toast({
      title: "Surgery Completed",
      description: "Surgery completed successfully. Patient moved to recovery.",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Operating Theatre Management</h1>
          <p className="text-muted-foreground">
            Surgical scheduling, theatre utilization, and perioperative management
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Surgeries</CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{theatreStats.todaysSurgeries}</div>
              <p className="text-xs text-muted-foreground">
                {theatreStats.emergencyCases} emergency cases
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{theatreStats.completedSurgeries}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((theatreStats.completedSurgeries / theatreStats.todaysSurgeries) * 100)}% completion rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emergency Cases</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{theatreStats.emergencyCases}</div>
              <p className="text-xs text-muted-foreground">
                Urgent interventions today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{theatreStats.averageDuration}min</div>
              <p className="text-xs text-muted-foreground">
                Surgical case duration
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On-Time Performance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{theatreStats.onTimePerformance}%</div>
              <p className="text-xs text-muted-foreground">
                Surgeries starting on time
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Theatres</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{theatreStats.availableTheatres}</div>
              <p className="text-xs text-muted-foreground">
                Ready for procedures
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schedule">Surgery Schedule</TabsTrigger>
            <TabsTrigger value="theatres">Theatre Status</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="staff">Surgical Staff</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Today's Surgical Schedule</CardTitle>
                    <CardDescription>
                      Monitor and manage surgical cases for today
                    </CardDescription>
                  </div>
                  <Button onClick={() => setScheduleSurgeryOpen(true)}>
                    Schedule Surgery
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {surgicalSchedule.map((surgery) => (
                    <div key={surgery.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{surgery.patient}</h3>
                          <Badge variant="outline">{surgery.patientId}</Badge>
                          <Badge className={getStatusColor(surgery.status)}>
                            {surgery.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                          <Badge className={getPriorityColor(surgery.priority)}>
                            {surgery.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-blue-600">{surgery.procedure}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center"><Clock className="mr-1 h-3 w-3" />{surgery.scheduledTime}</span>
                          <span>Duration: {formatDuration(surgery.duration)}</span>
                          <span>Theatre: {surgery.theatre}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center"><Stethoscope className="mr-1 h-3 w-3" />Surgeon: {surgery.surgeon}</span>
                          <span>Anesthesia: {surgery.anesthesiologist}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Equipment: {surgery.equipmentNeeded.join(', ')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {surgery.status === 'scheduled' && (
                          <Button size="sm" onClick={() => handleStartSurgery(surgery.id)}>
                            Start Surgery
                          </Button>
                        )}
                        {surgery.status === 'in-progress' && (
                          <Button size="sm" onClick={() => handleCompleteSurgery(surgery.id)}>
                            Complete
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theatres" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Operating Theatre Status</CardTitle>
                <CardDescription>
                  Real-time status of all operating theatres
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {theatres.map((theatre) => (
                    <Card key={theatre.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{theatre.name}</CardTitle>
                          <Badge className={getStatusColor(theatre.status)}>
                            {theatre.status.toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {theatre.currentProcedure && (
                            <div>
                              <p className="text-sm font-medium">Current: {theatre.currentProcedure}</p>
                              {theatre.surgeon && (
                                <p className="text-xs text-muted-foreground">Surgeon: {theatre.surgeon}</p>
                              )}
                              {theatre.startTime && theatre.estimatedEnd && (
                                <p className="text-xs text-muted-foreground">
                                  {theatre.startTime} - {theatre.estimatedEnd}
                                </p>
                              )}
                            </div>
                          )}
                          {theatre.nextProcedure && (
                            <div>
                              <p className="text-sm">Next: {theatre.nextProcedure}</p>
                              <p className="text-xs text-muted-foreground">Scheduled: {theatre.nextTime}</p>
                            </div>
                          )}
                          {theatre.expectedAvailable && (
                            <p className="text-xs text-muted-foreground">
                              Available: {theatre.expectedAvailable}
                            </p>
                          )}
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-muted-foreground">Utilization:</span>
                            <span className="text-xs font-medium">{theatre.utilization}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div 
                              className="bg-primary h-1.5 rounded-full"
                              style={{ width: `${theatre.utilization}%` }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Surgical Equipment Management</CardTitle>
                <CardDescription>
                  Track and manage surgical instruments and equipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { name: 'Laparoscope Set', status: 'available', location: 'Sterilization', nextMaintenance: '2024-02-15' },
                    { name: 'C-Arm Machine', status: 'in-use', location: 'OR-3', nextMaintenance: '2024-01-25' },
                    { name: 'Electrocautery Unit', status: 'maintenance', location: 'Biomedical', nextMaintenance: '2024-01-20' },
                    { name: 'Anesthesia Machine 1', status: 'available', location: 'OR-1', nextMaintenance: '2024-02-10' },
                    { name: 'Orthopedic Set', status: 'sterilizing', location: 'Central Sterile', nextMaintenance: '2024-01-30' },
                    { name: 'Microscope', status: 'available', location: 'OR-4', nextMaintenance: '2024-02-05' }
                  ].map((equipment, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{equipment.name}</CardTitle>
                        <Badge className={getStatusColor(equipment.status)}>
                          {equipment.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Location:</span>
                            <span>{equipment.location}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Next Maintenance:</span>
                            <span>{equipment.nextMaintenance}</span>
                          </div>
                          <Button className="w-full mt-2" variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Surgical Staff Management</CardTitle>
                <CardDescription>
                  Monitor surgical team schedules and availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Surgeons On Duty</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { name: 'Dr. Sarah Wilson', specialty: 'General Surgery', status: 'in-surgery', location: 'OR-1' },
                        { name: 'Dr. Robert Brown', specialty: 'Emergency Surgery', status: 'available', location: 'Call Room' },
                        { name: 'Dr. Michael Anderson', specialty: 'Orthopedics', status: 'prep', location: 'OR-3' },
                        { name: 'Dr. Jennifer Martinez', specialty: 'Cardiothoracic', status: 'available', location: 'Office' }
                      ].map((surgeon, index) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium text-sm">{surgeon.name}</p>
                            <p className="text-xs text-muted-foreground">{surgeon.specialty}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(surgeon.status)}>
                              {surgeon.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{surgeon.location}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Nursing Staff</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { name: 'Nurse Kelly Smith', role: 'Scrub Nurse', status: 'in-surgery', location: 'OR-1' },
                        { name: 'Nurse Tom Johnson', role: 'Circulating Nurse', status: 'available', location: 'OR-2' },
                        { name: 'Nurse Lisa Davis', role: 'Recovery Nurse', status: 'busy', location: 'PACU' },
                        { name: 'Nurse Mark Wilson', role: 'Anesthesia Tech', status: 'prep', location: 'OR-3' }
                      ].map((nurse, index) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium text-sm">{nurse.name}</p>
                            <p className="text-xs text-muted-foreground">{nurse.role}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(nurse.status)}>
                              {nurse.status.toUpperCase()}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{nurse.location}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <ScheduleSurgeryDialog 
        open={scheduleSurgeryOpen}
        onOpenChange={setScheduleSurgeryOpen}
      />
    </DashboardLayout>
  );
};

export default Theatre;