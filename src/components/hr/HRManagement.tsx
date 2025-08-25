import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  Clock,
  Calendar,
  TrendingUp,
  Award,
  Target,
  AlertCircle,
  CheckCircle,
  Star,
  BarChart3,
  FileText,
  Settings,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Download
} from 'lucide-react';

interface StaffMember {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  hireDate: string;
  salary: number;
  status: 'active' | 'inactive' | 'on_leave';
  performanceRating: number;
  totalPatients: number;
  completedAppointments: number;
  averageRating: number;
  certifications: string[];
}

interface HRManagementProps {
  className?: string;
}

const HRManagement = ({ className }: HRManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock staff data
  const staffData: StaffMember[] = [
    {
      id: 'staff-001',
      employeeId: 'EMP001',
      name: 'Dr. Emily Chen',
      role: 'Senior Physician',
      department: 'Cardiology',
      email: 'emily.chen@smartmed.com',
      phone: '+1 (555) 123-4567',
      hireDate: '2019-03-15',
      salary: 185000,
      status: 'active',
      performanceRating: 4.8,
      totalPatients: 1245,
      completedAppointments: 2180,
      averageRating: 4.9,
      certifications: ['Board Certified Cardiologist', 'Advanced Life Support', 'Echocardiography']
    },
    {
      id: 'staff-002',
      employeeId: 'EMP002',
      name: 'Nurse Sarah Wilson',
      role: 'Registered Nurse',
      department: 'Emergency',
      email: 'sarah.wilson@smartmed.com',
      phone: '+1 (555) 234-5678',
      hireDate: '2020-06-20',
      salary: 75000,
      status: 'active',
      performanceRating: 4.6,
      totalPatients: 2890,
      completedAppointments: 4520,
      averageRating: 4.7,
      certifications: ['RN License', 'Emergency Care', 'IV Therapy']
    },
    {
      id: 'staff-003',
      employeeId: 'EMP003',
      name: 'Dr. Michael Rodriguez',
      role: 'Radiologist',
      department: 'Radiology',
      email: 'michael.rodriguez@smartmed.com',
      phone: '+1 (555) 345-6789',
      hireDate: '2018-01-10',
      salary: 220000,
      status: 'active',
      performanceRating: 4.9,
      totalPatients: 856,
      completedAppointments: 1670,
      averageRating: 4.8,
      certifications: ['Board Certified Radiologist', 'MRI Interpretation', 'CT Scan Specialist']
    },
    {
      id: 'staff-004',
      employeeId: 'EMP004',
      name: 'Lisa Johnson',
      role: 'Administrative Assistant',
      department: 'Administration',
      email: 'lisa.johnson@smartmed.com',
      phone: '+1 (555) 456-7890',
      hireDate: '2021-09-05',
      salary: 45000,
      status: 'on_leave',
      performanceRating: 4.3,
      totalPatients: 0,
      completedAppointments: 0,
      averageRating: 4.5,
      certifications: ['Medical Administration', 'HIPAA Compliance']
    }
  ];

  const departments = ['All', 'Cardiology', 'Emergency', 'Radiology', 'Administration', 'Nursing', 'Laboratory'];
  const statuses = ['All', 'Active', 'Inactive', 'On Leave'];

  // Filter staff based on search and filters
  const filteredStaff = staffData.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || staff.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || staff.status === selectedStatus.toLowerCase().replace(' ', '_');
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Calculate summary statistics
  const totalStaff = staffData.length;
  const activeStaff = staffData.filter(staff => staff.status === 'active').length;
  const onLeaveStaff = staffData.filter(staff => staff.status === 'on_leave').length;
  const averageSalary = staffData.reduce((sum, staff) => sum + staff.salary, 0) / staffData.length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'on_leave':
        return <Badge variant="outline">On Leave</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`space-y-6 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Human Resources Management</h2>
          <p className="text-muted-foreground">Manage staff, performance, and HR operations</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{totalStaff}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Staff</p>
                <p className="text-2xl font-bold">{activeStaff}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold">{onLeaveStaff}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Salary</p>
                <p className="text-2xl font-bold">${Math.round(averageSalary / 1000)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search employees by name, ID, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                {departments.map(department => (
                  <option key={department} value={department.toLowerCase()}>
                    {department}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                {statuses.map(status => (
                  <option key={status} value={status.toLowerCase()}>
                    {status}
                  </option>
                ))}
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>

          {/* Employee Table */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>
                Showing {filteredStaff.length} of {totalStaff} employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Role & Department</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{staff.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {staff.employeeId}</p>
                            <p className="text-xs text-muted-foreground">
                              Hired: {new Date(staff.hireDate).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{staff.role}</p>
                            <p className="text-sm text-muted-foreground">{staff.department}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{staff.email}</p>
                            <p className="text-sm text-muted-foreground">{staff.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span className={`font-medium ${getPerformanceColor(staff.performanceRating)}`}>
                                {staff.performanceRating}/5
                              </span>
                            </div>
                            {staff.totalPatients > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {staff.totalPatients} patients
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">${staff.salary.toLocaleString()}</p>
                        </TableCell>
                        <TableCell>{getStatusBadge(staff.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staffData
                    .sort((a, b) => b.performanceRating - a.performanceRating)
                    .slice(0, 5)
                    .map((staff, index) => (
                    <div key={staff.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <p className="text-sm text-muted-foreground">{staff.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="font-medium">{staff.performanceRating}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Performance Rating</span>
                    <span className="font-bold">4.7/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Employee Satisfaction</span>
                    <span className="font-bold">89%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Retention Rate</span>
                    <span className="font-bold">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Training Completion</span>
                    <span className="font-bold">87%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Department performance comparison chart</p>
                <p className="text-sm">Compare metrics across departments</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    ${staffData.reduce((sum, staff) => sum + staff.salary, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Annual Salaries</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    ${Math.round(staffData.reduce((sum, staff) => sum + staff.salary, 0) / 12).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Monthly Payroll</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    ${Math.round(averageSalary).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Average Salary</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Salary Distribution by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Cardiology', 'Emergency', 'Radiology', 'Administration'].map((dept) => {
                  const deptStaff = staffData.filter(s => s.department === dept);
                  const avgSalary = deptStaff.reduce((sum, s) => sum + s.salary, 0) / deptStaff.length;
                  return (
                    <div key={dept} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{dept}</p>
                        <p className="text-sm text-muted-foreground">{deptStaff.length} employees</p>
                      </div>
                      <p className="font-bold">${Math.round(avgSalary).toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Health Insurance', enrolled: 28, total: 30, coverage: '93%' },
                  { name: 'Dental Insurance', enrolled: 25, total: 30, coverage: '83%' },
                  { name: 'Vision Insurance', enrolled: 22, total: 30, coverage: '73%' },
                  { name: 'Retirement Plan', enrolled: 27, total: 30, coverage: '90%' },
                  { name: 'Life Insurance', enrolled: 30, total: 30, coverage: '100%' }
                ].map((benefit) => (
                  <div key={benefit.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{benefit.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {benefit.enrolled} of {benefit.total} enrolled
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{benefit.coverage}</p>
                      <p className="text-sm text-muted-foreground">Coverage</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { requirement: 'HIPAA Training', completed: 28, total: 30, status: 'compliant' },
                  { requirement: 'Fire Safety Training', completed: 30, total: 30, status: 'compliant' },
                  { requirement: 'CPR Certification', completed: 25, total: 27, status: 'warning' },
                  { requirement: 'Background Checks', completed: 30, total: 30, status: 'compliant' },
                  { requirement: 'License Verification', completed: 18, total: 20, status: 'warning' }
                ].map((item) => (
                  <div key={item.requirement} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.requirement}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.completed} of {item.total} completed
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.status === 'compliant' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      <Badge variant={item.status === 'compliant' ? 'default' : 'secondary'}>
                        {item.status === 'compliant' ? 'Compliant' : 'Needs Attention'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Turnover Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Employee turnover trends</p>
                  <p className="text-sm">Track retention and turnover rates</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Training completion status</p>
                  <p className="text-sm">Monitor certification progress</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  'Employee Roster',
                  'Payroll Summary',
                  'Performance Review',
                  'Benefits Enrollment',
                  'Compliance Status',
                  'Training Records'
                ].map((report) => (
                  <Button key={report} variant="outline" className="h-20 flex flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    <span className="text-sm">{report}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRManagement;