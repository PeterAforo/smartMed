import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, CheckCircle, Clock, User, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ClinicalWorkflowEngineProps {
  patientId?: string;
}

export const ClinicalWorkflowEngine: React.FC<ClinicalWorkflowEngineProps> = ({ patientId }) => {
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
        .select(`
          *,
          workflow:clinical_workflows(workflow_name, workflow_type),
          patient:patients(first_name, last_name, patient_number)
        `)
        .eq('tenant_id', profile?.tenant_id)
        .in('status', ['active', 'paused'])
        .order('created_at', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      if (currentBranch?.id) {
        query = query.eq('branch_id', currentBranch.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id
  });

  // Fetch workflow tasks
  const { data: workflowTasks } = useQuery({
    queryKey: ['workflow-tasks', currentBranch?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_tasks')
        .select(`
          *,
          workflow_instance:workflow_instances(
            patient:patients(first_name, last_name, patient_number),
            workflow:clinical_workflows(workflow_name)
          )
        `)
        .eq('tenant_id', profile?.tenant_id)
        .in('status', ['pending', 'in_progress'])
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data;
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

  const calculateProgress = (instance: any) => {
    if (!instance.workflow?.steps) return 0;
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
            <ScrollArea className="h-[500px]">
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
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {workflows?.map((workflow) => (
                  <div key={workflow.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{workflow.workflow_name}</h4>
                      <Badge variant="outline">{workflow.workflow_type}</Badge>
                    </div>
                    
                    {workflow.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {workflow.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {workflow.steps?.length || 0} steps
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (patientId) {
                            startWorkflowMutation.mutate({
                              workflowId: workflow.id,
                              patientId
                            });
                          } else {
                            toast({
                              title: "Patient Required",
                              description: "Please select a patient to start this workflow.",
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={!patientId}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start Workflow
                      </Button>
                    </div>
                  </div>
                ))}
                {!workflows?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No workflow templates available.</p>
                    <p className="text-sm">Contact your administrator to set up clinical workflows.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};