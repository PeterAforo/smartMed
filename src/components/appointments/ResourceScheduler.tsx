import { useState } from "react"
import { MapPin, Monitor, Clock, AlertTriangle, Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { format, addMinutes, parseISO, isSameDay } from "date-fns"

interface RoomBooking {
  id: string
  room_name: string
  room_type: string | null
  equipment_required: any // Json type from Supabase
  booking_date: string
  start_time: string
  end_time: string
  status: string // Allow any string from database
  notes: string | null
  appointment_id: string | null
  appointments?: {
    id: string
    appointment_type: string
    patients: {
      first_name: string
      last_name: string
      patient_number: string
    }
  } | null
}

interface BookingFormData {
  room_name: string
  room_type: string
  equipment_required: string[]
  booking_date: Date | undefined
  start_time: string
  end_time: string
  notes: string
  appointment_id: string
}

const ROOM_TYPES = [
  'consultation',
  'procedure',
  'surgery',
  'emergency',
  'diagnostic'
]

const EQUIPMENT_OPTIONS = [
  'X-Ray Machine',
  'Ultrasound',
  'ECG Monitor',
  'Defibrillator',
  'Surgical Table',
  'Anesthesia Machine',
  'Ventilator',
  'Blood Pressure Monitor',
  'IV Pump',
  'Microscope'
]

export default function ResourceScheduler() {
  const { currentBranch, tenant } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showNewBookingDialog, setShowNewBookingDialog] = useState(false)
  const [editingBooking, setEditingBooking] = useState<RoomBooking | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [formData, setFormData] = useState<BookingFormData>({
    room_name: '',
    room_type: 'consultation',
    equipment_required: [],
    booking_date: new Date(),
    start_time: '09:00',
    end_time: '10:00',
    notes: '',
    appointment_id: ''
  })

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['room-bookings', currentBranch?.id, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!currentBranch) return []
      
      const { data, error } = await supabase
        .from('room_bookings')
        .select(`
          *,
          appointments(
            id,
            appointment_type,
            patients(
              first_name,
              last_name,
              patient_number
            )
          )
        `)
        .eq('branch_id', currentBranch.id)
        .eq('booking_date', format(selectedDate, 'yyyy-MM-dd'))
        .order('start_time')
      
      if (error) throw error
      return data || []
    },
    enabled: !!currentBranch
  })

  const { data: availableAppointments } = useQuery({
    queryKey: ['available-appointments', currentBranch?.id, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!currentBranch) return []
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_time,
          appointment_type,
          duration_minutes,
          patients(
            first_name,
            last_name,
            patient_number
          )
        `)
        .eq('branch_id', currentBranch.id)
        .eq('appointment_date', format(selectedDate, 'yyyy-MM-dd'))
        .eq('status', 'scheduled')
        .order('appointment_time')
      
      if (error) throw error
      return data || []
    },
    enabled: !!currentBranch && (showNewBookingDialog || !!editingBooking)
  })

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: BookingFormData) => {
      if (!currentBranch || !tenant || !bookingData.booking_date) {
        throw new Error('Missing required data')
      }

      // Check for conflicts
      const { data: conflicts, error: conflictError } = await supabase
        .from('room_bookings')
        .select('id')
        .eq('branch_id', currentBranch.id)
        .eq('room_name', bookingData.room_name)
        .eq('booking_date', format(bookingData.booking_date, 'yyyy-MM-dd'))
        .neq('status', 'cancelled')
        .or(`start_time.lte.${bookingData.end_time},end_time.gte.${bookingData.start_time}`)

      if (conflictError) throw conflictError
      if (conflicts && conflicts.length > 0) {
        throw new Error('Room is already booked during this time')
      }

      const { error } = await supabase
        .from('room_bookings')
        .insert([{
          tenant_id: tenant.id,
          branch_id: currentBranch.id,
          room_name: bookingData.room_name,
          room_type: bookingData.room_type,
          equipment_required: bookingData.equipment_required,
          booking_date: format(bookingData.booking_date, 'yyyy-MM-dd'),
          start_time: bookingData.start_time,
          end_time: bookingData.end_time,
          notes: bookingData.notes,
          appointment_id: bookingData.appointment_id || null,
          status: 'booked'
        }])
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-bookings'] })
      toast({
        title: "Room Booked",
        description: "Room booking created successfully"
      })
      setShowNewBookingDialog(false)
      resetForm()
    },
    onError: (error: any) => {
      toast({
        title: "Booking Error",
        description: error.message || "Failed to create booking",
        variant: "destructive"
      })
    }
  })

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<BookingFormData> }) => {
      const updateData = {
        ...data,
        booking_date: data.booking_date ? format(data.booking_date, 'yyyy-MM-dd') : undefined
      }
      const { error } = await supabase
        .from('room_bookings')
        .update(updateData)
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-bookings'] })
      toast({
        title: "Booking Updated",
        description: "Room booking updated successfully"
      })
      setEditingBooking(null)
      resetForm()
    }
  })

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase
        .from('room_bookings')
        .update({ status })
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-bookings'] })
    }
  })

  const resetForm = () => {
    setFormData({
      room_name: '',
      room_type: 'consultation',
      equipment_required: [],
      booking_date: new Date(),
      start_time: '09:00',
      end_time: '10:00',
      notes: '',
      appointment_id: ''
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingBooking) {
      updateBookingMutation.mutate({ id: editingBooking.id, data: formData })
    } else {
      createBookingMutation.mutate(formData)
    }
  }

  const startEdit = (booking: RoomBooking) => {
    setEditingBooking(booking)
    setFormData({
      room_name: booking.room_name,
      room_type: booking.room_type || 'consultation',
      equipment_required: Array.isArray(booking.equipment_required) ? booking.equipment_required : [],
      booking_date: parseISO(booking.booking_date),
      start_time: booking.start_time,
      end_time: booking.end_time,
      notes: booking.notes || '',
      appointment_id: booking.appointment_id || ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'text-blue-600'
      case 'in-use': return 'text-green-600'
      case 'completed': return 'text-gray-600'
      case 'cancelled': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getRoomTypeIcon = (type: string | null) => {
    switch (type) {
      case 'surgery': return <Monitor className="h-4 w-4" />
      case 'emergency': return <AlertTriangle className="h-4 w-4" />
      default: return <MapPin className="h-4 w-4" />
    }
  }

  const rooms = [...new Set(bookings?.map(b => b.room_name))]
  const bookedCount = bookings?.filter(b => b.status === 'booked').length || 0
  const inUseCount = bookings?.filter(b => b.status === 'in-use').length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resource Scheduler</h2>
          <p className="text-muted-foreground">Manage room and equipment bookings</p>
        </div>
        <Dialog open={showNewBookingDialog || !!editingBooking} onOpenChange={(open) => {
          if (!open) {
            setShowNewBookingDialog(false)
            setEditingBooking(null)
            resetForm()
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowNewBookingDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Book Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingBooking ? 'Edit Booking' : 'Book Room'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room_name">Room Name</Label>
                  <Input
                    id="room_name"
                    value={formData.room_name}
                    onChange={(e) => setFormData({...formData, room_name: e.target.value})}
                    placeholder="e.g., Room 101"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room_type">Room Type</Label>
                  <Select 
                    value={formData.room_type}
                    onValueChange={(value) => setFormData({...formData, room_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {formData.booking_date ? format(formData.booking_date, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.booking_date}
                        onSelect={(date) => setFormData({...formData, booking_date: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointment_id">Link to Appointment (Optional)</Label>
                <Select 
                  value={formData.appointment_id}
                  onValueChange={(value) => setFormData({...formData, appointment_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No appointment linked" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAppointments?.map((apt) => (
                      <SelectItem key={apt.id} value={apt.id}>
                        {format(new Date(`2000-01-01T${apt.appointment_time}`), 'h:mm a')} - 
                        {apt.patients.first_name} {apt.patients.last_name} ({apt.appointment_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Equipment Required</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {EQUIPMENT_OPTIONS.map((equipment) => (
                    <label key={equipment} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.equipment_required.includes(equipment)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              equipment_required: [...formData.equipment_required, equipment]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              equipment_required: formData.equipment_required.filter(eq => eq !== equipment)
                            })
                          }
                        }}
                        className="rounded"
                      />
                      <span>{equipment}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional booking notes"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowNewBookingDialog(false)
                    setEditingBooking(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createBookingMutation.isPending || updateBookingMutation.isPending}
                >
                  {editingBooking ? 'Update' : 'Book'} Room
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Booked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{bookedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{inUseCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.length > 0 ? Math.round(((bookedCount + inUseCount) / rooms.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Selection */}
      <div className="flex items-center gap-4">
        <Label>Date:</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Clock className="h-4 w-4" />
              {format(selectedDate, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Room Bookings - {format(selectedDate, 'PPP')}</CardTitle>
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
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Appointment</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings?.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoomTypeIcon(booking.room_type)}
                        <span className="font-medium">{booking.room_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {booking.room_type || 'General'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(`2000-01-01T${booking.start_time}`), 'h:mm a')} - 
                        {format(new Date(`2000-01-01T${booking.end_time}`), 'h:mm a')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.appointments ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {booking.appointments.patients.first_name} {booking.appointments.patients.last_name}
                          </div>
                          <div className="text-muted-foreground">
                            {booking.appointments.appointment_type}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No appointment</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {Array.isArray(booking.equipment_required) && booking.equipment_required.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {booking.equipment_required.slice(0, 2).map((eq: any, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {String(eq)}
                            </Badge>
                          ))}
                          {booking.equipment_required.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{booking.equipment_required.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(booking.status)}
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(booking)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {booking.status === 'booked' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateBookingStatusMutation.mutate({
                              id: booking.id,
                              status: 'in-use'
                            })}
                            className="text-green-600 hover:text-green-700"
                          >
                            Start
                          </Button>
                        )}
                        {booking.status === 'in-use' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateBookingStatusMutation.mutate({
                              id: booking.id,
                              status: 'completed'
                            })}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Complete
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateBookingStatusMutation.mutate({
                            id: booking.id,
                            status: 'cancelled'
                          })}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
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