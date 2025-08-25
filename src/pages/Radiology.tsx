import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Camera, FileText, Clock, User, Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Radiology = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for radiology imaging queue
  const [imagingQueue] = useState([
    {
      id: 1,
      patientName: 'John Smith',
      patientId: 'PAT001',
      examType: 'CT Scan - Chest',
      priority: 'urgent',
      scheduledTime: '09:00 AM',
      status: 'scheduled',
      technician: 'Dr. Wilson',
      room: 'CT-1'
    },
    {
      id: 2,
      patientName: 'Sarah Johnson',
      patientId: 'PAT002',
      examType: 'X-Ray - Knee',
      priority: 'routine',
      scheduledTime: '09:30 AM',
      status: 'in-progress',
      technician: 'Tech. Brown',
      room: 'X-RAY-2'
    },
    {
      id: 3,
      patientName: 'Mike Davis',
      patientId: 'PAT003',
      examType: 'MRI - Brain',
      priority: 'stat',
      scheduledTime: '10:00 AM',
      status: 'waiting',
      technician: 'Dr. Anderson',
      room: 'MRI-1'
    }
  ]);

  // Mock data for recent studies
  const [recentStudies] = useState([
    {
      id: 1,
      patientName: 'Emily Wilson',
      studyType: 'CT Abdomen',
      date: '2024-01-15',
      status: 'completed',
      findings: 'Normal findings',
      radiologist: 'Dr. Martinez'
    },
    {
      id: 2,
      patientName: 'David Brown',
      studyType: 'X-Ray Chest',
      date: '2024-01-15',
      status: 'pending-report',
      findings: 'Under review',
      radiologist: 'Dr. Thompson'
    }
  ]);

  const [stats] = useState({
    todaysExams: 24,
    completedStudies: 18,
    pendingReports: 6,
    equipmentUtilization: 87
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'stat': return 'bg-destructive text-destructive-foreground';
      case 'urgent': return 'bg-orange-500 text-white';
      case 'routine': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in-progress': return 'bg-blue-500 text-white';
      case 'waiting': return 'bg-yellow-500 text-white';
      case 'scheduled': return 'bg-secondary text-secondary-foreground';
      case 'pending-report': return 'bg-orange-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleStartExam = (examId: number) => {
    toast({
      title: "Exam Started",
      description: "Patient examination has been initiated.",
    });
  };

  const handleCompleteExam = (examId: number) => {
    toast({
      title: "Exam Completed",
      description: "Images captured and sent for review.",
    });
  };

  const filteredQueue = imagingQueue.filter(exam =>
    exam.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.examType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Radiology Department</h1>
          <p className="text-muted-foreground">
            Manage imaging studies, equipment scheduling, and radiology reports
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Exams</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todaysExams}</div>
              <p className="text-xs text-muted-foreground">
                +2 from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Studies</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedStudies}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.completedStudies / stats.todaysExams) * 100)}% completion rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReports}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting radiologist review
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipment Utilization</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.equipmentUtilization}%</div>
              <p className="text-xs text-muted-foreground">
                Optimal efficiency range
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="queue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="queue">Imaging Queue</TabsTrigger>
            <TabsTrigger value="studies">Recent Studies</TabsTrigger>
            <TabsTrigger value="equipment">Equipment Status</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Imaging Schedule</CardTitle>
                <CardDescription>
                  Manage patient imaging queue and track exam progress
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients, IDs, or exam types..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Exam
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredQueue.map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{exam.patientName}</h3>
                          <Badge variant="outline">{exam.patientId}</Badge>
                          <Badge className={getPriorityColor(exam.priority)}>
                            {exam.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{exam.examType}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center"><Clock className="mr-1 h-3 w-3" />{exam.scheduledTime}</span>
                          <span className="flex items-center"><User className="mr-1 h-3 w-3" />{exam.technician}</span>
                          <span>Room: {exam.room}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(exam.status)}>
                          {exam.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                        {exam.status === 'scheduled' && (
                          <Button size="sm" onClick={() => handleStartExam(exam.id)}>
                            Start Exam
                          </Button>
                        )}
                        {exam.status === 'in-progress' && (
                          <Button size="sm" onClick={() => handleCompleteExam(exam.id)}>
                            Complete
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="studies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Studies</CardTitle>
                <CardDescription>
                  Review completed imaging studies and pending reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentStudies.map((study) => (
                    <div key={study.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{study.patientName}</h3>
                          <Badge className={getStatusColor(study.status)}>
                            {study.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{study.studyType}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Date: {study.date}</span>
                          <span>Radiologist: {study.radiologist}</span>
                        </div>
                        <p className="text-sm">{study.findings}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          View Images
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

          <TabsContent value="equipment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Status</CardTitle>
                <CardDescription>
                  Monitor imaging equipment availability and maintenance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { name: 'CT Scanner 1', status: 'operational', utilization: 85, nextMaintenance: '2024-02-01' },
                    { name: 'MRI Machine 1', status: 'operational', utilization: 92, nextMaintenance: '2024-01-25' },
                    { name: 'X-Ray Room 1', status: 'operational', utilization: 67, nextMaintenance: '2024-02-10' },
                    { name: 'X-Ray Room 2', status: 'maintenance', utilization: 0, nextMaintenance: '2024-01-16' },
                    { name: 'Ultrasound 1', status: 'operational', utilization: 78, nextMaintenance: '2024-02-05' },
                    { name: 'Mammography', status: 'operational', utilization: 45, nextMaintenance: '2024-01-30' }
                  ].map((equipment, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{equipment.name}</CardTitle>
                        <Badge className={equipment.status === 'operational' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                          {equipment.status.toUpperCase()}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Utilization:</span>
                            <span>{equipment.utilization}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Next Maintenance:</span>
                            <span>{equipment.nextMaintenance}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Radiology Reports</CardTitle>
                <CardDescription>
                  Generate and manage radiology department reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" className="h-20 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    Daily Imaging Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Camera className="h-6 w-6 mb-2" />
                    Equipment Utilization
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Clock className="h-6 w-6 mb-2" />
                    Turnaround Times
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <User className="h-6 w-6 mb-2" />
                    Radiologist Performance
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

export default Radiology;