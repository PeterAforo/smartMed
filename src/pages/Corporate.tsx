import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, Users, DollarSign, BarChart3, FileText, Target, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Corporate = () => {
  const { toast } = useToast();

  const [corporateMetrics] = useState({
    totalRevenue: 2500000,
    totalBranches: 8,
    totalEmployees: 450,
    patientSatisfaction: 94,
    monthlyGrowth: 12.5,
    marketShare: 18.5
  });

  const [branches] = useState([
    {
      id: 1,
      name: 'Main Campus',
      location: 'Downtown',
      revenue: 850000,
      patients: 2500,
      staff: 120,
      performance: 'excellent'
    },
    {
      id: 2,
      name: 'North Branch',
      location: 'North District',
      revenue: 650000,
      patients: 1800,
      staff: 85,
      performance: 'good'
    },
    {
      id: 3,
      name: 'South Branch',
      location: 'South District',
      revenue: 720000,
      patients: 2100,
      staff: 95,
      performance: 'excellent'
    },
    {
      id: 4,
      name: 'East Branch',
      location: 'East District',
      revenue: 480000,
      patients: 1400,
      staff: 65,
      performance: 'average'
    }
  ]);

  const [strategicInitiatives] = useState([
    {
      id: 1,
      title: 'Digital Transformation',
      status: 'in-progress',
      progress: 75,
      deadline: '2024-06-30',
      budget: 500000,
      owner: 'IT Department'
    },
    {
      id: 2,
      title: 'Quality Improvement Program',
      status: 'planning',
      progress: 25,
      deadline: '2024-12-31',
      budget: 300000,
      owner: 'Quality Assurance'
    },
    {
      id: 3,
      title: 'Staff Development Initiative',
      status: 'in-progress',
      progress: 60,
      deadline: '2024-09-30',
      budget: 200000,
      owner: 'HR Department'
    }
  ]);

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'bg-green-500 text-white';
      case 'good': return 'bg-blue-500 text-white';
      case 'average': return 'bg-yellow-500 text-white';
      case 'poor': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in-progress': return 'bg-blue-500 text-white';
      case 'planning': return 'bg-yellow-500 text-white';
      case 'on-hold': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleGenerateReport = (reportType: string) => {
    toast({
      title: "Report Generated",
      description: `${reportType} report has been generated successfully.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Corporate Dashboard</h1>
          <p className="text-muted-foreground">
            Executive overview, strategic planning, and corporate performance metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(corporateMetrics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                +{corporateMetrics.monthlyGrowth}% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{corporateMetrics.totalBranches}</div>
              <p className="text-xs text-muted-foreground">
                Across multiple locations
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{corporateMetrics.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                Healthcare professionals
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patient Satisfaction</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{corporateMetrics.patientSatisfaction}%</div>
              <p className="text-xs text-muted-foreground">
                Above industry average
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Share</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{corporateMetrics.marketShare}%</div>
              <p className="text-xs text-muted-foreground">
                Regional healthcare market
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{corporateMetrics.monthlyGrowth}%</div>
              <p className="text-xs text-muted-foreground">
                Revenue growth rate
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="branches" className="space-y-4">
          <TabsList>
            <TabsTrigger value="branches">Branch Performance</TabsTrigger>
            <TabsTrigger value="initiatives">Strategic Initiatives</TabsTrigger>
            <TabsTrigger value="reports">Executive Reports</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
          </TabsList>

          <TabsContent value="branches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Branch Performance Overview</CardTitle>
                <CardDescription>
                  Monitor performance metrics across all healthcare facilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {branches.map((branch) => (
                    <div key={branch.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{branch.name}</h3>
                          <Badge className={getPerformanceColor(branch.performance)}>
                            {branch.performance.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{branch.location}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Revenue: {formatCurrency(branch.revenue)}</span>
                          <span>Patients: {branch.patients.toLocaleString()}</span>
                          <span>Staff: {branch.staff}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Generate Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="initiatives" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Strategic Initiatives</CardTitle>
                <CardDescription>
                  Track progress of corporate strategic initiatives and projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strategicInitiatives.map((initiative) => (
                    <div key={initiative.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{initiative.title}</h3>
                          <Badge className={getStatusColor(initiative.status)}>
                            {initiative.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Budget: {formatCurrency(initiative.budget)}</span>
                          <span>Owner: {initiative.owner}</span>
                          <span>Deadline: {initiative.deadline}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${initiative.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground">{initiative.progress}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          Update Progress
                        </Button>
                        <Button variant="outline" size="sm">
                          View Timeline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Executive Reports</CardTitle>
                <CardDescription>
                  Generate comprehensive reports for executive decision making
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col"
                    onClick={() => handleGenerateReport('Monthly Financial')}
                  >
                    <DollarSign className="h-6 w-6 mb-2" />
                    Monthly Financial Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col"
                    onClick={() => handleGenerateReport('Performance Dashboard')}
                  >
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Performance Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col"
                    onClick={() => handleGenerateReport('Strategic Planning')}
                  >
                    <Target className="h-6 w-6 mb-2" />
                    Strategic Planning Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col"
                    onClick={() => handleGenerateReport('Branch Analysis')}
                  >
                    <Building2 className="h-6 w-6 mb-2" />
                    Branch Analysis
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col"
                    onClick={() => handleGenerateReport('Market Analysis')}
                  >
                    <TrendingUp className="h-6 w-6 mb-2" />
                    Market Analysis
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col"
                    onClick={() => handleGenerateReport('Regulatory Compliance')}
                  >
                    <FileText className="h-6 w-6 mb-2" />
                    Regulatory Compliance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="governance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Corporate Governance</CardTitle>
                <CardDescription>
                  Board meetings, compliance tracking, and governance activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Board Activities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Next Board Meeting:</span>
                        <span className="text-sm font-medium">Feb 15, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Quarterly Review:</span>
                        <span className="text-sm font-medium">Mar 30, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Annual Meeting:</span>
                        <span className="text-sm font-medium">Jun 15, 2024</span>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        View Board Calendar
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Compliance Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">HIPAA Compliance:</span>
                        <Badge className="bg-green-500 text-white">Current</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Joint Commission:</span>
                        <Badge className="bg-green-500 text-white">Accredited</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">State Licensing:</span>
                        <Badge className="bg-yellow-500 text-white">Renewal Due</Badge>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        View Compliance Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Corporate;