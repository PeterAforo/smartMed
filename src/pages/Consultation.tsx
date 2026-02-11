import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  FileText, 
  Stethoscope, 
  Activity, 
  Pill, 
  TestTube, 
  ArrowLeft,
  Save,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEncounters } from '@/hooks/useEncounters';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ClinicalNotesSection } from '@/components/doctor/ClinicalNotesSection';
import { VitalsRecordingSection } from '@/components/doctor/VitalsRecordingSection';
import { PrescriptionSection } from '@/components/doctor/PrescriptionSection';
import { OrdersSection } from '@/components/doctor/OrdersSection';
import { PatientContextPanel } from '@/components/doctor/PatientContextPanel';

const Consultation = () => {
  const { patientId, queueId } = useParams<{ patientId: string; queueId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createEncounter, isCreating } = useEncounters();
  const [encounterId, setEncounterId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('history');
  const [consultationStatus, setConsultationStatus] = useState<'starting' | 'active' | 'completing'>('starting');

  // Fetch patient data
  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => api.getPatient(patientId!),
    enabled: !!patientId
  });

  // Fetch queue entry if queueId provided
  const { data: queueEntry } = useQuery({
    queryKey: ['queue', 'entry', queueId],
    queryFn: async () => {
      const queue = await api.getQueue({});
      return queue.find((q: any) => q.id === queueId);
    },
    enabled: !!queueId
  });

  const patientName = patient ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() : 'Loading...';
  const chiefComplaint = queueEntry?.chief_complaint || 'General consultation';

  const handleStartConsultation = async () => {
    if (!patientId) return;

    try {
      const encounterData = {
        patient_id: patientId,
        encounter_type: 'OPD' as const,
        chief_complaint: chiefComplaint,
        notes: `Consultation started at ${new Date().toLocaleTimeString()}`
      };

      createEncounter(encounterData, {
        onSuccess: (newEncounter) => {
          setEncounterId(newEncounter.id);
          setConsultationStatus('active');
          
          // Update queue status if we have a queue entry
          if (queueId) {
            api.updateQueueStatus(queueId, 'in_progress');
            queryClient.invalidateQueries({ queryKey: ['queue'] });
          }
          
          toast({
            title: "Consultation Started",
            description: `Active consultation for ${patientName}`
          });
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start consultation",
        variant: "destructive"
      });
    }
  };

  const handleCompleteConsultation = async () => {
    setConsultationStatus('completing');
    
    // Update queue status to completed
    if (queueId) {
      try {
        await api.updateQueueStatus(queueId, 'completed');
        queryClient.invalidateQueries({ queryKey: ['queue'] });
      } catch (error) {
        console.error('Failed to update queue status:', error);
      }
    }
    
    toast({
      title: "Consultation Completed",
      description: "Patient consultation has been completed successfully."
    });
    
    navigate('/doctor');
  };

  const handleBack = () => {
    if (consultationStatus === 'active') {
      const confirmClose = window.confirm(
        'Are you sure you want to leave this consultation? Any unsaved changes will be lost.'
      );
      if (!confirmClose) return;
    }
    navigate('/doctor');
  };

  if (patientLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b bg-background px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Queue
              </Button>
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Consultation - {patientName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Patient ID: {patient?.patient_number || patientId} • Chief Complaint: {chiefComplaint}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={consultationStatus === 'active' ? 'default' : 'secondary'}>
                  {consultationStatus === 'starting' && 'Not Started'}
                  {consultationStatus === 'active' && 'Active'}
                  {consultationStatus === 'completing' && 'Completing'}
                </Badge>
                {encounterId && (
                  <Badge variant="outline">
                    Encounter: {encounterId.slice(0, 8)}...
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {consultationStatus === 'starting' && (
                <Button 
                  onClick={handleStartConsultation}
                  disabled={isCreating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isCreating ? 'Starting...' : 'Start Consultation'}
                </Button>
              )}
              {consultationStatus === 'active' && (
                <Button 
                  onClick={handleCompleteConsultation}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Consultation
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Patient Context Panel */}
          <div className="w-80 border-r bg-muted/20 overflow-hidden">
            <PatientContextPanel patientId={patientId!} />
          </div>

          {/* Main Consultation Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {consultationStatus === 'starting' ? (
              <div className="flex-1 flex items-center justify-center">
                <Card className="w-96">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                      <Stethoscope className="h-6 w-6" />
                      Ready to Start Consultation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Patient: <span className="font-medium">{patientName}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Chief Complaint: <span className="font-medium">{chiefComplaint}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-4">
                        This will create a new encounter for the patient and begin the consultation workflow.
                      </p>
                    </div>
                    <Button 
                      onClick={handleStartConsultation}
                      disabled={isCreating}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isCreating ? 'Starting...' : 'Start Consultation'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="border-b px-6 py-2">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="history" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      History
                    </TabsTrigger>
                    <TabsTrigger value="examination" className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      Examination
                    </TabsTrigger>
                    <TabsTrigger value="vitals" className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Vitals
                    </TabsTrigger>
                    <TabsTrigger value="assessment" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Assessment
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="flex items-center gap-2">
                      <TestTube className="h-4 w-4" />
                      Orders
                    </TabsTrigger>
                    <TabsTrigger value="prescription" className="flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      Prescription
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-hidden">
                  <TabsContent value="history" className="h-full m-0">
                    <ClinicalNotesSection 
                      encounterId={encounterId}
                      noteType="history"
                      title="Patient History & Chief Complaint"
                    />
                  </TabsContent>

                  <TabsContent value="examination" className="h-full m-0">
                    <ClinicalNotesSection 
                      encounterId={encounterId}
                      noteType="examination"
                      title="Physical Examination"
                    />
                  </TabsContent>

                  <TabsContent value="vitals" className="h-full m-0">
                    <VitalsRecordingSection 
                      patientId={patientId!}
                      encounterId={encounterId}
                    />
                  </TabsContent>

                  <TabsContent value="assessment" className="h-full m-0">
                    <ClinicalNotesSection 
                      encounterId={encounterId}
                      noteType="assessment"
                      title="Assessment & Plan"
                    />
                  </TabsContent>

                  <TabsContent value="orders" className="h-full m-0">
                    <OrdersSection 
                      patientId={patientId!}
                      encounterId={encounterId}
                    />
                  </TabsContent>

                  <TabsContent value="prescription" className="h-full m-0">
                    <PrescriptionSection 
                      patientId={patientId!}
                      encounterId={encounterId}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Consultation;
