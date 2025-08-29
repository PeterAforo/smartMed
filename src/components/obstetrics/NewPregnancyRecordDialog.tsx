import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Baby, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewPregnancyRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewPregnancyRecordDialog = ({ open, onOpenChange }: NewPregnancyRecordDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    lmp: '', // Last Menstrual Period
    edd: '', // Expected Delivery Date
    gravida: '',
    para: '',
    gestationalAge: '',
    bloodType: '',
    rhFactor: '',
    prenatalVitamins: true,
    riskFactors: '',
    allergies: '',
    previousComplications: '',
    currentMedications: '',
    notes: '',
    provider: ''
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateEDD = (lmpDate: string) => {
    if (!lmpDate) return '';
    const lmp = new Date(lmpDate);
    const edd = new Date(lmp);
    edd.setDate(edd.getDate() + 280); // 40 weeks
    return edd.toISOString().split('T')[0];
  };

  const handleLMPChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      lmp: value,
      edd: calculateEDD(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Pregnancy Record Created",
      description: `New pregnancy record has been created for ${formData.patientName}.`
    });

    // Reset form
    setFormData({
      patientId: '',
      patientName: '',
      lmp: '',
      edd: '',
      gravida: '',
      para: '',
      gestationalAge: '',
      bloodType: '',
      rhFactor: '',
      prenatalVitamins: true,
      riskFactors: '',
      allergies: '',
      previousComplications: '',
      currentMedications: '',
      notes: '',
      provider: ''
    });

    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            New Pregnancy Record
          </DialogTitle>
          <DialogDescription>
            Create a comprehensive pregnancy record with prenatal care details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                value={formData.patientId}
                onChange={(e) => handleInputChange('patientId', e.target.value)}
                placeholder="PAT001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
                placeholder="Jane Smith"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lmp">Last Menstrual Period (LMP)</Label>
              <Input
                id="lmp"
                type="date"
                value={formData.lmp}
                onChange={(e) => handleLMPChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edd">Expected Delivery Date (EDD)</Label>
              <Input
                id="edd"
                type="date"
                value={formData.edd}
                onChange={(e) => handleInputChange('edd', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gravida">Gravida</Label>
              <Input
                id="gravida"
                type="number"
                min="1"
                value={formData.gravida}
                onChange={(e) => handleInputChange('gravida', e.target.value)}
                placeholder="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="para">Para</Label>
              <Input
                id="para"
                type="number"
                min="0"
                value={formData.para}
                onChange={(e) => handleInputChange('para', e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gestationalAge">Gestational Age (weeks)</Label>
              <Input
                id="gestationalAge"
                type="number"
                min="1"
                max="42"
                value={formData.gestationalAge}
                onChange={(e) => handleInputChange('gestationalAge', e.target.value)}
                placeholder="12"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type</Label>
              <Select value={formData.bloodType} onValueChange={(value) => handleInputChange('bloodType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="AB">AB</SelectItem>
                  <SelectItem value="O">O</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rhFactor">Rh Factor</Label>
              <Select value={formData.rhFactor} onValueChange={(value) => handleInputChange('rhFactor', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Rh factor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive (+)</SelectItem>
                  <SelectItem value="negative">Negative (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="riskFactors">Risk Factors</Label>
            <Textarea
              id="riskFactors"
              value={formData.riskFactors}
              onChange={(e) => handleInputChange('riskFactors', e.target.value)}
              placeholder="Age >35, diabetes, hypertension, previous complications..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Input
              id="allergies"
              value={formData.allergies}
              onChange={(e) => handleInputChange('allergies', e.target.value)}
              placeholder="Penicillin, latex, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="previousComplications">Previous Pregnancy Complications</Label>
            <Textarea
              id="previousComplications"
              value={formData.previousComplications}
              onChange={(e) => handleInputChange('previousComplications', e.target.value)}
              placeholder="Gestational diabetes, preeclampsia, etc."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentMedications">Current Medications</Label>
            <Textarea
              id="currentMedications"
              value={formData.currentMedications}
              onChange={(e) => handleInputChange('currentMedications', e.target.value)}
              placeholder="Prenatal vitamins, folic acid, etc."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Primary OB Provider</Label>
            <Select value={formData.provider} onValueChange={(value) => handleInputChange('provider', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dr-anderson">Dr. Maria Anderson</SelectItem>
                <SelectItem value="dr-martinez">Dr. Carlos Martinez</SelectItem>
                <SelectItem value="dr-thompson">Dr. Jennifer Thompson</SelectItem>
                <SelectItem value="dr-lee">Dr. Sarah Lee</SelectItem>
                <SelectItem value="dr-patel">Dr. Priya Patel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional observations or notes..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Calendar className="mr-2 h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Pregnancy Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};