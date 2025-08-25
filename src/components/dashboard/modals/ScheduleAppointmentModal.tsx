import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, Clock, Calendar as CalendarIconLucide, Loader2, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ScheduleAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  patient_number: string;
}

export function ScheduleAppointmentModal({ open, onOpenChange }: ScheduleAppointmentModalProps) {
  const { currentBranch, tenant, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [formData, setFormData] = useState({
    patientId: "",
    appointmentDate: null as Date | null,
    appointmentTime: "",
    appointmentType: "consultation",
    chiefComplaint: "",
    notes: "",
    duration: "30"
  });

  const [patientSearch, setPatientSearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form persistence
  useEffect(() => {
    const savedData = localStorage.getItem('appointmentForm');
    if (savedData && open) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData({
          ...parsedData,
          appointmentDate: parsedData.appointmentDate ? new Date(parsedData.appointmentDate) : null
        });
      } catch (error) {
        console.error('Failed to load saved appointment form:', error);
      }
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      localStorage.setItem('appointmentForm', JSON.stringify({
        ...formData,
        appointmentDate: formData.appointmentDate?.toISOString()
      }));
    }
  }, [formData, open]);

  // Load patients when modal opens
  useEffect(() => {
    if (open && currentBranch && tenant) {
      loadPatients();
    }
  }, [open, currentBranch, tenant]);

  const loadPatients = async () => {
    if (!currentBranch || !tenant) return;

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, patient_number')
        .eq('tenant_id', tenant.id)
        .eq('branch_id', currentBranch.id)
        .eq('status', 'active')
        .order('last_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patientId = "Please select a patient";
    }
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = "Please select an appointment date";
    }
    if (!formData.appointmentTime) {
      newErrors.appointmentTime = "Please select an appointment time";
    }
    if (formData.appointmentDate && formData.appointmentDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      newErrors.appointmentDate = "Appointment date cannot be in the past";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBranch || !tenant || !user) return;

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          tenant_id: tenant.id,
          branch_id: currentBranch.id,
          patient_id: formData.patientId,
          staff_id: user.id,
          appointment_date: format(formData.appointmentDate!, 'yyyy-MM-dd'),
          appointment_time: formData.appointmentTime,
          appointment_type: formData.appointmentType,
          chief_complaint: formData.chiefComplaint || null,
          notes: formData.notes || null,
          duration_minutes: parseInt(formData.duration),
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      const selectedPatient = patients.find(p => p.id === formData.patientId);
      await supabase
        .from('activities')
        .insert({
          tenant_id: tenant.id,
          branch_id: currentBranch.id,
          user_id: user.id,
          activity_type: 'create',
          entity_type: 'appointment',
          entity_id: data.id,
          description: `Appointment scheduled for ${selectedPatient?.first_name} ${selectedPatient?.last_name} on ${format(formData.appointmentDate!, 'PPP')}`,
          metadata: {
            appointment_date: format(formData.appointmentDate!, 'yyyy-MM-dd'),
            appointment_time: formData.appointmentTime,
            patient_name: `${selectedPatient?.first_name} ${selectedPatient?.last_name}`,
            appointment_type: formData.appointmentType
          }
        });

      toast({
        title: "Appointment Scheduled",
        description: `Appointment successfully scheduled for ${format(formData.appointmentDate!, 'PPP')} at ${formData.appointmentTime}.`,
      });

      // Clear saved form and reset
      localStorage.removeItem('appointmentForm');
      setFormData({
        patientId: "",
        appointmentDate: null,
        appointmentTime: "",
        appointmentType: "consultation",
        chiefComplaint: "",
        notes: "",
        duration: "30"
      });
      setErrors({});
      
      onOpenChange(false);
      
      // Refresh dashboard data
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activities'] });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule appointment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CalendarIconLucide className="h-5 w-5 text-primary" />
            <DialogTitle>Schedule Appointment</DialogTitle>
          </div>
          <DialogDescription>
            Book a new appointment for a patient. Form data is automatically saved as you type.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Search */}
          <div className="space-y-2">
            <Label htmlFor="patientSearch">Search Patient</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="patientSearch"
                placeholder="Search by name or patient number..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patient">Patient *</Label>
            <Select 
              value={formData.patientId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}
            >
              <SelectTrigger className={errors.patientId ? "border-destructive" : ""}>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients
                  .filter(patient =>
                    `${patient.first_name} ${patient.last_name} ${patient.patient_number}`
                      .toLowerCase()
                      .includes(patientSearch.toLowerCase())
                  )
                  .map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name} ({patient.patient_number})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.patientId && (
              <p className="text-sm text-destructive">{errors.patientId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointmentDate">Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.appointmentDate && "text-muted-foreground",
                      errors.appointmentDate && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.appointmentDate ? format(formData.appointmentDate, "PPP") : "Select appointment date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.appointmentDate || undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, appointmentDate: date || null }))}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {errors.appointmentDate && (
                <p className="text-sm text-destructive">{errors.appointmentDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointmentTime">Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="appointmentTime"
                  type="time"
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                  className={cn("pl-10", errors.appointmentTime && "border-destructive")}
                  step="900"
                />
              </div>
              {errors.appointmentTime && (
                <p className="text-sm text-destructive">{errors.appointmentTime}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointmentType">Appointment Type</Label>
              <Select value={formData.appointmentType} onValueChange={(value) => setFormData(prev => ({ ...prev, appointmentType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="lab_test">Lab Test</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="vaccination">Vaccination</SelectItem>
                  <SelectItem value="physical_exam">Physical Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chiefComplaint">Chief Complaint</Label>
            <Input
              id="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
              placeholder="Brief description of the patient's main concern"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Additional notes for the appointment..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule Appointment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}