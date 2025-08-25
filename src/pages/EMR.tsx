import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, User, Heart, Calendar, Search, Plus, Activity, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EMR = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for patient records
  const [patientRecords] = useState([
    {
      id: 1,
      patientId: 'PAT001',
      name: 'John Smith',
      age: 45,
      gender: 'Male',
      lastVisit: '2024-01-15',
      diagnosis: 'Hypertension',
      status: 'active',
      allergies: ['Penicillin', 'Shellfish'],
      medications: ['Lisinopril 10mg', 'Metformin 500mg'],
      vitals: { bp: '140/90', hr: 72, temp: 98.6, weight: 180 }
    },
    {
      id: 2,
      patientId: 'PAT002',
      name: 'Sarah Johnson',
      age: 32,
      gender: 'Female',
      lastVisit: '2024-01-14',
      diagnosis: 'Diabetes Type 2',
      status: 'active',
      allergies: ['Latex'],
      medications: ['Metformin 1000mg', 'Glipizide 5mg'],
      vitals: { bp: '125/80', hr: 78, temp: 98.4, weight: 145 }
    },
    {
      id: 3,
      patientId: 'PAT003',
      name: 'Michael Brown',
      age: 58,
      gender: 'Male',
      lastVisit: '2024-01-13',
      diagnosis: 'Coronary Artery Disease',
      status: 'critical',
      allergies: ['Aspirin'],
      medications: ['Atorvastatin 40mg', 'Clopidogrel 75mg'],
      vitals: { bp: '160/95', hr: 88, temp: 99.1, weight: 195 }
    }
  ]);

  // Mock data for recent activities
  const [recentActivities] = useState([
    {
      id: 1,
      type: 'lab_result',
      patient: 'John Smith',
      description: 'Blood panel results received',
      time: '2 hours ago',
      priority: 'normal'
    },
    {
      id: 2,
      type: 'prescription',
      patient: 'Sarah Johnson',
      description: 'New prescription added: Insulin',
      time: '4 hours ago',
      priority: 'high'
    },
    {
      id: 3,
      type: 'appointment',
      patient: 'Michael Brown',
      description: 'Follow-up appointment scheduled',
      time: '6 hours ago',
      priority: 'normal'
    }
  ]);

  const [emrStats] = useState({
    totalRecords: 2847,
    activePatients: 1523,
    criticalAlerts: 8,
    pendingResults: 24,
    todaysVisits: 67,
    systemUptime: 99.8
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'critical': return 'bg-red-500 text-white';
      case 'stable': return 'bg-blue-500 text-white';
      case 'discharged': return 'bg-gray-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'normal': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleViewRecord = (patientId: string) => {
    toast({
      title: "Opening Record",
      description: `Loading complete medical record for ${patientId}`,
    });
  };

  const handleNewRecord = () => {
    toast({
      title: "New Record",
      description: "Creating new patient medical record",
    });
  };

  const filteredRecords = patientRecords.filter(record =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Electronic Medical Records</h1>
          <p className="text-muted-foreground">
            Comprehensive patient record management and clinical documentation system
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emrStats.totalRecords.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Complete medical histories
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emrStats.activePatients.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Currently under care
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{emrStats.criticalAlerts}</div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Results</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emrStats.pendingResults}</div>
              <p className="text-xs text-muted-foreground">
                Lab and imaging results
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Visits</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emrStats.todaysVisits}</div>
              <p className="text-xs text-muted-foreground">
                Patient encounters today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{emrStats.systemUptime}%</div>
              <p className="text-xs text-muted-foreground">
                System availability
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="records" className="space-y-4">
          <TabsList>
            <TabsTrigger value="records">Patient Records</TabsTrigger>
            <TabsTrigger value="activities">Recent Activities</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="reports">Clinical Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Medical Records</CardTitle>
                <CardDescription>
                  Search and manage comprehensive patient medical histories
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name, ID, or diagnosis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button onClick={handleNewRecord}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Record
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{record.name}</h3>
                          <Badge variant="outline">{record.patientId}</Badge>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{record.age}y • {record.gender}</span>
                          <span>Last Visit: {record.lastVisit}</span>
                          <span>Diagnosis: {record.diagnosis}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div>BP: {record.vitals.bp}</div>
                          <div>HR: {record.vitals.hr} bpm</div>
                          <div>Temp: {record.vitals.temp}°F</div>
                          <div>Weight: {record.vitals.weight} lbs</div>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Allergies: </span>
                          {record.allergies.join(', ')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button size="sm" onClick={() => handleViewRecord(record.patientId)}>
                          View Record
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Print
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent EMR Activities</CardTitle>
                <CardDescription>
                  Track recent updates, alerts, and system activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{activity.patient}</h3>
                          <Badge className={getPriorityColor(activity.priority)}>
                            {activity.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Follow Up
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Documentation Templates</CardTitle>
                <CardDescription>
                  Standardized templates for efficient clinical documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { name: 'SOAP Note', category: 'Progress Notes', usage: 245 },
                    { name: 'Admission Assessment', category: 'Assessments', usage: 89 },
                    { name: 'Discharge Summary', category: 'Summaries', usage: 156 },
                    { name: 'Operative Report', category: 'Procedures', usage: 78 },
                    { name: 'Consultation Report', category: 'Consultations', usage: 123 },
                    { name: 'H&P Template', category: 'History & Physical', usage: 201 }
                  ].map((template, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant="outline">{template.category}</Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Usage this month:</span>
                            <span className="font-medium">{template.usage}</span>
                          </div>
                          <Button className="w-full" variant="outline" size="sm">
                            Use Template
                          </Button>
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
                <CardTitle>Clinical Reports & Analytics</CardTitle>
                <CardDescription>
                  Generate clinical reports and analyze patient data trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Button variant="outline" className="h-20 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    Patient Summary Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Activity className="h-6 w-6 mb-2" />
                    Clinical Quality Metrics
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Heart className="h-6 w-6 mb-2" />
                    Chronic Disease Registry
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <AlertCircle className="h-6 w-6 mb-2" />
                    Medication Alerts Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Calendar className="h-6 w-6 mb-2" />
                    Care Gap Analysis
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <User className="h-6 w-6 mb-2" />
                    Provider Productivity
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

export default EMR;