import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Calendar, DollarSign, Bed, TrendingUp, Download } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardData";
import { useAuth } from "@/hooks/useAuth";

interface ViewReportsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewReportsModal({ open, onOpenChange }: ViewReportsModalProps) {
  const { data: stats, isLoading } = useDashboardStats();
  const { currentBranch, hasCrossBranchAccess, tenant } = useAuth();

  const reports = [
    {
      title: "Patient Summary Report",
      description: "Overview of patient demographics and statistics",
      icon: Users,
      data: {
        "Total Active Patients": stats?.totalPatients || 0,
        "New Patients (This Month)": "45",
        "Patient Satisfaction": "4.8/5.0"
      }
    },
    {
      title: "Appointment Analytics",
      description: "Detailed analysis of appointment patterns",
      icon: Calendar,
      data: {
        "Today's Appointments": stats?.todayAppointments || 0,
        "Completion Rate": "92%",
        "Average Wait Time": "15 minutes"
      }
    },
    {
      title: "Bed Utilization Report",
      description: "Current bed occupancy and utilization metrics",
      icon: Bed,
      data: {
        "Bed Occupancy": stats?.activeBeds || "0/0",
        "Utilization Rate": `${stats?.bedOccupancyRate || 0}%`,
        "Average Stay": "3.2 days"
      }
    },
    {
      title: "Financial Performance",
      description: "Revenue and financial metrics overview",
      icon: DollarSign,
      data: {
        "Today's Revenue": `₵${stats?.todayRevenue?.toLocaleString() || 0}`,
        "Monthly Target": "85% achieved",
        "Payment Collection": "94%"
      }
    },
    {
      title: "Operational Efficiency",
      description: "Key performance indicators and trends",
      icon: TrendingUp,
      data: {
        "Staff Utilization": "87%",
        "Resource Efficiency": "Good",
        "Process Optimization": "12% improved"
      }
    },
    {
      title: "Quality Metrics",
      description: "Clinical quality and safety indicators",
      icon: BarChart3,
      data: {
        "Safety Score": "98.5%",
        "Clinical Outcomes": "Excellent",
        "Compliance Rate": "99.2%"
      }
    }
  ];

  const handleDownloadReport = (reportTitle: string) => {
    // In a real implementation, this would generate and download a PDF or Excel file
    const blob = new Blob([`Report: ${reportTitle}\nGenerated: ${new Date().toISOString()}\nBranch: ${currentBranch?.name || 'All Branches'}`], {
      type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reports & Analytics</DialogTitle>
          <DialogDescription>
            Comprehensive reports and analytics for {hasCrossBranchAccess ? `${tenant?.name} - All Branches` : currentBranch?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Context Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {hasCrossBranchAccess ? 'Multi-Branch View' : 'Single Branch'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Generated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report, index) => {
              const Icon = report.icon;
              return (
                <Card key={index} className="healthcare-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-primary" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadReport(report.title)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-base">{report.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {report.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(report.data).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-1">
                          <span className="text-sm text-muted-foreground">{key}:</span>
                          <span className="text-sm font-medium text-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary Statistics */}
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle className="text-lg">Executive Summary</CardTitle>
              <CardDescription>
                Key performance indicators at a glance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">{stats?.totalPatients || 0}</div>
                  <div className="text-xs text-muted-foreground">Total Patients</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-secondary">{stats?.todayAppointments || 0}</div>
                  <div className="text-xs text-muted-foreground">Today's Appointments</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-accent">{stats?.bedOccupancyRate || 0}%</div>
                  <div className="text-xs text-muted-foreground">Bed Occupancy</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-success">₵{(stats?.todayRevenue || 0).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Today's Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading && (
            <Card className="healthcare-card">
              <CardContent className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading report data...</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}