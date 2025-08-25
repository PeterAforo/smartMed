import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format, addDays } from "date-fns"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface NewPrescriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  onSuccess: () => void
}

export function NewPrescriptionDialog({
  open,
  onOpenChange,
  patientId,
  onSuccess
}: NewPrescriptionDialogProps) {
  const { user, tenant, currentBranch } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    medicationName: "",
    dosage: "",
    frequency: "",
    instructions: "",
    durationDays: "",
    refillsRemaining: "",
    startDate: new Date(),
    endDate: null as Date | null,
    pharmacyName: "",
    pharmacyPhone: "",
    pharmacyAddress: ""
  })

  // Auto-calculate end date when duration changes
  const handleDurationChange = (value: string) => {
    setFormData(prev => {
      const days = parseInt(value)
      return {
        ...prev,
        durationDays: value,
        endDate: days > 0 ? addDays(prev.startDate, days) : null
      }
    })
  }

  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return
    
    setFormData(prev => {
      const days = parseInt(prev.durationDays)
      return {
        ...prev,
        startDate: date,
        endDate: days > 0 ? addDays(date, days) : prev.endDate
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !tenant || !currentBranch) return

    if (!formData.medicationName.trim() || !formData.dosage.trim() || !formData.frequency.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (medication name, dosage, and frequency)",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const pharmacyInfo = (formData.pharmacyName || formData.pharmacyPhone || formData.pharmacyAddress) ? {
        name: formData.pharmacyName || null,
        phone: formData.pharmacyPhone || null,
        address: formData.pharmacyAddress || null
      } : {}

      const { error } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: patientId,
          tenant_id: tenant.id,
          branch_id: currentBranch.id,
          prescribed_by: user.id,
          medication_name: formData.medicationName.trim(),
          dosage: formData.dosage.trim(),
          frequency: formData.frequency.trim(),
          instructions: formData.instructions.trim() || null,
          duration_days: formData.durationDays ? parseInt(formData.durationDays) : null,
          refills_remaining: formData.refillsRemaining ? parseInt(formData.refillsRemaining) : 0,
          start_date: format(formData.startDate, 'yyyy-MM-dd'),
          end_date: formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : null,
          pharmacy_info: Object.keys(pharmacyInfo).length > 0 ? pharmacyInfo : null,
          status: 'active'
        })

      if (error) throw error

      // Log activity
      await supabase
        .from('activities')
        .insert({
          tenant_id: tenant.id,
          branch_id: currentBranch.id,
          user_id: user.id,
          activity_type: 'create',
          entity_type: 'prescription',
          entity_id: patientId,
          description: `Prescribed ${formData.medicationName} - ${formData.dosage}`,
          metadata: { medication: formData.medicationName, dosage: formData.dosage }
        })

      toast({
        title: "Prescription Created",
        description: "The prescription has been successfully added."
      })

      // Reset form
      setFormData({
        medicationName: "",
        dosage: "",
        frequency: "",
        instructions: "",
        durationDays: "",
        refillsRemaining: "",
        startDate: new Date(),
        endDate: null,
        pharmacyName: "",
        pharmacyPhone: "",
        pharmacyAddress: ""
      })

      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create prescription",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Prescription</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medicationName">Medication Name *</Label>
              <Input
                id="medicationName"
                value={formData.medicationName}
                onChange={(e) => setFormData(prev => ({ ...prev, medicationName: e.target.value }))}
                placeholder="e.g., Metformin, Lisinopril"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="e.g., 500mg, 10mg"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Once daily">Once daily</SelectItem>
                  <SelectItem value="Twice daily">Twice daily</SelectItem>
                  <SelectItem value="Three times daily">Three times daily</SelectItem>
                  <SelectItem value="Four times daily">Four times daily</SelectItem>
                  <SelectItem value="Every 4 hours">Every 4 hours</SelectItem>
                  <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                  <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                  <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
                  <SelectItem value="As needed">As needed (PRN)</SelectItem>
                  <SelectItem value="Once weekly">Once weekly</SelectItem>
                  <SelectItem value="Twice weekly">Twice weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationDays">Duration (Days)</Label>
              <Input
                id="durationDays"
                type="number"
                value={formData.durationDays}
                onChange={(e) => handleDurationChange(e.target.value)}
                placeholder="e.g., 30, 90"
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.startDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={handleStartDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="refillsRemaining">Refills Remaining</Label>
              <Input
                id="refillsRemaining"
                type="number"
                value={formData.refillsRemaining}
                onChange={(e) => setFormData(prev => ({ ...prev, refillsRemaining: e.target.value }))}
                placeholder="0"
                min="0"
                max="11"
              />
            </div>
          </div>

          {formData.endDate && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">End Date: {format(formData.endDate, "PPP")}</p>
              <p className="text-xs text-muted-foreground">Calculated based on start date and duration</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              rows={3}
              placeholder="e.g., Take with food, Avoid alcohol, Monitor blood pressure"
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Pharmacy Information (Optional)</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                <Input
                  id="pharmacyName"
                  value={formData.pharmacyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, pharmacyName: e.target.value }))}
                  placeholder="e.g., CVS Pharmacy, Walgreens"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pharmacyPhone">Pharmacy Phone</Label>
                  <Input
                    id="pharmacyPhone"
                    value={formData.pharmacyPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, pharmacyPhone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pharmacyAddress">Pharmacy Address</Label>
                  <Input
                    id="pharmacyAddress"
                    value={formData.pharmacyAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, pharmacyAddress: e.target.value }))}
                    placeholder="123 Main St, City, State"
                  />
                </div>
              </div>
            </div>
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
                "Create Prescription"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}