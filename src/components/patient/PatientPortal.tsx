import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, 
  Calendar, 
  FileText, 
  Pill, 
  TestTube, 
  Heart,
  Download,
  Share,
  Bell,
  Settings,
  Phone,
  Mail,
  MapPin,
  Clock,
  Activity,
  Shield,
  CreditCard,
  MessageSquare,
  Camera,
  QrCode
} from 'lucide-react';

interface PatientPortalProps {
  className?: string;
}

const PatientPortal = ({ className }: PatientPortalProps) => {
  const [activeSection, setActiveSection] = useState('overview');
  
  // Mock patient data
  const patientData = {
    id: 'p-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1979-03-15',
    address: '123 Main Street, Springfield, IL 62701',
    emergencyContact: 'John Johnson - +1 (555) 987-6543',
    primaryPhysician: 'Dr. Emily Chen',
    lastVisit: '2024-01-15',
    nextAppointment: '2024-02-15 10:00 AM',
    insuranceProvider: 'Blue Cross Blue Shield',
    membershipId: 'BC123456789'
  };

  const upcomingAppointments = [
    {
      id: 'a-001',
      date: '2024-02-15',
      time: '10:00 AM',
      doctor: 'Dr. Emily Chen',
      type: 'Follow-up Consultation',
      location: 'Main Clinic - Room 205',
      status: 'confirmed'
    },
    {
      id: 'a-002',
      date: '2024-02-28',
      time: '2:30 PM',
      doctor: 'Dr. James Wilson',
      type: 'Cardiology Consultation',
      location: 'Cardiology Center - Room 102',
      status: 'pending'
    }
  ];

  const recentMedicalRecords = [
    {
      id: 'mr-001',
      date: '2024-01-15',
      type: 'Consultation Notes',
      provider: 'Dr. Emily Chen',
      summary: 'Routine diabetes management review. Blood glucose levels stable.',
      status: 'available'
    },
    {
      id: 'mr-002',
      date: '2024-01-12',
      type: 'Lab Results',
      provider: 'Lab Department',
      summary: 'HbA1c: 6.8%, Cholesterol panel within normal limits.',
      status: 'available'
    },
    {
      id: 'mr-003',
      date: '2024-01-10',
      type: 'Prescription',
      provider: 'Dr. Emily Chen',
      summary: 'Metformin 1000mg twice daily, Lisinopril 10mg once daily.',
      status: 'available'
    }
  ];

  const currentMedications = [
    {
      name: 'Metformin',
      dosage: '1000mg',
      frequency: 'Twice daily',
      prescribedBy: 'Dr. Emily Chen',
      startDate: '2023-06-15',
      refillsRemaining: 3
    },
    {
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      prescribedBy: 'Dr. Emily Chen',
      startDate: '2023-08-20',
      refillsRemaining: 2
    },
    {
      name: 'Albuterol',
      dosage: '90mcg',
      frequency: 'As needed',
      prescribedBy: 'Dr. Sarah Williams',
      startDate: '2023-09-10',
      refillsRemaining: 1
    }
  ];

  const vitalSigns = [
    { type: 'Blood Pressure', value: '138/85', unit: 'mmHg', date: '2024-01-15', status: 'elevated' },
    { type: 'Heart Rate', value: '78', unit: 'bpm', date: '2024-01-15', status: 'normal' },
    { type: 'Weight', value: '165', unit: 'lbs', date: '2024-01-15', status: 'normal' },
    { type: 'Blood Glucose', value: '142', unit: 'mg/dL', date: '2024-01-15', status: 'elevated' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'elevated': return 'text-orange-600';
      case 'high': return 'text-red-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`space-y-6 p-6 ${className}`}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patientData.name}`} />
              <AvatarFallback>
                {patientData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome, {patientData.name.split(' ')[0]}!</h1>
              <p className="text-muted-foreground">Patient ID: {patientData.id.toUpperCase()}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  Next visit: {patientData.nextAppointment}
                </span>
                <span className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-1" />
                  Dr: {patientData.primaryPhysician}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <QrCode className="h-4 w-4 mr-2" />
              My QR Code
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-medium">Book Appointment</h3>
            <p className="text-xs text-muted-foreground">Schedule new visit</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-medium">Message Doctor</h3>
            <p className="text-xs text-muted-foreground">Secure messaging</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <Pill className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-medium">Prescription Refill</h3>
            <p className="text-xs text-muted-foreground">Request refills</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <TestTube className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <h3 className="font-medium">Lab Results</h3>
            <p className="text-xs text-muted-foreground">View latest results</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.slice(0, 2).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{appointment.type}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.doctor}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.date} at {appointment.time}
                        </p>
                      </div>
                      <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Medical Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Recent Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMedicalRecords.slice(0, 3).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{record.type}</h4>
                        <p className="text-sm text-muted-foreground">{record.summary}</p>
                        <p className="text-xs text-muted-foreground">{record.date}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Health Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Health Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vitalSigns.map((vital, index) => (
                  <div key={index} className="text-center">
                    <p className="text-sm text-muted-foreground">{vital.type}</p>
                    <p className={`text-2xl font-bold ${getStatusColor(vital.status)}`}>
                      {vital.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{vital.unit}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Appointments</CardTitle>
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book New Appointment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 rounded-full bg-blue-100">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{appointment.type}</h3>
                            <p className="text-sm text-muted-foreground">{appointment.doctor}</p>
                            <p className="text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 inline mr-1" />
                              {appointment.date} at {appointment.time}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 inline mr-1" />
                              {appointment.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                            {appointment.status}
                          </Badge>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">Reschedule</Button>
                            <Button variant="outline" size="sm">Cancel</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Records Tab */}
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Medical Records</CardTitle>
                <Button variant="outline">
                  <Share className="h-4 w-4 mr-2" />
                  Share Records
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMedicalRecords.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 rounded-full bg-green-100">
                            <FileText className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{record.type}</h3>
                            <p className="text-sm text-muted-foreground">{record.provider}</p>
                            <p className="text-sm">{record.summary}</p>
                            <p className="text-xs text-muted-foreground">{record.date}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Medications</CardTitle>
                <Button variant="outline">
                  <Pill className="h-4 w-4 mr-2" />
                  Request Refill
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentMedications.map((medication, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 rounded-full bg-purple-100">
                            <Pill className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{medication.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {medication.dosage} - {medication.frequency}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Prescribed by {medication.prescribedBy}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Started: {medication.startDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant="outline">
                            {medication.refillsRemaining} refills left
                          </Badge>
                          <Button variant="outline" size="sm">Request Refill</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vital Signs Tab */}
        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Vital Signs History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vitalSigns.map((vital, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{vital.type}</h3>
                          <p className={`text-2xl font-bold ${getStatusColor(vital.status)}`}>
                            {vital.value} <span className="text-sm font-normal">{vital.unit}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">Last recorded: {vital.date}</p>
                        </div>
                        <div className="p-2 rounded-full bg-blue-100">
                          <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Insurance Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Primary Insurance</h4>
                    <p className="text-sm text-muted-foreground">{patientData.insuranceProvider}</p>
                    <p className="text-sm text-muted-foreground">Member ID: {patientData.membershipId}</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Insurance Card
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Recent Bills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent bills to display</p>
                    <p className="text-sm">Your billing statements will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientPortal;