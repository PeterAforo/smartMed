import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Code, Key } from "lucide-react";

interface CreateApiEndpointDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateApiEndpointDialog = ({ open, onOpenChange }: CreateApiEndpointDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    method: '',
    endpoint: '',
    description: '',
    version: 'v1',
    requiresAuth: true,
    rateLimit: '',
    category: '',
    parameters: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "API Endpoint Created",
      description: `Endpoint "${formData.method} ${formData.endpoint}" has been created successfully.`
    });
    
    // Reset form
    setFormData({
      name: '',
      method: '',
      endpoint: '',
      description: '',
      version: 'v1',
      requiresAuth: true,
      rateLimit: '',
      category: '',
      parameters: ''
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Create API Endpoint
          </DialogTitle>
          <DialogDescription>
            Define a new REST API endpoint for external integrations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Endpoint Name</Label>
            <Input
              id="name"
              placeholder="e.g., Get Patient List"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="method">HTTP Method</Label>
              <Select value={formData.method} onValueChange={(value) => setFormData({ ...formData, method: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">API Version</Label>
              <Select value={formData.version} onValueChange={(value) => setFormData({ ...formData, version: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1">v1</SelectItem>
                  <SelectItem value="v2">v2</SelectItem>
                  <SelectItem value="v3">v3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint Path</Label>
            <Input
              id="endpoint"
              placeholder="/api/v1/patients"
              value={formData.endpoint}
              onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patients">Patients</SelectItem>
                  <SelectItem value="appointments">Appointments</SelectItem>
                  <SelectItem value="medical-records">Medical Records</SelectItem>
                  <SelectItem value="prescriptions">Prescriptions</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rateLimit">Rate Limit (requests/minute)</Label>
              <Input
                id="rateLimit"
                type="number"
                placeholder="1000"
                value={formData.rateLimit}
                onChange={(e) => setFormData({ ...formData, rateLimit: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this endpoint does and its intended use..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parameters">Parameters (JSON format)</Label>
            <Textarea
              id="parameters"
              placeholder='{"page": {"type": "integer", "required": false}, "limit": {"type": "integer", "required": false}}'
              value={formData.parameters}
              onChange={(e) => setFormData({ ...formData, parameters: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="requiresAuth"
              checked={formData.requiresAuth}
              onCheckedChange={(checked) => setFormData({ ...formData, requiresAuth: checked as boolean })}
            />
            <Label htmlFor="requiresAuth" className="text-sm">Requires Authentication</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Key className="mr-2 h-4 w-4" />
              Create Endpoint
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};