import { useState } from "react"
import { Plus, Edit, Trash2, Clock, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

interface AppointmentTemplate {
  id: string
  template_name: string
  appointment_type: string
  duration_minutes: number
  description?: string
  default_instructions?: string
  color_code: string
  is_active: boolean
}

interface TemplateFormData {
  template_name: string
  appointment_type: string
  duration_minutes: number
  description: string
  default_instructions: string
  color_code: string
}

export default function AppointmentTemplateManager() {
  const { currentBranch, tenant } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<AppointmentTemplate | null>(null)
  const [formData, setFormData] = useState<TemplateFormData>({
    template_name: '',
    appointment_type: 'consultation',
    duration_minutes: 30,
    description: '',
    default_instructions: '',
    color_code: '#3B82F6'
  })

  const { data: templates, isLoading } = useQuery({
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

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: TemplateFormData) => {
      if (!currentBranch || !tenant) throw new Error('Branch or tenant not found')
      
      const { error } = await supabase
        .from('appointment_templates')
        .insert([{
          ...templateData,
          tenant_id: tenant.id,
          branch_id: currentBranch.id
        }])
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-templates'] })
      toast({
        title: "Template Created",
        description: "Appointment template created successfully"
      })
      setShowNewTemplateDialog(false)
      resetForm()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive"
      })
    }
  })

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<TemplateFormData> }) => {
      const { error } = await supabase
        .from('appointment_templates')
        .update(data)
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-templates'] })
      toast({
        title: "Template Updated",
        description: "Appointment template updated successfully"
      })
      setEditingTemplate(null)
      resetForm()
    }
  })

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointment_templates')
        .update({ is_active: false })
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-templates'] })
      toast({
        title: "Template Deleted",
        description: "Appointment template deleted successfully"
      })
    }
  })

  const resetForm = () => {
    setFormData({
      template_name: '',
      appointment_type: 'consultation',
      duration_minutes: 30,
      description: '',
      default_instructions: '',
      color_code: '#3B82F6'
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data: formData })
    } else {
      createTemplateMutation.mutate(formData)
    }
  }

  const startEdit = (template: AppointmentTemplate) => {
    setEditingTemplate(template)
    setFormData({
      template_name: template.template_name,
      appointment_type: template.appointment_type,
      duration_minutes: template.duration_minutes,
      description: template.description || '',
      default_instructions: template.default_instructions || '',
      color_code: template.color_code
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Appointment Templates</h2>
          <p className="text-muted-foreground">Manage reusable appointment templates</p>
        </div>
        <Dialog open={showNewTemplateDialog || !!editingTemplate} onOpenChange={(open) => {
          if (!open) {
            setShowNewTemplateDialog(false)
            setEditingTemplate(null)
            resetForm()
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowNewTemplateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template_name">Template Name</Label>
                  <Input
                    id="template_name"
                    value={formData.template_name}
                    onChange={(e) => setFormData({...formData, template_name: e.target.value})}
                    placeholder="e.g., Standard Consultation"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment_type">Type</Label>
                  <Select 
                    value={formData.appointment_type} 
                    onValueChange={(value) => setFormData({...formData, appointment_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value) || 30})}
                    min="5"
                    max="480"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color_code">Color</Label>
                  <Input
                    id="color_code"
                    type="color"
                    value={formData.color_code}
                    onChange={(e) => setFormData({...formData, color_code: e.target.value})}
                    className="h-10 w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of this appointment type"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default_instructions">Default Instructions</Label>
                <Textarea
                  id="default_instructions"
                  value={formData.default_instructions}
                  onChange={(e) => setFormData({...formData, default_instructions: e.target.value})}
                  placeholder="Default instructions for this appointment type"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowNewTemplateDialog(false)
                    setEditingTemplate(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                >
                  {editingTemplate ? 'Update' : 'Create'} Template
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates?.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: template.color_code }}
                    />
                    <CardTitle className="text-lg">{template.template_name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => startEdit(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteTemplateMutation.mutate(template.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    <Stethoscope className="h-3 w-3 mr-1" />
                    {template.appointment_type}
                  </Badge>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {template.duration_minutes}m
                  </Badge>
                </div>
                
                {template.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                )}
                
                {template.default_instructions && (
                  <div className="text-xs text-muted-foreground">
                    <strong>Instructions:</strong> {template.default_instructions.slice(0, 100)}
                    {template.default_instructions.length > 100 && '...'}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}