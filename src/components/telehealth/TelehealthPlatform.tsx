import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Monitor, 
  Phone, 
  Mic, 
  MicOff, 
  VideoOff, 
  Settings,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Share,
  Download,
  Camera,
  ScreenShare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, addMinutes } from 'date-fns';

interface TelehealthPlatformProps {
  patientId?: string;
}

export const TelehealthPlatform: React.FC<TelehealthPlatformProps> = ({ patientId }) => {
  const { profile, currentBranch } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [sessionDuration, setSessionDuration] = useState('30');
  const [sessionType, setSessionType] = useState('consultation');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch telehealth sessions
  const { data: telehealthSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['telehealth-sessions', patientId, currentBranch?.id],
    queryFn: async () => {
      // Mock telehealth session data
      return [
        {
          id: 'th_001',
          patientName: 'John Doe',
          patientId: 'p1',
          doctorName: 'Dr. Sarah Wilson',
          sessionType: 'consultation',
          status: 'scheduled',
          scheduledTime: new Date('2024-01-21T14:00:00'),
          duration: 30,
          meetingLink: 'https://meet.healthcare.app/room/abc123',
          roomId: 'abc123',
          notes: 'Follow-up consultation for hypertension management',
          recordingEnabled: true
        },
        {
          id: 'th_002',
          patientName: 'Sarah Johnson',
          patientId: 'p2',
          doctorName: 'Dr. Michael Chen',
          sessionType: 'therapy',
          status: 'in_progress',
          scheduledTime: new Date('2024-01-20T15:30:00'),
          duration: 45,
          meetingLink: 'https://meet.healthcare.app/room/def456',
          roomId: 'def456',
          notes: 'Mental health counseling session',
          recordingEnabled: false,
          startedAt: new Date('2024-01-20T15:30:00')
        },
        {
          id: 'th_003',
          patientName: 'Michael Chen',
          patientId: 'p3',
          doctorName: 'Dr. Emily Rodriguez',
          sessionType: 'consultation',
          status: 'completed',
          scheduledTime: new Date('2024-01-20T10:00:00'),
          duration: 30,
          meetingLink: 'https://meet.healthcare.app/room/ghi789',
          roomId: 'ghi789',
          notes: 'Post-operative check-up',
          recordingEnabled: true,
          startedAt: new Date('2024-01-20T10:00:00'),
          endedAt: new Date('2024-01-20T10:28:00'),
          actualDuration: 28,
          recordingUrl: 'https://recordings.healthcare.app/ghi789.mp4'
        },
        {
          id: 'th_004',
          patientName: 'Emily Rodriguez',
          patientId: 'p4',
          doctorName: 'Dr. David Thompson',
          sessionType: 'specialist_consult',
          status: 'no_show',
          scheduledTime: new Date('2024-01-19T16:00:00'),
          duration: 30,
          meetingLink: 'https://meet.healthcare.app/room/jkl012',
          roomId: 'jkl012',
          notes: 'Orthopedic consultation for knee pain'
        }
      ];
    },
    enabled: !!profile?.tenant_id
  });

  // Fetch patients for session scheduling
  const { data: patients } = useQuery({
    queryKey: ['patients-for-telehealth', profile?.tenant_id],
    queryFn: async () => {
      // Mock patient data
      return [
        { id: 'p1', name: 'John Doe', email: 'john@email.com', phone: '+1-555-0123' },
        { id: 'p2', name: 'Sarah Johnson', email: 'sarah@email.com', phone: '+1-555-0456' },
        { id: 'p3', name: 'Michael Chen', email: 'michael@email.com', phone: '+1-555-0789' },
        { id: 'p4', name: 'Emily Rodriguez', email: 'emily@email.com', phone: '+1-555-0321' }
      ];
    },
    enabled: !!profile?.tenant_id
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      // Simulate API call to create telehealth session
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { 
        id: `th_${Date.now()}`, 
        roomId: `room_${Math.random().toString(36).substr(2, 9)}`,
        meetingLink: `https://meet.healthcare.app/room/${Math.random().toString(36).substr(2, 9)}`
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Telehealth session created successfully.",
      });
      setShowNewSessionDialog(false);
      queryClient.invalidateQueries({ queryKey: ['telehealth-sessions'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create telehealth session. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Join session mutation
  const joinSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      // Simulate joining session
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { status: 'joined' };
    },
    onSuccess: () => {
      toast({
        title: "Joining Session",
        description: "Opening telehealth session in new window...",
      });
    }
  });

  const handleCreateSession = () => {
    if (!selectedPatient || !sessionDuration) {
      toast({
        title: "Error",
        description: "Please select a patient and session duration.",
        variant: "destructive"
      });
      return;
    }

    createSessionMutation.mutate({
      patientId: selectedPatient,
      sessionType,
      duration: parseInt(sessionDuration),
      scheduledTime: new Date()
    });
  };

  const handleJoinSession = (session: any) => {
    // In a real implementation, this would open the video call interface
    joinSessionMutation.mutate(session.id);
    window.open(session.meetingLink, '_blank');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'in_progress': return <Video className="h-4 w-4 text-green-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'no_show': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled': return 'outline';
      case 'in_progress': return 'default';
      case 'completed': return 'secondary';
      case 'no_show': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <Users className="h-4 w-4" />;
      case 'therapy': return <Monitor className="h-4 w-4" />;
      case 'specialist_consult': return <Video className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const filteredSessions = telehealthSessions?.filter(session =>
    session.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Telehealth Platform
          </CardTitle>
          <Dialog open={showNewSessionDialog} onOpenChange={setShowNewSessionDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Schedule Telehealth Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients?.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Session Type</Label>
                    <Select value={sessionType} onValueChange={setSessionType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="therapy">Therapy Session</SelectItem>
                        <SelectItem value="specialist_consult">Specialist Consult</SelectItem>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Select value={sessionDuration} onValueChange={setSessionDuration}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Session Notes</Label>
                  <Textarea placeholder="Enter session notes or agenda..." />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="recording" defaultChecked />
                  <label htmlFor="recording" className="text-sm font-medium">
                    Enable session recording
                  </label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewSessionDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateSession}
                    disabled={createSessionMutation.isPending}
                  >
                    {createSessionMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Session
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sessions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="recordings">Recordings</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {sessionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  filteredSessions.map((session) => (
                    <Card key={session.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              {getSessionTypeIcon(session.sessionType)}
                            </div>
                            <div>
                              <h4 className="font-medium">{session.patientName}</h4>
                              <p className="text-sm text-muted-foreground">with {session.doctorName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadgeVariant(session.status)}>
                              {session.status.replace('_', ' ')}
                            </Badge>
                            {getStatusIcon(session.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Type</span>
                            <p className="font-medium capitalize">{session.sessionType.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Scheduled</span>
                            <p className="font-medium">{format(session.scheduledTime, 'MMM dd, HH:mm')}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duration</span>
                            <p className="font-medium">{session.duration} min</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Recording</span>
                            <p className="font-medium">{session.recordingEnabled ? 'Enabled' : 'Disabled'}</p>
                          </div>
                        </div>

                        {session.notes && (
                          <p className="text-sm text-muted-foreground mb-3 bg-muted/50 p-3 rounded-lg">
                            {session.notes}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {(session.status === 'scheduled' || session.status === 'in_progress') && (
                              <Button
                                onClick={() => handleJoinSession(session)}
                                disabled={joinSessionMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Video className="h-4 w-4 mr-2" />
                                {session.status === 'in_progress' ? 'Rejoin Session' : 'Start Session'}
                              </Button>
                            )}
                            {session.meetingLink && (
                              <Button variant="outline" size="sm">
                                <Share className="h-4 w-4 mr-1" />
                                Share Link
                              </Button>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {session.recordingUrl && (
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Recording
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-1" />
                              Configure
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                {!sessionsLoading && filteredSessions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No telehealth sessions found.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <div className="space-y-4">
              {filteredSessions
                .filter(session => session.status === 'scheduled')
                .map((session) => (
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{session.patientName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {format(session.scheduledTime, 'EEEE, MMM dd, yyyy')} at {format(session.scheduledTime, 'HH:mm')}
                          </p>
                          <p className="text-sm text-muted-foreground">Duration: {session.duration} minutes</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            Reschedule
                          </Button>
                          <Button
                            onClick={() => handleJoinSession(session)}
                            disabled={new Date() < session.scheduledTime}
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Join
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="recordings" className="space-y-4">
            <div className="space-y-4">
              {filteredSessions
                .filter(session => session.recordingUrl)
                .map((session) => (
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{session.patientName} - {session.doctorName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Recorded on {format(session.scheduledTime, 'MMM dd, yyyy')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Duration: {session.actualDuration || session.duration} minutes
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Monitor className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Video & Audio Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">High Definition Video</h4>
                      <p className="text-sm text-muted-foreground">Enable HD video quality for sessions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Noise Cancellation</h4>
                      <p className="text-sm text-muted-foreground">Reduce background noise during calls</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto Recording</h4>
                      <p className="text-sm text-muted-foreground">Automatically record all sessions</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Platform Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default Session Duration</Label>
                      <Select defaultValue="30">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Waiting Room</Label>
                      <Select defaultValue="enabled">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enabled">Enabled</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};