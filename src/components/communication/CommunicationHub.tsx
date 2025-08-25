import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Send, 
  Clock, 
  Users, 
  Settings,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Calendar,
  Bell,
  Video,
  FileText,
  Smartphone
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface CommunicationHubProps {
  patientId?: string;
}

export const CommunicationHub: React.FC<CommunicationHubProps> = ({ patientId }) => {
  const { profile, currentBranch } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedChannel, setSelectedChannel] = useState('sms');
  const [messageText, setMessageText] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);

  // Fetch communication history
  const { data: communicationHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['communication-history', patientId, currentBranch?.id],
    queryFn: async () => {
      // Mock data for communication history
      return [
        {
          id: 'comm_001',
          type: 'sms',
          direction: 'outbound',
          recipient: 'John Doe',
          recipientPhone: '+1-555-0123',
          subject: 'Appointment Reminder',
          message: 'Hello John, this is a reminder about your appointment tomorrow at 2:00 PM with Dr. Smith.',
          status: 'delivered',
          sentAt: new Date('2024-01-20T10:00:00'),
          deliveredAt: new Date('2024-01-20T10:00:15'),
          readAt: new Date('2024-01-20T10:05:00')
        },
        {
          id: 'comm_002',
          type: 'email',
          direction: 'outbound',
          recipient: 'Sarah Johnson',
          recipientEmail: 'sarah@email.com',
          subject: 'Lab Results Available',
          message: 'Dear Sarah, your lab results are now available. Please log into the patient portal to view them.',
          status: 'delivered',
          sentAt: new Date('2024-01-19T14:30:00'),
          deliveredAt: new Date('2024-01-19T14:30:45'),
          readAt: new Date('2024-01-19T16:22:00')
        },
        {
          id: 'comm_003',
          type: 'call',
          direction: 'inbound',
          recipient: 'Michael Chen',
          recipientPhone: '+1-555-0456',
          subject: 'Prescription Inquiry',
          message: 'Patient called asking about prescription refill status.',
          status: 'completed',
          sentAt: new Date('2024-01-18T09:15:00'),
          duration: 180
        },
        {
          id: 'comm_004',
          type: 'sms',
          direction: 'inbound',
          recipient: 'Emily Rodriguez',
          recipientPhone: '+1-555-0789',
          subject: 'Appointment Cancellation',
          message: 'Hi, I need to cancel my appointment today. Can we reschedule?',
          status: 'received',
          sentAt: new Date('2024-01-17T08:45:00')
        }
      ];
    },
    enabled: !!profile?.tenant_id
  });

  // Fetch patients for messaging
  const { data: patients } = useQuery({
    queryKey: ['patients-for-messaging', profile?.tenant_id],
    queryFn: async () => {
      // Mock patient data
      return [
        { id: 'p1', name: 'John Doe', phone: '+1-555-0123', email: 'john@email.com' },
        { id: 'p2', name: 'Sarah Johnson', phone: '+1-555-0456', email: 'sarah@email.com' },
        { id: 'p3', name: 'Michael Chen', phone: '+1-555-0789', email: 'michael@email.com' },
        { id: 'p4', name: 'Emily Rodriguez', phone: '+1-555-0321', email: 'emily@email.com' }
      ];
    },
    enabled: !!profile?.tenant_id
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      // Simulate API call to send message
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { id: `msg_${Date.now()}`, status: 'sent' };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Message sent successfully.",
      });
      setMessageText('');
      setSelectedRecipients([]);
      setShowNewMessageDialog(false);
      queryClient.invalidateQueries({ queryKey: ['communication-history'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (!messageText || selectedRecipients.length === 0) {
      toast({
        title: "Error",
        description: "Please select recipients and enter a message.",
        variant: "destructive"
      });
      return;
    }

    sendMessageMutation.mutate({
      channel: selectedChannel,
      recipients: selectedRecipients,
      message: messageText,
      patientId
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sent': return <Send className="h-4 w-4 text-blue-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'sms': return <Smartphone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getChannelBadgeColor = (type: string) => {
    switch (type) {
      case 'sms': return 'bg-blue-100 text-blue-800';
      case 'email': return 'bg-green-100 text-green-800';
      case 'call': return 'bg-purple-100 text-purple-800';
      case 'video': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredHistory = communicationHistory?.filter(comm =>
    comm.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comm.subject.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Communication Hub
          </CardTitle>
          <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send New Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Communication Channel</Label>
                    <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sms">SMS Text</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="call">Phone Call</SelectItem>
                        <SelectItem value="video">Video Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Recipients</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patients" />
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
                </div>

                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Enter your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewMessageDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending}
                  >
                    {sendMessageMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
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
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="history">Message History</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="automated">Automated</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
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
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  filteredHistory.map((comm) => (
                    <div key={comm.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${getChannelBadgeColor(comm.type)}`}>
                            {getChannelIcon(comm.type)}
                          </div>
                          <div>
                            <h4 className="font-medium">{comm.recipient}</h4>
                            <p className="text-sm text-muted-foreground">{comm.subject}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={comm.direction === 'outbound' ? 'default' : 'secondary'}>
                            {comm.direction}
                          </Badge>
                          {getStatusIcon(comm.status)}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 bg-muted/50 p-3 rounded-lg">
                        {comm.message}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Sent: {format(comm.sentAt, 'MMM dd, yyyy HH:mm')}</span>
                        {comm.deliveredAt && (
                          <span>Delivered: {format(comm.deliveredAt, 'MMM dd, yyyy HH:mm')}</span>
                        )}
                        {comm.readAt && (
                          <span>Read: {format(comm.readAt, 'MMM dd, yyyy HH:mm')}</span>
                        )}
                        {comm.duration && (
                          <span>Duration: {Math.floor(comm.duration / 60)}m {comm.duration % 60}s</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {!historyLoading && filteredHistory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No communication history found.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Appointment Reminders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    "Hello [Name], this is a reminder about your appointment on [Date] at [Time] with [Doctor]."
                  </p>
                  <Button variant="outline" size="sm">Use Template</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Lab Results Ready</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    "Dear [Name], your lab results are now available. Please log into the patient portal to view them."
                  </p>
                  <Button variant="outline" size="sm">Use Template</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Prescription Ready</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    "Hi [Name], your prescription is ready for pickup at [Pharmacy]. Please bring a valid ID."
                  </p>
                  <Button variant="outline" size="sm">Use Template</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Follow-up Required</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    "Hello [Name], please schedule a follow-up appointment for [Reason]. Call us at [Phone]."
                  </p>
                  <Button variant="outline" size="sm">Use Template</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="automated" className="space-y-4">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Automated Appointment Reminders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">24-hour SMS Reminder</h4>
                      <p className="text-sm text-muted-foreground">Send SMS reminder 24 hours before appointment</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">2-hour Email Reminder</h4>
                      <p className="text-sm text-muted-foreground">Send email reminder 2 hours before appointment</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Follow-up After No-Show</h4>
                      <p className="text-sm text-muted-foreground">Automatically send rescheduling message after missed appointment</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lab Results Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Normal Results Notification</h4>
                      <p className="text-sm text-muted-foreground">Notify patients when normal lab results are available</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Abnormal Results Alert</h4>
                      <p className="text-sm text-muted-foreground">Immediate notification for abnormal results requiring attention</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Communication Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default SMS Provider</Label>
                      <Select defaultValue="twilio">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="twilio">Twilio</SelectItem>
                          <SelectItem value="messagebird">MessageBird</SelectItem>
                          <SelectItem value="nexmo">Vonage (Nexmo)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Email Service</Label>
                      <Select defaultValue="sendgrid">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sendgrid">SendGrid</SelectItem>
                          <SelectItem value="mailgun">Mailgun</SelectItem>
                          <SelectItem value="ses">Amazon SES</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Business Hours</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="Start time (e.g., 08:00)" />
                      <Input placeholder="End time (e.g., 18:00)" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security & Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">HIPAA Compliant Messaging</h4>
                      <p className="text-sm text-muted-foreground">Ensure all messages comply with HIPAA regulations</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Message Encryption</h4>
                      <p className="text-sm text-muted-foreground">Enable end-to-end encryption for all communications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Audit Trail</h4>
                      <p className="text-sm text-muted-foreground">Maintain detailed logs of all communications</p>
                    </div>
                    <Switch defaultChecked />
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