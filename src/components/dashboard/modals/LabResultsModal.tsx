import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Search } from "lucide-react";

interface LabResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  patient_number: string;
}

export function LabResultsModal({ open, onOpenChange }: LabResultsModalProps) {
  const { currentBranch, tenant } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Load patients when modal opens
  useEffect(() => {
    if (open && currentBranch && tenant) {
      loadPatients();
    }
  }, [open, currentBranch, tenant]);

  const loadPatients = async () => {
    if (!currentBranch || !tenant) return;

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, patient_number')
        .eq('tenant_id', tenant.id)
        .eq('branch_id', currentBranch.id)
        .eq('status', 'active')
        .order('last_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  // Mock lab results data - in a real app, this would come from a lab results table
  const mockLabResults = [
    {
      id: "1",
      test_name: "Complete Blood Count (CBC)",
      date: "2024-01-20",
      status: "completed",
      results: {
        "Hemoglobin": { value: "14.2", unit: "g/dL", reference: "12.0-15.5", normal: true },
        "White Blood Cells": { value: "7.8", unit: "K/uL", reference: "4.5-11.0", normal: true },
        "Platelets": { value: "280", unit: "K/uL", reference: "150-450", normal: true }
      }
    },
    {
      id: "2",
      test_name: "Basic Metabolic Panel",
      date: "2024-01-18",
      status: "completed",
      results: {
        "Glucose": { value: "95", unit: "mg/dL", reference: "70-100", normal: true },
        "Sodium": { value: "142", unit: "mEq/L", reference: "136-145", normal: true },
        "Potassium": { value: "4.1", unit: "mEq/L", reference: "3.5-5.0", normal: true }
      }
    },
    {
      id: "3",
      test_name: "Lipid Panel",
      date: "2024-01-15",
      status: "completed",
      results: {
        "Total Cholesterol": { value: "205", unit: "mg/dL", reference: "<200", normal: false },
        "HDL Cholesterol": { value: "55", unit: "mg/dL", reference: ">40", normal: true },
        "LDL Cholesterol": { value: "130", unit: "mg/dL", reference: "<100", normal: false }
      }
    }
  ];

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name} ${patient.patient_number}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lab Results</DialogTitle>
          <DialogDescription>
            View and search laboratory test results for patients.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient Search */}
          <div className="space-y-2">
            <Label htmlFor="patientSearch">Search Patient</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="patientSearch"
                placeholder="Search by name or patient number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Patient Selection */}
          <div className="space-y-2">
            <Label htmlFor="patient">Select Patient</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a patient to view results" />
              </SelectTrigger>
              <SelectContent>
                {filteredPatients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name} ({patient.patient_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lab Results Display */}
          {selectedPatient && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Lab Results for {patients.find(p => p.id === selectedPatient)?.first_name} {patients.find(p => p.id === selectedPatient)?.last_name}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {mockLabResults.length} Results Available
                </Badge>
              </div>

              {mockLabResults.map((result) => (
                <Card key={result.id} className="healthcare-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {result.test_name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={result.status === 'completed' ? 'default' : 'secondary'}>
                          {result.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {result.date}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {Object.entries(result.results).map(([test, data]) => (
                        <div key={test} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-foreground">{test}</div>
                            <div className="text-xs text-muted-foreground">
                              Reference: {data.reference}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">
                              {data.value} {data.unit}
                            </span>
                            <Badge variant={data.normal ? 'default' : 'destructive'} className="text-xs">
                              {data.normal ? 'Normal' : 'Abnormal'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {mockLabResults.length === 0 && (
                <Card className="healthcare-card">
                  <CardContent className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No lab results found for this patient.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {!selectedPatient && (
            <Card className="healthcare-card">
              <CardContent className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a patient to view their lab results.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}