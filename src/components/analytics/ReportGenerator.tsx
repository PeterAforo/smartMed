import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from './DateRangePicker';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Calendar, 
  Settings, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export function ReportGenerator() {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('monthly');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: endOfMonth(new Date())
  });
  const [includeCharts, setIncludeCharts] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const { branches, hasCrossBranchAccess } = useAuth();
  const { toast } = useToast();

  const handleGenerateReport = async (format: 'pdf' | 'html' = 'pdf') => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        title: "Invalid Date Range",
        description: "Please select a valid date range for the report.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          reportType,
          startDate: format(dateRange.from, 'yyyy-MM-dd'),
          endDate: format(dateRange.to, 'yyyy-MM-dd'),
          branchId: selectedBranch || undefined,
          includeCharts,
          format
        }
      });

      if (error) throw error;

      if (format === 'pdf') {
        // Open in new window for PDF generation via browser print
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(data);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 500);
        }
      } else {
        // Download HTML file
        const blob = new Blob([data], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `healthcare-report-${dateRange.from.toISOString().split('T')[0]}-${dateRange.to.toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setLastGenerated(new Date());
      toast({
        title: "Report Generated",
        description: `${format.toUpperCase()} report has been generated successfully.`,
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportData = async (dataType: 'appointments' | 'revenue' | 'patients' | 'queue' | 'all', exportFormat: 'csv' | 'json') => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        title: "Invalid Date Range",
        description: "Please select a valid date range for export.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-data', {
        body: {
          dataType,
          format: exportFormat,
          startDate: format(dateRange.from, 'yyyy-MM-dd'),
          endDate: format(dateRange.to, 'yyyy-MM-dd'),
          branchId: selectedBranch || undefined
        }
      });

      if (error) throw error;

      // Create download
      const mimeType = exportFormat === 'csv' ? 'text/csv' : 'application/json';
      const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataType}-export-${dateRange.from.toISOString().split('T')[0]}-${dateRange.to.toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `${dataType} data exported as ${exportFormat.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getDateRangeForReportType = () => {
    const now = new Date();
    switch (reportType) {
      case 'daily':
        return { from: subDays(now, 7), to: now };
      case 'weekly':
        return { from: subDays(now, 30), to: now };
      case 'monthly':
        return { from: startOfMonth(subMonths(now, 11)), to: endOfMonth(now) };
      default:
        return dateRange;
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card className="healthcare-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Report Generator</CardTitle>
          </div>
          <CardDescription>
            Generate comprehensive analytics reports with customizable parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Report Type</Label>
            <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Report (Last 7 days)</SelectItem>
                <SelectItem value="weekly">Weekly Report (Last 30 days)</SelectItem>
                <SelectItem value="monthly">Monthly Report (Last 12 months)</SelectItem>
                <SelectItem value="custom">Custom Date Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Date Range</Label>
            <DateRangePicker
              dateRange={{
                from: reportType === 'custom' ? dateRange.from : getDateRangeForReportType().from,
                to: reportType === 'custom' ? dateRange.to : getDateRangeForReportType().to
              }}
              onDateRangeChange={(range) => {
                if (range?.from && range?.to) {
                  setDateRange({ from: range.from, to: range.to });
                }
              }}
            />
          </div>

          {/* Branch Selection */}
          {hasCrossBranchAccess && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Branch Filter</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="All branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Branches</SelectItem>
                  {branches?.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Report Options */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Report Options</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="include-charts"
                checked={includeCharts}
                onCheckedChange={setIncludeCharts}
              />
              <Label htmlFor="include-charts" className="text-sm">
                Include Charts and Visualizations
              </Label>
            </div>
          </div>

          {/* Generation Status */}
          {lastGenerated && (
            <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm text-success-foreground">
                Last generated: {lastGenerated.toLocaleString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Generation Actions */}
      <Card className="healthcare-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Generate Reports
          </CardTitle>
          <CardDescription>
            Create professional reports in different formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button
              onClick={() => handleGenerateReport('pdf')}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Generate PDF Report
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleGenerateReport('html')}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download HTML Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Export Section */}
      <Card className="healthcare-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Data Export
          </CardTitle>
          <CardDescription>
            Export raw analytics data for external analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* CSV Exports */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">CSV Format</Label>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportData('appointments', 'csv')}
                    disabled={isExporting}
                    className="w-full justify-start"
                  >
                    {isExporting ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Download className="h-3 w-3 mr-2" />}
                    Appointments CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportData('revenue', 'csv')}
                    disabled={isExporting}
                    className="w-full justify-start"
                  >
                    {isExporting ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Download className="h-3 w-3 mr-2" />}
                    Revenue CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportData('patients', 'csv')}
                    disabled={isExporting}
                    className="w-full justify-start"
                  >
                    {isExporting ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Download className="h-3 w-3 mr-2" />}
                    Patients CSV
                  </Button>
                </div>
              </div>

              {/* JSON Exports */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">JSON Format</Label>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportData('queue', 'json')}
                    disabled={isExporting}
                    className="w-full justify-start"
                  >
                    {isExporting ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Download className="h-3 w-3 mr-2" />}
                    Queue JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportData('all', 'json')}
                    disabled={isExporting}
                    className="w-full justify-start"
                  >
                    {isExporting ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Download className="h-3 w-3 mr-2" />}
                    Complete JSON
                  </Button>
                </div>
              </div>

              {/* Bulk Export */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Bulk Export</Label>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleExportData('all', 'csv')}
                    disabled={isExporting}
                    className="w-full justify-start"
                  >
                    {isExporting ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Download className="h-3 w-3 mr-2" />}
                    Complete CSV Export
                  </Button>
                  <Badge variant="secondary" className="w-full justify-center">
                    All Analytics Data
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}