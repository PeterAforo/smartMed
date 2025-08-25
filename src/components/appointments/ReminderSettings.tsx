import { useState } from "react"
import { Bell, MessageSquare, Mail, Clock, Send, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { format, addHours, addMinutes } from "date-fns"

interface ReminderHistory {
  id: string
  reminder_type: 'sms' | 'email'
  reminder_time: string
  scheduled_for: string
  sent_at: string | null
  status: 'pending' | 'sent' | 'failed'
  delivery_status: string | null
  error_message: string | null
  appointments: {
    appointment_date: string
    appointment_time: string
    appointment_type: string
    patients: {
      first_name: string
      last_name: string
      patient_number: string
    }
  }
}

export default function ReminderSettings() {
  const { currentBranch, tenant } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showHistory, setShowHistory] = useState(false)
  const [testReminderType, setTestReminderType] = useState<'sms' | 'email'>('sms')
  const [selectedAppointment, setSelectedAppointment] = useState('')

  // Fetch upcoming appointments for testing
  const { data: upcomingAppointments } = useQuery({
    queryKey: ['upcoming-appointments', currentBranch?.id],
    queryFn: async () => {
      if (!currentBranch) return []
      
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          appointment_type,
          patients!inner(
            first_name,
            last_name,
            patient_number,
            phone,
            email
          )
        `)
        .eq('branch_id', currentBranch.id)
        .gte('appointment_date', format(tomorrow, 'yyyy-MM-dd'))
        .eq('status', 'scheduled')
        .order('appointment_date')
        .order('appointment_time')
        .limit(20)
      
      if (error) throw error
      return data || []
    },
    enabled: !!currentBranch
  })

  // Fetch reminder history
  const { data: reminderHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['reminder-history', currentBranch?.id],
    queryFn: async () => {
      if (!currentBranch) return []
      
      const { data, error } = await supabase
        .from('appointment_reminders')
        .select(`
          *,
          appointments!inner(
            appointment_date,
            appointment_time,
            appointment_type,
            patients!inner(
              first_name,
              last_name,
              patient_number
            )
          )
        `)
        .eq('appointments.branch_id', currentBranch.id)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      return data || []
    },
    enabled: !!currentBranch && showHistory
  })

  // Send test reminder
  const sendTestReminderMutation = useMutation({
    mutationFn: async ({ appointmentId, reminderType }: { appointmentId: string, reminderType: 'sms' | 'email' }) => {
      const { data, error } = await supabase.functions.invoke('send-appointment-reminders', {
        body: {
          appointmentId,
          reminderType,
          reminderTime: 'test'
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Test Reminder Sent",
          description: "Test reminder sent successfully"
        })
      } else {
        toast({
          title: "Reminder Failed",
          description: data.message || "Failed to send test reminder",
          variant: "destructive"
        })
      }
      queryClient.invalidateQueries({ queryKey: ['reminder-history'] })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send test reminder",
        variant: "destructive"
      })
    }
  })

  // Schedule reminders for appointment
  const scheduleRemindersMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!tenant) throw new Error('Tenant not found')

      const appointment = upcomingAppointments?.find(apt => apt.id === appointmentId)
      if (!appointment) throw new Error('Appointment not found')

      const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
      
      // Schedule reminders at different intervals
      const reminders = [
        {
          reminder_type: 'email',
          reminder_time: '24h',
          scheduled_for: addHours(appointmentDateTime, -24).toISOString()
        },
        {
          reminder_type: 'sms',
          reminder_time: '2h',
          scheduled_for: addHours(appointmentDateTime, -2).toISOString()
        }
      ]

      const { error } = await supabase
        .from('appointment_reminders')
        .insert(
          reminders.map(reminder => ({
            tenant_id: tenant.id,
            appointment_id: appointmentId,
            ...reminder,
            status: 'pending',
            message_content: reminder.reminder_type === 'sms' ? 
              'SMS appointment reminder' : 
              'Email appointment reminder'
          }))
        )

      if (error) throw error
    },
    onSuccess: () => {
      toast({
        title: "Reminders Scheduled",
        description: "Appointment reminders scheduled successfully"
      })
      queryClient.invalidateQueries({ queryKey: ['reminder-history'] })
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Send className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'failed': return <Bell className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reminder Settings</h2>
          <p className="text-muted-foreground">Configure and manage appointment reminders</p>
        </div>
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <History className="h-4 w-4" />
              View History
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Reminder History</DialogTitle>
            </DialogHeader>
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Appointment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reminderHistory?.map((reminder) => (
                    <TableRow key={reminder.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {reminder.appointments.patients.first_name} {reminder.appointments.patients.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {reminder.appointments.patients.patient_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {format(new Date(reminder.appointments.appointment_date), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(`2000-01-01T${reminder.appointments.appointment_time}`), 'h:mm a')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {reminder.reminder_type === 'sms' ? 
                            <MessageSquare className="h-3 w-3" /> : 
                            <Mail className="h-3 w-3" />
                          }
                          {reminder.reminder_type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(reminder.scheduled_for), 'MMM dd, h:mm a')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`gap-1 ${getStatusColor(reminder.status)}`}
                        >
                          {getStatusIcon(reminder.status)}
                          {reminder.status}
                        </Badge>
                        {reminder.error_message && (
                          <div className="text-xs text-red-600 mt-1">
                            {reminder.error_message}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Test Reminder Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Test Reminder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-appointment">Select Appointment</Label>
              <Select value={selectedAppointment} onValueChange={setSelectedAppointment}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an upcoming appointment" />
                </SelectTrigger>
                <SelectContent>
                  {upcomingAppointments?.map((apt) => (
                    <SelectItem key={apt.id} value={apt.id}>
                      {apt.patients.first_name} {apt.patients.last_name} - 
                      {format(new Date(apt.appointment_date), 'MMM dd')} at 
                      {format(new Date(`2000-01-01T${apt.appointment_time}`), 'h:mm a')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-type">Reminder Type</Label>
              <Select value={testReminderType} onValueChange={(value: 'sms' | 'email') => setTestReminderType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      SMS
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={() => sendTestReminderMutation.mutate({
              appointmentId: selectedAppointment,
              reminderType: testReminderType
            })}
            disabled={!selectedAppointment || sendTestReminderMutation.isPending}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Send Test Reminder
          </Button>
        </CardContent>
      </Card>

      {/* Reminder Templates Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Default Reminder Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Email Reminder</div>
                  <div className="text-sm text-muted-foreground">Sent 24 hours before appointment</div>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">SMS Reminder</div>
                  <div className="text-sm text-muted-foreground">Sent 2 hours before appointment</div>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="pt-4">
            <h4 className="font-medium mb-2">Bulk Schedule Reminders</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Schedule automatic reminders for upcoming appointments
            </p>
            <div className="flex gap-2">
              <Select value={selectedAppointment} onValueChange={setSelectedAppointment}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select appointment to schedule reminders" />
                </SelectTrigger>
                <SelectContent>
                  {upcomingAppointments?.map((apt) => (
                    <SelectItem key={apt.id} value={apt.id}>
                      {apt.patients.first_name} {apt.patients.last_name} - 
                      {format(new Date(apt.appointment_date), 'MMM dd')} at 
                      {format(new Date(`2000-01-01T${apt.appointment_time}`), 'h:mm a')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => scheduleRemindersMutation.mutate(selectedAppointment)}
                disabled={!selectedAppointment || scheduleRemindersMutation.isPending}
              >
                Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reminders Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reminderHistory?.filter(r => r.status === 'sent').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {reminderHistory?.filter(r => r.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {reminderHistory?.filter(r => r.status === 'failed').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}