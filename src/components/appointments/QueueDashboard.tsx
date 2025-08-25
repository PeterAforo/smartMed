import { useState } from "react"
import { Clock, Users, CheckCircle, AlertCircle, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { format, isToday, differenceInMinutes } from "date-fns"

interface QueueItem {
  id: string
  appointment_id: string
  queue_position: number
  check_in_time: string | null
  estimated_start_time: string | null
  actual_start_time: string | null
  status: 'waiting' | 'in-progress' | 'completed' | 'no-show'
  wait_time_minutes: number | null
  appointments: {
    id: string
    appointment_time: string
    appointment_type: string
    duration_minutes: number
    patients: {
      id: string
      first_name: string
      last_name: string
      patient_number: string
    }
  }
}

export default function QueueDashboard() {
  const { currentBranch, tenant } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(new Date())

  const { data: queueData, isLoading } = useQuery({
    queryKey: ['appointment-queue', currentBranch?.id, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!currentBranch) return []
      
      const { data, error } = await supabase
        .from('appointment_queue')
        .select(`
          *,
          appointments!inner(
            id,
            appointment_time,
            appointment_type,
            duration_minutes,
            patients!inner(
              id,
              first_name,
              last_name,
              patient_number
            )
          )
        `)
        .eq('branch_id', currentBranch.id)
        .eq('queue_date', format(selectedDate, 'yyyy-MM-dd'))
        .order('queue_position')
      
      if (error) throw error
      return data || []
    },
    enabled: !!currentBranch,
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  const updateQueueStatusMutation = useMutation({
    mutationFn: async ({ queueId, status, appointmentId }: { 
      queueId: string, 
      status: string,
      appointmentId?: string 
    }) => {
      const updateData: any = { status }
      
      if (status === 'in-progress') {
        updateData.actual_start_time = new Date().toISOString()
      }

      const { error } = await supabase
        .from('appointment_queue')
        .update(updateData)
        .eq('id', queueId)
      
      if (error) throw error

      // Also update appointment status if provided
      if (appointmentId) {
        await supabase
          .from('appointments')
          .update({ 
            status: status === 'in-progress' ? 'in-progress' : status,
            actual_start_time: status === 'in-progress' ? new Date().toISOString() : null
          })
          .eq('id', appointmentId)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-queue'] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    }
  })

  const checkInPatientMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!currentBranch || !tenant) throw new Error('Branch or tenant not found')

      // Get appointment details
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single()

      if (appointmentError) throw appointmentError

      // Get current queue position (highest + 1)
      const { data: lastInQueue } = await supabase
        .from('appointment_queue')
        .select('queue_position')
        .eq('branch_id', currentBranch.id)
        .eq('queue_date', format(new Date(), 'yyyy-MM-dd'))
        .order('queue_position', { ascending: false })
        .limit(1)

      const newPosition = (lastInQueue?.[0]?.queue_position || 0) + 1

      // Create queue entry
      const { error } = await supabase
        .from('appointment_queue')
        .insert([{
          tenant_id: tenant.id,
          branch_id: currentBranch.id,
          appointment_id: appointmentId,
          queue_date: format(new Date(), 'yyyy-MM-dd'),
          queue_position: newPosition,
          check_in_time: new Date().toISOString(),
          status: 'waiting'
        }])

      if (error) throw error

      // Update appointment status
      await supabase
        .from('appointments')
        .update({ 
          status: 'confirmed',
          check_in_time: new Date().toISOString()
        })
        .eq('id', appointmentId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-queue'] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast({
        title: "Patient Checked In",
        description: "Patient added to queue successfully"
      })
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-yellow-600'
      case 'in-progress': return 'text-blue-600'
      case 'completed': return 'text-green-600'
      case 'no-show': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return <Clock className="h-4 w-4" />
      case 'in-progress': return <Play className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'no-show': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const calculateWaitTime = (checkInTime: string | null, currentTime: Date = new Date()) => {
    if (!checkInTime) return 0
    return differenceInMinutes(currentTime, new Date(checkInTime))
  }

  const waitingCount = queueData?.filter(item => item.status === 'waiting').length || 0
  const inProgressCount = queueData?.filter(item => item.status === 'in-progress').length || 0
  const completedCount = queueData?.filter(item => item.status === 'completed').length || 0
  const averageWaitTime = queueData?.filter(item => item.wait_time_minutes)
    .reduce((acc, item) => acc + (item.wait_time_minutes || 0), 0) / 
    Math.max(queueData?.filter(item => item.wait_time_minutes).length || 1, 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Queue Dashboard</h2>
          <p className="text-muted-foreground">Real-time patient queue management</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {queueData?.length || 0} patients
          </Badge>
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Waiting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{waitingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Wait</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageWaitTime || 0)}m</div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Queue ({format(selectedDate, 'PPP')})</CardTitle>
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
                  <TableHead>Position</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Appointment</TableHead>
                  <TableHead>Check-in Time</TableHead>
                  <TableHead>Wait Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queueData?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        #{item.queue_position}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(
                              item.appointments.patients.first_name, 
                              item.appointments.patients.last_name
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {item.appointments.patients.first_name} {item.appointments.patients.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground font-mono">
                            {item.appointments.patients.patient_number}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {format(new Date(`2000-01-01T${item.appointments.appointment_time}`), 'h:mm a')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.appointments.appointment_type} ({item.appointments.duration_minutes}m)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.check_in_time ? (
                        <div className="text-sm">
                          {format(new Date(item.check_in_time), 'h:mm a')}
                        </div>
                      ) : (
                        <Badge variant="secondary">Not checked in</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.check_in_time ? (
                        <div className="text-sm font-medium">
                          {calculateWaitTime(item.check_in_time)}m
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`gap-1 ${getStatusColor(item.status)}`}
                      >
                        {getStatusIcon(item.status)}
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {item.status === 'waiting' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQueueStatusMutation.mutate({
                              queueId: item.id,
                              status: 'in-progress',
                              appointmentId: item.appointment_id
                            })}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {item.status === 'in-progress' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQueueStatusMutation.mutate({
                              queueId: item.id,
                              status: 'completed',
                              appointmentId: item.appointment_id
                            })}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQueueStatusMutation.mutate({
                            queueId: item.id,
                            status: 'no-show',
                            appointmentId: item.appointment_id
                          })}
                          className="text-red-600 hover:text-red-700"
                        >
                          <AlertCircle className="h-4 w-4" />
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
    </div>
  )
}