import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Calendar, FileText, Bell, Video, MessageSquare, Shield, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PatientPortal = () => {
  const { toast } = useToast();

  // Mock patient data
  const [patientInfo] = useState({
    name: 'John Smith',
    patientId: 'PAT001',
    age: 45,
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    address: '123 Main St, City, State 12345',
    emergencyContact: 'Jane Smith - (555) 987-6543',
    bloodType: 'A+',
    allergies: ['Penicillin', 'Shellfish'],
    insuranceProvider: 'Blue Cross Blue Shield',
    primaryPhysician: 'Dr. Sarah Johnson'
  });

  // Mock appointments data
  const [appointments] = useState([
    {
      id: 1,
      date: '2024-01-25',
      time: '10:00 AM',
      doctor: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      type: 'Follow-up',
      status: 'scheduled',
      location: 'Main Campus - Room 201'
    },
    {
      id: 2,
      date: '2024-02-15',
      time: '2:30 PM',
      doctor: 'Dr. Michael Brown',
      department: 'Orthopedics',
      type: 'Consultation',
      status: 'scheduled',
      location: 'North Campus - Room 105'
    }
  ]);

  // Mock medical records
  const [medicalRecords] = useState([
    {
      id: 1,
      date: '2024-01-15',
      type: 'Lab Results',
      provider: 'Dr. Sarah Johnson',
      status: 'available',
      summary: 'Blood panel - All values normal'
    },
    {
      id: 2,
      date: '2024-01-10',
      type: 'Visit Summary',
      provider: 'Dr. Sarah Johnson',
      status: 'available',
      summary: 'Routine checkup - Blood pressure monitoring'
    },
    {
      id: 3,
      date: '2024-01-05',
      type: 'Prescription',
      provider: 'Dr. Sarah Johnson',
      status: 'active',
      summary: 'Lisinopril 10mg - Refills remaining: 2'
    }
  ]);

  // Mock messages
  const [messages] = useState([
    {
      id: 1,
      from: 'Dr. Sarah Johnson',
      subject: 'Lab Results Available',
      date: '2024-01-15',
      preview: 'Your recent blood work results are now available...',
      unread: true
    },
    {
      id: 2,
      from: 'Appointment Center',
      subject: 'Upcoming Appointment Reminder',
      date: '2024-01-14',
      preview: 'This is a reminder for your appointment on January 25th...',
      unread: false
    }
  ]);

  const [portalStats] = useState({
    upcomingAppointments: 2,
    unreadMessages: 1,
    pendingBills: 1,
    availableResults: 3
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500 text-white';
      case 'completed': return 'bg-green-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      case 'available': return 'bg-green-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'active': return 'bg-blue-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleScheduleAppointment = () => {
    toast({
      title: "Appointment Request",
      description: "Your appointment request has been submitted. You will receive confirmation within 24 hours.",
    });
  };

  const handleSendMessage = () => {
    toast({
      title: "Message Sent",
      description: "Your message has been sent to your healthcare provider.",
    });
  };

  const handleRequestRefill = () => {
    toast({
      title: "Refill Requested",
      description: "Your prescription refill request has been submitted.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Portal</h1>
          <p className="text-muted-foreground">
            Welcome back, {patientInfo.name}. Access your health information and manage your care.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portalStats.upcomingAppointments}</div>
              <p className="text-xs text-muted-foreground">
                Next: Jan 25, 2024
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portalStats.unreadMessages}</div>
              <p className="text-xs text-muted-foreground">
                From healthcare providers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Results</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portalStats.availableResults}</div>
              <p className="text-xs text-muted-foreground">
                Lab and test results
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portalStats.pendingBills}</div>
              <p className="text-xs text-muted-foreground">
                Outstanding balance
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="records">Medical Records</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest healthcare activities and updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 border rounded">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Lab Results Available</p>
                      <p className="text-xs text-muted-foreground">Blood panel results - Jan 15, 2024</p>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Appointment Scheduled</p>
                      <p className="text-xs text-muted-foreground">Dr. Sarah Johnson - Jan 25, 2024</p>
                    </div>
                    <Button variant="outline" size="sm">Details</Button>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded">
                    <Heart className="h-5 w-5 text-red-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Prescription Refilled</p>
                      <p className="text-xs text-muted-foreground">Lisinopril 10mg - Jan 10, 2024</p>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks and services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <Button className="h-12 justify-start" onClick={handleScheduleAppointment}>
                      <Calendar className="mr-3 h-5 w-5" />
                      Schedule Appointment
                    </Button>
                    <Button variant="outline" className="h-12 justify-start" onClick={handleSendMessage}>
                      <MessageSquare className="mr-3 h-5 w-5" />
                      Message Provider
                    </Button>
                    <Button variant="outline" className="h-12 justify-start" onClick={handleRequestRefill}>
                      <Heart className="mr-3 h-5 w-5" />
                      Request Prescription Refill
                    </Button>
                    <Button variant="outline" className="h-12 justify-start">
                      <Video className="mr-3 h-5 w-5" />
                      Join Telehealth Visit
                    </Button>
                    <Button variant="outline" className="h-12 justify-start">
                      <FileText className="mr-3 h-5 w-5" />
                      Download Records
                    </Button>
                    <Button variant="outline" className="h-12 justify-start">
                      <Bell className="mr-3 h-5 w-5" />
                      Pay Bills Online
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Appointments</CardTitle>
                <CardDescription>
                  View and manage your upcoming appointments
                </CardDescription>
                <Button onClick={handleScheduleAppointment}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule New Appointment
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{appointment.doctor}</h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{appointment.department} - {appointment.type}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center"><Calendar className="mr-1 h-3 w-3" />{appointment.date}</span>
                          <span>{appointment.time}</span>
                          <span>{appointment.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                        <Button variant="outline" size="sm">
                          Cancel
                        </Button>
                        <Button size="sm">
                          Join Visit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Medical Records</CardTitle>
                <CardDescription>
                  Access your medical history, test results, and documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicalRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{record.type}</h3>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{record.provider}</p>
                        <p className="text-sm">{record.summary}</p>
                        <p className="text-xs text-muted-foreground">{record.date}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          Share
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  Secure communication with your healthcare team
                </CardDescription>
                <Button onClick={handleSendMessage}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  New Message
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex items-center justify-between p-4 border rounded-lg ${message.unread ? 'bg-blue-50 border-blue-200' : ''}`}>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{message.from}</h3>
                          {message.unread && <Badge className="bg-blue-500 text-white">NEW</Badge>}
                        </div>
                        <p className="text-sm font-medium">{message.subject}</p>
                        <p className="text-sm text-muted-foreground">{message.preview}</p>
                        <p className="text-xs text-muted-foreground">{message.date}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          Reply
                        </Button>
                        <Button size="sm">
                          Read
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Your basic information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input value={patientInfo.name} readOnly />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Patient ID</label>
                    <Input value={patientInfo.patientId} readOnly />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input value={patientInfo.email} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input value={patientInfo.phone} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address</label>
                    <Input value={patientInfo.address} />
                  </div>
                  <Button>Update Information</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                  <CardDescription>
                    Important medical details and emergency contacts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Blood Type</label>
                    <Input value={patientInfo.bloodType} readOnly />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Allergies</label>
                    <Input value={patientInfo.allergies.join(', ')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Primary Physician</label>
                    <Input value={patientInfo.primaryPhysician} readOnly />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Insurance Provider</label>
                    <Input value={patientInfo.insuranceProvider} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Emergency Contact</label>
                    <Input value={patientInfo.emergencyContact} />
                  </div>
                  <Button>Update Medical Info</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PatientPortal;