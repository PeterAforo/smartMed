import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, CheckCircle, Clock, User, AlertCircle, Plus, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import WorkflowTemplateLibrary from './WorkflowTemplateLibrary';
import WorkflowBuilder from './WorkflowBuilder';
import WorkflowAnalytics from './WorkflowAnalytics';
import WorkflowAutomation from './WorkflowAutomation';

interface ClinicalWorkflowEngineProps {
  patientId?: string;
}

interface WorkflowInstanceWithRelations {
  id: string;
  workflow_id: string;
  patient_id: string;
  status: string;
  priority: number;
  current_step: number;
  started_at: string;
  workflow?: {
    id: string;
    workflow_name: string;
    workflow_type: string;
    steps: any[];
  };
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    patient_number: string;
  };
}

interface WorkflowTaskWithRelations {
  id: string;
  task_name: string;
  description: string;
  status: string;
  due_date?: string;
  workflow_instance_id: string;
  workflow_instance?: {
    id: string;
    workflow_id: string;
    patient_id: string;
    workflow?: {
      id: string;
      workflow_name: string;
    };
    patient?: {
      id: string;
      first_name: string;
      last_name: string;
      patient_number: string;
    };
  };
}

const ClinicalWorkflowEngine: React.FC<ClinicalWorkflowEngineProps> = ({ patientId }) => {
  const { profile, currentBranch } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  // Fetch available workflows
  const { data: workflows, isLoading: workflowsLoading } = useQuery({
    queryKey: ['clinical-workflows', currentBranch?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinical_workflows')
        .select('*')
        .eq('tenant_id', profile?.tenant_id)
        .eq('is_active', true)
        .order('workflow_name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id
  });

  // Fetch active workflow instances
  const { data: workflowInstances, isLoading: instancesLoading } = useQuery({
    queryKey: ['workflow-instances', currentBranch?.id, patientId],
    queryFn: async () => {
      let query = supabase
        .from('workflow_instances')
        .select('*')
        .eq('tenant_id', profile?.tenant_id)
        .in('status', ['active', 'paused'])
        .order('created_at', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      if (currentBranch?.id) {
        query = query.eq('branch_id', currentBranch.id);
      }

      const { data: instances, error } = await query;
      if (error) throw error;

      // Fetch related data separately
      if (instances && instances.length > 0) {
        const workflowIds = [...new Set(instances.map(i => i.workflow_id))];
        const patientIds = [...new Set(instances.map(i => i.patient_id))];

        const [workflowsData, patientsData] = await Promise.all([
          supabase.from('clinical_workflows').select('id, workflow_name, workflow_type, steps').in('id', workflowIds),
          supabase.from('patients').select('id, first_name, last_name, patient_number').in('id', patientIds)
        ]);

        return instances.map(instance => ({
          ...instance,
          workflow: workflowsData.data?.find(w => w.id === instance.workflow_id),
          patient: patientsData.data?.find(p => p.id === instance.patient_id)
        })) as WorkflowInstanceWithRelations[];
      }

      return instances || [];
    },
    enabled: !!profile?.tenant_id
  });

  // Fetch workflow tasks
  const { data: workflowTasks } = useQuery({
    queryKey: ['workflow-tasks', currentBranch?.id],
    queryFn: async () => {
      const { data: tasks, error } = await supabase
        .from('workflow_tasks')
        .select('*')
        .eq('tenant_id', profile?.tenant_id)
        .in('status', ['pending', 'in_progress'])
        .order('due_date', { ascending: true });
      
      if (error) throw error;

      // Fetch related data separately
      if (tasks && tasks.length > 0) {
        const instanceIds = [...new Set(tasks.map(t => t.workflow_instance_id))];
        
        const { data: instances } = await supabase
          .from('workflow_instances')
          .select('id, workflow_id, patient_id')
          .in('id', instanceIds);

        if (instances && instances.length > 0) {
          const workflowIds = [...new Set(instances.map(i => i.workflow_id))];
          const patientIds = [...new Set(instances.map(i => i.patient_id))];

          const [workflowsData, patientsData] = await Promise.all([
            supabase.from('clinical_workflows').select('id, workflow_name').in('id', workflowIds),
            supabase.from('patients').select('id, first_name, last_name, patient_number').in('id', patientIds)
          ]);

          return tasks.map(task => {
            const instance = instances.find(i => i.id === task.workflow_instance_id);
            return {
              ...task,
              workflow_instance: {
                ...instance,
                workflow: workflowsData.data?.find(w => w.id === instance?.workflow_id),
                patient: patientsData.data?.find(p => p.id === instance?.patient_id)
              }
            };
          }) as WorkflowTaskWithRelations[];
        }
      }

      return tasks || [];
    },
    enabled: !!profile?.tenant_id
  });

  // Start workflow mutation
  const startWorkflowMutation = useMutation({
    mutationFn: async ({ workflowId, patientId }: { workflowId: string; patientId: string }) => {
      if (!profile?.tenant_id || !currentBranch?.id) throw new Error('Missing tenant or branch');

      const { data, error } = await supabase
        .from('workflow_instances')
        .insert({
          workflow_id: workflowId,
          patient_id: patientId,
          tenant_id: profile.tenant_id,
          branch_id: currentBranch.id,
          assigned_to: profile.user_id,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workflow started successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] });
    },
    onError: (error) => {
      console.error('Error starting workflow:', error);
      toast({
        title: "Error",
        description: "Failed to start workflow. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update workflow status mutation
  const updateWorkflowMutation = useMutation({
    mutationFn: async ({ instanceId, status }: { instanceId: string; status: string }) => {
      const updateData: any = { status };
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('workflow_instances')
        .update(updateData)
        .eq('id', instanceId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workflow status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] });
    }
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status, notes }: { taskId: string; status: string; notes?: string }) => {
      const updateData: any = { status };
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = profile?.user_id;
        updateData.completion_notes = notes;
      }

      const { error } = await supabase
        .from('workflow_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['workflow-tasks'] });
    }
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'paused': return 'outline';
      case 'cancelled': return 'destructive';
      case 'pending': return 'outline';
      case 'in_progress': return 'default';
      case 'overdue': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: number) => {
    if (priority <= 2) return 'destructive';
    if (priority <= 3) return 'default';
    return 'secondary';
  };

  const calculateProgress = (instance: WorkflowInstanceWithRelations) => {
    if (!instance.workflow?.steps || !Array.isArray(instance.workflow.steps)) return 0;
    const totalSteps = instance.workflow.steps.length;
    const currentStep = instance.current_step || 0;
    return Math.round((currentStep / totalSteps) * 100);
  };

  if (workflowsLoading || instancesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clinical Workflow Engine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Clinical Workflow Engine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Workflows</TabsTrigger>
            <TabsTrigger value="tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Active Workflows</h3>
              <StartWorkflowDialog workflows={workflows} />
            </div>
            <ScrollArea className="h-[450px]">
              <div className="space-y-4">
                {workflowInstances?.map((instance) => (
                  <div key={instance.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{instance.workflow?.workflow_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Patient: {instance.patient?.first_name} {instance.patient?.last_name} 
                          ({instance.patient?.patient_number})
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(instance.status)}>
                          {instance.status}
                        </Badge>
                        <Badge variant={getPriorityBadgeVariant(instance.priority)}>
                          Priority {instance.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{calculateProgress(instance)}%</span>
                      </div>
                      <Progress value={calculateProgress(instance)} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Started: {format(new Date(instance.started_at), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex gap-2">
                        {instance.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateWorkflowMutation.mutate({
                              instanceId: instance.id,
                              status: 'paused'
                            })}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        )}
                        {instance.status === 'paused' && (
                          <Button
                            size="sm"
                            onClick={() => updateWorkflowMutation.mutate({
                              instanceId: instance.id,
                              status: 'active'
                            })}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateWorkflowMutation.mutate({
                            instanceId: instance.id,
                            status: 'completed'
                          })}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {!workflowInstances?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    No active workflows found.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {workflowTasks?.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{task.task_name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(task.status)}>
                          {task.status}
                        </Badge>
                        {task.due_date && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(task.due_date), 'MMM dd')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {task.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Workflow: {task.workflow_instance?.workflow?.workflow_name}
                        <br />
                        Patient: {task.workflow_instance?.patient?.first_name} {task.workflow_instance?.patient?.last_name}
                      </div>
                      <div className="flex gap-2">
                        {task.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => updateTaskMutation.mutate({
                              taskId: task.id,
                              status: 'in_progress'
                            })}
                          >
                            Start Task
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => updateTaskMutation.mutate({
                              taskId: task.id,
                              status: 'completed'
                            })}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {!workflowTasks?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending tasks found.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <ScrollArea className="h-[80vh]">
              <div className="space-y-6 pr-4">
                <WorkflowTemplateLibrary />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      My Custom Workflows
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CustomWorkflowsList workflows={workflows} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Workflow Builder</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WorkflowBuilder />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WorkflowAnalytics />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Automation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WorkflowAutomation />
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Start Workflow Dialog Component
const StartWorkflowDialog: React.FC<{ workflows?: any[] }> = ({ workflows }) => {
  const { profile, currentBranch } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch patients when dialog opens
  const fetchPatients = async () => {
    if (!profile?.tenant_id) return;
    
    const { data, error } = await supabase
      .from('patients')
      .select('id, first_name, last_name, patient_number')
      .eq('tenant_id', profile.tenant_id)
      .limit(50)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setPatients(data);
    }
  };

  const startWorkflowMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.tenant_id || !currentBranch?.id || !selectedWorkflow || !selectedPatient) {
        throw new Error('Missing required data');
      }

      const { data, error } = await supabase
        .from('workflow_instances')
        .insert({
          workflow_id: selectedWorkflow,
          patient_id: selectedPatient,
          tenant_id: profile.tenant_id,
          branch_id: currentBranch.id,
          assigned_to: profile.user_id,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workflow instance started successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] });
      setSelectedWorkflow('');
      setSelectedPatient('');
      setIsOpen(false);
    },
    onError: (error) => {
      console.error('Error starting workflow:', error);
      toast({
        title: "Error",
        description: "Failed to start workflow. Please try again.",
        variant: "destructive",
      });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => { setIsOpen(true); fetchPatients(); }}>
          <Plus className="h-4 w-4 mr-2" />
          Start Workflow
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start New Workflow</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="workflow">Select Workflow</Label>
            <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a workflow" />
              </SelectTrigger>
              <SelectContent>
                {workflows?.map((workflow) => (
                  <SelectItem key={workflow.id} value={workflow.id}>
                    {workflow.workflow_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="patient">Select Patient</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a patient" />
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
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => startWorkflowMutation.mutate()}
              disabled={!selectedWorkflow || !selectedPatient || startWorkflowMutation.isPending}
            >
              Start Workflow
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Custom Workflows List Component
const CustomWorkflowsList: React.FC<{ workflows?: any[] }> = ({ workflows }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteWorkflowMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      const { error } = await supabase
        .from('clinical_workflows')
        .update({ is_active: false })
        .eq('id', workflowId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workflow deactivated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['clinical-workflows'] });
    }
  });

  if (!workflows?.length) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p>No custom workflows created yet.</p>
            <p className="text-sm mt-1">Use the templates above or create a custom workflow to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-3">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{workflow.workflow_name}</h4>
                  <p className="text-sm text-muted-foreground">{workflow.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{workflow.workflow_type}</Badge>
                    <Badge variant="secondary">
                      {Array.isArray(workflow.steps) ? workflow.steps.length : 0} steps
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteWorkflowMutation.mutate(workflow.id)}
                  >
                    Deactivate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ClinicalWorkflowEngine;