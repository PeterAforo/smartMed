import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Plus, 
  Bell,
  Target,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Automation rule types
const TRIGGER_TYPES = [
  { value: 'patient_admission', label: 'Patient Admission' },
  { value: 'appointment_scheduled', label: 'Appointment Scheduled' },
  { value: 'lab_result_critical', label: 'Critical Lab Result' },
  { value: 'medication_due', label: 'Medication Due' },
  { value: 'follow_up_required', label: 'Follow-up Required' },
  { value: 'workflow_overdue', label: 'Workflow Overdue' },
];

const ACTION_TYPES = [
  { value: 'start_workflow', label: 'Start Workflow' },
  { value: 'send_notification', label: 'Send Notification' },
  { value: 'assign_task', label: 'Assign Task' },
  { value: 'escalate_priority', label: 'Escalate Priority' },
  { value: 'schedule_appointment', label: 'Schedule Appointment' },
  { value: 'update_status', label: 'Update Status' },
];

interface WorkflowAutomationProps {
  workflowId?: string;
}

const WorkflowAutomation: React.FC<WorkflowAutomationProps> = ({ workflowId }) => {
  const { profile, currentBranch } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    trigger_type: '',
    trigger_conditions: {},
    action_type: '',
    action_parameters: {},
    is_active: true,
  });

  // Fetch automation rules
  const { data: automationRules, isLoading } = useQuery({
    queryKey: ['workflow-automation-rules', currentBranch?.id, workflowId],
    queryFn: async () => {
      if (!profile?.tenant_id) return [];

      let query = supabase
        .from('workflow_automation_rules')
        .select('*')
        .eq('tenant_id', profile.tenant_id);

      if (currentBranch?.id) {
        query = query.eq('branch_id', currentBranch.id);
      }

      if (workflowId) {
        query = query.eq('workflow_id', workflowId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.tenant_id
  });

  // Fetch SLA configurations
  const { data: slaConfigs } = useQuery({
    queryKey: ['workflow-sla-configs', currentBranch?.id],
    queryFn: async () => {
      if (!profile?.tenant_id) return [];

      const { data, error } = await supabase
        .from('workflow_sla_configs')
        .select('*')
        .eq('tenant_id', profile.tenant_id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.tenant_id
  });

  // Create automation rule mutation
  const createRuleMutation = useMutation({
    mutationFn: async (ruleData: any) => {
      if (!profile?.tenant_id || !currentBranch?.id) throw new Error('Missing tenant or branch');

      const { data, error } = await supabase
        .from('workflow_automation_rules')
        .insert({
          ...ruleData,
          tenant_id: profile.tenant_id,
          branch_id: currentBranch.id,
          created_by: profile.user_id,
          workflow_id: workflowId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Automation rule created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['workflow-automation-rules'] });
      setIsCreatingRule(false);
      setNewRule({
        name: '',
        trigger_type: '',
        trigger_conditions: {},
        action_type: '',
        action_parameters: {},
        is_active: true,
      });
    },
    onError: (error) => {
      console.error('Error creating automation rule:', error);
      toast({
        title: "Error",
        description: "Failed to create automation rule.",
        variant: "destructive",
      });
    }
  });

  // Toggle rule status mutation
  const toggleRuleMutation = useMutation({
    mutationFn: async ({ ruleId, isActive }: { ruleId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('workflow_automation_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-automation-rules'] });
    }
  });

  const handleCreateRule = () => {
    createRuleMutation.mutate(newRule);
  };

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary';
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'patient_admission': return Target;
      case 'lab_result_critical': return AlertTriangle;
      case 'workflow_overdue': return Clock;
      default: return Zap;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workflow Automation</CardTitle>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Workflow Automation</h2>
        <Dialog open={isCreatingRule} onOpenChange={setIsCreatingRule}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Automation Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ruleName">Rule Name</Label>
                <Input
                  id="ruleName"
                  value={newRule.name}
                  onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter rule name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="triggerType">Trigger</Label>
                  <Select
                    value={newRule.trigger_type}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, trigger_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIGGER_TYPES.map((trigger) => (
                        <SelectItem key={trigger.value} value={trigger.value}>
                          {trigger.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="actionType">Action</Label>
                  <Select
                    value={newRule.action_type}
                    onValueChange={(value) => setNewRule(prev => ({ ...prev, action_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ruleActive"
                  checked={newRule.is_active}
                  onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="ruleActive">Enable rule immediately</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreatingRule(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRule}
                  disabled={!newRule.name || !newRule.trigger_type || !newRule.action_type || createRuleMutation.isPending}
                >
                  Create Rule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="sla">SLA Management</TabsTrigger>
          <TabsTrigger value="triggers">Smart Triggers</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-4">
            {automationRules?.map((rule) => {
              const TriggerIcon = getTriggerIcon(rule.trigger_type);
              
              return (
                <Card key={rule.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <TriggerIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{rule.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {TRIGGER_TYPES.find(t => t.value === rule.trigger_type)?.label}
                            </Badge>
                            <Badge variant="secondary">
                              {ACTION_TYPES.find(a => a.value === rule.action_type)?.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(rule.is_active)}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={(checked) => 
                            toggleRuleMutation.mutate({ ruleId: rule.id, isActive: checked })
                          }
                        />
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      When <strong>{TRIGGER_TYPES.find(t => t.value === rule.trigger_type)?.label}</strong> occurs,
                      automatically <strong>{ACTION_TYPES.find(a => a.value === rule.action_type)?.label}</strong>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {!automationRules?.length && (
              <Card>
                <CardContent className="text-center py-8">
                  <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Automation Rules</h3>
                  <p className="text-muted-foreground mb-4">
                    Create automation rules to streamline your workflows
                  </p>
                  <Button onClick={() => setIsCreatingRule(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Rule
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sla" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SLA Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Standard SLA</span>
                    </div>
                    <div className="text-2xl font-bold">24 hours</div>
                    <div className="text-sm text-muted-foreground">Default workflow completion time</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Critical SLA</span>
                    </div>
                    <div className="text-2xl font-bold">4 hours</div>
                    <div className="text-sm text-muted-foreground">High priority workflow completion</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">SLA Monitoring</h4>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Automatic Escalation</div>
                      <div className="text-xs text-muted-foreground">
                        Escalate to supervisor when SLA is breached
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Email Notifications</div>
                      <div className="text-xs text-muted-foreground">
                        Send alerts 1 hour before SLA breach
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Smart Triggers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Bell className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Patient Flow Optimization</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Automatically adjusts workflow priorities based on patient queue length
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Triggered when queue exceeds 10 patients
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Resource Allocation</span>
                      <Badge variant="secondary">Inactive</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Dynamically assigns staff based on workload and availability
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Triggered when staff utilization exceeds 80%
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Filter className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">Quality Assurance</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Initiates quality checks for high-risk procedures
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Triggered for surgical and critical care workflows
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowAutomation;