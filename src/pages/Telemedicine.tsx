import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Phone, Monitor, Users, Calendar, Clock, Search, Plus, Camera, Mic, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScheduleVirtualVisitDialog } from '@/components/telemedicine/ScheduleVirtualVisitDialog';
import { RescheduleDialog } from '@/components/telemedicine/RescheduleDialog';
import { AppointmentDetailsDialog } from '@/components/telemedicine/AppointmentDetailsDialog';
import { TelehealthAnalytics } from '@/components/telemedicine/TelehealthAnalytics';

const Telemedicine = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  // Mock data for virtual appointments
  const [virtualAppointments] = useState([
    {
      id: 1,
      patient: 'John Smith',
      patientId: 'PAT001',
      doctor: 'Dr. Sarah Johnson',
      appointmentTime: '10:00 AM',
      date: '2024-01-18',
      duration: 30,
      type: 'consultation',
      status: 'scheduled',
      platform: 'video',
      roomId: 'room_12345'
    },
    {
      id: 2,
      patient: 'Maria Garcia',
      patientId: 'PAT002',
      doctor: 'Dr. Michael Brown',
      appointmentTime: '2:30 PM',
      date: '2024-01-18',
      duration: 20,
      type: 'follow-up',
      status: 'in-progress',
      platform: 'video',
      roomId: 'room_67890'
    },
    {
      id: 3,
      patient: 'David Lee',
      patientId: 'PAT003',
      doctor: 'Dr. Emily Wilson',
      appointmentTime: '4:00 PM',
      date: '2024-01-18',
      duration: 25,
      type: 'therapy',
      status: 'waiting',
      platform: 'phone',
      roomId: null
    }
  ]);

  // Mock data for active sessions
  const [activeSessions] = useState([
    {
      id: 1,
      doctor: 'Dr. Sarah Johnson',
      patient: 'John Smith',
      startTime: '10:00 AM',
      duration: 15,
      participants: 2,
      platform: 'video',
      quality: 'excellent'
    },
    {
      id: 2,
      doctor: 'Dr. Michael Brown',
      patient: 'Maria Garcia',
      startTime: '2:30 PM',
      duration: 8,
      participants: 2,
      platform: 'video',
      quality: 'good'
    }
  ]);

  const [telehealthStats] = useState({
    todaysSessions: 18,
    activeSessions: 2,
    completedSessions: 16,
    averageDuration: 22,
    patientSatisfaction: 96,
    technicalIssues: 1
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500 text-white';
      case 'in-progress': return 'bg-green-500 text-white';
      case 'completed': return 'bg-gray-500 text-white';
      case 'waiting': return 'bg-yellow-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-500 text-white';
      case 'good': return 'bg-blue-500 text-white';
      case 'fair': return 'bg-yellow-500 text-white';
      case 'poor': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleJoinSession = (appointmentId: number) => {
    const appointment = virtualAppointments.find(app => app.id === appointmentId);
    if (appointment?.platform === 'video' && appointment.roomId) {
      // Simulate opening video call
      window.open(`https://meet.example.com/${appointment.roomId}`, '_blank');
    }
    toast({
      title: "Joining Session",
      description: "Connecting to telemedicine session...",
    });
  };

  const handleStartSession = (appointmentId: number) => {
    const appointment = virtualAppointments.find(app => app.id === appointmentId);
    if (appointment) {
      // Update appointment status to in-progress
      appointment.status = 'in-progress';
    }
    toast({
      title: "Session Started",
      description: "Telemedicine session is now active.",
    });
  };

  const handleEndSession = (sessionId: number) => {
    toast({
      title: "Session Ended",
      description: "Telemedicine session completed successfully.",
    });
  };

  const handleReschedule = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowRescheduleDialog(true);
  };

  const handleViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowDetailsDialog(true);
  };

  const filteredAppointments = virtualAppointments.filter(appointment =>
    appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Telemedicine Platform</h1>
          <p className="text-muted-foreground">
            Virtual healthcare delivery, remote consultations, and digital health services
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{telehealthStats.todaysSessions}</div>
              <p className="text-xs text-muted-foreground">
                Virtual consultations
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{telehealthStats.activeSessions}</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{telehealthStats.completedSessions}</div>
              <p className="text-xs text-muted-foreground">
                Successful consultations
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{telehealthStats.averageDuration}min</div>
              <p className="text-xs text-muted-foreground">
                Per consultation
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patient Satisfaction</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{telehealthStats.patientSatisfaction}%</div>
              <p className="text-xs text-muted-foreground">
                Positive feedback
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Technical Issues</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{telehealthStats.technicalIssues}</div>
              <p className="text-xs text-muted-foreground">
                Today's incidents
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appointments">Virtual Appointments</TabsTrigger>
            <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
            <TabsTrigger value="platform">Platform Settings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Virtual Appointment Schedule</CardTitle>
                <CardDescription>
                  Manage telemedicine appointments and virtual consultations
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients, doctors, or appointment IDs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button onClick={() => setShowScheduleDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Virtual Visit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{appointment.patient}</h3>
                          <Badge variant="outline">{appointment.patientId}</Badge>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {appointment.platform === 'video' ? <Video className="h-3 w-3 mr-1" /> : <Phone className="h-3 w-3 mr-1" />}
                            {appointment.platform.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-blue-600">{appointment.type} consultation</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center"><Calendar className="mr-1 h-3 w-3" />{appointment.date}</span>
                          <span className="flex items-center"><Clock className="mr-1 h-3 w-3" />{appointment.appointmentTime}</span>
                          <span>Duration: {appointment.duration}min</span>
                          <span>Dr: {appointment.doctor}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {appointment.status === 'scheduled' && (
                          <Button size="sm" onClick={() => handleStartSession(appointment.id)}>
                            <Video className="mr-2 h-4 w-4" />
                            Start Session
                          </Button>
                        )}
                        {appointment.status === 'in-progress' && (
                          <Button size="sm" onClick={() => handleJoinSession(appointment.id)}>
                            <Monitor className="mr-2 h-4 w-4" />
                            Join Session
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleReschedule(appointment)}>
                          Reschedule
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(appointment)}>
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Telemedicine Sessions</CardTitle>
                <CardDescription>
                  Monitor ongoing virtual consultations and session quality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{session.doctor}</h3>
                          <Badge className="bg-green-500 text-white">LIVE</Badge>
                          <Badge className={getQualityColor(session.quality)}>
                            {session.quality.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Patient: {session.patient}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center"><Clock className="mr-1 h-3 w-3" />Started: {session.startTime}</span>
                          <span>Duration: {session.duration}min</span>
                          <span className="flex items-center"><Users className="mr-1 h-3 w-3" />{session.participants} participants</span>
                          <span className="flex items-center">
                            {session.platform === 'video' ? <Video className="mr-1 h-3 w-3" /> : <Phone className="mr-1 h-3 w-3" />}
                            {session.platform}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button size="sm" onClick={() => handleJoinSession(session.id)}>
                          <Monitor className="mr-2 h-4 w-4" />
                          Join
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleEndSession(session.id)}>
                          End Session
                        </Button>
                      </div>
                    </div>
                  ))}
                  {activeSessions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No active sessions at the moment
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="platform" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
                <CardDescription>
                  Configure telemedicine platform settings and integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Video Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Default Video Quality</label>
                        <select className="w-full p-2 border rounded">
                          <option>HD (720p)</option>
                          <option>Full HD (1080p)</option>
                          <option>4K (2160p)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Auto Recording</label>
                        <select className="w-full p-2 border rounded">
                          <option>Disabled</option>
                          <option>Audio Only</option>
                          <option>Audio + Video</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="screenshare" />
                        <label htmlFor="screenshare" className="text-sm">Enable Screen Sharing</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="waiting-room" />
                        <label htmlFor="waiting-room" className="text-sm">Enable Waiting Room</label>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Security & Compliance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="hipaa" checked readOnly />
                        <label htmlFor="hipaa" className="text-sm">HIPAA Compliant</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="encryption" checked readOnly />
                        <label htmlFor="encryption" className="text-sm">End-to-End Encryption</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="audit-logs" checked readOnly />
                        <label htmlFor="audit-logs" className="text-sm">Audit Logging</label>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Session Timeout (minutes)</label>
                        <Input type="number" placeholder="60" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Max Participants</label>
                        <Input type="number" placeholder="10" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <TelehealthAnalytics />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <ScheduleVirtualVisitDialog
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
        />
        
        <RescheduleDialog
          open={showRescheduleDialog}
          onOpenChange={setShowRescheduleDialog}
          appointment={selectedAppointment}
        />
        
        <AppointmentDetailsDialog
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          appointment={selectedAppointment}
        />
      </div>
    </DashboardLayout>
  );
};

export default Telemedicine;