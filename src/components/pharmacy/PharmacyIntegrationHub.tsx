import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle, Clock, Search, Pill, Repeat, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface PharmacyIntegrationHubProps {
  patientId?: string;
}

export const PharmacyIntegrationHub: React.FC<PharmacyIntegrationHubProps> = ({ patientId }) => {
  const { profile, currentBranch } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescriptions, setSelectedPrescriptions] = useState<string[]>([]);

  // Fetch active prescriptions
  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery({
    queryKey: ['prescriptions', patientId, currentBranch?.id],
    queryFn: async () => {
      let query = supabase
        .from('prescriptions')
        .select('*')
        .eq('tenant_id', profile?.tenant_id)
        .in('status', ['active', 'pending'])
        .order('start_date', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      if (currentBranch?.id) {
        query = query.eq('branch_id', currentBranch.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id
  });

  // Fetch medication interactions
  const { data: interactions } = useQuery({
    queryKey: ['medication-interactions', profile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medication_interactions')
        .select('*')
        .eq('tenant_id', profile?.tenant_id)
        .eq('is_active', true)
        .order('severity_level', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id
  });

  // Fetch prescription renewals
  const { data: renewals } = useQuery({
    queryKey: ['prescription-renewals', currentBranch?.id],
    queryFn: async () => {
      let query = supabase
        .from('prescription_renewals')
        .select('*')
        .eq('tenant_id', profile?.tenant_id)
        .order('request_date', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      if (currentBranch?.id) {
        query = query.eq('branch_id', currentBranch.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id
  });

  // Fetch medication adherence data
  const { data: adherenceData } = useQuery({
    queryKey: ['medication-adherence', patientId],
    queryFn: async () => {
      let query = supabase
        .from('medication_adherence')
        .select('*')
        .eq('tenant_id', profile?.tenant_id)
        .order('adherence_date', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id
  });

  // Fetch patients data  
  const { data: patients } = useQuery({
    queryKey: ['patients', profile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, patient_number')
        .eq('tenant_id', profile?.tenant_id);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id
  });

  // Create patient lookup map
  const patientMap = patients?.reduce((acc, patient) => {
    acc[patient.id] = patient;
    return acc;
  }, {} as Record<string, any>) || {};

  // Create prescription lookup map
  const prescriptionMap = prescriptions?.reduce((acc, prescription) => {
    acc[prescription.id] = prescription;
    return acc;
  }, {} as Record<string, any>) || {};

  // Check for drug interactions
  const checkInteractions = (medications: string[]) => {
    if (!interactions || medications.length < 2) return [];
    
    const foundInteractions = [];
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const interaction = interactions.find(
          int => 
            (int.medication_1.toLowerCase() === medications[i].toLowerCase() && 
             int.medication_2.toLowerCase() === medications[j].toLowerCase()) ||
            (int.medication_1.toLowerCase() === medications[j].toLowerCase() && 
             int.medication_2.toLowerCase() === medications[i].toLowerCase())
        );
        if (interaction) {
          foundInteractions.push({
            ...interaction,
            medication_pair: [medications[i], medications[j]]
          });
        }
      }
    }
    return foundInteractions;
  };

  // Approve renewal mutation
  const approveRenewalMutation = useMutation({
    mutationFn: async (renewalId: string) => {
      const { error } = await supabase
        .from('prescription_renewals')
        .update({
          status: 'approved',
          approved_by: profile?.user_id,
          approval_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', renewalId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Prescription renewal approved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['prescription-renewals'] });
    }
  });

  const getInteractionSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'contraindicated': return 'destructive';
      case 'major': return 'destructive';
      case 'moderate': return 'default';
      case 'minor': return 'secondary';
      default: return 'outline';
    }
  };

  const getAdherenceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredPrescriptions = prescriptions?.filter(prescription =>
    prescription.medication_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patientMap[prescription.patient_id]?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patientMap[prescription.patient_id]?.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const selectedMedications = prescriptions
    ?.filter(p => selectedPrescriptions.includes(p.id))
    ?.map(p => p.medication_name) || [];

  const currentInteractions = checkInteractions(selectedMedications);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-5 w-5" />
          Pharmacy Integration Hub
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">Active Prescriptions</TabsTrigger>
            <TabsTrigger value="interactions">Drug Interactions</TabsTrigger>
            <TabsTrigger value="renewals">Renewals</TabsTrigger>
            <TabsTrigger value="adherence">Adherence</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prescriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {selectedPrescriptions.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedPrescriptions([])}
                >
                  Clear Selection ({selectedPrescriptions.length})
                </Button>
              )}
            </div>

            {currentInteractions.length > 0 && (
              <div className="p-4 border border-destructive rounded-lg bg-destructive/5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-destructive">Drug Interactions Detected</span>
                </div>
                <div className="space-y-2">
                  {currentInteractions.map((interaction, index) => (
                    <div key={index} className="text-sm">
                      <Badge variant={getInteractionSeverityVariant(interaction.interaction_type)} className="mr-2">
                        {interaction.interaction_type}
                      </Badge>
                      <span>{interaction.medication_pair.join(' + ')}: </span>
                      <span className="text-muted-foreground">{interaction.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {prescriptionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  filteredPrescriptions.map((prescription) => (
                    <div key={prescription.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedPrescriptions.includes(prescription.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPrescriptions(prev => [...prev, prescription.id]);
                              } else {
                                setSelectedPrescriptions(prev => prev.filter(id => id !== prescription.id));
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{prescription.medication_name}</h4>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p><strong>Dosage:</strong> {prescription.dosage}</p>
                              <p><strong>Frequency:</strong> {prescription.frequency}</p>
                              {patientMap[prescription.patient_id] && (
                                <p><strong>Patient:</strong> {patientMap[prescription.patient_id].first_name} {patientMap[prescription.patient_id].last_name}</p>
                              )}
                              <p><strong>Start Date:</strong> {format(new Date(prescription.start_date), 'MMM dd, yyyy')}</p>
                              {prescription.end_date && (
                                <p><strong>End Date:</strong> {format(new Date(prescription.end_date), 'MMM dd, yyyy')}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                            {prescription.status}
                          </Badge>
                          {prescription.refills_remaining > 0 && (
                            <Badge variant="outline">
                              {prescription.refills_remaining} refills
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {!prescriptionsLoading && filteredPrescriptions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No active prescriptions found.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {interactions?.map((interaction) => (
                  <div key={interaction.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        {interaction.medication_1} + {interaction.medication_2}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={getInteractionSeverityVariant(interaction.interaction_type)}>
                          {interaction.interaction_type}
                        </Badge>
                        <Badge variant="outline">
                          Level {interaction.severity_level}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p><strong>Description:</strong> {interaction.description}</p>
                      {interaction.clinical_significance && (
                        <p><strong>Clinical Significance:</strong> {interaction.clinical_significance}</p>
                      )}
                      {interaction.management_recommendations && (
                        <p><strong>Management:</strong> {interaction.management_recommendations}</p>
                      )}
                      <p><strong>Evidence Level:</strong> {interaction.evidence_level}</p>
                    </div>
                  </div>
                ))}
                {!interactions?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    No drug interactions configured.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="renewals" className="space-y-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {renewals?.map((renewal) => (
                  <div key={renewal.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        {prescriptionMap[renewal.original_prescription_id]?.medication_name || 'Unknown Medication'}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={renewal.status === 'approved' ? 'default' : 'secondary'}>
                          {renewal.status}
                        </Badge>
                        <Badge variant="outline">
                          {renewal.renewal_type}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {patientMap[renewal.patient_id] && (
                        <p><strong>Patient:</strong> {patientMap[renewal.patient_id].first_name} {patientMap[renewal.patient_id].last_name}</p>
                      )}
                      <p><strong>Requested:</strong> {format(new Date(renewal.request_date), 'MMM dd, yyyy')}</p>
                      {renewal.approval_date && (
                        <p><strong>Approved:</strong> {format(new Date(renewal.approval_date), 'MMM dd, yyyy')}</p>
                      )}
                      {renewal.reason_for_renewal && (
                        <p><strong>Reason:</strong> {renewal.reason_for_renewal}</p>
                      )}
                    </div>
                    {renewal.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => approveRenewalMutation.mutate(renewal.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Deny
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {!renewals?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    No prescription renewals found.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="adherence" className="space-y-4">
            {!patientId ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a patient to view medication adherence data.</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {adherenceData?.map((adherence) => (
                    <div key={adherence.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {prescriptionMap[adherence.prescription_id]?.medication_name || 'Unknown Medication'}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${getAdherenceColor(adherence.adherence_percentage)}`}>
                            {Math.round(adherence.adherence_percentage)}% adherence
                          </span>
                          <Badge variant="outline">
                            {format(new Date(adherence.adherence_date), 'MMM dd')}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Dosage:</strong> {prescriptionMap[adherence.prescription_id]?.dosage || 'Unknown'}</p>
                        <p><strong>Prescribed:</strong> {adherence.doses_prescribed} doses</p>
                        <p><strong>Taken:</strong> {adherence.doses_taken} doses</p>
                        <p><strong>Missed:</strong> {adherence.missed_doses} doses</p>
                        {adherence.side_effects?.length > 0 && (
                          <p><strong>Side Effects:</strong> {adherence.side_effects.join(', ')}</p>
                        )}
                        {adherence.patient_reported_issues && (
                          <p><strong>Issues:</strong> {adherence.patient_reported_issues}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {!adherenceData?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      No adherence data available for this patient.
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};