import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface NewMedicalRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  onSuccess: () => void
}

export function NewMedicalRecordDialog({
  open,
  onOpenChange,
  patientId,
  onSuccess
}: NewMedicalRecordDialogProps) {
  const { user, tenant, currentBranch } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    recordType: "general",
    severity: "low",
    treatmentPlan: "",
    followUpNotes: "",
    diagnosisCodes: [] as string[],
    newDiagnosisCode: ""
  })

  const addDiagnosisCode = () => {
    if (formData.newDiagnosisCode.trim()) {
      setFormData(prev => ({
        ...prev,
        diagnosisCodes: [...prev.diagnosisCodes, prev.newDiagnosisCode.trim()],
        newDiagnosisCode: ""
      }))
    }
  }

  const removeDiagnosisCode = (index: number) => {
    setFormData(prev => ({
      ...prev,
      diagnosisCodes: prev.diagnosisCodes.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !tenant || !currentBranch) return

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the medical record",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('medical_records')
        .insert({
          patient_id: patientId,
          tenant_id: tenant.id,
          branch_id: currentBranch.id,
          recorded_by: user.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          record_type: formData.recordType,
          severity: formData.severity,
          treatment_plan: formData.treatmentPlan.trim() || null,
          follow_up_notes: formData.followUpNotes.trim() || null,
          diagnosis_codes: formData.diagnosisCodes.length > 0 ? formData.diagnosisCodes : null,
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
          entity_type: 'medical_record',
          entity_id: patientId,
          description: `Added medical record: ${formData.title}`,
          metadata: { record_type: formData.recordType, severity: formData.severity }
        })

      toast({
        title: "Medical Record Added",
        description: "The medical record has been successfully created."
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        recordType: "general",
        severity: "low",
        treatmentPlan: "",
        followUpNotes: "",
        diagnosisCodes: [],
        newDiagnosisCode: ""
      })

      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create medical record",
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
          <DialogTitle>Add Medical Record</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Annual Physical Exam"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recordType">Record Type</Label>
              <Select
                value={formData.recordType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, recordType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="discharge">Discharge</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity Level</Label>
            <Select
              value={formData.severity}
              onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Detailed description of the medical record..."
            />
          </div>

          <div className="space-y-2">
            <Label>Diagnosis Codes (ICD-10)</Label>
            <div className="flex gap-2">
              <Input
                value={formData.newDiagnosisCode}
                onChange={(e) => setFormData(prev => ({ ...prev, newDiagnosisCode: e.target.value }))}
                placeholder="e.g., Z00.00, K59.00"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDiagnosisCode())}
              />
              <Button type="button" onClick={addDiagnosisCode} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.diagnosisCodes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.diagnosisCodes.map((code, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {code}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => removeDiagnosisCode(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatmentPlan">Treatment Plan</Label>
            <Textarea
              id="treatmentPlan"
              value={formData.treatmentPlan}
              onChange={(e) => setFormData(prev => ({ ...prev, treatmentPlan: e.target.value }))}
              rows={3}
              placeholder="Recommended treatment plan and medications..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="followUpNotes">Follow-up Notes</Label>
            <Textarea
              id="followUpNotes"
              value={formData.followUpNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, followUpNotes: e.target.value }))}
              rows={2}
              placeholder="Follow-up instructions and next appointment recommendations..."
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
                "Create Record"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}