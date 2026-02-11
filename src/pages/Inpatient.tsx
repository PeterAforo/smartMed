import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bed, Search, Calendar, User, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

const Inpatient = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch stats from API
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admissions-stats'],
    queryFn: () => api.getAdmissionsStats()
  });

  // Fetch current inpatients
  const { data: inpatients = [], isLoading: inpatientsLoading } = useQuery({
    queryKey: ['current-inpatients', searchTerm],
    queryFn: () => api.getCurrentInpatients(searchTerm || undefined)
  });

  // Fetch pending admissions
  const { data: admissions = [], isLoading: admissionsLoading } = useQuery({
    queryKey: ['pending-admissions'],
    queryFn: () => api.getPendingAdmissions()
  });

  // Fetch discharges
  const { data: discharges = [], isLoading: dischargesLoading } = useQuery({
    queryKey: ['discharges'],
    queryFn: () => api.getDischarges()
  });

  // Fetch available beds for assignment
  const { data: availableBeds = [] } = useQuery({
    queryKey: ['available-beds'],
    queryFn: () => api.getBeds({ status: 'available' })
  });

  // Mutation for updating admission status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateAdmission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-inpatients'] });
      queryClient.invalidateQueries({ queryKey: ['admissions-stats'] });
      toast({ title: "Status Updated", description: "Patient status has been updated." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Mutation for discharge
  const dischargeMutation = useMutation({
    mutationFn: (admissionId: string) => api.dischargePatient(admissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-inpatients'] });
      queryClient.invalidateQueries({ queryKey: ['discharges'] });
      queryClient.invalidateQueries({ queryKey: ['admissions-stats'] });
      queryClient.invalidateQueries({ queryKey: ['available-beds'] });
      toast({ title: "Patient Discharged", description: "Patient has been discharged successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-100 text-green-800';
      case 'improving': return 'bg-blue-100 text-blue-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'declining': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'routine': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDischargeStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateStatus = (admissionId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: admissionId, data: { condition_status: newStatus } });
  };

  const handleDischarge = (admissionId: string) => {
    dischargeMutation.mutate(admissionId);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Bed className="h-8 w-8 text-primary" />
            Inpatient Department
          </h1>
          <p className="text-muted-foreground">Manage admitted patients, admissions, and discharges</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Beds</p>
                  <p className="text-2xl font-bold text-primary">{stats?.total_beds || 0}</p>
                </div>
                <Bed className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Occupied</p>
                  <p className="text-2xl font-bold text-red-600">{stats?.occupied_beds || 0}</p>
                </div>
                <User className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.available_beds || 0}</p>
                </div>
                <Bed className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Admissions Today</p>
                  <p className="text-2xl font-bold text-blue-600">{stats?.admissions_today || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Discharges Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.discharges_today || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Patients</p>
                  <p className="text-2xl font-bold text-red-600">{stats?.critical_patients || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="current" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current Patients</TabsTrigger>
            <TabsTrigger value="admissions">New Admissions</TabsTrigger>
            <TabsTrigger value="discharges">Discharges</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Current Inpatients</CardTitle>
                    <CardDescription>Patients currently admitted in the hospital</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {inpatientsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : inpatients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No inpatients found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inpatients.map((patient: any) => (
                      <div key={patient.id} className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <h3 className="font-semibold">
                              {patient.patient_first_name} {patient.patient_last_name}
                            </h3>
                            {patient.room_number && <Badge variant="outline">Room {patient.room_number}</Badge>}
                            {patient.bed_number && <Badge variant="outline">Bed {patient.bed_number}</Badge>}
                            <Badge className={getStatusColor(patient.condition_status || 'stable')}>
                              {patient.condition_status || 'stable'}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleUpdateStatus(patient.id, 'improving')}>
                              Update Status
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDischarge(patient.id)}>
                              Discharge
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Patient ID: {patient.patient_number} • Admitted: {formatDate(patient.admission_date)}
                            </p>
                            <p className="text-sm text-muted-foreground mb-2">
                              Attending: Dr. {patient.doctor_first_name} {patient.doctor_last_name}
                            </p>
                            <p className="text-sm mb-2">
                              <strong>Diagnosis:</strong> {patient.diagnosis || 'N/A'}
                            </p>
                            <p className="text-sm mb-2">
                              <strong>Diet:</strong> {patient.diet || 'Regular'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm mb-2">
                              <strong>Expected Discharge:</strong> {patient.expected_discharge ? formatDate(patient.expected_discharge) : 'TBD'}
                            </p>
                            <p className="text-sm">
                              <strong>Allergies:</strong> {patient.patient_allergies?.length > 0 ? patient.patient_allergies.join(', ') : 'None'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admissions">
            <Card>
              <CardHeader>
                <CardTitle>New Admissions</CardTitle>
                <CardDescription>Patients being admitted today</CardDescription>
              </CardHeader>
              <CardContent>
                {admissionsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : admissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending admissions
                  </div>
                ) : (
                  <div className="space-y-4">
                    {admissions.map((admission: any) => (
                      <div key={admission.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold">
                              {admission.patient_first_name} {admission.patient_last_name}
                            </h3>
                            <Badge className={getPriorityColor(admission.admission_type)}>
                              {admission.admission_type}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{formatTime(admission.admission_date)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Patient ID: {admission.patient_number} • From: {admission.admission_source || 'Direct'}
                          </p>
                          <p className="text-sm text-muted-foreground mb-1">
                            Doctor: Dr. {admission.doctor_first_name} {admission.doctor_last_name}
                          </p>
                          <p className="text-sm">
                            <strong>Diagnosis:</strong> {admission.diagnosis || 'Pending'}
                          </p>
                          <p className="text-sm">
                            <strong>Room:</strong> {admission.room_number || 'Pending Assignment'}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Assign Room
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discharges">
            <Card>
              <CardHeader>
                <CardTitle>Patient Discharges</CardTitle>
                <CardDescription>Patients being discharged today</CardDescription>
              </CardHeader>
              <CardContent>
                {dischargesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : discharges.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No discharges today
                  </div>
                ) : (
                  <div className="space-y-4">
                    {discharges.map((discharge: any) => (
                      <div key={discharge.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold">
                              {discharge.patient_first_name} {discharge.patient_last_name}
                            </h3>
                            {discharge.room_number && <Badge variant="outline">Room {discharge.room_number}</Badge>}
                            <Badge className={getDischargeStatusColor(discharge.discharge_status || 'pending')}>
                              {discharge.discharge_status || 'pending'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {discharge.actual_discharge ? formatTime(discharge.actual_discharge) : 'Pending'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Patient ID: {discharge.patient_number} • Doctor: Dr. {discharge.doctor_first_name} {discharge.doctor_last_name}
                          </p>
                          <p className="text-sm">
                            <strong>Follow-up:</strong> {discharge.follow_up_date ? formatDate(discharge.follow_up_date) : 'Not scheduled'}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          {discharge.discharge_status === 'pending' && (
                            <Button size="sm" onClick={() => handleDischarge(discharge.id)}>
                              Process Discharge
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Discharge Summary
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Inpatient;
