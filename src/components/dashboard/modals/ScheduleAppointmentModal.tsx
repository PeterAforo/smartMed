import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

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
    appointmentDate: "",
    appointmentTime: "",
    appointmentType: "consultation",
    chiefComplaint: "",
    notes: ""
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBranch || !tenant || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          tenant_id: tenant.id,
          branch_id: currentBranch.id,
          patient_id: formData.patientId,
          staff_id: user.id,
          appointment_date: formData.appointmentDate,
          appointment_time: formData.appointmentTime,
          appointment_type: formData.appointmentType,
          chief_complaint: formData.chiefComplaint || null,
          notes: formData.notes || null,
          created_by: user.id
        });

      if (error) throw error;

      // Log activity
      const selectedPatient = patients.find(p => p.id === formData.patientId);
      await supabase
        .from('activities')
        .insert({
          tenant_id: tenant.id,
          branch_id: currentBranch.id,
          user_id: user.id,
          activity_type: 'appointment_scheduled',
          entity_type: 'appointment',
          description: `Appointment scheduled for ${selectedPatient?.first_name} ${selectedPatient?.last_name} on ${formData.appointmentDate}`
        });

      toast({
        title: "Appointment Scheduled",
        description: `Appointment has been successfully scheduled for ${formData.appointmentDate}.`,
      });

      // Reset form and close modal
      setFormData({
        patientId: "",
        appointmentDate: "",
        appointmentTime: "",
        appointmentType: "consultation",
        chiefComplaint: "",
        notes: ""
      });
      
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
          <DialogTitle>Schedule Appointment</DialogTitle>
          <DialogDescription>
            Book a new appointment for a patient.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient">Patient *</Label>
            <Select required onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name} ({patient.patient_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointmentDate">Date *</Label>
              <Input
                id="appointmentDate"
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointmentTime">Time *</Label>
              <Input
                id="appointmentTime"
                type="time"
                value={formData.appointmentTime}
                onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                required
              />
            </div>
          </div>

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
              </SelectContent>
            </Select>
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
              {loading ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}