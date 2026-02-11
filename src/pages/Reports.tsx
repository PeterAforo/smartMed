import { useState } from "react"
import { Download, Filter, Calendar, BarChart3, PieChart, TrendingUp, FileText, Users, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { useAuth } from "@/hooks/useAuth"
import { useDashboardStats } from "@/hooks/useDashboardData"
import { useAnalyticsDashboard } from "@/hooks/useAnalytics"
import { AppointmentTrendsChart, RevenueTrendsChart, PatientFlowChart, AppointmentTypeChart } from "@/components/analytics/AnalyticsCharts"
import { format, subDays, startOfMonth, endOfMonth } from "date-fns"
import { GenerateReportDialog } from "@/components/reports/GenerateReportDialog"

// Report templates configuration
const reportTemplates = [
  {
    id: 1,
    name: "Monthly Financial Report",
    description: "Comprehensive financial overview including revenue, expenses, and profit analysis",
    category: "Financial",
    lastGenerated: "2024-01-15",
    frequency: "Monthly"
  },
  {
    id: 2,
    name: "Patient Demographics Report",
    description: "Detailed breakdown of patient demographics and statistics",
    category: "Patients",
    lastGenerated: "2024-01-20",
    frequency: "Quarterly"
  },
  {
    id: 3,
    name: "Staff Performance Report",
    description: "Analysis of staff productivity, patient satisfaction, and performance metrics",
    category: "HR",
    lastGenerated: "2024-01-18",
    frequency: "Monthly"
  },
  {
    id: 4,
    name: "Appointment Analytics",
    description: "Comprehensive analysis of appointment patterns, no-shows, and scheduling efficiency",
    category: "Operations",
    lastGenerated: "2024-01-22",
    frequency: "Weekly"
  }
]

export default function Reports() {
  const { currentBranch } = useAuth()
  const { data: stats } = useDashboardStats()
  const analytics = useAnalyticsDashboard()
  const [generateReportOpen, setGenerateReportOpen] = useState(false)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  })
  const [reportCategory, setReportCategory] = useState("all")

  const filteredReports = reportTemplates.filter(report => 
    reportCategory === "all" || report.category.toLowerCase() === reportCategory
  )

  const handleDownloadReport = (reportId: number, format: string) => {
    // Mock download functionality
    console.log(`Downloading report ${reportId} in ${format} format`)
    // In a real app, this would trigger a download
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
              <p className="text-muted-foreground">Comprehensive insights and data analysis</p>
            </div>
            <Button onClick={() => setGenerateReportOpen(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Custom Report
            </Button>
          </div>
          <div className="flex gap-2">{/* ... rest of filters ... */}
            <Select value={reportCategory} onValueChange={setReportCategory}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="patients">Patients</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
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
                    "Pick a date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-3 text-sm text-muted-foreground">
                  Date range picker would go here
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="templates">Report Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total Patients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalPatients || 0}</div>
                  <div className="text-sm text-green-600">+12% from last month</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.todayAppointments || 0}</div>
                  <div className="text-sm text-blue-600">Today's schedule</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats?.todayRevenue?.toLocaleString() || 0}</div>
                  <div className="text-sm text-green-600">+8% from last month</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Bed Occupancy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.bedOccupancyRate || 0}%</div>
                  <div className="text-sm text-orange-600">Average capacity</div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Charts */}
            <div className="grid gap-6">
              <AppointmentTrendsChart 
                data={analytics.appointments.data || []} 
                isLoading={analytics.appointments.isLoading}
              />
              
              <div className="grid gap-6 md:grid-cols-2">
                <PatientFlowChart 
                  data={analytics.patientFlow.data || []} 
                  isLoading={analytics.patientFlow.isLoading}
                />
                <AppointmentTypeChart 
                  data={analytics.appointmentTypes.data || []} 
                  isLoading={analytics.appointmentTypes.isLoading}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <RevenueTrendsChart 
              data={analytics.revenue.data || []} 
              isLoading={analytics.revenue.isLoading}
            />
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Appointments</TableHead>
                      <TableHead>Completion Rate</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.staffPerformance.data?.map((staff, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{staff.staff_name}</TableCell>
                        <TableCell>{staff.total_appointments}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {staff.total_appointments > 0 
                              ? Math.round((staff.completed_appointments / staff.total_appointments) * 100)
                              : 0}%
                          </Badge>
                        </TableCell>
                        <TableCell>${Number(staff.revenue_generated).toLocaleString()}</TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          {analytics.staffPerformance.isLoading ? 'Loading...' : 'No staff performance data available'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid gap-4">
              {filteredReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold">{report.name}</h3>
                          <Badge variant="outline">{report.category}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">{report.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Last generated: {format(new Date(report.lastGenerated), 'MMM dd, yyyy')}</span>
                          <span>Frequency: {report.frequency}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(report.id, 'pdf')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(report.id, 'excel')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Excel
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleDownloadReport(report.id, 'generate')}
                        >
                          Generate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <GenerateReportDialog 
        open={generateReportOpen}
        onOpenChange={setGenerateReportOpen}
      />
    </DashboardLayout>
  )
}