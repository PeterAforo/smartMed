import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileText, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewMedicalRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewMedicalRecordDialog = ({ open, onOpenChange }: NewMedicalRecordDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    recordType: '',
    chiefComplaint: '',
    historyOfPresentIllness: '',
    pastMedicalHistory: '',
    medications: '',
    allergies: '',
    socialHistory: '',
    familyHistory: '',
    reviewOfSystems: '',
    physicalExam: '',
    assessment: '',
    plan: '',
    followUp: '',
    provider: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Medical Record Created",
      description: `New medical record has been created for patient ${formData.patientId}.`
    });

    // Reset form
    setFormData({
      patientId: '',
      recordType: '',
      chiefComplaint: '',
      historyOfPresentIllness: '',
      pastMedicalHistory: '',
      medications: '',
      allergies: '',
      socialHistory: '',
      familyHistory: '',
      reviewOfSystems: '',
      physicalExam: '',
      assessment: '',
      plan: '',
      followUp: '',
      provider: ''
    });

    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create New Medical Record
          </DialogTitle>
          <DialogDescription>
            Document comprehensive patient medical information and clinical findings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="recordType">Record Type</Label>
              <Select value={formData.recordType} onValueChange={(value) => handleInputChange('recordType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select record type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admission">Admission Note</SelectItem>
                  <SelectItem value="progress">Progress Note</SelectItem>
                  <SelectItem value="discharge">Discharge Summary</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="procedure">Procedure Note</SelectItem>
                  <SelectItem value="emergency">Emergency Visit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chiefComplaint">Chief Complaint</Label>
            <Input
              id="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
              placeholder="Patient's primary concern..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="historyOfPresentIllness">History of Present Illness</Label>
            <Textarea
              id="historyOfPresentIllness"
              value={formData.historyOfPresentIllness}
              onChange={(e) => handleInputChange('historyOfPresentIllness', e.target.value)}
              placeholder="Detailed description of current symptoms and timeline..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pastMedicalHistory">Past Medical History</Label>
              <Textarea
                id="pastMedicalHistory"
                value={formData.pastMedicalHistory}
                onChange={(e) => handleInputChange('pastMedicalHistory', e.target.value)}
                placeholder="Previous medical conditions..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medications">Current Medications</Label>
              <Textarea
                id="medications"
                value={formData.medications}
                onChange={(e) => handleInputChange('medications', e.target.value)}
                placeholder="List current medications with dosages..."
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="Known allergies and reactions..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="socialHistory">Social History</Label>
              <Input
                id="socialHistory"
                value={formData.socialHistory}
                onChange={(e) => handleInputChange('socialHistory', e.target.value)}
                placeholder="Smoking, alcohol, occupation..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="familyHistory">Family History</Label>
            <Textarea
              id="familyHistory"
              value={formData.familyHistory}
              onChange={(e) => handleInputChange('familyHistory', e.target.value)}
              placeholder="Relevant family medical history..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewOfSystems">Review of Systems</Label>
            <Textarea
              id="reviewOfSystems"
              value={formData.reviewOfSystems}
              onChange={(e) => handleInputChange('reviewOfSystems', e.target.value)}
              placeholder="Systematic review of body systems..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="physicalExam">Physical Examination</Label>
            <Textarea
              id="physicalExam"
              value={formData.physicalExam}
              onChange={(e) => handleInputChange('physicalExam', e.target.value)}
              placeholder="Detailed physical examination findings..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assessment">Assessment</Label>
              <Textarea
                id="assessment"
                value={formData.assessment}
                onChange={(e) => handleInputChange('assessment', e.target.value)}
                placeholder="Clinical assessment and differential diagnosis..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan">Plan</Label>
              <Textarea
                id="plan"
                value={formData.plan}
                onChange={(e) => handleInputChange('plan', e.target.value)}
                placeholder="Treatment plan and recommendations..."
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="followUp">Follow-up Instructions</Label>
              <Input
                id="followUp"
                value={formData.followUp}
                onChange={(e) => handleInputChange('followUp', e.target.value)}
                placeholder="Return in 2 weeks, PRN..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select value={formData.provider} onValueChange={(value) => handleInputChange('provider', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dr-smith">Dr. John Smith</SelectItem>
                  <SelectItem value="dr-johnson">Dr. Sarah Johnson</SelectItem>
                  <SelectItem value="dr-brown">Dr. Michael Brown</SelectItem>
                  <SelectItem value="dr-davis">Dr. Lisa Davis</SelectItem>
                  <SelectItem value="dr-wilson">Dr. David Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Medical Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};