import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Calendar } from "lucide-react";

interface GenerateAuditReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GenerateAuditReportDialog = ({ open, onOpenChange }: GenerateAuditReportDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    reportType: '',
    dateRange: '',
    startDate: '',
    endDate: '',
    category: '',
    format: 'pdf',
    includeCharts: true,
    recipients: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Audit Report Generation Started",
      description: `${formData.reportType} report is being generated. You will be notified when complete.`
    });
    
    // Reset form
    setFormData({
      reportType: '',
      dateRange: '',
      startDate: '',
      endDate: '',
      category: '',
      format: 'pdf',
      includeCharts: true,
      recipients: ''
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Audit Report
          </DialogTitle>
          <DialogDescription>
            Create a comprehensive audit report with customizable parameters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select value={formData.reportType} onValueChange={(value) => setFormData({ ...formData, reportType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="security-summary">Security Summary</SelectItem>
                <SelectItem value="compliance-report">Compliance Report</SelectItem>
                <SelectItem value="user-activity">User Activity Report</SelectItem>
                <SelectItem value="data-access">Data Access Report</SelectItem>
                <SelectItem value="failed-logins">Failed Login Analysis</SelectItem>
                <SelectItem value="comprehensive">Comprehensive Audit Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={formData.dateRange} onValueChange={(value) => setFormData({ ...formData, dateRange: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category Filter</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="data_access">Data Access</SelectItem>
                  <SelectItem value="data_modification">Data Modification</SelectItem>
                  <SelectItem value="security_event">Security Events</SelectItem>
                  <SelectItem value="clinical_action">Clinical Actions</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required={formData.dateRange === 'custom'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required={formData.dateRange === 'custom'}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="format">Output Format</Label>
            <Select value={formData.format} onValueChange={(value) => setFormData({ ...formData, format: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel (XLSX)</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipients">Email Recipients (Optional)</Label>
            <Textarea
              id="recipients"
              placeholder="Enter email addresses separated by commas"
              value={formData.recipients}
              onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Calendar className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};