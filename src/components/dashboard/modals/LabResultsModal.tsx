import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Search, Filter, Download, Calendar, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

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
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [selectedTestType, setSelectedTestType] = useState("all");

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

  // Enhanced mock lab results with more variety
  const mockLabResults = [
    {
      id: "1",
      test_name: "Complete Blood Count (CBC)",
      date: "2024-01-20",
      status: "completed",
      category: "hematology",
      doctor: "Dr. Smith",
      results: {
        "Hemoglobin": { value: "14.2", unit: "g/dL", reference: "12.0-15.5", normal: true },
        "White Blood Cells": { value: "7.8", unit: "K/uL", reference: "4.5-11.0", normal: true },
        "Platelets": { value: "280", unit: "K/uL", reference: "150-450", normal: true },
        "Hematocrit": { value: "42.1", unit: "%", reference: "36.0-46.0", normal: true }
      }
    },
    {
      id: "2",
      test_name: "Basic Metabolic Panel",
      date: "2024-01-18",
      status: "completed",
      category: "chemistry",
      doctor: "Dr. Johnson",
      results: {
        "Glucose": { value: "95", unit: "mg/dL", reference: "70-100", normal: true },
        "Sodium": { value: "142", unit: "mEq/L", reference: "136-145", normal: true },
        "Potassium": { value: "4.1", unit: "mEq/L", reference: "3.5-5.0", normal: true },
        "Creatinine": { value: "1.0", unit: "mg/dL", reference: "0.6-1.3", normal: true }
      }
    },
    {
      id: "3",
      test_name: "Lipid Panel",
      date: "2024-01-15",
      status: "completed",
      category: "chemistry",
      doctor: "Dr. Williams",
      results: {
        "Total Cholesterol": { value: "205", unit: "mg/dL", reference: "<200", normal: false },
        "HDL Cholesterol": { value: "55", unit: "mg/dL", reference: ">40", normal: true },
        "LDL Cholesterol": { value: "130", unit: "mg/dL", reference: "<100", normal: false },
        "Triglycerides": { value: "150", unit: "mg/dL", reference: "<150", normal: true }
      }
    },
    {
      id: "4",
      test_name: "Thyroid Function Tests",
      date: "2024-01-12",
      status: "completed",
      category: "endocrinology",
      doctor: "Dr. Brown",
      results: {
        "TSH": { value: "2.1", unit: "mIU/L", reference: "0.4-4.0", normal: true },
        "Free T4": { value: "1.2", unit: "ng/dL", reference: "0.8-1.8", normal: true },
        "Free T3": { value: "3.1", unit: "pg/mL", reference: "2.3-4.2", normal: true }
      }
    },
    {
      id: "5",
      test_name: "Liver Function Tests",
      date: "2024-01-10",
      status: "pending",
      category: "chemistry",
      doctor: "Dr. Davis",
      results: {
        "ALT": { value: "35", unit: "U/L", reference: "10-40", normal: true },
        "AST": { value: "28", unit: "U/L", reference: "10-40", normal: true },
        "Bilirubin": { value: "0.8", unit: "mg/dL", reference: "0.3-1.2", normal: true }
      }
    }
  ];

  const getFilteredResults = () => {
    let filtered = mockLabResults;

    if (selectedDateRange !== "all") {
      const days = parseInt(selectedDateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filtered = filtered.filter(result => new Date(result.date) >= cutoffDate);
    }

    if (selectedTestType !== "all") {
      filtered = filtered.filter(result => result.category === selectedTestType);
    }

    return filtered;
  };

  const handleDownloadResults = (resultId: string) => {
    const result = mockLabResults.find(r => r.id === resultId);
    if (!result) return;

    const patient = patients.find(p => p.id === selectedPatient);
    if (!patient) return;

    const reportContent = `
Lab Result Report
=================
Patient: ${patient.first_name} ${patient.last_name} (${patient.patient_number})
Test: ${result.test_name}
Date: ${result.date}
Doctor: ${result.doctor}
Status: ${result.status}

Results:
${Object.entries(result.results).map(([test, data]) => 
  `${test}: ${data.value} ${data.unit} (Ref: ${data.reference}) - ${data.normal ? 'Normal' : 'Abnormal'}`
).join('\n')}

Generated: ${new Date().toISOString()}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lab_Result_${result.test_name.replace(/\s+/g, '_')}_${result.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name} ${patient.patient_number}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <DialogTitle>Lab Results</DialogTitle>
          </div>
          <DialogDescription>
            View and search laboratory test results for patients.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testType">Test Category</Label>
              <Select value={selectedTestType} onValueChange={setSelectedTestType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="hematology">Hematology</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="endocrinology">Endocrinology</SelectItem>
                  <SelectItem value="microbiology">Microbiology</SelectItem>
                </SelectContent>
              </Select>
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
            <Tabs defaultValue="results" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Lab Results for {patients.find(p => p.id === selectedPatient)?.first_name} {patients.find(p => p.id === selectedPatient)?.last_name}
                </h3>
                <div className="flex items-center gap-2">
                  <TabsList>
                    <TabsTrigger value="results">All Results</TabsTrigger>
                    <TabsTrigger value="abnormal">Abnormal Only</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                  </TabsList>
                  <Badge variant="outline" className="text-xs">
                    {getFilteredResults().length} Results Found
                  </Badge>
                </div>
              </div>

              <TabsContent value="results" className="space-y-4">
                {getFilteredResults().map((result) => (
                  <Card key={result.id} className="healthcare-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {result.test_name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadResults(result.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Badge variant={result.status === 'completed' ? 'default' : result.status === 'pending' ? 'secondary' : 'destructive'}>
                            {result.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(result.date), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-xs">
                        Ordered by: {result.doctor} • Category: {result.category}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {Object.entries(result.results).map(([test, data]) => (
                          <div key={test} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-sm text-foreground flex items-center gap-1">
                                {test}
                                {!data.normal && <AlertTriangle className="h-3 w-3 text-destructive" />}
                              </div>
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
              </TabsContent>

              <TabsContent value="abnormal" className="space-y-4">
                {getFilteredResults()
                  .filter(result => Object.values(result.results).some(data => !data.normal))
                  .map((result) => (
                    <Card key={result.id} className="healthcare-card border-destructive/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            {result.test_name}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadResults(result.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Badge variant="destructive" className="text-xs">
                              Abnormal Values
                            </Badge>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(result.date), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          {Object.entries(result.results)
                            .filter(([, data]) => !data.normal)
                            .map(([test, data]) => (
                            <div key={test} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                              <div className="flex-1">
                                <div className="font-medium text-sm text-foreground flex items-center gap-1">
                                  {test}
                                  <AlertTriangle className="h-3 w-3 text-destructive" />
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Reference: {data.reference}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-semibold text-destructive">
                                  {data.value} {data.unit}
                                </span>
                                <Badge variant="destructive" className="text-xs">
                                  Abnormal
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                {getFilteredResults()
                  .filter(result => result.status === 'pending')
                  .map((result) => (
                    <Card key={result.id} className="healthcare-card border-secondary/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4 text-secondary" />
                            {result.test_name}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              Pending Results
                            </Badge>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(result.date), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                        <CardDescription className="text-xs">
                          Ordered by: {result.doctor} • Expected completion: 24-48 hours
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
              </TabsContent>

              {getFilteredResults().length === 0 && (
                <Card className="healthcare-card">
                  <CardContent className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No lab results found matching the current filters.</p>
                  </CardContent>
                </Card>
              )}
            </Tabs>
          )}

          {!selectedPatient && (
            <Card className="healthcare-card">
              <CardContent className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Patient</h3>
                <p className="text-muted-foreground mb-4">Choose a patient from the dropdown above to view their lab results.</p>
                <p className="text-sm text-muted-foreground">
                  Use the search and filter options to find specific tests or date ranges.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-muted-foreground">
            {selectedPatient && `Showing ${getFilteredResults().length} results`}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}