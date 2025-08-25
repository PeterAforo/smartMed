import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, User, Calendar, Clock, Stethoscope } from 'lucide-react';

interface ViewPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: {
    id: number;
    name: string;
    patientId: string;
    age?: number;
    gender?: string;
    phone?: string;
    complaint?: string;
  } | null;
}

export const ViewPatientDialog = ({ open, onOpenChange, patient }: ViewPatientDialogProps) => {
  if (!patient) return null;

  // Mock patient data
  const patientDetails = {
    ...patient,
    age: 45,
    gender: 'Male',
    phone: '+233 20 123 4567',
    email: 'john.doe@email.com',
    address: '123 Main Street, Accra',
    emergencyContact: 'Jane Doe (Wife)',
    emergencyPhone: '+233 20 987 6543',
    insurance: 'NHIS',
    policyNumber: 'NH123456789',
    allergies: ['Penicillin', 'Shellfish'],
    medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
    lastVisit: '2024-01-10',
    vitals: {
      bloodPressure: '140/90',
      temperature: '98.6°F',
      pulse: '72 bpm',
      weight: '75 kg',
      height: '175 cm'
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Information
          </DialogTitle>
          <DialogDescription>
            Complete patient profile and medical information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Full Name</Label>
                <p className="text-sm">{patientDetails.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Patient ID</Label>
                <p className="text-sm font-mono">{patientDetails.patientId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Age</Label>
                <p className="text-sm">{patientDetails.age} years</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Gender</Label>
                <p className="text-sm">{patientDetails.gender}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Phone</Label>
                <p className="text-sm">{patientDetails.phone}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm">{patientDetails.email}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Current Visit */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Current Visit
            </h4>
            <div>
              <Label className="text-sm font-medium">Chief Complaint</Label>
              <p className="text-sm mt-1">{patientDetails.complaint}</p>
            </div>
          </div>

          <Separator />

          {/* Vital Signs */}
          <div className="space-y-4">
            <h4 className="font-medium">Latest Vital Signs</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Blood Pressure</Label>
                <p className="text-sm">{patientDetails.vitals.bloodPressure}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Temperature</Label>
                <p className="text-sm">{patientDetails.vitals.temperature}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Pulse</Label>
                <p className="text-sm">{patientDetails.vitals.pulse}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Weight</Label>
                <p className="text-sm">{patientDetails.vitals.weight}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Height</Label>
                <p className="text-sm">{patientDetails.vitals.height}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Medical History */}
          <div className="space-y-4">
            <h4 className="font-medium">Medical History</h4>
            <div className="space-y-2">
              <div>
                <Label className="text-sm font-medium">Allergies</Label>
                <div className="flex gap-2 mt-1">
                  {patientDetails.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive">{allergy}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Medical Conditions</Label>
                <div className="flex gap-2 mt-1">
                  {patientDetails.medicalHistory.map((condition, index) => (
                    <Badge key={index} variant="outline">{condition}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Contact Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Address</Label>
                <p className="text-sm">{patientDetails.address}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Emergency Contact</Label>
                <p className="text-sm">{patientDetails.emergencyContact}</p>
                <p className="text-sm text-muted-foreground">{patientDetails.emergencyPhone}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Insurance Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Insurance Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Insurance Provider</Label>
                <p className="text-sm">{patientDetails.insurance}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Policy Number</Label>
                <p className="text-sm font-mono">{patientDetails.policyNumber}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            View Full Medical Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};