import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Baby, Heart, Calendar, Clock, User, Bell, Search, Plus, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Obstetrics = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for expectant mothers
  const [expectantMothers] = useState([
    {
      id: 1,
      patientId: 'OB001',
      name: 'Sarah Johnson',
      age: 28,
      gestationalAge: '32 weeks 4 days',
      edd: '2024-03-15',
      lastVisit: '2024-01-12',
      riskLevel: 'low',
      complications: [],
      nextAppointment: '2024-01-26',
      obstetrician: 'Dr. Emily Wilson',
      status: 'active'
    },
    {
      id: 2,
      patientId: 'OB002',
      name: 'Maria Garcia',
      age: 35,
      gestationalAge: '28 weeks 2 days',
      edd: '2024-04-10',
      lastVisit: '2024-01-14',
      riskLevel: 'high',
      complications: ['Gestational Diabetes', 'Advanced Maternal Age'],
      nextAppointment: '2024-01-21',
      obstetrician: 'Dr. Michael Brown',
      status: 'active'
    },
    {
      id: 3,
      patientId: 'OB003',
      name: 'Lisa Chen',
      age: 24,
      gestationalAge: '38 weeks 1 day',
      edd: '2024-01-25',
      lastVisit: '2024-01-15',
      riskLevel: 'medium',
      complications: ['Mild Preeclampsia'],
      nextAppointment: '2024-01-18',
      obstetrician: 'Dr. Jennifer Martinez',
      status: 'term'
    }
  ]);

  // Mock data for deliveries
  const [recentDeliveries] = useState([
    {
      id: 1,
      mother: 'Jennifer Smith',
      deliveryDate: '2024-01-15',
      deliveryTime: '03:45 AM',
      type: 'Normal Vaginal Delivery',
      babyGender: 'Female',
      babyWeight: '3.2 kg',
      complications: 'None',
      apgarScore: '9/10',
      attending: 'Dr. Emily Wilson'
    },
    {
      id: 2,
      mother: 'Amanda Davis',
      deliveryDate: '2024-01-14',
      deliveryTime: '11:30 PM',
      type: 'Cesarean Section',
      babyGender: 'Male',
      babyWeight: '3.8 kg',
      complications: 'Cord around neck',
      apgarScore: '8/9',
      attending: 'Dr. Michael Brown'
    }
  ]);

  const [obStats] = useState({
    activePregnancies: 245,
    dueSoon: 18,
    highRiskCases: 32,
    deliveriesThisMonth: 67,
    currentInLabor: 3,
    neonatalCare: 12
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'high': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500 text-white';
      case 'term': return 'bg-green-500 text-white';
      case 'labor': return 'bg-red-500 text-white';
      case 'delivered': return 'bg-gray-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const calculateWeeksUntilDue = (edd: string) => {
    const dueDate = new Date(edd);
    const today = new Date();
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.ceil(daysDiff / 7);
  };

  const handleScheduleCheckup = (patientId: string) => {
    toast({
      title: "Checkup Scheduled",
      description: `Prenatal checkup scheduled for patient ${patientId}`,
    });
  };

  const handleEmergencyAlert = (patientId: string) => {
    toast({
      title: "Emergency Alert",
      description: `Emergency protocol initiated for patient ${patientId}`,
      variant: "destructive",
    });
  };

  const filteredMothers = expectantMothers.filter(mother =>
    mother.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mother.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mother.obstetrician.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Obstetrics & Maternity</h1>
          <p className="text-muted-foreground">
            Comprehensive maternal care, delivery management, and neonatal services
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Pregnancies</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{obStats.activePregnancies}</div>
              <p className="text-xs text-muted-foreground">
                Under prenatal care
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{obStats.dueSoon}</div>
              <p className="text-xs text-muted-foreground">
                Due within 2 weeks
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{obStats.highRiskCases}</div>
              <p className="text-xs text-muted-foreground">
                Requiring special monitoring
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deliveries This Month</CardTitle>
              <Baby className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{obStats.deliveriesThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                Successful deliveries
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Currently in Labor</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{obStats.currentInLabor}</div>
              <p className="text-xs text-muted-foreground">
                Active labor cases
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Neonatal Care</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{obStats.neonatalCare}</div>
              <p className="text-xs text-muted-foreground">
                Babies in NICU/nursery
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pregnancies" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pregnancies">Active Pregnancies</TabsTrigger>
            <TabsTrigger value="deliveries">Recent Deliveries</TabsTrigger>
            <TabsTrigger value="labor">Labor & Delivery</TabsTrigger>
            <TabsTrigger value="neonatal">Neonatal Care</TabsTrigger>
          </TabsList>

          <TabsContent value="pregnancies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Prenatal Care Management</CardTitle>
                <CardDescription>
                  Monitor expectant mothers and manage prenatal appointments
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name, ID, or physician..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Pregnancy Record
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredMothers.map((mother) => (
                    <div key={mother.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{mother.name}</h3>
                          <Badge variant="outline">{mother.patientId}</Badge>
                          <Badge className={getRiskColor(mother.riskLevel)}>
                            {mother.riskLevel.toUpperCase()} RISK
                          </Badge>
                          <Badge className={getStatusColor(mother.status)}>
                            {mother.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Age: {mother.age}</span>
                          <span>{mother.gestationalAge}</span>
                          <span>EDD: {mother.edd}</span>
                          <span>{calculateWeeksUntilDue(mother.edd)} weeks to go</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center"><User className="mr-1 h-3 w-3" />Dr: {mother.obstetrician}</span>
                          <span className="flex items-center"><Calendar className="mr-1 h-3 w-3" />Next: {mother.nextAppointment}</span>
                        </div>
                        {mother.complications.length > 0 && (
                          <div className="text-sm">
                            <span className="text-red-600 font-medium">Complications: </span>
                            {mother.complications.join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button size="sm" onClick={() => handleScheduleCheckup(mother.patientId)}>
                          Schedule Checkup
                        </Button>
                        {mother.riskLevel === 'high' && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleEmergencyAlert(mother.patientId)}
                          >
                            Emergency
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          View Record
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deliveries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Deliveries</CardTitle>
                <CardDescription>
                  Review recent births and delivery outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDeliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{delivery.mother}</h3>
                          <Badge className="bg-green-500 text-white">DELIVERED</Badge>
                        </div>
                        <p className="text-sm font-medium text-blue-600">{delivery.type}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center"><Calendar className="mr-1 h-3 w-3" />{delivery.deliveryDate}</span>
                          <span className="flex items-center"><Clock className="mr-1 h-3 w-3" />{delivery.deliveryTime}</span>
                          <span className="flex items-center"><User className="mr-1 h-3 w-3" />{delivery.attending}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span>Baby: {delivery.babyGender}, {delivery.babyWeight}</span>
                          <span>APGAR: {delivery.apgarScore}</span>
                          <span className={delivery.complications === 'None' ? 'text-green-600' : 'text-red-600'}>
                            {delivery.complications}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          Birth Certificate
                        </Button>
                        <Button variant="outline" size="sm">
                          Discharge Summary
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="labor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Labor & Delivery Ward</CardTitle>
                <CardDescription>
                  Monitor active labor cases and delivery room status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Active Labor Cases</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { name: 'Patricia Wilson', room: 'L&D-1', stage: 'Active Labor', cervix: '6 cm', time: '4 hours' },
                        { name: 'Rebecca Martinez', room: 'L&D-2', stage: 'Transition', cervix: '9 cm', time: '8 hours' },
                        { name: 'Angela Thompson', room: 'L&D-3', stage: 'Early Labor', cervix: '3 cm', time: '2 hours' }
                      ].map((patient, index) => (
                        <div key={index} className="p-3 border rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{patient.name}</p>
                              <p className="text-xs text-muted-foreground">{patient.room}</p>
                              <p className="text-xs">Stage: {patient.stage}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs">Dilation: {patient.cervix}</p>
                              <p className="text-xs text-muted-foreground">Duration: {patient.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Delivery Room Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { room: 'L&D Room 1', status: 'occupied', patient: 'Patricia Wilson', nurse: 'Nurse Johnson' },
                        { room: 'L&D Room 2', status: 'occupied', patient: 'Rebecca Martinez', nurse: 'Nurse Davis' },
                        { room: 'L&D Room 3', status: 'occupied', patient: 'Angela Thompson', nurse: 'Nurse Wilson' },
                        { room: 'L&D Room 4', status: 'available', patient: null, nurse: 'Nurse Smith' }
                      ].map((room, index) => (
                        <div key={index} className="p-3 border rounded">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm">{room.room}</p>
                              <p className="text-xs text-muted-foreground">{room.nurse}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(room.status)}>
                                {room.status.toUpperCase()}
                              </Badge>
                              {room.patient && (
                                <p className="text-xs mt-1">{room.patient}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="neonatal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Neonatal Intensive Care Unit</CardTitle>
                <CardDescription>
                  Monitor newborns requiring specialized care
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { name: 'Baby Johnson', mother: 'Sarah Johnson', weight: '2.1 kg', gestationalAge: '34 weeks', condition: 'Respiratory distress', days: 5 },
                    { name: 'Baby Martinez', mother: 'Maria Martinez', weight: '1.8 kg', gestationalAge: '32 weeks', condition: 'Feeding difficulties', days: 12 },
                    { name: 'Baby Thompson', mother: 'Lisa Thompson', weight: '2.5 kg', gestationalAge: '36 weeks', condition: 'Jaundice', days: 3 },
                    { name: 'Baby Wilson', mother: 'Jennifer Wilson', weight: '3.0 kg', gestationalAge: '38 weeks', condition: 'Observation', days: 1 }
                  ].map((baby, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{baby.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">Mother: {baby.mother}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Weight:</span>
                            <span>{baby.weight}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>GA:</span>
                            <span>{baby.gestationalAge}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Condition:</span>
                            <span className="text-right">{baby.condition}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Days in NICU:</span>
                            <span>{baby.days}</span>
                          </div>
                          <Button className="w-full mt-2" variant="outline" size="sm">
                            View Chart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Obstetrics;