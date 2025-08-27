import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { FileText, Download, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GenerateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GenerateReportDialog = ({ open, onOpenChange }: GenerateReportDialogProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateRange, setDateRange] = useState<{from?: Date; to?: Date}>({});
  const [formData, setFormData] = useState({
    reportType: '',
    format: 'pdf',
    includeSections: {
      summary: true,
      charts: true,
      detailedData: true,
      recommendations: false
    },
    filterBy: {
      department: '',
      dateRange: 'month',
      status: 'all'
    },
    customTitle: '',
    notes: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSectionToggle = (section: string) => {
    setFormData(prev => ({
      ...prev,
      includeSections: {
        ...prev.includeSections,
        [section]: !prev.includeSections[section as keyof typeof prev.includeSections]
      }
    }));
  };

  const handleFilterChange = (filter: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      filterBy: {
        ...prev.filterBy,
        [filter]: value
      }
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));

    toast({
      title: "Report Generated",
      description: `${formData.reportType} report has been generated successfully. Download will start automatically.`
    });

    setIsGenerating(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Custom Report
          </DialogTitle>
          <DialogDescription>
            Create a customized report with your preferred settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select value={formData.reportType} onValueChange={(value) => handleInputChange('reportType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="financial">Financial Report</SelectItem>
                <SelectItem value="patient-demographics">Patient Demographics</SelectItem>
                <SelectItem value="staff-performance">Staff Performance</SelectItem>
                <SelectItem value="appointment-analytics">Appointment Analytics</SelectItem>
                <SelectItem value="inventory-status">Inventory Status</SelectItem>
                <SelectItem value="quality-metrics">Quality Metrics</SelectItem>
                <SelectItem value="operational-summary">Operational Summary</SelectItem>
                <SelectItem value="custom">Custom Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label htmlFor="format">Output Format</Label>
            <Select value={formData.format} onValueChange={(value) => handleInputChange('format', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                <SelectItem value="csv">CSV Data</SelectItem>
                <SelectItem value="powerpoint">PowerPoint Presentation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-4">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quick Select</Label>
                <Select value={formData.filterBy.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department Filter</Label>
                <Select value={formData.filterBy.department} onValueChange={(value) => handleFilterChange('department', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                    <SelectItem value="radiology">Radiology</SelectItem>
                    <SelectItem value="laboratory">Laboratory</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Include Sections */}
          <div className="space-y-4">
            <Label>Include Sections</Label>
            <div className="space-y-2">
              {Object.entries(formData.includeSections).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={key}
                    checked={value}
                    onChange={() => handleSectionToggle(key)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={key} className="text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Options */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customTitle">Custom Report Title (Optional)</Label>
              <Input
                id="customTitle"
                value={formData.customTitle}
                onChange={(e) => handleInputChange('customTitle', e.target.value)}
                placeholder="Enter custom title for the report"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes or requirements for the report..."
                rows={3}
              />
            </div>
          </div>

          {/* Preview Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Report Summary</h4>
            <div className="text-sm space-y-1">
              <p><strong>Type:</strong> {formData.reportType || 'Not selected'}</p>
              <p><strong>Format:</strong> {formData.format.toUpperCase()}</p>
              <p><strong>Period:</strong> {formData.filterBy.dateRange}</p>
              <p><strong>Department:</strong> {formData.filterBy.department || 'All'}</p>
              <p><strong>Sections:</strong> {Object.values(formData.includeSections).filter(Boolean).length} included</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !formData.reportType}
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};