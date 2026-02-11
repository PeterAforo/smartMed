import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Thermometer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface RecordVitalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: {
    id: string;
    patient_id: string;
    name: string;
    patientId: string;
    room: string;
  } | null;
}

export const RecordVitalsDialog = ({ open, onOpenChange, patient }: RecordVitalsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vitals, setVitals] = useState({
    temperature: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
    painLevel: '',
    notes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vitals.temperature || !vitals.bloodPressureSystolic || !vitals.heartRate) {
      toast({
        title: "Missing Information",
        description: "Please record at least temperature, blood pressure, and heart rate.",
        variant: "destructive"
      });
      return;
    }

    if (!patient?.patient_id) {
      toast({
        title: "Error",
        description: "Patient ID is missing. Cannot record vitals.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create triage assessment with vitals
      await api.createTriageAssessment({
        patient_id: patient.patient_id,
        queue_id: patient.id || undefined,
        triage_level: vitals.painLevel ? Math.min(5, Math.max(1, Math.ceil(parseInt(vitals.painLevel) / 2))) : 3,
        triage_category: 'less_urgent',
        chief_complaint: vitals.notes || 'Vitals recorded',
        temperature: vitals.temperature ? parseFloat(vitals.temperature) : null,
        blood_pressure_systolic: vitals.bloodPressureSystolic ? parseInt(vitals.bloodPressureSystolic) : null,
        blood_pressure_diastolic: vitals.bloodPressureDiastolic ? parseInt(vitals.bloodPressureDiastolic) : null,
        pulse_rate: vitals.heartRate ? parseInt(vitals.heartRate) : null,
        respiratory_rate: vitals.respiratoryRate ? parseInt(vitals.respiratoryRate) : null,
        oxygen_saturation: vitals.oxygenSaturation ? parseFloat(vitals.oxygenSaturation) : null,
        weight: vitals.weight ? parseFloat(vitals.weight) : null,
        height: vitals.height ? parseFloat(vitals.height) : null,
        pain_level: vitals.painLevel ? parseInt(vitals.painLevel) : null,
        notes: vitals.notes || null
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['triage'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      
      toast({
        title: "Vitals Recorded",
        description: `Vital signs recorded for ${patient?.name} (${patient?.patientId})`
      });
      
      onOpenChange(false);
      
      // Reset form
      setVitals({
        temperature: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        heartRate: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        weight: '',
        height: '',
        painLevel: '',
        notes: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record vitals",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Record Vital Signs
          </DialogTitle>
          <DialogDescription>
            Patient: {patient.name} ({patient.patientId}) • Room: {patient.room}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°F) *</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={vitals.temperature}
                onChange={(e) => handleInputChange('temperature', e.target.value)}
                placeholder="98.6"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heartRate">Heart Rate (bpm) *</Label>
              <Input
                id="heartRate"
                type="number"
                value={vitals.heartRate}
                onChange={(e) => handleInputChange('heartRate', e.target.value)}
                placeholder="72"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="respiratoryRate">Respiratory Rate</Label>
              <Input
                id="respiratoryRate"
                type="number"
                value={vitals.respiratoryRate}
                onChange={(e) => handleInputChange('respiratoryRate', e.target.value)}
                placeholder="16"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bloodPressureSystolic">Systolic BP *</Label>
              <Input
                id="bloodPressureSystolic"
                type="number"
                value={vitals.bloodPressureSystolic}
                onChange={(e) => handleInputChange('bloodPressureSystolic', e.target.value)}
                placeholder="120"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodPressureDiastolic">Diastolic BP *</Label>
              <Input
                id="bloodPressureDiastolic"
                type="number"
                value={vitals.bloodPressureDiastolic}
                onChange={(e) => handleInputChange('bloodPressureDiastolic', e.target.value)}
                placeholder="80"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oxygenSaturation">O2 Sat (%)</Label>
              <Input
                id="oxygenSaturation"
                type="number"
                value={vitals.oxygenSaturation}
                onChange={(e) => handleInputChange('oxygenSaturation', e.target.value)}
                placeholder="98"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={vitals.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="70.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={vitals.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder="175"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="painLevel">Pain Level (0-10)</Label>
              <Input
                id="painLevel"
                type="number"
                min="0"
                max="10"
                value={vitals.painLevel}
                onChange={(e) => handleInputChange('painLevel', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={vitals.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional observations or notes..."
              rows={3}
            />
          </div>

          {/* Vital Signs Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Vital Signs Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {vitals.temperature && <p>Temperature: {vitals.temperature}°F</p>}
              {vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic && 
                <p>Blood Pressure: {vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic} mmHg</p>}
              {vitals.heartRate && <p>Heart Rate: {vitals.heartRate} bpm</p>}
              {vitals.oxygenSaturation && <p>O2 Saturation: {vitals.oxygenSaturation}%</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record Vitals"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};