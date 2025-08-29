import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePatients } from '@/hooks/usePatients';
import { StartEncounterDialog } from '../encounters/StartEncounterDialog';
import { Clock, User, Heart, Thermometer, Activity, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface VitalSigns {
  systolic_bp?: number;
  diastolic_bp?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  temperature?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  pain_scale?: number;
}

interface TriageData {
  patient_id: string;
  chief_complaint: string;
  vitals: VitalSigns;
  triage_level: 1 | 2 | 3 | 4 | 5;
  symptoms: string[];
  allergies: string[];
  current_medications: string[];
  notes?: string;
}

export function TriageManager() {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [vitals, setVitals] = useState<VitalSigns>({});
  const [triageLevel, setTriageLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [newSymptom, setNewSymptom] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [medications, setMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState('');
  const [notes, setNotes] = useState('');
  const [showEncounterDialog, setShowEncounterDialog] = useState(false);

  const { patients } = usePatients();

  const getTriageLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'destructive'; // Critical
      case 2: return 'destructive'; // Emergent
      case 3: return 'default'; // Urgent
      case 4: return 'secondary'; // Less Urgent
      case 5: return 'outline'; // Non-urgent
      default: return 'outline';
    }
  };

  const getTriageLevelLabel = (level: number) => {
    switch (level) {
      case 1: return 'Resuscitation';
      case 2: return 'Emergent';
      case 3: return 'Urgent';
      case 4: return 'Less Urgent';
      case 5: return 'Non-urgent';
      default: return 'Unknown';
    }
  };

  const calculateBMI = () => {
    if (vitals.weight && vitals.height) {
      const heightInMeters = vitals.height / 100;
      return (vitals.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  const handleAddItem = (
    item: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    setNewItem: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (item.trim() && !list.includes(item.trim())) {
      setList([...list, item.trim()]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (
    index: number,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleSubmitTriage = async () => {
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }

    if (!chiefComplaint.trim()) {
      toast.error('Chief complaint is required');
      return;
    }

    const triageData: TriageData = {
      patient_id: selectedPatientId,
      chief_complaint: chiefComplaint,
      vitals,
      triage_level: triageLevel,
      symptoms,
      allergies,
      current_medications: medications,
      notes: notes.trim() || undefined
    };

    // In a real implementation, this would save to the database
    console.log('Triage data:', triageData);
    toast.success('Triage completed successfully');

    // Start encounter after triage
    setShowEncounterDialog(true);
  };

  const resetForm = () => {
    setSelectedPatientId('');
    setChiefComplaint('');
    setVitals({});
    setTriageLevel(3);
    setSymptoms([]);
    setAllergies([]);
    setMedications([]);
    setNotes('');
  };

  const selectedPatient = patients?.find(p => p.id === selectedPatientId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Triage Assessment</h2>
        <Button variant="outline" onClick={resetForm}>
          Reset Form
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Patient Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Patient</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients?.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name} - {patient.medical_record_number || 'No MRN'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPatient && (
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-medium">{selectedPatient.first_name} {selectedPatient.last_name}</h3>
                <p className="text-sm text-muted-foreground">MRN: {selectedPatient.medical_record_number || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedPatient.gender} • {new Date().getFullYear() - new Date(selectedPatient.date_of_birth).getFullYear()} years
                </p>
                {selectedPatient.phone && (
                  <p className="text-sm text-muted-foreground">Phone: {selectedPatient.phone}</p>
                )}
              </div>
            )}

            {/* Triage Level */}
            <div className="space-y-2">
              <Label>Triage Level (ESI)</Label>
              <Select value={triageLevel.toString()} onValueChange={(value) => setTriageLevel(parseInt(value) as 1 | 2 | 3 | 4 | 5)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Resuscitation</SelectItem>
                  <SelectItem value="2">2 - Emergent</SelectItem>
                  <SelectItem value="3">3 - Urgent</SelectItem>
                  <SelectItem value="4">4 - Less Urgent</SelectItem>
                  <SelectItem value="5">5 - Non-urgent</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant={getTriageLevelColor(triageLevel)} className="w-fit">
                Level {triageLevel}: {getTriageLevelLabel(triageLevel)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Systolic BP</Label>
                <Input
                  type="number"
                  placeholder="120"
                  value={vitals.systolic_bp || ''}
                  onChange={(e) => setVitals(prev => ({ ...prev, systolic_bp: parseInt(e.target.value) || undefined }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Diastolic BP</Label>
                <Input
                  type="number"
                  placeholder="80"
                  value={vitals.diastolic_bp || ''}
                  onChange={(e) => setVitals(prev => ({ ...prev, diastolic_bp: parseInt(e.target.value) || undefined }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Heart Rate</Label>
                <Input
                  type="number"
                  placeholder="72"
                  value={vitals.heart_rate || ''}
                  onChange={(e) => setVitals(prev => ({ ...prev, heart_rate: parseInt(e.target.value) || undefined }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Resp. Rate</Label>
                <Input
                  type="number"
                  placeholder="16"
                  value={vitals.respiratory_rate || ''}
                  onChange={(e) => setVitals(prev => ({ ...prev, respiratory_rate: parseInt(e.target.value) || undefined }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Temperature (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="36.5"
                  value={vitals.temperature || ''}
                  onChange={(e) => setVitals(prev => ({ ...prev, temperature: parseFloat(e.target.value) || undefined }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">O2 Sat (%)</Label>
                <Input
                  type="number"
                  placeholder="98"
                  value={vitals.oxygen_saturation || ''}
                  onChange={(e) => setVitals(prev => ({ ...prev, oxygen_saturation: parseInt(e.target.value) || undefined }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="70"
                  value={vitals.weight || ''}
                  onChange={(e) => setVitals(prev => ({ ...prev, weight: parseFloat(e.target.value) || undefined }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Height (cm)</Label>
                <Input
                  type="number"
                  placeholder="170"
                  value={vitals.height || ''}
                  onChange={(e) => setVitals(prev => ({ ...prev, height: parseInt(e.target.value) || undefined }))}
                />
              </div>
            </div>

            {calculateBMI() && (
              <div className="p-2 bg-muted rounded text-sm">
                <span className="font-medium">BMI: {calculateBMI()}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label>Pain Scale (0-10)</Label>
              <Input
                type="number"
                min="0"
                max="10"
                placeholder="0"
                value={vitals.pain_scale || ''}
                onChange={(e) => setVitals(prev => ({ ...prev, pain_scale: parseInt(e.target.value) || undefined }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Assessment */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Clinical Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Chief Complaint *</Label>
              <Textarea
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Patient's primary concern or reason for visit"
                rows={3}
                required
              />
            </div>

            {/* Symptoms */}
            <div className="space-y-2">
              <Label>Symptoms</Label>
              {symptoms.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {symptoms.map((symptom, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveItem(index, symptoms, setSymptoms)}
                    >
                      {symptom} ×
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex space-x-1">
                <Input
                  value={newSymptom}
                  onChange={(e) => setNewSymptom(e.target.value)}
                  placeholder="Add symptom"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem(newSymptom, symptoms, setSymptoms, setNewSymptom)}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleAddItem(newSymptom, symptoms, setSymptoms, setNewSymptom)}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Allergies */}
            <div className="space-y-2">
              <Label>Allergies</Label>
              {allergies.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {allergies.map((allergy, index) => (
                    <Badge
                      key={index}
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => handleRemoveItem(index, allergies, setAllergies)}
                    >
                      {allergy} ×
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex space-x-1">
                <Input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Add allergy"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem(newAllergy, allergies, setAllergies, setNewAllergy)}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleAddItem(newAllergy, allergies, setAllergies, setNewAllergy)}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Current Medications */}
            <div className="space-y-2">
              <Label>Current Medications</Label>
              {medications.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {medications.map((medication, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => handleRemoveItem(index, medications, setMedications)}
                    >
                      {medication} ×
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex space-x-1">
                <Input
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  placeholder="Add medication"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem(newMedication, medications, setMedications, setNewMedication)}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleAddItem(newMedication, medications, setMedications, setNewMedication)}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional assessment notes"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Button 
              onClick={handleSubmitTriage}
              disabled={!selectedPatientId || !chiefComplaint.trim()}
              className="w-full sm:w-auto"
            >
              Complete Triage & Start Encounter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Start Encounter Dialog */}
      <StartEncounterDialog
        isOpen={showEncounterDialog}
        onClose={() => setShowEncounterDialog(false)}
        patientId={selectedPatientId}
      />
    </div>
  );
}