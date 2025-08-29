import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  FileText, 
  Stethoscope, 
  Activity, 
  Pill, 
  TestTube, 
  Camera,
  Clock,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEncounters } from '@/hooks/useEncounters';
import { useOrders } from '@/hooks/useOrders';
import { ClinicalNotesSection } from './ClinicalNotesSection';
import { VitalsRecordingSection } from './VitalsRecordingSection';
import { PrescriptionSection } from './PrescriptionSection';
import { OrdersSection } from './OrdersSection';
import { PatientContextPanel } from './PatientContextPanel';

interface ConsultationInterfaceProps {
  open: boolean;
  onClose: () => void;
  appointment: {
    id: number;
    patient: string;
    patientId: string;
    complaint: string;
    time: string;
    type: string;
  } | null;
}

export const ConsultationInterface = ({ 
  open, 
  onClose, 
  appointment 
}: ConsultationInterfaceProps) => {
  const { toast } = useToast();
  const { createEncounter, isCreating } = useEncounters();
  const [encounterId, setEncounterId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('history');
  const [consultationStatus, setConsultationStatus] = useState<'starting' | 'active' | 'completing'>('starting');

  const handleStartConsultation = async () => {
    if (!appointment) return;

    try {
      const encounterData = {
        patient_id: appointment.patientId,
        encounter_type: 'OPD' as const,
        chief_complaint: appointment.complaint,
        notes: `Appointment consultation started at ${appointment.time}`
      };

      createEncounter(encounterData, {
        onSuccess: (newEncounter) => {
          setEncounterId(newEncounter.id);
          setConsultationStatus('active');
          toast({
            title: "Consultation Started",
            description: `Active consultation for ${appointment.patient}`
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

  const handleCompleteConsultation = () => {
    setConsultationStatus('completing');
    // TODO: Update encounter status to completed
    toast({
      title: "Consultation Completed",
      description: "Patient consultation has been completed successfully."
    });
    onClose();
  };

  const handleCloseConsultation = () => {
    if (consultationStatus === 'active') {
      // Warn about unsaved changes
      const confirmClose = window.confirm(
        'Are you sure you want to close this consultation? Any unsaved changes will be lost.'
      );
      if (!confirmClose) return;
    }
    onClose();
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Consultation - {appointment.patient}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {appointment.time} • {appointment.type} • ID: {appointment.patientId}
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
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  Complete Consultation
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCloseConsultation}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Patient Context Panel */}
          <div className="w-80 border-r bg-muted/20">
            <PatientContextPanel patientId={appointment.patientId} />
          </div>

          {/* Main Consultation Area */}
          <div className="flex-1 flex flex-col">
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
                        Chief Complaint: <span className="font-medium">{appointment.complaint}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
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
                      patientId={appointment.patientId}
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
                      patientId={appointment.patientId}
                      encounterId={encounterId}
                    />
                  </TabsContent>

                  <TabsContent value="prescription" className="h-full m-0">
                    <PrescriptionSection 
                      patientId={appointment.patientId}
                      encounterId={encounterId}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};