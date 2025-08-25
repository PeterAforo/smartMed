import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Search, Clock, User, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CheckIn = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [appointments] = useState([
    { 
      id: 1, 
      patientId: 'P001', 
      name: 'John Doe', 
      time: '10:30 AM', 
      doctor: 'Dr. Smith', 
      department: 'Cardiology',
      status: 'scheduled',
      appointmentType: 'Consultation'
    },
    { 
      id: 2, 
      patientId: 'P002', 
      name: 'Jane Smith', 
      time: '11:00 AM', 
      doctor: 'Dr. Johnson', 
      department: 'General Medicine',
      status: 'checked-in',
      appointmentType: 'Follow-up'
    },
    { 
      id: 3, 
      patientId: 'P003', 
      name: 'Mike Johnson', 
      time: '11:30 AM', 
      doctor: 'Dr. Williams', 
      department: 'Orthopedics',
      status: 'waiting',
      appointmentType: 'Consultation'
    },
    { 
      id: 4, 
      patientId: 'P004', 
      name: 'Sarah Davis', 
      time: '12:00 PM', 
      doctor: 'Dr. Brown', 
      department: 'Pediatrics',
      status: 'scheduled',
      appointmentType: 'Vaccination'
    }
  ]);

  const [stats] = useState({
    totalAppointments: 24,
    checkedIn: 8,
    waiting: 3,
    completed: 13
  });

  const handleCheckIn = (appointmentId: number) => {
    toast({
      title: "Patient Checked In",
      description: "Patient has been successfully checked in and added to the queue."
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'checked-in': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.doctor.toLowerCase().includes(searchTerm.toLowerCase())
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

        {/* Stats Cards */}
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

        {/* Search and Appointments */}
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
                  placeholder="Search by name, patient ID, or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold">{appointment.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {appointment.patientId} • {appointment.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{appointment.doctor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{appointment.department}</span>
                    </div>
                    <Badge variant="outline">{appointment.appointmentType}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.replace('-', ' ')}
                    </Badge>
                    
                    {appointment.status === 'scheduled' && (
                      <Button 
                        size="sm"
                        onClick={() => handleCheckIn(appointment.id)}
                      >
                        <CheckSquare className="mr-2 h-4 w-4" />
                        Check In
                      </Button>
                    )}
                    
                    {appointment.status === 'checked-in' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled
                      >
                        In Queue
                      </Button>
                    )}
                    
                    {appointment.status === 'waiting' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                      >
                        Call Patient
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common check-in operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <User className="h-6 w-6 mb-2" />
                <span>Walk-in Registration</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Clock className="h-6 w-6 mb-2" />
                <span>View Queue Status</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Search className="h-6 w-6 mb-2" />
                <span>Patient Lookup</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CheckIn;