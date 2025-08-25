import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Search, Calendar, Clock, FileText, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Imaging = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [imagingOrders] = useState([
    {
      id: 1,
      orderNumber: 'IMG-2024-001',
      patientName: 'John Doe',
      patientId: 'P001',
      studyType: 'Chest X-Ray',
      bodyPart: 'Chest',
      orderDate: '2024-01-15',
      scheduledDate: '2024-01-16',
      scheduledTime: '10:00 AM',
      priority: 'routine',
      status: 'scheduled',
      doctor: 'Dr. Smith',
      indication: 'Chest pain evaluation',
      contrast: false,
      facility: 'Main Imaging Center'
    },
    {
      id: 2,
      orderNumber: 'IMG-2024-002',
      patientName: 'Jane Smith',
      patientId: 'P002',
      studyType: 'MRI Brain',
      bodyPart: 'Head',
      orderDate: '2024-01-14',
      scheduledDate: '2024-01-15',
      scheduledTime: '02:00 PM',
      priority: 'urgent',
      status: 'in-progress',
      doctor: 'Dr. Johnson',
      indication: 'Headache investigation',
      contrast: true,
      facility: 'Advanced Imaging Suite'
    },
    {
      id: 3,
      orderNumber: 'IMG-2024-003',
      patientName: 'Mike Johnson',
      patientId: 'P003',
      studyType: 'CT Abdomen',
      bodyPart: 'Abdomen',
      orderDate: '2024-01-13',
      scheduledDate: '2024-01-14',
      scheduledTime: '09:30 AM',
      priority: 'stat',
      status: 'completed',
      doctor: 'Dr. Williams',
      indication: 'Abdominal pain',
      contrast: true,
      facility: 'Emergency Imaging'
    }
  ]);

  const [studies] = useState([
    {
      id: 1,
      studyId: 'STU-2024-001',
      patientName: 'Mike Johnson',
      studyType: 'CT Abdomen',
      studyDate: '2024-01-14',
      modality: 'CT',
      bodyPart: 'Abdomen',
      images: 45,
      status: 'completed',
      radiologist: 'Dr. Brown',
      reportStatus: 'final',
      findings: 'No acute findings. Normal abdominal CT.',
      impression: 'Normal study',
      orderNumber: 'IMG-2024-003'
    },
    {
      id: 2,
      studyId: 'STU-2024-002',
      patientName: 'Alice Cooper',
      studyType: 'Chest X-Ray',
      studyDate: '2024-01-15',
      modality: 'XR',
      bodyPart: 'Chest',
      images: 2,
      status: 'completed',
      radiologist: 'Dr. Davis',
      reportStatus: 'preliminary',
      findings: 'Clear lung fields. Normal heart size.',
      impression: 'Normal chest X-ray',
      orderNumber: 'IMG-2024-004'
    },
    {
      id: 3,
      studyId: 'STU-2024-003',
      patientName: 'Jane Smith',
      studyType: 'MRI Brain',
      studyDate: '2024-01-15',
      modality: 'MR',
      bodyPart: 'Head',
      images: 120,
      status: 'reading',
      radiologist: 'Dr. Wilson',
      reportStatus: 'pending',
      findings: 'Under review',
      impression: 'Pending radiologist interpretation',
      orderNumber: 'IMG-2024-002'
    }
  ]);

  const [equipment] = useState([
    {
      id: 1,
      name: 'CT Scanner 1',
      type: 'CT',
      location: 'Main Imaging Center',
      status: 'operational',
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-02-10',
      utilizationRate: 85,
      currentStudy: 'STU-2024-005'
    },
    {
      id: 2,
      name: 'MRI Scanner A',
      type: 'MRI',
      location: 'Advanced Imaging Suite',
      status: 'operational',
      lastMaintenance: '2024-01-08',
      nextMaintenance: '2024-02-08',
      utilizationRate: 92,
      currentStudy: 'STU-2024-003'
    },
    {
      id: 3,
      name: 'X-Ray Room 1',
      type: 'X-Ray',
      location: 'Emergency Imaging',
      status: 'maintenance',
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-02-15',
      utilizationRate: 0,
      currentStudy: null
    }
  ]);

  const [stats] = useState({
    totalOrders: 125,
    scheduledToday: 18,
    inProgress: 6,
    completedToday: 22,
    pendingReports: 8,
    criticalFindings: 2
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'reading': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'stat': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'routine': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEquipmentStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'final': return 'bg-green-100 text-green-800';
      case 'preliminary': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleScheduleStudy = (orderNumber: string) => {
    toast({
      title: "Study Scheduled",
      description: `Imaging study ${orderNumber} has been scheduled successfully.`
    });
  };

  const handleStartStudy = (orderNumber: string) => {
    toast({
      title: "Study Started",
      description: `Imaging study ${orderNumber} is now in progress.`
    });
  };

  const handleCompleteStudy = (studyId: string) => {
    toast({
      title: "Study Completed",
      description: `Study ${studyId} has been completed and sent for reading.`
    });
  };

  const filteredOrders = imagingOrders.filter(order =>
    order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.studyType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Camera className="h-8 w-8 text-primary" />
            Medical Imaging
          </h1>
          <p className="text-muted-foreground">Manage imaging orders, studies, and equipment</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalOrders}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled Today</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.scheduledToday}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedToday}</p>
                </div>
                <Camera className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Reports</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingReports}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Findings</p>
                  <p className="text-2xl font-bold text-red-600">{stats.criticalFindings}</p>
                </div>
                <Monitor className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Imaging Orders</TabsTrigger>
            <TabsTrigger value="studies">Studies & Reports</TabsTrigger>
            <TabsTrigger value="equipment">Equipment Status</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Imaging Orders</CardTitle>
                    <CardDescription>Manage and schedule imaging studies</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold">{order.orderNumber}</h3>
                            <p className="text-sm text-muted-foreground">Patient: {order.patientName}</p>
                          </div>
                          <Badge variant="outline">{order.studyType}</Badge>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('-', ' ')}
                          </Badge>
                          {order.contrast && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              Contrast
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {order.status === 'scheduled' && (
                            <Button 
                              size="sm"
                              onClick={() => handleStartStudy(order.orderNumber)}
                            >
                              Start Study
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Study Information</p>
                          <p className="text-sm">Body Part: <span className="font-medium">{order.bodyPart}</span></p>
                          <p className="text-sm">Indication: <span className="font-medium">{order.indication}</span></p>
                          <p className="text-sm">Doctor: <span className="font-medium">{order.doctor}</span></p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Scheduling</p>
                          <p className="text-sm">Order Date: <span className="font-medium">{order.orderDate}</span></p>
                          <p className="text-sm">Scheduled: <span className="font-medium">{order.scheduledDate} at {order.scheduledTime}</span></p>
                          <p className="text-sm">Facility: <span className="font-medium">{order.facility}</span></p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Patient Details</p>
                          <p className="text-sm">Patient ID: <span className="font-medium">{order.patientId}</span></p>
                          <p className="text-sm">Priority: <span className="font-medium capitalize">{order.priority}</span></p>
                          <p className="text-sm">Status: <span className="font-medium capitalize">{order.status.replace('-', ' ')}</span></p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="studies">
            <Card>
              <CardHeader>
                <CardTitle>Studies & Reports</CardTitle>
                <CardDescription>View completed studies and radiologist reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studies.map((study) => (
                    <div key={study.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold">{study.studyId}</h3>
                            <p className="text-sm text-muted-foreground">Patient: {study.patientName}</p>
                          </div>
                          <Badge variant="outline">{study.modality}</Badge>
                          <Badge className={getStatusColor(study.status)}>
                            {study.status}
                          </Badge>
                          <Badge className={getReportStatusColor(study.reportStatus)}>
                            {study.reportStatus}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">
                            <Monitor className="mr-2 h-4 w-4" />
                            View Images
                          </Button>
                          {study.reportStatus === 'final' && (
                            <Button size="sm" variant="outline">
                              <FileText className="mr-2 h-4 w-4" />
                              View Report
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Study Details</p>
                          <p className="text-sm">Type: <span className="font-medium">{study.studyType}</span></p>
                          <p className="text-sm">Body Part: <span className="font-medium">{study.bodyPart}</span></p>
                          <p className="text-sm">Date: <span className="font-medium">{study.studyDate}</span></p>
                          <p className="text-sm">Images: <span className="font-medium">{study.images}</span></p>
                          <p className="text-sm">Radiologist: <span className="font-medium">{study.radiologist}</span></p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Report</p>
                          <div className="bg-background p-3 rounded border">
                            <p className="text-sm mb-2">
                              <strong>Findings:</strong> {study.findings}
                            </p>
                            <p className="text-sm">
                              <strong>Impression:</strong> {study.impression}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Status</CardTitle>
                <CardDescription>Monitor imaging equipment and utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {equipment.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.location}</p>
                          </div>
                          <Badge className={getEquipmentStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium">{item.type}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Utilization:</span>
                            <span className="font-medium">{item.utilizationRate}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Last Maintenance:</span>
                            <span className="font-medium">{item.lastMaintenance}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Next Maintenance:</span>
                            <span className="font-medium">{item.nextMaintenance}</span>
                          </div>
                          {item.currentStudy && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Current Study:</span>
                              <span className="font-medium">{item.currentStudy}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <Button size="sm" className="w-full">
                            View Schedule
                          </Button>
                          {item.status === 'maintenance' && (
                            <Button size="sm" variant="outline" className="w-full">
                              Mark Operational
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Imaging Reports</CardTitle>
                <CardDescription>Generate departmental and performance reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex-col">
                    <Camera className="h-6 w-6 mb-2" />
                    <span>Daily Studies Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Clock className="h-6 w-6 mb-2" />
                    <span>Turnaround Times</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Monitor className="h-6 w-6 mb-2" />
                    <span>Equipment Utilization</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    <span>Radiologist Productivity</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Calendar className="h-6 w-6 mb-2" />
                    <span>Scheduling Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Camera className="h-6 w-6 mb-2" />
                    <span>Quality Metrics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Imaging;