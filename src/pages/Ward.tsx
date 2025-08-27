import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Bed, Heart, Clock, AlertTriangle, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ManageBedsDialog } from '@/components/ward/ManageBedsDialog';

const Ward = () => {
  const { toast } = useToast();
  const [manageBedsOpen, setManageBedsOpen] = useState(false);
  const [selectedWard, setSelectedWard] = useState('');
  
  const [wards] = useState([
    {
      id: 1,
      name: 'Medical Ward A',
      capacity: 20,
      occupied: 18,
      available: 2,
      nurse: 'Nurse Sarah',
      patients: [
        { name: 'John Doe', bed: '1A', condition: 'Stable', priority: 'low' },
        { name: 'Jane Smith', bed: '2A', condition: 'Critical', priority: 'high' },
        { name: 'Mike Johnson', bed: '3A', condition: 'Improving', priority: 'medium' }
      ]
    },
    {
      id: 2,
      name: 'Surgical Ward B',
      capacity: 15,
      occupied: 12,
      available: 3,
      nurse: 'Nurse Williams',
      patients: [
        { name: 'Alice Cooper', bed: '1B', condition: 'Post-op', priority: 'medium' },
        { name: 'David Miller', bed: '2B', condition: 'Recovering', priority: 'low' }
      ]
    },
    {
      id: 3,
      name: 'ICU Ward',
      capacity: 10,
      occupied: 8,
      available: 2,
      nurse: 'Nurse Davis',
      patients: [
        { name: 'Robert Wilson', bed: '1C', condition: 'Critical', priority: 'high' },
        { name: 'Emily Brown', bed: '2C', condition: 'Serious', priority: 'high' }
      ]
    }
  ]);

  const [rounds] = useState([
    {
      id: 1,
      time: '08:00 AM',
      ward: 'Medical Ward A',
      doctor: 'Dr. Smith',
      status: 'completed',
      patients: 18,
      notes: 'All patients stable, no emergencies'
    },
    {
      id: 2,
      time: '02:00 PM',
      ward: 'Surgical Ward B',
      doctor: 'Dr. Johnson',
      status: 'in-progress',
      patients: 12,
      notes: 'Checking post-operative patients'
    },
    {
      id: 3,
      time: '06:00 PM',
      ward: 'ICU Ward',
      doctor: 'Dr. Williams',
      status: 'scheduled',
      patients: 8,
      notes: 'Evening ICU round'
    }
  ]);

  const [nursingTasks] = useState([
    { id: 1, task: 'Medication round - Medical Ward A', time: '10:00 AM', nurse: 'Nurse Sarah', completed: true },
    { id: 2, task: 'Vital signs check - ICU Ward', time: '11:00 AM', nurse: 'Nurse Davis', completed: false },
    { id: 3, task: 'Wound dressing - Surgical Ward B', time: '11:30 AM', nurse: 'Nurse Williams', completed: false },
    { id: 4, task: 'Patient education - Medical Ward A', time: '12:00 PM', nurse: 'Nurse Sarah', completed: false }
  ]);

  const [stats] = useState({
    totalWards: 8,
    totalBeds: 120,
    occupiedBeds: 95,
    availableBeds: 25,
    criticalPatients: 12,
    nursingStaff: 24
  });

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'serious': return 'bg-orange-100 text-orange-800';
      case 'stable': return 'bg-green-100 text-green-800';
      case 'improving': return 'bg-blue-100 text-blue-800';
      case 'post-op': return 'bg-purple-100 text-purple-800';
      case 'recovering': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoundStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOccupancyColor = (occupied: number, capacity: number) => {
    const percentage = (occupied / capacity) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleStartRound = (roundId: number) => {
    toast({
      title: "Ward Round Started",
      description: "Medical round has been initiated."
    });
  };

  const handleCompleteTask = (taskId: number) => {
    toast({
      title: "Task Completed",
      description: "Nursing task has been marked as completed."
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Ward Management
          </h1>
          <p className="text-muted-foreground">Manage hospital wards, bed allocation, and nursing care</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Wards</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalWards}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Beds</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalBeds}</p>
                </div>
                <Bed className="h-8 w-8 text-blue-600" />
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
                  <p className="text-sm text-muted-foreground">Critical Patients</p>
                  <p className="text-2xl font-bold text-red-600">{stats.criticalPatients}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nursing Staff</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.nursingStaff}</p>
                </div>
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="wards" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="wards">Ward Overview</TabsTrigger>
            <TabsTrigger value="rounds">Medical Rounds</TabsTrigger>
            <TabsTrigger value="nursing">Nursing Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="wards">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {wards.map((ward) => (
                <Card key={ward.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{ward.name}</CardTitle>
                        <CardDescription>Nurse in charge: {ward.nurse}</CardDescription>
                      </div>
                      <Badge variant="outline">
                        <span className={getOccupancyColor(ward.occupied, ward.capacity)}>
                          {ward.occupied}/{ward.capacity}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Occupancy Stats */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-red-50 rounded">
                          <p className="text-lg font-bold text-red-600">{ward.occupied}</p>
                          <p className="text-xs text-muted-foreground">Occupied</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded">
                          <p className="text-lg font-bold text-green-600">{ward.available}</p>
                          <p className="text-xs text-muted-foreground">Available</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded">
                          <p className="text-lg font-bold text-blue-600">{ward.capacity}</p>
                          <p className="text-xs text-muted-foreground">Capacity</p>
                        </div>
                      </div>

                      {/* Recent Patients */}
                      <div>
                        <h4 className="font-medium mb-2">Recent Patients</h4>
                        <div className="space-y-2">
                          {ward.patients.slice(0, 3).map((patient, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div>
                                <p className="text-sm font-medium">{patient.name}</p>
                                <p className="text-xs text-muted-foreground">Bed {patient.bed}</p>
                              </div>
                              <div className="flex gap-1">
                                <Badge className={getConditionColor(patient.condition)}>
                                  {patient.condition}
                                </Badge>
                                <Badge className={getPriorityColor(patient.priority)}>
                                  {patient.priority}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Users className="mr-2 h-4 w-4" />
                          View All Patients
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedWard(ward.name);
                            setManageBedsOpen(true);
                          }}
                        >
                          <Bed className="mr-2 h-4 w-4" />
                          Manage Beds
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rounds">
            <Card>
              <CardHeader>
                <CardTitle>Medical Rounds Schedule</CardTitle>
                <CardDescription>Daily medical rounds for all wards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rounds.map((round) => (
                    <div key={round.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="font-semibold text-primary">{round.time}</span>
                          <h3 className="font-semibold">{round.ward}</h3>
                          <Badge className={getRoundStatusColor(round.status)}>
                            {round.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Doctor: {round.doctor} • Patients: {round.patients}
                        </p>
                        <p className="text-sm">
                          <strong>Notes:</strong> {round.notes}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {round.status === 'scheduled' && (
                          <Button 
                            size="sm"
                            onClick={() => handleStartRound(round.id)}
                          >
                            Start Round
                          </Button>
                        )}
                        {round.status === 'in-progress' && (
                          <Button size="sm" variant="outline">
                            Complete Round
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nursing">
            <Card>
              <CardHeader>
                <CardTitle>Nursing Tasks</CardTitle>
                <CardDescription>Current nursing tasks across all wards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nursingTasks.map((task) => (
                    <div key={task.id} className={`p-4 rounded-lg border ${task.completed ? 'bg-green-50 border-green-200' : 'bg-muted'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <span className="font-semibold text-primary">{task.time}</span>
                            <h3 className="font-medium">{task.task}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Assigned to: {task.nurse}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          {!task.completed && (
                            <Button 
                              size="sm"
                              onClick={() => handleCompleteTask(task.id)}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Mark Complete
                            </Button>
                          )}
                          {task.completed && (
                            <div className="text-green-600 font-medium flex items-center">
                              <Heart className="mr-2 h-4 w-4" />
                              Completed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <ManageBedsDialog 
        open={manageBedsOpen}
        onOpenChange={setManageBedsOpen}
        wardName={selectedWard}
      />
    </DashboardLayout>
  );
};

export default Ward;