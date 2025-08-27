import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Calendar, Clock, Award, TrendingUp, Search, Plus, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddEmployeeDialog } from '@/components/hr/AddEmployeeDialog';

const HR = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);

  // Mock data for employees
  const [employees] = useState([
    {
      id: 1,
      employeeId: 'EMP001',
      name: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      position: 'Senior Cardiologist',
      hireDate: '2020-03-15',
      status: 'active',
      leaveBalance: 15,
      performance: 'excellent',
      salary: 180000,
      email: 'sarah.johnson@hospital.com'
    },
    {
      id: 2,
      employeeId: 'EMP002',
      name: 'Nurse Mary Smith',
      department: 'Emergency',
      position: 'Senior Nurse',
      hireDate: '2019-08-22',
      status: 'active',
      leaveBalance: 12,
      performance: 'good',
      salary: 75000,
      email: 'mary.smith@hospital.com'
    },
    {
      id: 3,
      employeeId: 'EMP003',
      name: 'Dr. Michael Brown',
      department: 'Orthopedics',
      position: 'Orthopedic Surgeon',
      hireDate: '2021-01-10',
      status: 'active',
      leaveBalance: 20,
      performance: 'excellent',
      salary: 220000,
      email: 'michael.brown@hospital.com'
    },
    {
      id: 4,
      employeeId: 'EMP004',
      name: 'Tech. James Wilson',
      department: 'Radiology',
      position: 'Radiology Technician',
      hireDate: '2022-06-01',
      status: 'probation',
      leaveBalance: 8,
      performance: 'satisfactory',
      salary: 55000,
      email: 'james.wilson@hospital.com'
    }
  ]);

  // Mock data for leave requests
  const [leaveRequests] = useState([
    {
      id: 1,
      employeeName: 'Dr. Sarah Johnson',
      leaveType: 'Annual Leave',
      startDate: '2024-02-01',
      endDate: '2024-02-05',
      days: 5,
      status: 'pending',
      reason: 'Family vacation'
    },
    {
      id: 2,
      employeeName: 'Nurse Mary Smith',
      leaveType: 'Sick Leave',
      startDate: '2024-01-20',
      endDate: '2024-01-22',
      days: 3,
      status: 'approved',
      reason: 'Medical appointment'
    }
  ]);

  const [hrStats] = useState({
    totalEmployees: 245,
    newHires: 8,
    pendingLeaves: 12,
    turnoverRate: 5.2,
    averageSalary: 95000,
    vacantPositions: 15
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'probation': return 'bg-yellow-500 text-white';
      case 'inactive': return 'bg-red-500 text-white';
      case 'pending': return 'bg-blue-500 text-white';
      case 'approved': return 'bg-green-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'bg-green-500 text-white';
      case 'good': return 'bg-blue-500 text-white';
      case 'satisfactory': return 'bg-yellow-500 text-white';
      case 'needs-improvement': return 'bg-red-500 text-white';
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

  const handleApproveLeave = (leaveId: number) => {
    toast({
      title: "Leave Approved",
      description: "Leave request has been approved successfully.",
    });
  };

  const handleRejectLeave = (leaveId: number) => {
    toast({
      title: "Leave Rejected",
      description: "Leave request has been rejected.",
    });
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Human Resources</h1>
          <p className="text-muted-foreground">
            Manage staff, recruitment, payroll, and employee development
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hrStats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                Active healthcare staff
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Hires (Month)</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hrStats.newHires}</div>
              <p className="text-xs text-muted-foreground">
                +20% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hrStats.pendingLeaves}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hrStats.turnoverRate}%</div>
              <p className="text-xs text-muted-foreground">
                Below industry average
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(hrStats.averageSalary)}</div>
              <p className="text-xs text-muted-foreground">
                Competitive market rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vacant Positions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hrStats.vacantPositions}</div>
              <p className="text-xs text-muted-foreground">
                Open positions to fill
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="leaves">Leave Management</TabsTrigger>
            <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Employee Management</CardTitle>
                <CardDescription>
                  Manage employee records, departments, and organizational structure
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees, IDs, departments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button onClick={() => setAddEmployeeOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Employee
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{employee.name}</h3>
                          <Badge variant="outline">{employee.employeeId}</Badge>
                          <Badge className={getStatusColor(employee.status)}>
                            {employee.status.toUpperCase()}
                          </Badge>
                          <Badge className={getPerformanceColor(employee.performance)}>
                            {employee.performance.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Dept: {employee.department}</span>
                          <span>Hired: {employee.hireDate}</span>
                          <span>Leave: {employee.leaveBalance} days</span>
                          <span>Salary: {formatCurrency(employee.salary)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Performance
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaves" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Leave Management</CardTitle>
                <CardDescription>
                  Approve leave requests and manage employee time off
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaveRequests.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{leave.employeeName}</h3>
                          <Badge className={getStatusColor(leave.status)}>
                            {leave.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{leave.leaveType}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>From: {leave.startDate}</span>
                          <span>To: {leave.endDate}</span>
                          <span>Days: {leave.days}</span>
                        </div>
                        <p className="text-sm">{leave.reason}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {leave.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleApproveLeave(leave.id)}>
                              Approve
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleRejectLeave(leave.id)}>
                              Reject
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recruitment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recruitment & Hiring</CardTitle>
                <CardDescription>
                  Manage job postings, interviews, and hiring process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Open Positions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { position: 'Senior Nurse - ICU', applications: 15, posted: '2024-01-10' },
                        { position: 'Radiologist', applications: 8, posted: '2024-01-12' },
                        { position: 'Lab Technician', applications: 22, posted: '2024-01-08' },
                        { position: 'Physical Therapist', applications: 12, posted: '2024-01-15' }
                      ].map((job, index) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium text-sm">{job.position}</p>
                            <p className="text-xs text-muted-foreground">Posted: {job.posted}</p>
                          </div>
                          <Badge variant="outline">{job.applications} applicants</Badge>
                        </div>
                      ))}
                      <Button className="w-full mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Post New Job
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Interview Schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { candidate: 'John Smith', position: 'Senior Nurse', time: '10:00 AM', date: '2024-01-18' },
                        { candidate: 'Emily Davis', position: 'Radiologist', time: '2:00 PM', date: '2024-01-18' },
                        { candidate: 'Michael Johnson', position: 'Lab Tech', time: '11:00 AM', date: '2024-01-19' }
                      ].map((interview, index) => (
                        <div key={index} className="p-2 border rounded">
                          <p className="font-medium text-sm">{interview.candidate}</p>
                          <p className="text-xs text-muted-foreground">{interview.position}</p>
                          <p className="text-xs text-muted-foreground">{interview.date} at {interview.time}</p>
                        </div>
                      ))}
                      <Button className="w-full mt-4" variant="outline">
                        View Full Schedule
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Management</CardTitle>
                <CardDescription>
                  Track employee performance and conduct reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Button variant="outline" className="h-20 flex-col">
                    <Award className="h-6 w-6 mb-2" />
                    Performance Reviews
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <TrendingUp className="h-6 w-6 mb-2" />
                    Goals & Objectives
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    Team Assessments
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    Training Records
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Calendar className="h-6 w-6 mb-2" />
                    Review Schedule
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Award className="h-6 w-6 mb-2" />
                    Recognition Program
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Management</CardTitle>
                <CardDescription>
                  Process payroll, manage benefits, and handle compensation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Payroll Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Next Payroll:</span>
                        <span className="text-sm font-medium">Jan 31, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Payroll:</span>
                        <span className="text-sm font-medium">{formatCurrency(1250000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Overtime Hours:</span>
                        <span className="text-sm font-medium">245 hrs</span>
                      </div>
                      <Button className="w-full mt-4">
                        Process Payroll
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Benefits Administration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Health Insurance:</span>
                        <span className="text-sm font-medium">98% enrolled</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Retirement Plan:</span>
                        <span className="text-sm font-medium">85% participation</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Life Insurance:</span>
                        <span className="text-sm font-medium">92% covered</span>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        Manage Benefits
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <AddEmployeeDialog 
        open={addEmployeeOpen}
        onOpenChange={setAddEmployeeOpen}
      />
    </DashboardLayout>
  );
};

export default HR;