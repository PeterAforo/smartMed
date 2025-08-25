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
import { CalendarIcon, UserPlus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface NewPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewPatientModal({ open, onOpenChange }: NewPatientModalProps) {
  const { currentBranch, tenant, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: null as Date | null,
    gender: "",
    phone: "",
    email: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    allergies: "",
    medicalHistory: "",
    insuranceProvider: "",
    insurancePolicyNumber: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save form data to localStorage for persistence
  useEffect(() => {
    const savedData = localStorage.getItem('newPatientForm');
    if (savedData && open) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData({
          ...parsedData,
          dateOfBirth: parsedData.dateOfBirth ? new Date(parsedData.dateOfBirth) : null
        });
      } catch (error) {
        console.error('Failed to load saved form data:', error);
      }
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      localStorage.setItem('newPatientForm', JSON.stringify({
        ...formData,
        dateOfBirth: formData.dateOfBirth?.toISOString()
      }));
    }
  }, [formData, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
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
      // Generate patient number (simple format: P + timestamp)
      const patientNumber = `P${Date.now()}`;

      const { data: patientData, error } = await supabase
        .from('patients')
        .insert({
          tenant_id: tenant.id,
          branch_id: currentBranch.id,
          patient_number: patientNumber,
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          date_of_birth: formData.dateOfBirth ? format(formData.dateOfBirth, 'yyyy-MM-dd') : null,
          gender: formData.gender || null,
          phone: formData.phone || null,
          email: formData.email || null,
          address: formData.address || null,
          emergency_contact_name: formData.emergencyContactName || null,
          emergency_contact_phone: formData.emergencyContactPhone || null,
          allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()).filter(a => a) : [],
          medical_history: formData.medicalHistory ? { notes: formData.medicalHistory } : {},
          insurance_info: (formData.insuranceProvider || formData.insurancePolicyNumber) ? {
            provider: formData.insuranceProvider,
            policy_number: formData.insurancePolicyNumber
          } : {},
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase
        .from('activities')
        .insert({
          tenant_id: tenant.id,
          branch_id: currentBranch.id,
          user_id: user.id,
          activity_type: 'create',
          entity_type: 'patient',
          entity_id: patientNumber,
          description: `New patient registered: ${formData.firstName} ${formData.lastName}`,
          metadata: { patient_number: patientNumber }
        });

      toast({
        title: "Patient Created",
        description: `Patient ${formData.firstName} ${formData.lastName} has been successfully registered.`,
      });

      // Clear saved form data and reset
      localStorage.removeItem('newPatientForm');
      setFormData({
        firstName: "",
        lastName: "",
        dateOfBirth: null,
        gender: "",
        phone: "",
        email: "",
        address: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        allergies: "",
        medicalHistory: "",
        insuranceProvider: "",
        insurancePolicyNumber: ""
      });
      setErrors({});
      
      onOpenChange(false);
      
      // Refresh dashboard data
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activities'] });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create patient",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <DialogTitle>Register New Patient</DialogTitle>
          </div>
          <DialogDescription>
            Enter patient information to create a new record. Form data is automatically saved as you type.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className={errors.firstName ? "border-destructive" : ""}
                required
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className={errors.lastName ? "border-destructive" : ""}
                required
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : "Select date of birth"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dateOfBirth || undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, dateOfBirth: date || null }))}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className={errors.phone ? "border-destructive" : ""}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={errors.email ? "border-destructive" : ""}
                placeholder="patient@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
              <Input
                id="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies (comma-separated)</Label>
            <Input
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
              placeholder="e.g., Penicillin, Peanuts, Latex"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="insuranceProvider">Insurance Provider</Label>
              <Input
                id="insuranceProvider"
                value={formData.insuranceProvider}
                onChange={(e) => setFormData(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                placeholder="e.g., Blue Cross, Aetna"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
              <Input
                id="insurancePolicyNumber"
                value={formData.insurancePolicyNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, insurancePolicyNumber: e.target.value }))}
                placeholder="Policy or member ID"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea
              id="medicalHistory"
              value={formData.medicalHistory}
              onChange={(e) => setFormData(prev => ({ ...prev, medicalHistory: e.target.value }))}
              rows={3}
              placeholder="Brief medical history and relevant conditions..."
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
                  Creating...
                </>
              ) : (
                "Create Patient"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}