import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Database, Calendar } from "lucide-react";

interface CreateBackupJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateBackupJobDialog = ({ open, onOpenChange }: CreateBackupJobDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    source: '',
    destination: '',
    type: '',
    schedule: '',
    retentionPeriod: '',
    compression: false,
    encryption: false,
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Backup Job Created",
      description: `Backup job "${formData.name}" has been created successfully.`
    });
    
    // Reset form
    setFormData({
      name: '',
      source: '',
      destination: '',
      type: '',
      schedule: '',
      retentionPeriod: '',
      compression: false,
      encryption: false,
      description: ''
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Create New Backup Job
          </DialogTitle>
          <DialogDescription>
            Configure a new backup job for your data protection needs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Job Name</Label>
              <Input
                id="name"
                placeholder="e.g., Daily Patient Records Backup"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Backup Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select backup type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automated">Automated</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="incremental">Incremental</SelectItem>
                  <SelectItem value="differential">Differential</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient-database">Patient Database</SelectItem>
                  <SelectItem value="ehr-system">EHR System</SelectItem>
                  <SelectItem value="pacs-system">PACS System</SelectItem>
                  <SelectItem value="system-config">System Configuration</SelectItem>
                  <SelectItem value="user-data">User Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Select value={formData.destination} onValueChange={(value) => setFormData({ ...formData, destination: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aws-s3">AWS S3 - Primary</SelectItem>
                  <SelectItem value="local-nas">Local NAS Storage</SelectItem>
                  <SelectItem value="google-cloud">Google Cloud Storage</SelectItem>
                  <SelectItem value="offsite-tape">Offsite Tape Storage</SelectItem>
                  <SelectItem value="azure-blob">Azure Blob Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule</Label>
              <Select value={formData.schedule} onValueChange={(value) => setFormData({ ...formData, schedule: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="retention">Retention Period</Label>
              <Select value={formData.retentionPeriod} onValueChange={(value) => setFormData({ ...formData, retentionPeriod: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select retention" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30-days">30 Days</SelectItem>
                  <SelectItem value="90-days">90 Days</SelectItem>
                  <SelectItem value="1-year">1 Year</SelectItem>
                  <SelectItem value="5-years">5 Years</SelectItem>
                  <SelectItem value="7-years">7 Years</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Options</Label>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="compression"
                  checked={formData.compression}
                  onCheckedChange={(checked) => setFormData({ ...formData, compression: checked as boolean })}
                />
                <Label htmlFor="compression" className="text-sm">Enable Compression</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="encryption"
                  checked={formData.encryption}
                  onCheckedChange={(checked) => setFormData({ ...formData, encryption: checked as boolean })}
                />
                <Label htmlFor="encryption" className="text-sm">Enable Encryption</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter backup job description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Calendar className="mr-2 h-4 w-4" />
              Create Backup Job
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};