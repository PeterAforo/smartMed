import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Clock, Users, AlertTriangle, FileText, Stethoscope, Pill } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Pre-built workflow templates
const WORKFLOW_TEMPLATES = [
  {
    id: 'patient-admission',
    name: 'Patient Admission Workflow',
    type: 'admission',
    icon: Users,
    description: 'Complete patient admission process from registration to bed assignment',
    estimatedTime: '45-60 minutes',
    category: 'Inpatient',
    steps: [
      { name: 'Verify Patient Identity', duration: 5, role: 'receptionist', required: true },
      { name: 'Complete Registration Forms', duration: 10, role: 'receptionist', required: true },
      { name: 'Insurance Verification', duration: 15, role: 'billing', required: true },
      { name: 'Medical History Review', duration: 10, role: 'nurse', required: true },
      { name: 'Vital Signs Collection', duration: 10, role: 'nurse', required: true },
      { name: 'Physician Assessment', duration: 20, role: 'doctor', required: true },
      { name: 'Bed Assignment', duration: 5, role: 'nurse', required: true },
      { name: 'Admission Documentation', duration: 10, role: 'nurse', required: true }
    ]
  },
  {
    id: 'surgical-prep',
    name: 'Surgical Preparation Workflow',
    type: 'surgery',
    icon: Stethoscope,
    description: 'Pre-operative preparation and safety checks',
    estimatedTime: '90-120 minutes',
    category: 'Surgery',
    steps: [
      { name: 'Pre-operative Assessment', duration: 20, role: 'doctor', required: true },
      { name: 'Anesthesia Consultation', duration: 15, role: 'anesthesiologist', required: true },
      { name: 'Consent Forms', duration: 10, role: 'nurse', required: true },
      { name: 'NPO Verification', duration: 5, role: 'nurse', required: true },
      { name: 'Lab Results Review', duration: 10, role: 'doctor', required: true },
      { name: 'Site Marking', duration: 5, role: 'doctor', required: true },
      { name: 'Patient Preparation', duration: 30, role: 'nurse', required: true },
      { name: 'Safety Checklist', duration: 10, role: 'nurse', required: true }
    ]
  },
  {
    id: 'emergency-triage',
    name: 'Emergency Room Triage',
    type: 'emergency',
    icon: AlertTriangle,
    description: 'Rapid patient assessment and priority assignment',
    estimatedTime: '15-30 minutes',
    category: 'Emergency',
    steps: [
      { name: 'Initial Assessment', duration: 5, role: 'nurse', required: true },
      { name: 'Vital Signs Check', duration: 5, role: 'nurse', required: true },
      { name: 'Pain Assessment', duration: 3, role: 'nurse', required: true },
      { name: 'Triage Category Assignment', duration: 2, role: 'nurse', required: true },
      { name: 'Fast Track Screening', duration: 5, role: 'nurse', required: false },
      { name: 'Notification to Physician', duration: 2, role: 'nurse', required: true },
      { name: 'Patient Placement', duration: 3, role: 'nurse', required: true }
    ]
  },
  {
    id: 'discharge-planning',
    name: 'Discharge Planning Workflow',
    type: 'discharge',
    icon: FileText,
    description: 'Comprehensive patient discharge process',
    estimatedTime: '30-45 minutes',
    category: 'Inpatient',
    steps: [
      { name: 'Discharge Orders Review', duration: 10, role: 'doctor', required: true },
      { name: 'Medication Reconciliation', duration: 10, role: 'pharmacist', required: true },
      { name: 'Discharge Instructions', duration: 10, role: 'nurse', required: true },
      { name: 'Follow-up Appointments', duration: 5, role: 'receptionist', required: true },
      { name: 'Transportation Arrangements', duration: 5, role: 'nurse', required: false },
      { name: 'Final Documentation', duration: 10, role: 'nurse', required: true }
    ]
  },
  {
    id: 'medication-reconciliation',
    name: 'Medication Reconciliation',
    type: 'pharmacy',
    icon: Pill,
    description: 'Comprehensive medication review and reconciliation',
    estimatedTime: '20-30 minutes',
    category: 'Pharmacy',
    steps: [
      { name: 'Current Medications Review', duration: 10, role: 'pharmacist', required: true },
      { name: 'Drug Interaction Check', duration: 5, role: 'pharmacist', required: true },
      { name: 'Allergy Verification', duration: 3, role: 'pharmacist', required: true },
      { name: 'Dosage Verification', duration: 5, role: 'pharmacist', required: true },
      { name: 'Patient Education', duration: 10, role: 'pharmacist', required: true },
      { name: 'Documentation Update', duration: 5, role: 'pharmacist', required: true }
    ]
  }
];

interface WorkflowTemplateLibraryProps {
  onTemplateSelect?: (template: any) => void;
}

const WorkflowTemplateLibrary: React.FC<WorkflowTemplateLibraryProps> = ({ onTemplateSelect }) => {
  const { profile, currentBranch } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customWorkflow, setCustomWorkflow] = useState({
    name: '',
    description: '',
    type: 'custom',
    steps: []
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async (workflowData: any) => {
      if (!profile?.tenant_id || !currentBranch?.id) throw new Error('Missing tenant or branch');

      const { data, error } = await supabase
        .from('clinical_workflows')
        .insert({
          workflow_name: workflowData.name,
          workflow_type: workflowData.type,
          description: workflowData.description,
          steps: workflowData.steps,
          tenant_id: profile.tenant_id,
          branch_id: currentBranch.id,
          created_by: profile.user_id,
          conditions: workflowData.conditions || {},
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Workflow template created successfully');
      queryClient.invalidateQueries({ queryKey: ['clinical-workflows'] });
      setIsCustomizing(false);
      setSelectedTemplate(null);
    },
    onError: (error) => {
      console.error('Error creating workflow:', error);
      toast.error('Failed to create workflow template');
    }
  });

  const handleTemplateUse = (template: any) => {
    createWorkflowMutation.mutate({
      name: template.name,
      description: template.description,
      type: template.type,
      steps: template.steps.map((step: any, index: number) => ({
        ...step,
        order: index + 1,
        estimated_duration: step.duration
      }))
    });
  };

  const handleTemplateCustomize = (template: any) => {
    setCustomWorkflow({
      name: template.name,
      description: template.description,
      type: template.type,
      steps: template.steps
    });
    setIsCustomizing(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Emergency': return AlertTriangle;
      case 'Surgery': return Stethoscope;
      case 'Pharmacy': return Pill;
      case 'Inpatient': return Users;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Workflow Templates</h3>
        <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCustomizing(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Custom Workflow</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="workflowName">Workflow Name</Label>
                <Input
                  id="workflowName"
                  value={customWorkflow.name}
                  onChange={(e) => setCustomWorkflow(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  placeholder="Enter workflow name"
                />
              </div>
              <div>
                <Label htmlFor="workflowDescription">Description</Label>
                <Input
                  id="workflowDescription"
                  value={customWorkflow.description}
                  onChange={(e) => setCustomWorkflow(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  placeholder="Enter workflow description"
                />
              </div>
              <div>
                <Label htmlFor="workflowType">Type</Label>
                <Select
                  value={customWorkflow.type}
                  onValueChange={(value) => setCustomWorkflow(prev => ({
                    ...prev,
                    type: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select workflow type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admission">Admission</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                    <SelectItem value="discharge">Discharge</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCustomizing(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createWorkflowMutation.mutate(customWorkflow)}
                  disabled={!customWorkflow.name || createWorkflowMutation.isPending}
                >
                  Create Workflow
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="grid gap-4">
          {WORKFLOW_TEMPLATES.map((template) => {
            const IconComponent = template.icon;
            const CategoryIcon = getCategoryIcon(template.category);
            
            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <CategoryIcon className="h-3 w-3" />
                            {template.category}
                          </Badge>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {template.estimatedTime}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium">Steps ({template.steps.length})</h4>
                    <div className="space-y-1">
                      {template.steps.slice(0, 3).map((step, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>{step.name}</span>
                          <Badge variant="outline">{step.role}</Badge>
                          <Badge variant="secondary">{step.duration}min</Badge>
                        </div>
                      ))}
                      {template.steps.length > 3 && (
                        <div className="text-xs text-muted-foreground pl-3">
                          +{template.steps.length - 3} more steps
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleTemplateUse(template)}
                      disabled={createWorkflowMutation.isPending}
                    >
                      Use Template
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTemplateCustomize(template)}
                    >
                      Customize
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5" />
                            {template.name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">{template.description}</p>
                          <div>
                            <h4 className="font-medium mb-2">Workflow Steps</h4>
                            <div className="space-y-2">
                              {template.steps.map((step, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                      {index + 1}
                                    </div>
                                    <div>
                                      <div className="font-medium text-sm">{step.name}</div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline">{step.role}</Badge>
                                        <Badge variant="secondary">{step.duration} min</Badge>
                                        {step.required && (
                                          <Badge variant="destructive">Required</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default WorkflowTemplateLibrary;