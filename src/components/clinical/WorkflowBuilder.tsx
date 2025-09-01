import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
} from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Save, Settings, Trash2 } from 'lucide-react';
import '@xyflow/react/dist/style.css';

// Custom Node Components
const WorkflowStepNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="flex flex-col">
        <div className="font-bold text-sm">{data.label}</div>
        <div className="text-xs text-gray-500">{data.role}</div>
        <div className="text-xs text-gray-400">{data.duration}min</div>
        {data.required && (
          <Badge variant="destructive" className="mt-1 w-fit">
            Required
          </Badge>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

const DecisionNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-yellow-100 border-2 border-yellow-300 min-w-[180px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="flex flex-col items-center">
        <div className="font-bold text-sm">{data.label}</div>
        <div className="text-xs text-gray-500">{data.condition}</div>
      </div>
      <Handle type="source" position={Position.Left} className="w-3 h-3" />
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
};

const StartNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-full bg-green-100 border-2 border-green-300 min-w-[120px] text-center">
      <div className="font-bold text-sm">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

const EndNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-full bg-red-100 border-2 border-red-300 min-w-[120px] text-center">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="font-bold text-sm">{data.label}</div>
    </div>
  );
};

const nodeTypes = {
  workflowStep: WorkflowStepNode,
  decision: DecisionNode,
  start: StartNode,
  end: EndNode,
};

interface WorkflowBuilderProps {
  onSave?: (workflow: any) => void;
  initialWorkflow?: any;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ onSave, initialWorkflow }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: '1',
      type: 'start',
      position: { x: 400, y: 50 },
      data: { label: 'Start Workflow' },
    },
  ]);
  
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [workflowDetails, setWorkflowDetails] = useState({
    name: initialWorkflow?.name || '',
    description: initialWorkflow?.description || '',
    type: initialWorkflow?.type || 'custom',
  });

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addWorkflowStep = () => {
    const newNode = {
      id: `step-${Date.now()}`,
      type: 'workflowStep' as const,
      position: { x: Math.random() * 400 + 200, y: Math.random() * 300 + 200 },
      data: {
        label: 'New Step',
        role: 'nurse',
        duration: 10,
        required: true,
        instructions: '',
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addDecisionNode = () => {
    const newNode = {
      id: `decision-${Date.now()}`,
      type: 'decision' as const,
      position: { x: Math.random() * 400 + 200, y: Math.random() * 300 + 200 },
      data: {
        label: 'Decision Point',
        condition: 'Condition',
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addEndNode = () => {
    const newNode = {
      id: `end-${Date.now()}`,
      type: 'end' as const,
      position: { x: Math.random() * 400 + 200, y: Math.random() * 300 + 400 },
      data: {
        label: 'End Workflow',
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  };

  const updateNodeData = (nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  };

  const saveWorkflow = () => {
    const workflowData = {
      ...workflowDetails,
      nodes,
      edges,
      steps: nodes
        .filter(node => node.type === 'workflowStep')
        .map((node, index) => ({
          name: (node.data as any).label,
          order: index + 1,
          role: (node.data as any).role,
          duration: (node.data as any).duration,
          required: (node.data as any).required,
          instructions: (node.data as any).instructions,
        })),
    };
    
    onSave?.(workflowData);
  };

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node);
    setIsEditingNode(true);
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 border-r bg-background p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workflow Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="workflowName">Name</Label>
              <Input
                id="workflowName"
                value={workflowDetails.name}
                onChange={(e) => setWorkflowDetails(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                placeholder="Workflow name"
              />
            </div>
            <div>
              <Label htmlFor="workflowDescription">Description</Label>
              <Textarea
                id="workflowDescription"
                value={workflowDetails.description}
                onChange={(e) => setWorkflowDetails(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Workflow description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="workflowType">Type</Label>
              <Select
                value={workflowDetails.type}
                onValueChange={(value) => setWorkflowDetails(prev => ({
                  ...prev,
                  type: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={addWorkflowStep} className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Workflow Step
            </Button>
            <Button onClick={addDecisionNode} variant="outline" className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Decision Point
            </Button>
            <Button onClick={addEndNode} variant="outline" className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              End Node
            </Button>
          </CardContent>
        </Card>

        <Button onClick={saveWorkflow} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Workflow
        </Button>
      </div>

      {/* Main Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          style={{ backgroundColor: '#f8fafc' }}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      {/* Node Edit Dialog */}
      <Dialog open={isEditingNode} onOpenChange={setIsEditingNode}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Node</DialogTitle>
          </DialogHeader>
          {selectedNode && (
            <div className="space-y-4">
              {selectedNode.type === 'workflowStep' && (
                <>
                  <div>
                    <Label htmlFor="stepName">Step Name</Label>
                    <Input
                      id="stepName"
                      value={(selectedNode.data as any).label || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stepRole">Assigned Role</Label>
                    <Select
                      value={(selectedNode.data as any).role || ''}
                      onValueChange={(value) => updateNodeData(selectedNode.id, { role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="nurse">Nurse</SelectItem>
                        <SelectItem value="receptionist">Receptionist</SelectItem>
                        <SelectItem value="pharmacist">Pharmacist</SelectItem>
                        <SelectItem value="radiologist">Radiologist</SelectItem>
                        <SelectItem value="lab_tech">Lab Technician</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="stepDuration">Duration (minutes)</Label>
                    <Input
                      id="stepDuration"
                      type="number"
                      value={(selectedNode.data as any).duration || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, { duration: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stepInstructions">Instructions</Label>
                    <Textarea
                      id="stepInstructions"
                      value={(selectedNode.data as any).instructions || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, { instructions: e.target.value })}
                      rows={3}
                    />
                  </div>
                </>
              )}
              
              {selectedNode.type === 'decision' && (
                <>
                  <div>
                    <Label htmlFor="decisionLabel">Decision Label</Label>
                    <Input
                      id="decisionLabel"
                      value={(selectedNode.data as any).label || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="decisionCondition">Condition</Label>
                    <Input
                      id="decisionCondition"
                      value={(selectedNode.data as any).condition || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, { condition: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="flex justify-between">
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteNode(selectedNode.id);
                    setIsEditingNode(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button onClick={() => setIsEditingNode(false)}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowBuilder;