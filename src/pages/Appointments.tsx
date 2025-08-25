import { useState } from "react"
import { Plus, Search, Filter, Calendar, Clock, User, Phone, Eye, Edit, CheckCircle, XCircle, FileText, Users, MapPin, Bell, Repeat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { ScheduleAppointmentModal } from "@/components/dashboard/modals/ScheduleAppointmentModal"
import AppointmentTemplateManager from "@/components/appointments/AppointmentTemplateManager"
import RecurringAppointmentDialog from "@/components/appointments/RecurringAppointmentDialog"
import QueueDashboard from "@/components/appointments/QueueDashboard"
import ResourceScheduler from "@/components/appointments/ResourceScheduler"
import ReminderSettings from "@/components/appointments/ReminderSettings"
import { useAuth } from "@/hooks/useAuth"
import { useRealtimeAppointments } from "@/hooks/useRealtime"
import { NotificationProvider, NotificationToggle } from "@/components/notifications/NotificationProvider"
import { format, isToday, isTomorrow, isYesterday, startOfDay, endOfDay } from "date-fns"

export default function Appointments() {
  const { currentBranch } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const [showRecurringDialog, setShowRecurringDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("appointments")

  const { data: appointments, loading: isLoading, refetch } = useRealtimeAppointments()

  const filteredAppointments = appointments?.filter(appointment => {
    const matchesSearch = searchTerm === "" || 
      `${appointment.patients.first_name} ${appointment.patients.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patients.patient_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.appointment_type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
    
    let matchesDate = true
    const appointmentDate = new Date(appointment.appointment_date)
    const today = new Date()
    
    switch (dateFilter) {
      case "today":
        matchesDate = isToday(appointmentDate)
        break
      case "tomorrow":
        matchesDate = isTomorrow(appointmentDate)
        break
      case "week":
        const weekFromNow = new Date()
        weekFromNow.setDate(today.getDate() + 7)
        matchesDate = appointmentDate >= today && appointmentDate <= weekFromNow
        break
      case "past":
        matchesDate = appointmentDate < startOfDay(today)
        break
      default:
        matchesDate = true
    }
    
    return matchesSearch && matchesStatus && matchesDate
  }) || []

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default'
      case 'confirmed': return 'secondary'
      case 'in-progress': return 'outline'
      case 'completed': return 'default'
      case 'cancelled': return 'destructive'
      case 'no-show': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600'
      case 'confirmed': return 'text-green-600'
      case 'in-progress': return 'text-orange-600'
      case 'completed': return 'text-green-700'
      case 'cancelled': return 'text-red-600'
      case 'no-show': return 'text-red-700'
      default: return 'text-gray-600'
    }
  }

  const getDateLabel = (date: string) => {
    const appointmentDate = new Date(date)
    if (isToday(appointmentDate)) return "Today"
    if (isTomorrow(appointmentDate)) return "Tomorrow"
    if (isYesterday(appointmentDate)) return "Yesterday"
    return format(appointmentDate, 'MMM dd, yyyy')
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const todayAppointments = appointments?.filter(apt => isToday(new Date(apt.appointment_date))) || []
  const upcomingAppointments = appointments?.filter(apt => new Date(apt.appointment_date) > endOfDay(new Date())) || []
  const completedAppointments = appointments?.filter(apt => apt.status === 'completed') || []

  return (
    <NotificationProvider>
      <DashboardLayout>
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Advanced Appointments</h1>
            <p className="text-muted-foreground">Comprehensive appointment management system</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationToggle />
            <Button 
              variant="outline" 
              onClick={() => setShowRecurringDialog(true)} 
              className="gap-2"
            >
              <Repeat className="h-4 w-4" />
              Recurring
            </Button>
            <Button onClick={() => setShowNewAppointmentModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="appointments" className="gap-2">
              <Calendar className="h-4 w-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="queue" className="gap-2">
              <Users className="h-4 w-4" />
              Queue
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-2">
              <MapPin className="h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="reminders" className="gap-2">
              <Bell className="h-4 w-4" />
              Reminders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-6">

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{todayAppointments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{upcomingAppointments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{completedAppointments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name, number, or appointment type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="week">Next 7 Days</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Appointments ({filteredAppointments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(appointment.patients.first_name, appointment.patients.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {appointment.patients.first_name} {appointment.patients.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground font-mono">
                              {appointment.patients.patient_number}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{getDateLabel(appointment.appointment_date)}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(`2000-01-01T${appointment.appointment_time}`), 'h:mm a')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{appointment.appointment_type}</Badge>
                      </TableCell>
                      <TableCell>{appointment.duration_minutes || 30} min</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(appointment.status)} className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {appointment.patients.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {appointment.patients.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {appointment.status === 'scheduled' && (
                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

          </TabsContent>

          <TabsContent value="templates">
            <AppointmentTemplateManager />
          </TabsContent>

          <TabsContent value="queue">
            <QueueDashboard />
          </TabsContent>

          <TabsContent value="resources">
            <ResourceScheduler />
          </TabsContent>

          <TabsContent value="reminders">
            <ReminderSettings />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <ScheduleAppointmentModal 
          open={showNewAppointmentModal} 
          onOpenChange={setShowNewAppointmentModal}
        />
        <RecurringAppointmentDialog
          open={showRecurringDialog}
          onOpenChange={setShowRecurringDialog}
        />
        </div>
      </DashboardLayout>
    </NotificationProvider>
  )
}