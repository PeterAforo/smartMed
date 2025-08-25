import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TestTube, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewLabOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LabTest {
  id: string;
  name: string;
  category: string;
}

export const NewLabOrderDialog = ({ open, onOpenChange }: NewLabOrderDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorName: '',
    priority: 'routine',
    clinicalNotes: ''
  });
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([]);

  const availableTests = [
    { id: 'cbc', name: 'Complete Blood Count', category: 'Hematology' },
    { id: 'lipid', name: 'Lipid Profile', category: 'Biochemistry' },
    { id: 'glucose', name: 'Glucose Test', category: 'Biochemistry' },
    { id: 'hba1c', name: 'HbA1c', category: 'Biochemistry' },
    { id: 'liver', name: 'Liver Function Tests', category: 'Biochemistry' },
    { id: 'kidney', name: 'Kidney Function Tests', category: 'Biochemistry' },
    { id: 'thyroid', name: 'Thyroid Function Tests', category: 'Endocrinology' },
    { id: 'urine', name: 'Urinalysis', category: 'Microbiology' },
    { id: 'culture', name: 'Blood Culture', category: 'Microbiology' }
  ];

  const addTest = (testId: string) => {
    const test = availableTests.find(t => t.id === testId);
    if (test && !selectedTests.find(t => t.id === testId)) {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const removeTest = (testId: string) => {
    setSelectedTests(selectedTests.filter(test => test.id !== testId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.doctorName || selectedTests.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one test.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const orderId = `LO${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    toast({
      title: "Lab Order Created",
      description: `Order ${orderId} created with ${selectedTests.length} tests for patient ${formData.patientId}.`,
    });
    
    setIsSubmitting(false);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      patientId: '',
      doctorName: '',
      priority: 'routine',
      clinicalNotes: ''
    });
    setSelectedTests([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            New Laboratory Order
          </DialogTitle>
          <DialogDescription>
            Create a new laboratory test order for a patient
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient and Doctor Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID *</Label>
              <Input
                id="patientId"
                placeholder="Enter patient ID"
                value={formData.patientId}
                onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorName">Ordering Doctor *</Label>
              <Input
                id="doctorName"
                placeholder="Enter doctor name"
                value={formData.doctorName}
                onChange={(e) => setFormData(prev => ({ ...prev, doctorName: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="stat">STAT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Test Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Laboratory Tests *</Label>
              <Select onValueChange={addTest}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Add test" />
                </SelectTrigger>
                <SelectContent>
                  {availableTests
                    .filter(test => !selectedTests.find(t => t.id === test.id))
                    .map(test => (
                      <SelectItem key={test.id} value={test.id}>
                        {test.name} ({test.category})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTests.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selected Tests:</Label>
                {selectedTests.map(test => (
                  <div key={test.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <span className="font-medium">{test.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">({test.category})</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTest(test.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {selectedTests.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                <TestTube className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No tests selected</p>
                <p className="text-sm text-muted-foreground">Select tests from the dropdown above</p>
              </div>
            )}
          </div>

          {/* Clinical Notes */}
          <div className="space-y-2">
            <Label htmlFor="clinicalNotes">Clinical Notes</Label>
            <Textarea
              id="clinicalNotes"
              placeholder="Enter clinical information, symptoms, or special instructions..."
              value={formData.clinicalNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, clinicalNotes: e.target.value }))}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Order..." : "Create Lab Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};