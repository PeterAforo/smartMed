import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, FileText, Activity, Heart, Users, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface PatientTimelineDashboardProps {
  patientId: string;
}

const PatientTimelineDashboard: React.FC<PatientTimelineDashboardProps> = ({ patientId }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'all' | '30d' | '90d' | '1y'>('all');

  const { data: timelineData, isLoading } = useQuery({
    queryKey: ['patient-timeline', patientId, selectedTimeRange],
    queryFn: async () => {
      // Get appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('appointment_date', { ascending: false });

      // Get medical records
      const { data: medicalRecords } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      // Get prescriptions
      const { data: prescriptions } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      // Get lab results
      const { data: labResults } = await supabase
        .from('lab_results')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      // Get vital signs
      const { data: vitalSigns } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false });

      // Get family medical history
      const { data: familyHistory } = await supabase
        .from('family_medical_history')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      // Get surgical history
      const { data: surgicalHistory } = await supabase
        .from('surgical_history')
        .select('*')
        .eq('patient_id', patientId)
        .order('surgery_date', { ascending: false });

      // Get hospitalization records
      const { data: hospitalizations } = await supabase
        .from('hospitalization_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('admission_date', { ascending: false });

      // Combine and sort all timeline events
      const allEvents = [
        ...(appointments || []).map(item => ({
          ...item,
          type: 'appointment',
          date: item.appointment_date,
          title: `${item.appointment_type} Appointment`,
          icon: Calendar,
          status: item.status
        })),
        ...(medicalRecords || []).map(item => ({
          ...item,
          type: 'medical_record',
          date: item.created_at,
          title: item.title,
          icon: FileText,
          status: item.status
        })),
        ...(prescriptions || []).map(item => ({
          ...item,
          type: 'prescription',
          date: item.created_at,
          title: `Prescription: ${item.medication_name}`,
          icon: Activity,
          status: item.status
        })),
        ...(labResults || []).map(item => ({
          ...item,
          type: 'lab_result',
          date: item.created_at,
          title: `Lab: ${item.test_name}`,
          icon: Activity,
          status: item.status
        })),
        ...(vitalSigns || []).map(item => ({
          ...item,
          type: 'vital_signs',
          date: item.recorded_at,
          title: 'Vital Signs Recorded',
          icon: Heart,
          status: 'recorded'
        })),
        ...(familyHistory || []).map(item => ({
          ...item,
          type: 'family_history',
          date: item.created_at,
          title: `Family History: ${item.condition_name}`,
          icon: Users,
          status: item.status
        })),
        ...(surgicalHistory || []).map(item => ({
          ...item,
          type: 'surgery',
          date: item.surgery_date,
          title: `Surgery: ${item.procedure_name}`,
          icon: Activity,
          status: 'completed'
        })),
        ...(hospitalizations || []).map(item => ({
          ...item,
          type: 'hospitalization',
          date: item.admission_date,
          title: `Hospitalization: ${item.primary_diagnosis}`,
          icon: Activity,
          status: item.status
        }))
      ];

      return allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  });

  const getStatusBadgeVariant = (status: string, type: string) => {
    if (type === 'appointment') {
      switch (status) {
        case 'completed': return 'default';
        case 'scheduled': return 'secondary';
        case 'cancelled': return 'destructive';
        default: return 'outline';
      }
    }
    return status === 'active' ? 'default' : 'secondary';
  };

  const formatEventDate = (date: string) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Patient Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Patient Timeline
          </CardTitle>
          <div className="flex gap-2">
            {(['all', '30d', '90d', '1y'] as const).map((range) => (
              <Button
                key={range}
                variant={selectedTimeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeRange(range)}
              >
                {range === 'all' ? 'All' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {timelineData?.map((event, index) => {
                  const IconComponent = event.icon;
                  return (
                    <div key={`${event.type}-${event.id}-${index}`} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-card-foreground">{event.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadgeVariant(event.status, event.type)}>
                              {event.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatEventDate(event.date)}
                            </span>
                          </div>
                        </div>
                        {event.type === 'medical_record' && 'description' in event && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description || 'No description available'}
                          </p>
                        )}
                        {event.type === 'prescription' && 'dosage' in event && 'frequency' in event && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.dosage} - {event.frequency}
                          </p>
                        )}
                        {event.type === 'appointment' && 'notes' in event && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.notes || 'No notes available'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {!timelineData?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    No timeline events found for this patient.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-primary">
                    {timelineData?.filter(e => e.type === 'appointment').length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Appointments</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-primary">
                    {timelineData?.filter(e => e.type === 'prescription').length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Prescriptions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-primary">
                    {timelineData?.filter(e => e.type === 'lab_result').length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Lab Results</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-primary">
                    {timelineData?.filter(e => e.type === 'surgery').length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Surgeries</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Trend analysis will be available soon.</p>
              <p className="text-sm">This will include vital signs trends, medication adherence, and health outcomes.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PatientTimelineDashboard;