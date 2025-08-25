import { useState } from "react"
import { Calendar, Repeat, User, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { format, addDays, addWeeks, addMonths } from "date-fns"

interface RecurringAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface RecurringFormData {
  patient_id: string
  template_id: string
  series_name: string
  recurrence_pattern: 'daily' | 'weekly' | 'monthly'
  recurrence_interval: number
  total_appointments: number
  start_date: Date | undefined
  end_date: Date | undefined
  appointment_time: string
  notes: string
}

export default function RecurringAppointmentDialog({ 
  open, 
  onOpenChange 
}: RecurringAppointmentDialogProps) {
  const { currentBranch, tenant } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [patientSearch, setPatientSearch] = useState("")
  const [formData, setFormData] = useState<RecurringFormData>({
    patient_id: '',
    template_id: '',
    series_name: '',
    recurrence_pattern: 'weekly',
    recurrence_interval: 1,
    total_appointments: 10,
    start_date: undefined,
    end_date: undefined,
    appointment_time: '09:00',
    notes: ''
  })

  // Fetch patients for selection
  const { data: patients } = useQuery({
    queryKey: ['patients-search', currentBranch?.id, patientSearch],
    queryFn: async () => {
      if (!currentBranch || patientSearch.length < 2) return []
      
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, patient_number')
        .eq('branch_id', currentBranch.id)
        .eq('status', 'active')
        .or(`first_name.ilike.%${patientSearch}%,last_name.ilike.%${patientSearch}%,patient_number.ilike.%${patientSearch}%`)
        .limit(10)
      
      if (error) throw error
      return data || []
    },
    enabled: !!currentBranch && patientSearch.length >= 2
  })

  // Fetch appointment templates
  const { data: templates } = useQuery({
    queryKey: ['appointment-templates', currentBranch?.id],
    queryFn: async () => {
      if (!currentBranch) return []
      
      const { data, error } = await supabase
        .from('appointment_templates')
        .select('*')
        .eq('branch_id', currentBranch.id)
        .eq('is_active', true)
        .order('template_name')
      
      if (error) throw error
      return data || []
    },
    enabled: !!currentBranch
  })

  const createSeriesMutation = useMutation({
    mutationFn: async (seriesData: RecurringFormData) => {
      if (!currentBranch || !tenant || !seriesData.start_date) {
        throw new Error('Missing required data')
      }

      // Create appointment series
      const { data: series, error: seriesError } = await supabase
        .from('appointment_series')
        .insert([{
          tenant_id: tenant.id,
          branch_id: currentBranch.id,
          patient_id: seriesData.patient_id,
          template_id: seriesData.template_id,
          series_name: seriesData.series_name,
          recurrence_pattern: seriesData.recurrence_pattern,
          recurrence_interval: seriesData.recurrence_interval,
          total_appointments: seriesData.total_appointments,
          start_date: format(seriesData.start_date, 'yyyy-MM-dd'),
          end_date: seriesData.end_date ? format(seriesData.end_date, 'yyyy-MM-dd') : null
        }])
        .select()
        .single()

      if (seriesError) throw seriesError

      // Get template details
      const template = templates?.find(t => t.id === seriesData.template_id)
      if (!template) throw new Error('Template not found')

      // Generate appointments
      const appointments = []
      let currentDate = new Date(seriesData.start_date)

      for (let i = 0; i < seriesData.total_appointments; i++) {
        if (seriesData.end_date && currentDate > seriesData.end_date) break

        appointments.push({
          tenant_id: tenant.id,
          branch_id: currentBranch.id,
          patient_id: seriesData.patient_id,
          series_id: series.id,
          template_id: seriesData.template_id,
          appointment_date: format(currentDate, 'yyyy-MM-dd'),
          appointment_time: seriesData.appointment_time,
          appointment_type: template.appointment_type,
          duration_minutes: template.duration_minutes,
          notes: seriesData.notes,
          status: 'scheduled'
        })

        // Calculate next appointment date
        switch (seriesData.recurrence_pattern) {
          case 'daily':
            currentDate = addDays(currentDate, seriesData.recurrence_interval)
            break
          case 'weekly':
            currentDate = addWeeks(currentDate, seriesData.recurrence_interval)
            break
          case 'monthly':
            currentDate = addMonths(currentDate, seriesData.recurrence_interval)
            break
        }
      }

      // Insert all appointments
      const { error: appointmentsError } = await supabase
        .from('appointments')
        .insert(appointments)

      if (appointmentsError) throw appointmentsError

      // Update series with created count
      await supabase
        .from('appointment_series')
        .update({ appointments_created: appointments.length })
        .eq('id', series.id)

      return { series, appointmentsCount: appointments.length }
    },
    onSuccess: ({ appointmentsCount }) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointment-series'] })
      toast({
        title: "Recurring Appointments Created",
        description: `Successfully created ${appointmentsCount} appointments`
      })
      onOpenChange(false)
      resetForm()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create recurring appointments",
        variant: "destructive"
      })
    }
  })

  const resetForm = () => {
    setFormData({
      patient_id: '',
      template_id: '',
      series_name: '',
      recurrence_pattern: 'weekly',
      recurrence_interval: 1,
      total_appointments: 10,
      start_date: undefined,
      end_date: undefined,
      appointment_time: '09:00',
      notes: ''
    })
    setPatientSearch("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createSeriesMutation.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Create Recurring Appointments
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient_search">Patient</Label>
              <div className="space-y-2">
                <Input
                  id="patient_search"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Search patients..."
                />
                {patients && patients.length > 0 && (
                  <Select 
                    value={formData.patient_id} 
                    onValueChange={(value) => setFormData({...formData, patient_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {patient.first_name} {patient.last_name} ({patient.patient_number})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template_id">Appointment Template</Label>
              <Select 
                value={formData.template_id}
                onValueChange={(value) => setFormData({...formData, template_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: template.color_code }}
                        />
                        {template.template_name} ({template.duration_minutes}m)
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="series_name">Series Name</Label>
            <Input
              id="series_name"
              value={formData.series_name}
              onChange={(e) => setFormData({...formData, series_name: e.target.value})}
              placeholder="e.g., Weekly Physical Therapy"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recurrence_pattern">Repeat</Label>
              <Select 
                value={formData.recurrence_pattern}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                  setFormData({...formData, recurrence_pattern: value})
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurrence_interval">Every</Label>
              <Input
                id="recurrence_interval"
                type="number"
                value={formData.recurrence_interval}
                onChange={(e) => setFormData({...formData, recurrence_interval: parseInt(e.target.value) || 1})}
                min="1"
                max="12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_appointments">Total</Label>
              <Input
                id="total_appointments"
                type="number"
                value={formData.total_appointments}
                onChange={(e) => setFormData({...formData, total_appointments: parseInt(e.target.value) || 1})}
                min="1"
                max="100"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => setFormData({...formData, start_date: date})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, 'PPP') : 'No end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => setFormData({...formData, end_date: date})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment_time">Time</Label>
              <Input
                id="appointment_time"
                type="time"
                value={formData.appointment_time}
                onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes for all appointments in this series"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createSeriesMutation.isPending || !formData.patient_id || !formData.template_id || !formData.start_date}
            >
              Create Series
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}