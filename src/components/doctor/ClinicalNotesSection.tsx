import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, FileText, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter clinical assessment, diagnosis, and impression..."
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