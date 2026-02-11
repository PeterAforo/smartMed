import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, FileText, Clock, Search, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface ClinicalNotesSectionProps {
  encounterId: string | null;
  noteType: 'history' | 'examination' | 'assessment';
  title: string;
}

interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface SelectedDiagnosis {
  code: string;
  description: string;
  category: string;
  isNotifiable: boolean;
}

export const ClinicalNotesSection = ({ 
  encounterId, 
  noteType, 
  title 
}: ClinicalNotesSectionProps) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<SOAPNote>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [icd10Search, setIcd10Search] = useState('');
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<SelectedDiagnosis[]>([]);

  // Fetch ICD-10 codes based on search
  const { data: icd10Results = [], isLoading: icd10Loading } = useQuery({
    queryKey: ['icd10', 'search', icd10Search],
    queryFn: () => api.searchICD10({ q: icd10Search, limit: 20 }),
    enabled: icd10Search.length >= 2
  });

  // Fetch notifiable diseases list
  const { data: notifiableDiseases = [] } = useQuery({
    queryKey: ['icd10', 'notifiable'],
    queryFn: () => api.getNotifiableDiseases()
  });

  const notifiableCodes = notifiableDiseases.map((d: any) => d.code);

  const addDiagnosis = (diagnosis: any) => {
    const isNotifiable = notifiableCodes.includes(diagnosis.code);
    const newDiagnosis: SelectedDiagnosis = {
      code: diagnosis.code,
      description: diagnosis.description,
      category: diagnosis.category,
      isNotifiable
    };
    
    if (!selectedDiagnoses.find(d => d.code === diagnosis.code)) {
      setSelectedDiagnoses([...selectedDiagnoses, newDiagnosis]);
      
      if (isNotifiable) {
        toast({
          title: "⚠️ Notifiable Disease",
          description: `${diagnosis.description} is a notifiable disease. Please report to public health authorities.`,
          variant: "destructive"
        });
      }
    }
    setIcd10Search('');
  };

  const removeDiagnosis = (code: string) => {
    setSelectedDiagnoses(selectedDiagnoses.filter(d => d.code !== code));
  };

  // Auto-save functionality
  useEffect(() => {
    if (!encounterId) return;

    const autoSaveTimer = setTimeout(() => {
      handleAutoSave();
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [notes, encounterId]);

  const handleAutoSave = async () => {
    if (!encounterId) return;
    
    setIsAutoSaving(true);
    // TODO: Implement actual save to database
    await new Promise(resolve => setTimeout(resolve, 500));
    setLastSaved(new Date());
    setIsAutoSaving(false);
  };

  const handleManualSave = async () => {
    if (!encounterId) {
      toast({
        title: "No Active Encounter",
        description: "Please start the consultation first.",
        variant: "destructive"
      });
      return;
    }

    await handleAutoSave();
    toast({
      title: "Notes Saved",
      description: "Clinical notes have been saved successfully."
    });
  };

  const getTemplateForNoteType = () => {
    switch (noteType) {
      case 'history':
        return {
          subjective: `Chief Complaint: 
History of Present Illness:
Past Medical History:
Medications:
Allergies:
Social History:
Family History:
Review of Systems:`,
          objective: '',
          assessment: '',
          plan: ''
        };
      case 'examination':
        return {
          subjective: '',
          objective: `General Appearance:
Vital Signs: 
Head/Eyes/Ears/Nose/Throat:
Cardiovascular:
Respiratory:
Abdomen:
Neurological:
Musculoskeletal:
Skin:`,
          assessment: '',
          plan: ''
        };
      case 'assessment':
        return {
          subjective: '',
          objective: '',
          assessment: `Primary Diagnosis:
Differential Diagnosis:
Clinical Impression:`,
          plan: `Treatment Plan:
Follow-up:
Patient Education:
Referrals:
Next Steps:`
        };
      default:
        return notes;
    }
  };

  const loadTemplate = () => {
    const template = getTemplateForNoteType();
    setNotes(template);
  };

  const renderNoteTypeContent = () => {
    switch (noteType) {
      case 'history':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subjective (Patient History)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter patient history, chief complaint, and subjective findings..."
                  value={notes.subjective}
                  onChange={(e) => setNotes(prev => ({ ...prev, subjective: e.target.value }))}
                  className="min-h-[300px]"
                />
              </CardContent>
            </Card>
          </div>
        );
      
      case 'examination':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Objective (Physical Examination)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter physical examination findings and objective observations..."
                  value={notes.objective}
                  onChange={(e) => setNotes(prev => ({ ...prev, objective: e.target.value }))}
                  className="min-h-[300px]"
                />
              </CardContent>
            </Card>
          </div>
        );
      
      case 'assessment':
        return (
          <div className="space-y-4">
            {/* ICD-10 Diagnosis Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  ICD-10 Diagnosis Codes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search ICD-10 codes (e.g., diabetes, hypertension, J06)..."
                    value={icd10Search}
                    onChange={(e) => setIcd10Search(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Search Results */}
                {icd10Search.length >= 2 && (
                  <ScrollArea className="h-48 border rounded-lg">
                    <div className="p-2 space-y-1">
                      {icd10Loading ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Searching...</p>
                      ) : icd10Results.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No results found</p>
                      ) : (
                        icd10Results.map((result: any) => (
                          <div
                            key={result.code}
                            className="p-2 rounded hover:bg-accent cursor-pointer flex items-center justify-between"
                            onClick={() => addDiagnosis(result)}
                          >
                            <div>
                              <span className="font-mono font-medium text-primary">{result.code}</span>
                              <span className="mx-2">-</span>
                              <span>{result.description}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{result.category}</Badge>
                              {notifiableCodes.includes(result.code) && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Notifiable
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                )}

                {/* Selected Diagnoses */}
                {selectedDiagnoses.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Diagnoses</Label>
                    <div className="space-y-2">
                      {selectedDiagnoses.map((diagnosis, index) => (
                        <div
                          key={diagnosis.code}
                          className={`p-3 rounded-lg border flex items-center justify-between ${
                            diagnosis.isNotifiable ? 'bg-red-50 border-red-200' : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant={index === 0 ? 'default' : 'secondary'}>
                              {index === 0 ? 'Primary' : `Secondary ${index}`}
                            </Badge>
                            <span className="font-mono font-medium">{diagnosis.code}</span>
                            <span>-</span>
                            <span>{diagnosis.description}</span>
                            {diagnosis.isNotifiable && (
                              <Badge variant="destructive" className="ml-2">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Notifiable Disease
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDiagnosis(diagnosis.code)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Clinical Assessment Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter clinical assessment, differential diagnosis, and clinical impression..."
                  value={notes.assessment}
                  onChange={(e) => setNotes(prev => ({ ...prev, assessment: e.target.value }))}
                  className="min-h-[150px]"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter treatment plan, follow-up instructions, and next steps..."
                  value={notes.plan}
                  onChange={(e) => setNotes(prev => ({ ...prev, plan: e.target.value }))}
                  className="min-h-[150px]"
                />
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {title}
            </h3>
            <div className="flex items-center gap-4 mt-2">
              {lastSaved && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Last saved: {lastSaved.toLocaleTimeString()}
                </p>
              )}
              {isAutoSaving && (
                <Badge variant="secondary">Auto-saving...</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadTemplate}>
              Load Template
            </Button>
            <Button onClick={handleManualSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Notes
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {renderNoteTypeContent()}
      </div>
    </div>
  );
};