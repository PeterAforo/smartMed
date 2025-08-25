import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon, 
  Filter, 
  Share2, 
  Eye,
  Clock,
  BarChart3,
  PieChart,
  TrendingUp,
  Settings,
  Save,
  RefreshCw,
  Mail,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AdvancedReportingProps {
  onReportGenerated?: (reportId: string) => void;
}

export const AdvancedReporting: React.FC<AdvancedReportingProps> = ({ onReportGenerated }) => {
  const { profile, currentBranch } = useAuth();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState('');
  const [filterBy, setFilterBy] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for report templates and configurations
  const { data: reportTemplates } = useQuery({
    queryKey: ['report-templates', profile?.tenant_id],
    queryFn: async () => {
      return [
        {
          id: 'financial_summary',
          name: 'Financial Summary Report',
          description: 'Comprehensive financial analysis including revenue, expenses, and profitability',
          category: 'Financial',
          metrics: ['revenue', 'expenses', 'profit_margin', 'patient_volume'],
          defaultGroupBy: 'monthly',
          estimatedTime: 5
        },
        {
          id: 'patient_analytics',
          name: 'Patient Analytics Report',
          description: 'Patient demographics, visit patterns, and satisfaction metrics',
          category: 'Clinical',
          metrics: ['patient_count', 'demographics', 'satisfaction', 'retention_rate'],
          defaultGroupBy: 'weekly',
          estimatedTime: 3
        },
        {
          id: 'operational_efficiency',
          name: 'Operational Efficiency Report',
          description: 'Staff performance, resource utilization, and process optimization',
          category: 'Operations',
          metrics: ['wait_times', 'staff_efficiency', 'resource_utilization', 'appointment_metrics'],
          defaultGroupBy: 'daily',
          estimatedTime: 4
        },
        {
          id: 'quality_indicators',
          name: 'Quality Indicators Report',
          description: 'Clinical quality metrics, safety indicators, and compliance status',
          category: 'Quality',
          metrics: ['quality_scores', 'safety_metrics', 'compliance_rate', 'incident_reports'],
          defaultGroupBy: 'monthly',
          estimatedTime: 7
        },
        {
          id: 'custom_report',
          name: 'Custom Report',
          description: 'Build a custom report with your selected metrics and parameters',
          category: 'Custom',
          metrics: [],
          defaultGroupBy: 'monthly',
          estimatedTime: 0
        }
      ];
    }
  });

  const { data: recentReports } = useQuery({
    queryKey: ['recent-reports', profile?.tenant_id],
    queryFn: async () => {
      return [
        {
          id: 'rpt_001',
          name: 'Q3 Financial Summary',
          template: 'Financial Summary Report',
          generatedAt: new Date('2024-01-20'),
          status: 'completed',
          size: '2.5 MB',
          format: 'PDF'
        },
        {
          id: 'rpt_002',
          name: 'Weekly Patient Analytics',
          template: 'Patient Analytics Report',
          generatedAt: new Date('2024-01-18'),
          status: 'completed',
          size: '1.8 MB',
          format: 'Excel'
        },
        {
          id: 'rpt_003',
          name: 'December Operations',
          template: 'Operational Efficiency Report',
          generatedAt: new Date('2024-01-15'),
          status: 'completed',
          size: '3.1 MB',
          format: 'PDF'
        }
      ];
    }
  });

  const availableMetrics = [
    { id: 'revenue', label: 'Revenue Analysis', category: 'Financial' },
    { id: 'patient_volume', label: 'Patient Volume', category: 'Clinical' },
    { id: 'wait_times', label: 'Wait Times', category: 'Operations' },
    { id: 'satisfaction', label: 'Patient Satisfaction', category: 'Quality' },
    { id: 'staff_efficiency', label: 'Staff Efficiency', category: 'Operations' },
    { id: 'appointment_metrics', label: 'Appointment Metrics', category: 'Operations' },
    { id: 'demographics', label: 'Patient Demographics', category: 'Clinical' },
    { id: 'quality_scores', label: 'Quality Scores', category: 'Quality' }
  ];

  const departments = [
    { id: 'emergency', label: 'Emergency' },
    { id: 'cardiology', label: 'Cardiology' },
    { id: 'pediatrics', label: 'Pediatrics' },
    { id: 'orthopedics', label: 'Orthopedics' },
    { id: 'radiology', label: 'Radiology' }
  ];

  const handleGenerateReport = async () => {
    if (!reportName || !selectedTemplate) {
      toast({
        title: "Error",
        description: "Please provide a report name and select a template.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const reportId = `rpt_${Date.now()}`;
      
      toast({
        title: "Success",
        description: `Report "${reportName}" has been generated successfully.`,
      });
      
      onReportGenerated?.(reportId);
      
      // Reset form
      setReportName('');
      setReportDescription('');
      setSelectedMetrics([]);
      setSelectedDepartments([]);
      setSelectedTemplate('');
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleDepartmentToggle = (deptId: string) => {
    setSelectedDepartments(prev => 
      prev.includes(deptId) 
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  };

  const selectedTemplateData = reportTemplates?.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Advanced Reporting</h2>
        </div>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Configuration */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="report-name">Report Name</Label>
                      <Input
                        id="report-name"
                        placeholder="Enter report name"
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template">Template</Label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {reportTemplates?.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter report description"
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date Range</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "LLL dd, y")} -{" "}
                                  {format(dateRange.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(dateRange.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange.from}
                            selected={{ from: dateRange.from, to: dateRange.to }}
                            onSelect={(range) => setDateRange(range || {})}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="group-by">Group By</Label>
                      <Select value={groupBy} onValueChange={setGroupBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grouping" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metrics Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Metrics & Data Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {availableMetrics.map((metric) => (
                      <div key={metric.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={metric.id}
                          checked={selectedMetrics.includes(metric.id)}
                          onCheckedChange={() => handleMetricToggle(metric.id)}
                        />
                        <label
                          htmlFor={metric.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {metric.label}
                        </label>
                        <Badge variant="outline" className="text-xs">
                          {metric.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Filters & Departments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Departments</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {departments.map((dept) => (
                          <div key={dept.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={dept.id}
                              checked={selectedDepartments.includes(dept.id)}
                              onCheckedChange={() => handleDepartmentToggle(dept.id)}
                            />
                            <label
                              htmlFor={dept.id}
                              className="text-sm font-medium leading-none"
                            >
                              {dept.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Report Preview & Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Report Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedTemplateData && (
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Template:</span>
                        <p className="text-sm text-muted-foreground">{selectedTemplateData.name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Category:</span>
                        <Badge variant="outline" className="ml-2">
                          {selectedTemplateData.category}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Estimated Time:</span>
                        <p className="text-sm text-muted-foreground">{selectedTemplateData.estimatedTime} minutes</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Selected Metrics:</span>
                        <p className="text-sm text-muted-foreground">{selectedMetrics.length} metrics</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    PDF Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel Spreadsheet
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Report
                  </Button>
                </CardContent>
              </Card>

              <Button 
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates?.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{template.estimatedTime} min</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports?.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{report.name}</h4>
                      <p className="text-sm text-muted-foreground">{report.template}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Generated: {format(report.generatedAt, 'MMM dd, yyyy')}</span>
                        <span>Size: {report.size}</span>
                        <span>Format: {report.format}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{report.status}</Badge>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};