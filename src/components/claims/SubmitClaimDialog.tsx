import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Shield, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubmitClaimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubmitClaimDialog = ({ open, onOpenChange }: SubmitClaimDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    policyNumber: '',
    insuranceProvider: '',
    serviceDate: '',
    diagnosisCode: '',
    doctor: '',
    claimAmount: '',
    services: [] as string[],
    claimType: 'medical',
    priority: 'routine',
    preAuthRequired: false,
    attachments: [] as string[],
    notes: ''
  });

  const handleInputChange = (field: string, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addService = () => {
    setFormData(prev => ({ 
      ...prev, 
      services: [...prev.services, ''] 
    }));
  };

  const updateService = (index: number, value: string) => {
    const updated = [...formData.services];
    updated[index] = value;
    setFormData(prev => ({ ...prev, services: updated }));
  };

  const removeService = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      services: prev.services.filter((_, i) => i !== index) 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const claimNumber = `CLM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    toast({
      title: "Claim Submitted Successfully",
      description: `Claim ${claimNumber} has been submitted for processing. You will receive updates on the status.`
    });

    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submit Insurance Claim
          </DialogTitle>
          <DialogDescription>
            Submit a new insurance claim for patient services
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Patient Information</h3>
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
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Insurance Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Input
                  id="policyNumber"
                  value={formData.policyNumber}
                  onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                  placeholder="NHIS-2024-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Select value={formData.insuranceProvider} onValueChange={(value) => handleInputChange('insuranceProvider', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national-health">National Health Insurance</SelectItem>
                    <SelectItem value="private-health-plus">Private Health Plus</SelectItem>
                    <SelectItem value="corporate-insurance">Corporate Insurance Ltd</SelectItem>
                    <SelectItem value="medicare">Medicare</SelectItem>
                    <SelectItem value="medicaid">Medicaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Claim Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Claim Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceDate">Service Date</Label>
                <Input
                  id="serviceDate"
                  type="date"
                  value={formData.serviceDate}
                  onChange={(e) => handleInputChange('serviceDate', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor">Attending Doctor</Label>
                <Select value={formData.doctor} onValueChange={(value) => handleInputChange('doctor', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr-smith">Dr. Smith</SelectItem>
                    <SelectItem value="dr-johnson">Dr. Johnson</SelectItem>
                    <SelectItem value="dr-williams">Dr. Williams</SelectItem>
                    <SelectItem value="dr-brown">Dr. Brown</SelectItem>
                    <SelectItem value="dr-davis">Dr. Davis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosisCode">Diagnosis Code (ICD-10)</Label>
                <Input
                  id="diagnosisCode"
                  value={formData.diagnosisCode}
                  onChange={(e) => handleInputChange('diagnosisCode', e.target.value)}
                  placeholder="M79.3"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="claimAmount">Claim Amount (₵)</Label>
                <Input
                  id="claimAmount"
                  type="number"
                  step="0.01"
                  value={formData.claimAmount}
                  onChange={(e) => handleInputChange('claimAmount', e.target.value)}
                  placeholder="1500.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="claimType">Claim Type</Label>
                <Select value={formData.claimType} onValueChange={(value) => handleInputChange('claimType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select claim type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Medical Services</SelectItem>
                    <SelectItem value="surgical">Surgical Procedure</SelectItem>
                    <SelectItem value="emergency">Emergency Treatment</SelectItem>
                    <SelectItem value="preventive">Preventive Care</SelectItem>
                    <SelectItem value="dental">Dental Services</SelectItem>
                    <SelectItem value="vision">Vision Care</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="stat">STAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Services Provided</h3>
              <Button type="button" variant="outline" onClick={addService}>
                Add Service
              </Button>
            </div>
            <div className="space-y-2">
              {formData.services.map((service, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={service}
                    onChange={(e) => updateService(index, e.target.value)}
                    placeholder="Service description"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeService(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {formData.services.length === 0 && (
                <p className="text-sm text-muted-foreground">No services added yet. Click "Add Service" to include services.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional information or special circumstances..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Shield className="h-4 w-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Claim"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};