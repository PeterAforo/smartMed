import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  AlertTriangle, 
  Pill, 
  Activity, 
  Calendar, 
  FileText,
  Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface PatientContextPanelProps {
  patientId: string;
}

export const PatientContextPanel = ({ patientId }: PatientContextPanelProps) => {
  // Fetch patient data
  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => api.getPatient(patientId),
    enabled: !!patientId
  });

  // Fetch triage/vitals data
  const { data: triageData = [] } = useQuery({
    queryKey: ['triage', 'patient', patientId],
    queryFn: () => api.getTriageAssessments({ patient_id: patientId }),
    enabled: !!patientId
  });

  // Fetch prescriptions
  const { data: prescriptions = [] } = useQuery({
    queryKey: ['prescriptions', 'patient', patientId],
    queryFn: () => api.getPrescriptions({ patient_id: patientId }),
    enabled: !!patientId
  });

  // Fetch medical records
  const { data: medicalRecords = [] } = useQuery({
    queryKey: ['emr', 'patient', patientId],
    queryFn: () => api.getMedicalRecords({ patient_id: patientId }),
    enabled: !!patientId
  });

  // Fetch lab orders
  const { data: labOrders = [] } = useQuery({
    queryKey: ['lab', 'patient', patientId],
    queryFn: () => api.getLabOrders({ patient_id: patientId }),
    enabled: !!patientId
  });

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Calculate age from date of birth
  const calculateAge = (dob: string | null) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Get most recent triage/vitals
  const recentTriage = triageData[0];

  // Transform data for display
  const patientData = {
    id: patientId,
    name: patient ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() : 'Unknown',
    age: patient ? calculateAge(patient.date_of_birth) : 'N/A',
    gender: patient?.gender || 'N/A',
    mrn: patient?.patient_number || 'N/A',
    phone: patient?.phone || 'N/A',
    allergies: recentTriage?.allergies || [],
    currentMedications: prescriptions
      .filter((p: any) => p.status === 'active' || p.status === 'dispensed')
      .slice(0, 5)
      .map((p: any) => ({
        name: p.medication_name || 'Unknown',
        dosage: p.dosage || '',
        frequency: p.frequency || ''
      })),
    recentVitals: recentTriage ? {
      bloodPressure: recentTriage.blood_pressure_systolic && recentTriage.blood_pressure_diastolic 
        ? `${recentTriage.blood_pressure_systolic}/${recentTriage.blood_pressure_diastolic}` : 'N/A',
      pulse: recentTriage.pulse_rate || 'N/A',
      temperature: recentTriage.temperature ? `${recentTriage.temperature}°F` : 'N/A',
      weight: recentTriage.weight ? `${recentTriage.weight}kg` : 'N/A',
      date: recentTriage.assessed_at ? new Date(recentTriage.assessed_at).toLocaleDateString() : 'N/A'
    } : null,
    recentVisits: medicalRecords.slice(0, 3).map((rec: any) => ({
      date: rec.visit_date ? new Date(rec.visit_date).toLocaleDateString() : 'N/A',
      provider: rec.provider_name || 'N/A',
      diagnosis: rec.diagnosis || 'N/A',
      status: rec.status || 'Completed'
    })),
    medicalHistory: medicalRecords
      .filter((rec: any) => rec.diagnosis)
      .slice(0, 5)
      .map((rec: any) => ({
        condition: rec.diagnosis,
        date: rec.visit_date ? new Date(rec.visit_date).toLocaleDateString() : 'N/A',
        status: 'Active'
      })),
    pendingOrders: labOrders
      .filter((o: any) => o.status === 'pending' || o.status === 'in_progress')
      .slice(0, 5)
      .map((o: any) => ({
        type: 'Lab',
        order: o.test_name || 'Lab Test',
        status: o.status || 'Pending',
        date: o.order_date ? new Date(o.order_date).toLocaleDateString() : 'N/A'
      }))
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Patient Demographics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-semibold">{patientData.name}</p>
              <p className="text-sm text-muted-foreground">
                {patientData.age} years • {patientData.gender}
              </p>
              <p className="text-sm text-muted-foreground">
                MRN: {patientData.mrn}
              </p>
              <p className="text-sm text-muted-foreground">
                {patientData.phone}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Allergies */}
        {patientData.allergies.length > 0 && (
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                Allergies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {patientData.allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Medications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Current Medications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {patientData.currentMedications.map((med, index) => (
              <div key={index} className="text-sm">
                <p className="font-medium">{med.name} {med.dosage}</p>
                <p className="text-muted-foreground">{med.frequency}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Vitals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Vitals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {patientData.recentVitals ? (
              <div className="text-sm">
                <p>BP: {patientData.recentVitals.bloodPressure}</p>
                <p>Pulse: {patientData.recentVitals.pulse} bpm</p>
                <p>Temp: {patientData.recentVitals.temperature}</p>
                <p>Weight: {patientData.recentVitals.weight}</p>
                <p className="text-muted-foreground text-xs mt-1">
                  {patientData.recentVitals.date}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No vitals recorded yet</p>
            )}
          </CardContent>
        </Card>

        {/* Medical History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Active Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {patientData.medicalHistory
              .filter(condition => condition.status === 'Active')
              .map((condition, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium">{condition.condition}</p>
                  <p className="text-muted-foreground text-xs">
                    Since {condition.date}
                  </p>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Recent Visits */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Recent Visits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {patientData.recentVisits.slice(0, 3).map((visit, index) => (
              <div key={index} className="text-sm border-l-2 border-primary/20 pl-2">
                <p className="font-medium">{visit.diagnosis}</p>
                <p className="text-muted-foreground text-xs">
                  {visit.date} • {visit.provider}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending Orders */}
        {patientData.pendingOrders.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {patientData.pendingOrders.map((order, index) => (
                <div key={index} className="text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{order.order}</p>
                    <Badge variant="outline" className="text-xs">
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {order.type} • {order.date}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};