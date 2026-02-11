import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Activity, Save, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface VitalsRecordingSectionProps {
  patientId: string;
  encounterId: string | null;
}

interface VitalSigns {
  systolic: string;
  diastolic: string;
  pulse: string;
  temperature: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  weight: string;
  height: string;
  bmi: string;
  painScale: string;
}

export const VitalsRecordingSection = ({ 
  patientId, 
  encounterId 
}: VitalsRecordingSectionProps) => {
  const { toast } = useToast();
  
  // Fetch triage data for this patient
  const { data: triageData = [], isLoading: triageLoading } = useQuery({
    queryKey: ['triage', 'patient', patientId],
    queryFn: () => api.getTriageAssessments({ patient_id: patientId }),
    enabled: !!patientId
  });

  // Get the most recent triage assessment
  const latestTriage = triageData[0];
  const previousTriage = triageData[1];

  const [vitals, setVitals] = useState<VitalSigns>({
    systolic: '',
    diastolic: '',
    pulse: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
    bmi: '',
    painScale: ''
  });

  // Populate vitals from triage data when it loads
  useEffect(() => {
    if (latestTriage) {
      setVitals({
        systolic: latestTriage.blood_pressure_systolic?.toString() || '',
        diastolic: latestTriage.blood_pressure_diastolic?.toString() || '',
        pulse: latestTriage.pulse_rate?.toString() || '',
        temperature: latestTriage.temperature?.toString() || '',
        respiratoryRate: latestTriage.respiratory_rate?.toString() || '',
        oxygenSaturation: latestTriage.oxygen_saturation?.toString() || '',
        weight: latestTriage.weight?.toString() || '',
        height: latestTriage.height?.toString() || '',
        bmi: '',
        painScale: latestTriage.pain_level?.toString() || ''
      });
    }
  }, [latestTriage]);

  const [isSaving, setIsSaving] = useState(false);

  // Previous vitals from second most recent triage or defaults
  const previousVitals = {
    systolic: previousTriage?.blood_pressure_systolic?.toString() || '--',
    diastolic: previousTriage?.blood_pressure_diastolic?.toString() || '--',
    pulse: previousTriage?.pulse_rate?.toString() || '--',
    temperature: previousTriage?.temperature?.toString() || '--',
    respiratoryRate: previousTriage?.respiratory_rate?.toString() || '--',
    oxygenSaturation: previousTriage?.oxygen_saturation?.toString() || '--',
    weight: previousTriage?.weight?.toString() || '--',
    height: previousTriage?.height?.toString() || '--',
    bmi: '--'
  };

  const calculateBMI = () => {
    const weightKg = parseFloat(vitals.weight);
    const heightM = parseFloat(vitals.height) / 100;
    
    if (weightKg && heightM) {
      const bmi = (weightKg / (heightM * heightM)).toFixed(1);
      setVitals(prev => ({ ...prev, bmi }));
    }
  };

  React.useEffect(() => {
    calculateBMI();
  }, [vitals.weight, vitals.height]);

  const getVitalStatus = (current: string, previous: string, isHigherBetter = false) => {
    if (!current || !previous) return null;
    
    const currentVal = parseFloat(current);
    const previousVal = parseFloat(previous);
    
    if (currentVal > previousVal) {
      return isHigherBetter ? 'improved' : 'elevated';
    } else if (currentVal < previousVal) {
      return isHigherBetter ? 'declined' : 'decreased';
    }
    return 'stable';
  };

  const renderVitalWithComparison = (
    label: string,
    value: string,
    previousValue: string,
    unit: string,
    field: keyof VitalSigns,
    normalRange?: string,
    isHigherBetter = false
  ) => {
    const status = getVitalStatus(value, previousValue, isHigherBetter);
    
    return (
      <div className="space-y-2">
        <Label htmlFor={field}>{label}</Label>
        <div className="flex items-center gap-2">
          <Input
            id={field}
            type="number"
            placeholder="--"
            value={value}
            onChange={(e) => setVitals(prev => ({ ...prev, [field]: e.target.value }))}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">{unit}</span>
          {status && (
            <Badge 
              variant={status === 'improved' || status === 'stable' ? 'default' : 'secondary'}
              className="flex items-center gap-1"
            >
              {(status === 'elevated' || status === 'improved') && <TrendingUp className="h-3 w-3" />}
              {(status === 'decreased' || status === 'declined') && <TrendingDown className="h-3 w-3" />}
              {status}
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Previous: {previousValue} {unit}
          {normalRange && <span> • Normal: {normalRange}</span>}
        </div>
      </div>
    );
  };

  const handleSaveVitals = async () => {
    if (!encounterId) {
      toast({
        title: "No Active Encounter",
        description: "Please start the consultation first.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    // TODO: Implement actual save to database
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Vitals Recorded",
      description: "Patient vital signs have been saved successfully."
    });
    
    setIsSaving(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Vital Signs Recording
          </h3>
          <Button onClick={handleSaveVitals} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Vitals'}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Blood Pressure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Blood Pressure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label htmlFor="systolic">Systolic</Label>
                  <Input
                    id="systolic"
                    type="number"
                    placeholder="120"
                    value={vitals.systolic}
                    onChange={(e) => setVitals(prev => ({ ...prev, systolic: e.target.value }))}
                  />
                </div>
                <span className="text-lg font-medium pt-6">/</span>
                <div className="flex-1">
                  <Label htmlFor="diastolic">Diastolic</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    placeholder="80"
                    value={vitals.diastolic}
                    onChange={(e) => setVitals(prev => ({ ...prev, diastolic: e.target.value }))}
                  />
                </div>
                <span className="text-sm text-muted-foreground pt-6">mmHg</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Previous: {previousVitals.systolic}/{previousVitals.diastolic} mmHg
              </div>
              <div className="text-xs text-muted-foreground">
                Normal: &lt;120/80 mmHg
              </div>
            </CardContent>
          </Card>

          {/* Heart Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Heart Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {renderVitalWithComparison(
                'Pulse Rate',
                vitals.pulse,
                previousVitals.pulse,
                'bpm',
                'pulse',
                '60-100 bpm'
              )}
            </CardContent>
          </Card>

          {/* Temperature */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Temperature</CardTitle>
            </CardHeader>
            <CardContent>
              {renderVitalWithComparison(
                'Body Temperature',
                vitals.temperature,
                previousVitals.temperature,
                '°F',
                'temperature',
                '97.8-99.1°F'
              )}
            </CardContent>
          </Card>

          {/* Respiratory Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Respiratory Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {renderVitalWithComparison(
                'Breaths per minute',
                vitals.respiratoryRate,
                previousVitals.respiratoryRate,
                '/min',
                'respiratoryRate',
                '12-20 /min'
              )}
            </CardContent>
          </Card>

          {/* Oxygen Saturation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Oxygen Saturation</CardTitle>
            </CardHeader>
            <CardContent>
              {renderVitalWithComparison(
                'SpO2',
                vitals.oxygenSaturation,
                previousVitals.oxygenSaturation,
                '%',
                'oxygenSaturation',
                '95-100%',
                true
              )}
            </CardContent>
          </Card>

          {/* Pain Scale */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pain Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="painScale">Pain Scale (0-10)</Label>
                <Input
                  id="painScale"
                  type="number"
                  min="0"
                  max="10"
                  placeholder="0"
                  value={vitals.painScale}
                  onChange={(e) => setVitals(prev => ({ ...prev, painScale: e.target.value }))}
                />
                <div className="text-xs text-muted-foreground">
                  0 = No pain, 10 = Worst pain
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anthropometrics */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Anthropometric Measurements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {renderVitalWithComparison(
                  'Weight',
                  vitals.weight,
                  previousVitals.weight,
                  'kg',
                  'weight'
                )}
                {renderVitalWithComparison(
                  'Height',
                  vitals.height,
                  previousVitals.height,
                  'cm',
                  'height'
                )}
              </div>
              {vitals.bmi && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <Label>Body Mass Index (BMI)</Label>
                  <p className="text-lg font-semibold">{vitals.bmi}</p>
                  <p className="text-sm text-muted-foreground">
                    {parseFloat(vitals.bmi) < 18.5 && 'Underweight'}
                    {parseFloat(vitals.bmi) >= 18.5 && parseFloat(vitals.bmi) < 25 && 'Normal weight'}
                    {parseFloat(vitals.bmi) >= 25 && parseFloat(vitals.bmi) < 30 && 'Overweight'}
                    {parseFloat(vitals.bmi) >= 30 && 'Obese'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};