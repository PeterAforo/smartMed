import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Play, Pause, Settings, Clock, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowAutomationProps {
  workflowId?: string;
}

// Mock data for demonstration (will be replaced with real data once tables are properly set up)
const mockAutomationRules = [
  {
    id: '1',
    name: 'Patient Admission Auto-Start',
    description: 'Automatically start admission workflow when patient is registered',
    trigger_type: 'patient_admission',
    action_type: 'start_workflow',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Lab Results Notification',
    description: 'Send notification when lab results are available',
    trigger_type: 'lab_results_ready',
    action_type: 'send_notification',
    is_active: false,
    created_at: new Date().toISOString()
  }
];

const TRIGGER_TYPES = [
  { value: 'patient_admission', label: 'Patient Admission' },
  { value: 'appointment_scheduled', label: 'Appointment Scheduled' },
  { value: 'lab_results_ready', label: 'Lab Results Ready' },
  { value: 'medication_ordered', label: 'Medication Ordered' },
  { value: 'time_based', label: 'Time-based Trigger' }
];

const ACTION_TYPES = [
  { value: 'start_workflow', label: 'Start Workflow' },
  { value: 'send_notification', label: 'Send Notification' },
  { value: 'create_task', label: 'Create Task' },
  { value: 'escalate', label: 'Escalate' },
  { value: 'assign_staff', label: 'Assign Staff' }
];

const WorkflowAutomation: React.FC<WorkflowAutomationProps> = ({ workflowId }) => {
  const [automationRules, setAutomationRules] = useState(mockAutomationRules);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    trigger_type: '',
    action_type: '',
    is_active: true
  });

  const handleCreateRule = () => {
    if (!newRule.name || !newRule.trigger_type || !newRule.action_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    const rule = {
      id: Date.now().toString(),
      ...newRule,
      created_at: new Date().toISOString()
    };

    setAutomationRules(prev => [...prev, rule]);
    setNewRule({
      name: '',
      description: '',
      trigger_type: '',
      action_type: '',
      is_active: true
    });
    toast.success('Automation rule created successfully');
  };

  const toggleRuleStatus = (ruleId: string) => {
    setAutomationRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, is_active: !rule.is_active }
        : rule
    ));
    toast.success('Rule status updated');
  };

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary';
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'patient_admission': return Play;
      case 'time_based': return Clock;
      case 'lab_results_ready': return CheckCircle;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Automation</h2>
          <p className="text-muted-foreground">
            Configure automation rules and SLA monitoring for workflows
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Automation Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input
                  id="rule-name"
                  value={newRule.name}
                  onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter rule name"
                />
              </div>
              <div>
                <Label htmlFor="rule-description">Description</Label>
                <Textarea
                  id="rule-description"
                  value={newRule.description}
                  onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter rule description"
                />
              </div>
              <div>
                <Label htmlFor="trigger-type">Trigger Type</Label>
                <Select value={newRule.trigger_type} onValueChange={(value) => setNewRule(prev => ({ ...prev, trigger_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="action-type">Action Type</Label>
                <Select value={newRule.action_type} onValueChange={(value) => setNewRule(prev => ({ ...prev, action_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="rule-active"
                  checked={newRule.is_active}
                  onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="rule-active">Active</Label>
              </div>
              <Button onClick={handleCreateRule} className="w-full">
                Create Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="automation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="automation">Automation Rules</TabsTrigger>
          <TabsTrigger value="sla">SLA Management</TabsTrigger>
          <TabsTrigger value="triggers">Smart Triggers</TabsTrigger>
        </TabsList>

        <TabsContent value="automation" className="space-y-4">
          {automationRules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Automation Rules</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first automation rule to streamline workflow processes
                </p>
                <Button>Create First Rule</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {automationRules.map((rule) => {
                const TriggerIcon = getTriggerIcon(rule.trigger_type);
                return (
                  <Card key={rule.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <TriggerIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{rule.name}</h3>
                            <p className="text-sm text-muted-foreground">{rule.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline">
                                {TRIGGER_TYPES.find(t => t.value === rule.trigger_type)?.label}
                              </Badge>
                              <Badge variant="outline">
                                {ACTION_TYPES.find(a => a.value === rule.action_type)?.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusBadgeVariant(rule.is_active)}>
                            {rule.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Switch
                            checked={rule.is_active}
                            onCheckedChange={() => toggleRuleStatus(rule.id)}
                          />
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sla" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Emergency Admission SLA</span>
                  <Badge variant="default">Active</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Target Duration</Label>
                    <p className="text-2xl font-bold">2h</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Warning Threshold</Label>
                    <p className="text-2xl font-bold">1h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Discharge Planning SLA</span>
                  <Badge variant="default">Active</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Target Duration</Label>
                    <p className="text-2xl font-bold">24h</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Warning Threshold</Label>
                    <p className="text-2xl font-bold">20h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Patient Wait Time Monitor</span>
                  <Badge variant="default">Active</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automatically escalates when patient wait time exceeds 30 minutes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Critical Lab Results Alert</span>
                  <Badge variant="secondary">Inactive</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sends immediate notifications for critical lab result values
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Medication Interaction Check</span>
                  <Badge variant="default">Active</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Validates medication orders against patient allergies and interactions
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowAutomation;