import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface NewVitalSignsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  onSuccess: () => void
}

export function NewVitalSignsDialog({
  open,
  onOpenChange,
  patientId,
  onSuccess
}: NewVitalSignsDialogProps) {
  const { user, tenant, currentBranch } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    heartRate: "",
    temperature: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
    notes: ""
  })

  // Calculate BMI when weight and height are provided
  const calculateBMI = (weight: number, height: number) => {
    if (weight > 0 && height > 0) {
      const heightInMeters = height / 100
      return (weight / (heightInMeters * heightInMeters)).toFixed(1)
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !tenant || !currentBranch) return

    // At least one vital sign must be provided
    const hasVitals = formData.bloodPressureSystolic || formData.bloodPressureDiastolic || 
                     formData.heartRate || formData.temperature || formData.respiratoryRate || 
                     formData.oxygenSaturation || formData.weight || formData.height
    
    if (!hasVitals) {
      toast({
        title: "Error",
        description: "Please enter at least one vital sign measurement",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const weight = formData.weight ? parseFloat(formData.weight) : null
      const height = formData.height ? parseFloat(formData.height) : null
      const bmi = weight && height ? parseFloat(calculateBMI(weight, height) || "0") : null

      const { error } = await supabase
        .from('vital_signs')
        .insert({
          patient_id: patientId,
          tenant_id: tenant.id,
          branch_id: currentBranch.id,
          recorded_by: user.id,
          blood_pressure_systolic: formData.bloodPressureSystolic ? parseInt(formData.bloodPressureSystolic) : null,
          blood_pressure_diastolic: formData.bloodPressureDiastolic ? parseInt(formData.bloodPressureDiastolic) : null,
          heart_rate: formData.heartRate ? parseInt(formData.heartRate) : null,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null,
          respiratory_rate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : null,
          oxygen_saturation: formData.oxygenSaturation ? parseFloat(formData.oxygenSaturation) : null,
          weight_kg: weight,
          height_cm: height,
          bmi: bmi,
          notes: formData.notes.trim() || null,
          recorded_at: new Date().toISOString()
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
          entity_type: 'vital_signs',
          entity_id: patientId,
          description: `Recorded vital signs`,
          metadata: { 
            blood_pressure: formData.bloodPressureSystolic && formData.bloodPressureDiastolic ? 
              `${formData.bloodPressureSystolic}/${formData.bloodPressureDiastolic}` : null,
            heart_rate: formData.heartRate || null
          }
        })

      toast({
        title: "Vital Signs Recorded",
        description: "The vital signs have been successfully recorded."
      })

      // Reset form
      setFormData({
        bloodPressureSystolic: "",
        bloodPressureDiastolic: "",
        heartRate: "",
        temperature: "",
        respiratoryRate: "",
        oxygenSaturation: "",
        weight: "",
        height: "",
        notes: ""
      })

      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record vital signs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const weight = parseFloat(formData.weight)
  const height = parseFloat(formData.height)
  const bmi = calculateBMI(weight, height)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Vital Signs</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bloodPressureSystolic">Blood Pressure - Systolic (mmHg)</Label>
              <Input
                id="bloodPressureSystolic"
                type="number"
                value={formData.bloodPressureSystolic}
                onChange={(e) => setFormData(prev => ({ ...prev, bloodPressureSystolic: e.target.value }))}
                placeholder="120"
                min="50"
                max="300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodPressureDiastolic">Blood Pressure - Diastolic (mmHg)</Label>
              <Input
                id="bloodPressureDiastolic"
                type="number"
                value={formData.bloodPressureDiastolic}
                onChange={(e) => setFormData(prev => ({ ...prev, bloodPressureDiastolic: e.target.value }))}
                placeholder="80"
                min="30"
                max="200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
              <Input
                id="heartRate"
                type="number"
                value={formData.heartRate}
                onChange={(e) => setFormData(prev => ({ ...prev, heartRate: e.target.value }))}
                placeholder="72"
                min="30"
                max="250"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                placeholder="36.5"
                min="30"
                max="45"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="respiratoryRate">Respiratory Rate (/min)</Label>
              <Input
                id="respiratoryRate"
                type="number"
                value={formData.respiratoryRate}
                onChange={(e) => setFormData(prev => ({ ...prev, respiratoryRate: e.target.value }))}
                placeholder="16"
                min="5"
                max="60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
              <Input
                id="oxygenSaturation"
                type="number"
                step="0.1"
                value={formData.oxygenSaturation}
                onChange={(e) => setFormData(prev => ({ ...prev, oxygenSaturation: e.target.value }))}
                placeholder="98"
                min="70"
                max="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="70.5"
                min="1"
                max="300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={formData.height}
                onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                placeholder="175"
                min="50"
                max="250"
              />
            </div>
          </div>

          {bmi && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">Calculated BMI: {bmi}</p>
              <p className="text-xs text-muted-foreground">
                {parseFloat(bmi) < 18.5 ? 'Underweight' : 
                 parseFloat(bmi) < 25 ? 'Normal weight' : 
                 parseFloat(bmi) < 30 ? 'Overweight' : 'Obese'}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Additional observations or notes..."
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
                  Recording...
                </>
              ) : (
                "Record Vital Signs"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}