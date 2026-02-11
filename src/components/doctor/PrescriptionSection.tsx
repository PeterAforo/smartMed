import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pill, Plus, Trash2, Save, AlertTriangle, Clock, Search, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface PrescriptionSectionProps {
  patientId: string;
  encounterId: string | null;
}

interface Medication {
  id: string;
  inventoryId: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  route: string;
  quantity: number;
  stockAvailable: number;
}

interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
}

export const PrescriptionSection = ({ 
  patientId, 
  encounterId 
}: PrescriptionSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch inventory/medications from pharmacy
  const { data: inventoryData = [], isLoading: inventoryLoading } = useQuery({
    queryKey: ['pharmacy', 'medications'],
    queryFn: () => api.getMedications({}),
  });

  // Fetch patient's existing prescriptions
  const { data: existingPrescriptions = [] } = useQuery({
    queryKey: ['prescriptions', 'patient', patientId],
    queryFn: () => api.getPrescriptions({ patient_id: patientId }),
    enabled: !!patientId
  });

  // Fetch patient's triage data for allergies
  const { data: triageData = [] } = useQuery({
    queryKey: ['triage', 'patient', patientId],
    queryFn: () => api.getTriageAssessments({ patient_id: patientId }),
    enabled: !!patientId
  });

  // Get allergies from latest triage
  const latestTriage = triageData[0];
  const patientAllergies: string[] = latestTriage?.allergies || [];
  
  // Get current medications from existing prescriptions
  const currentMedications = existingPrescriptions
    .filter((p: any) => p.status === 'active' || p.status === 'dispensed')
    .map((p: any) => `${p.medication_name} ${p.dosage} ${p.frequency}`);

  const drugInteractions: DrugInteraction[] = [
    {
      drug1: 'Warfarin',
      drug2: 'Aspirin',
      severity: 'moderate',
      description: 'Increased risk of bleeding'
    }
  ];

  // Filter inventory based on search
  const filteredInventory = inventoryData.filter((item: any) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.generic_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addMedicationFromInventory = (inventoryItem: any) => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      inventoryId: inventoryItem.id,
      name: inventoryItem.name || inventoryItem.generic_name,
      dosage: inventoryItem.strength || '',
      frequency: '',
      duration: '',
      instructions: '',
      route: 'PO',
      quantity: 1,
      stockAvailable: inventoryItem.quantity_in_stock || 0
    };
    setMedications([...medications, newMedication]);
    setSearchTerm('');
    
    if (inventoryItem.quantity_in_stock <= 0) {
      toast({
        title: "Low Stock Warning",
        description: `${inventoryItem.name} is out of stock.`,
        variant: "destructive"
      });
    } else if (inventoryItem.quantity_in_stock < 10) {
      toast({
        title: "Low Stock Warning", 
        description: `Only ${inventoryItem.quantity_in_stock} units of ${inventoryItem.name} available.`,
      });
    }
  };

  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      inventoryId: '',
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      route: 'PO',
      quantity: 1,
      stockAvailable: 0
    };
    setMedications([...medications, newMedication]);
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const checkAllergies = (medicationName: string) => {
    return patientAllergies.some(allergy => 
      medicationName.toLowerCase().includes(allergy.toLowerCase())
    );
  };

  const checkDrugInteractions = () => {
    const interactions: DrugInteraction[] = [];
    medications.forEach(med1 => {
      medications.forEach(med2 => {
        if (med1.id !== med2.id) {
          const interaction = drugInteractions.find(di => 
            (di.drug1.toLowerCase().includes(med1.name.toLowerCase()) && 
             di.drug2.toLowerCase().includes(med2.name.toLowerCase())) ||
            (di.drug2.toLowerCase().includes(med1.name.toLowerCase()) && 
             di.drug1.toLowerCase().includes(med2.name.toLowerCase()))
          );
          if (interaction && !interactions.includes(interaction)) {
            interactions.push(interaction);
          }
        }
      });
    });
    return interactions;
  };

  const handleSavePrescription = async () => {
    if (!encounterId) {
      toast({
        title: "No Active Encounter",
        description: "Please start the consultation first.",
        variant: "destructive"
      });
      return;
    }

    if (medications.length === 0) {
      toast({
        title: "No Medications",
        description: "Please add at least one medication.",
        variant: "destructive"
      });
      return;
    }

    const incompleteMeds = medications.filter(med => 
      !med.name || !med.dosage || !med.frequency || !med.duration
    );

    if (incompleteMeds.length > 0) {
      toast({
        title: "Incomplete Medications",
        description: "Please complete all medication details.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    // TODO: Implement actual save to database
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Prescription Created",
      description: `Prescription created with ${medications.length} medications.`
    });
    
    setIsSaving(false);
  };

  const interactions = checkDrugInteractions();

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Electronic Prescription
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={addMedication}>
              <Plus className="mr-2 h-4 w-4" />
              Add Medication
            </Button>
            <Button onClick={handleSavePrescription} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Prescription'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-y-auto p-6">
          {/* Patient Safety Information */}
          <div className="mb-6 space-y-4">
            {patientAllergies.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-red-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Patient Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {patientAllergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive">{allergy}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {interactions.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-orange-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Drug Interactions Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {interactions.map((interaction, index) => (
                    <div key={index} className="text-sm text-orange-800">
                      <strong>{interaction.drug1}</strong> + <strong>{interaction.drug2}</strong>: {interaction.description}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Medications List */}
          <div className="space-y-4">
            {medications.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Medications Added</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by adding medications for this prescription
                    </p>
                    <Button onClick={addMedication}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Medication
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              medications.map((medication, index) => (
                <Card key={medication.id} className="border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Medication {index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(medication.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {checkAllergies(medication.name) && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800 font-medium flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Warning: Patient has allergy to this medication class
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Medication Name *</Label>
                        <Input
                          placeholder="e.g., Amoxicillin"
                          value={medication.name}
                          onChange={(e) => updateMedication(medication.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Dosage *</Label>
                        <Input
                          placeholder="e.g., 500mg"
                          value={medication.dosage}
                          onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Route</Label>
                        <Select 
                          value={medication.route} 
                          onValueChange={(value) => updateMedication(medication.id, 'route', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PO">PO (By mouth)</SelectItem>
                            <SelectItem value="IV">IV (Intravenous)</SelectItem>
                            <SelectItem value="IM">IM (Intramuscular)</SelectItem>
                            <SelectItem value="SC">SC (Subcutaneous)</SelectItem>
                            <SelectItem value="Topical">Topical</SelectItem>
                            <SelectItem value="Inhaled">Inhaled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Frequency *</Label>
                        <Select 
                          value={medication.frequency} 
                          onValueChange={(value) => updateMedication(medication.id, 'frequency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OD">OD (Once daily)</SelectItem>
                            <SelectItem value="BID">BID (Twice daily)</SelectItem>
                            <SelectItem value="TID">TID (Three times daily)</SelectItem>
                            <SelectItem value="QID">QID (Four times daily)</SelectItem>
                            <SelectItem value="Q6H">Q6H (Every 6 hours)</SelectItem>
                            <SelectItem value="Q8H">Q8H (Every 8 hours)</SelectItem>
                            <SelectItem value="PRN">PRN (As needed)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Duration *</Label>
                        <Select 
                          value={medication.duration} 
                          onValueChange={(value) => updateMedication(medication.id, 'duration', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3 days">3 days</SelectItem>
                            <SelectItem value="5 days">5 days</SelectItem>
                            <SelectItem value="7 days">7 days</SelectItem>
                            <SelectItem value="10 days">10 days</SelectItem>
                            <SelectItem value="14 days">14 days</SelectItem>
                            <SelectItem value="30 days">30 days</SelectItem>
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Special Instructions</Label>
                      <Textarea
                        placeholder="e.g., Take with food, avoid alcohol..."
                        value={medication.instructions}
                        onChange={(e) => updateMedication(medication.id, 'instructions', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Prescription Notes */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Additional Prescription Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Additional instructions for the patient or pharmacy..."
                value={prescriptionNotes}
                onChange={(e) => setPrescriptionNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Inventory Search Sidebar */}
        <div className="w-80 border-l bg-muted/20 p-4 flex flex-col">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Add from Inventory
          </h4>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {inventoryLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Loading inventory...</p>
              ) : searchTerm && filteredInventory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No medications found</p>
              ) : (
                (searchTerm ? filteredInventory : inventoryData.slice(0, 10)).map((item: any) => (
                  <div 
                    key={item.id} 
                    className="p-3 bg-background rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => addMedicationFromInventory(item)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{item.name}</p>
                      <Badge variant={item.quantity_in_stock > 10 ? 'default' : item.quantity_in_stock > 0 ? 'secondary' : 'destructive'} className="text-xs">
                        {item.quantity_in_stock || 0} in stock
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.strength} • {item.dosage_form}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Current Medications
            </h4>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {currentMedications.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No current medications</p>
                ) : (
                  currentMedications.map((med: string, index: number) => (
                    <div key={index} className="p-2 bg-background rounded border text-xs">
                      {med}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};