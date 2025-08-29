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
  FileText 
} from 'lucide-react';

interface PatientContextPanelProps {
  patientId: string;
}

export const PatientContextPanel = ({ patientId }: PatientContextPanelProps) => {
  // Mock patient data - in real implementation, this would come from hooks
  const patientData = {
    id: patientId,
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    mrn: 'MRN-12345',
    phone: '+233 20 123 4567',
    allergies: ['Penicillin', 'Shellfish'],
    currentMedications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'BID' },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'OD' },
      { name: 'Aspirin', dosage: '81mg', frequency: 'OD' }
    ],
    medicalHistory: [
      { condition: 'Type 2 Diabetes Mellitus', date: '2020-03-15', status: 'Active' },
      { condition: 'Hypertension', date: '2019-08-22', status: 'Active' },
      { condition: 'Hyperlipidemia', date: '2021-01-10', status: 'Active' }
    ],
    recentVitals: {
      bloodPressure: '140/85',
      pulse: '78',
      temperature: '98.6°F',
      weight: '85kg',
      date: '2024-01-15'
    },
    recentVisits: [
      { date: '2024-01-10', provider: 'Dr. Smith', diagnosis: 'DM Follow-up', status: 'Completed' },
      { date: '2023-12-15', provider: 'Dr. Johnson', diagnosis: 'Annual Physical', status: 'Completed' },
      { date: '2023-11-20', provider: 'Dr. Smith', diagnosis: 'HTN Management', status: 'Completed' }
    ],
    pendingOrders: [
      { type: 'Lab', order: 'HbA1c', status: 'Pending', date: '2024-01-12' },
      { type: 'Imaging', order: 'Chest X-Ray', status: 'Scheduled', date: '2024-01-16' }
    ]
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
            <div className="text-sm">
              <p>BP: {patientData.recentVitals.bloodPressure}</p>
              <p>Pulse: {patientData.recentVitals.pulse} bpm</p>
              <p>Temp: {patientData.recentVitals.temperature}</p>
              <p>Weight: {patientData.recentVitals.weight}</p>
              <p className="text-muted-foreground text-xs mt-1">
                {patientData.recentVitals.date}
              </p>
            </div>
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