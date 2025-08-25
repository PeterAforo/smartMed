import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Users, Activity, FileText, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { NewFamilyHistoryDialog } from './NewFamilyHistoryDialog';
import { NewSurgicalHistoryDialog } from './NewSurgicalHistoryDialog';
import { NewHospitalizationDialog } from './NewHospitalizationDialog';

interface MedicalHistoryTrackerProps {
  patientId: string;
}

export const MedicalHistoryTracker: React.FC<MedicalHistoryTrackerProps> = ({ patientId }) => {
  const [showFamilyHistoryDialog, setShowFamilyHistoryDialog] = useState(false);
  const [showSurgicalHistoryDialog, setShowSurgicalHistoryDialog] = useState(false);
  const [showHospitalizationDialog, setShowHospitalizationDialog] = useState(false);

  const { data: familyHistory, isLoading: familyLoading, refetch: refetchFamily } = useQuery({
    queryKey: ['family-medical-history', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('family_medical_history')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: surgicalHistory, isLoading: surgicalLoading, refetch: refetchSurgical } = useQuery({
    queryKey: ['surgical-history', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('surgical_history')
        .select('*')
        .eq('patient_id', patientId)
        .order('surgery_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: hospitalizations, isLoading: hospitalizationLoading, refetch: refetchHospitalizations } = useQuery({
    queryKey: ['hospitalization-records', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hospitalization_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('admission_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'mild': return 'secondary';
      case 'moderate': return 'default';
      case 'severe': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'suspected': return 'secondary';
      case 'ruled_out': return 'outline';
      case 'active': return 'default';
      case 'completed': return 'secondary';
      default: return 'outline';
    }
  };

  const formatRelationship = (relationship: string) => {
    return relationship.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="family" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="family" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Family History
          </TabsTrigger>
          <TabsTrigger value="surgical" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Surgical History
          </TabsTrigger>
          <TabsTrigger value="hospitalization" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Hospitalizations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="family" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Family Medical History
                </CardTitle>
                <Button onClick={() => setShowFamilyHistoryDialog(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Family History
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {familyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {familyHistory?.map((record) => (
                      <div key={record.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{record.condition_name}</h4>
                            <div className="flex gap-2">
                              <Badge variant={getStatusBadgeVariant(record.status)}>
                                {record.status}
                              </Badge>
                              <Badge variant={getSeverityBadgeVariant(record.severity)}>
                                {record.severity}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Relationship:</strong> {formatRelationship(record.relationship)}</p>
                            {record.age_of_onset && (
                              <p><strong>Age of Onset:</strong> {record.age_of_onset} years</p>
                            )}
                            {record.notes && (
                              <p><strong>Notes:</strong> {record.notes}</p>
                            )}
                            <p><strong>Recorded:</strong> {format(new Date(record.created_at), 'MMM dd, yyyy')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!familyHistory?.length && (
                      <div className="text-center py-8 text-muted-foreground">
                        No family medical history recorded yet.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surgical" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Surgical History
                </CardTitle>
                <Button onClick={() => setShowSurgicalHistoryDialog(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Surgery
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {surgicalLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {surgicalHistory?.map((record) => (
                      <div key={record.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{record.procedure_name}</h4>
                            <Badge variant={getStatusBadgeVariant(record.outcome)}>
                              {record.outcome}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Date:</strong> {format(new Date(record.surgery_date), 'MMM dd, yyyy')}</p>
                            {record.surgeon_name && (
                              <p><strong>Surgeon:</strong> {record.surgeon_name}</p>
                            )}
                            {record.hospital_name && (
                              <p><strong>Hospital:</strong> {record.hospital_name}</p>
                            )}
                            {record.anesthesia_type && (
                              <p><strong>Anesthesia:</strong> {record.anesthesia_type}</p>
                            )}
                            {record.complications && (
                              <p><strong>Complications:</strong> {record.complications}</p>
                            )}
                            {record.notes && (
                              <p><strong>Notes:</strong> {record.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {!surgicalHistory?.length && (
                      <div className="text-center py-8 text-muted-foreground">
                        No surgical history recorded yet.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hospitalization" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Hospitalization Records
                </CardTitle>
                <Button onClick={() => setShowHospitalizationDialog(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Hospitalization
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {hospitalizationLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {hospitalizations?.map((record) => (
                      <div key={record.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{record.primary_diagnosis}</h4>
                            <Badge variant={getStatusBadgeVariant(record.status)}>
                              {record.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Hospital:</strong> {record.hospital_name}</p>
                            <p><strong>Admission:</strong> {format(new Date(record.admission_date), 'MMM dd, yyyy')}</p>
                            {record.discharge_date && (
                              <p><strong>Discharge:</strong> {format(new Date(record.discharge_date), 'MMM dd, yyyy')}</p>
                            )}
                            {record.length_of_stay && (
                              <p><strong>Length of Stay:</strong> {record.length_of_stay} days</p>
                            )}
                            {record.department && (
                              <p><strong>Department:</strong> {record.department}</p>
                            )}
                            {record.attending_physician && (
                              <p><strong>Attending Physician:</strong> {record.attending_physician}</p>
                            )}
                            <p><strong>Reason:</strong> {record.admission_reason}</p>
                            {record.discharge_summary && (
                              <p><strong>Discharge Summary:</strong> {record.discharge_summary}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {!hospitalizations?.length && (
                      <div className="text-center py-8 text-muted-foreground">
                        No hospitalization records found.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NewFamilyHistoryDialog
        open={showFamilyHistoryDialog}
        onOpenChange={setShowFamilyHistoryDialog}
        patientId={patientId}
        onSuccess={() => {
          refetchFamily();
          setShowFamilyHistoryDialog(false);
        }}
      />

      <NewSurgicalHistoryDialog
        open={showSurgicalHistoryDialog}
        onOpenChange={setShowSurgicalHistoryDialog}
        patientId={patientId}
        onSuccess={() => {
          refetchSurgical();
          setShowSurgicalHistoryDialog(false);
        }}
      />

      <NewHospitalizationDialog
        open={showHospitalizationDialog}
        onOpenChange={setShowHospitalizationDialog}
        patientId={patientId}
        onSuccess={() => {
          refetchHospitalizations();
          setShowHospitalizationDialog(false);
        }}
      />
    </div>
  );
};