import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useEncounters } from '@/hooks/useEncounters';
import { useOrders } from '@/hooks/useOrders';
import { StartEncounterDialog } from './StartEncounterDialog';
import { CreateOrderDialog } from './CreateOrderDialog';
import { UpdateEncounterDialog } from './UpdateEncounterDialog';
import { Clock, User, MapPin, FileText, Plus, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface EncounterDashboardProps {
  patientId?: string;
}

export function EncounterDashboard({ patientId }: EncounterDashboardProps) {
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [selectedEncounterId, setSelectedEncounterId] = useState<string | null>(null);

  const { encounters, isLoading } = useEncounters(patientId);
  const { orders } = useOrders(selectedEncounterId ? { encounterId: selectedEncounterId } : {});

  const activeEncounters = encounters?.filter(e => e.status === 'active') || [];
  const recentEncounters = encounters?.slice(0, 5) || [];

  const handleStartOrder = (encounterId: string) => {
    setSelectedEncounterId(encounterId);
    setShowOrderDialog(true);
  };

  const handleUpdateEncounter = (encounterId: string) => {
    setSelectedEncounterId(encounterId);
    setShowUpdateDialog(true);
  };

  const getEncounterTypeColor = (type: string) => {
    switch (type) {
      case 'ER': return 'destructive';
      case 'IPD': return 'secondary';
      case 'OPD': return 'default';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading encounters...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Patient Encounters</h2>
        <Button onClick={() => setShowStartDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Start Encounter
        </Button>
      </div>

      {/* Active Encounters */}
      {activeEncounters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Active Encounters ({activeEncounters.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeEncounters.map((encounter) => (
              <div key={encounter.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getEncounterTypeColor(encounter.encounter_type)}>
                        {encounter.encounter_type}
                      </Badge>
                      <Badge variant={getStatusColor(encounter.status)}>
                        {encounter.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        #{encounter.encounter_number}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {format(new Date(encounter.start_time), 'MMM dd, yyyy HH:mm')}
                      </div>
                      
                      {encounter.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {encounter.location}
                        </div>
                      )}
                      
                      {encounter.profiles && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {encounter.profiles.first_name} {encounter.profiles.last_name}
                        </div>
                      )}
                    </div>

                    {encounter.chief_complaint && (
                      <div className="flex items-start">
                        <FileText className="h-4 w-4 mr-1 mt-1 text-muted-foreground" />
                        <p className="text-sm">{encounter.chief_complaint}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartOrder(encounter.id)}
                    >
                      Add Order
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateEncounter(encounter.id)}
                    >
                      Update
                    </Button>
                  </div>
                </div>

                {/* Active Orders Summary */}
                {orders?.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">Active Orders ({orders.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {orders.slice(0, 5).map((order) => (
                        <Badge key={order.id} variant="outline">
                          {order.order_type}: {order.order_name}
                        </Badge>
                      ))}
                      {orders.length > 5 && (
                        <Badge variant="outline">+{orders.length - 5} more</Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Encounters */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Encounters</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEncounters.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No encounters found. Start the first encounter for this patient.
            </p>
          ) : (
            <div className="space-y-3">
              {recentEncounters.map((encounter, index) => (
                <div key={encounter.id}>
                  <div className="flex justify-between items-center py-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getEncounterTypeColor(encounter.encounter_type)}>
                          {encounter.encounter_type}
                        </Badge>
                        <Badge variant={getStatusColor(encounter.status)}>
                          {encounter.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          #{encounter.encounter_number}
                        </span>
                      </div>
                      <p className="text-sm">{encounter.chief_complaint || 'No chief complaint recorded'}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(encounter.start_time), 'MMM dd, yyyy HH:mm')}
                        {encounter.end_time && ` - ${format(new Date(encounter.end_time), 'HH:mm')}`}
                      </p>
                    </div>
                    
                    {encounter.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateEncounter(encounter.id)}
                      >
                        Manage
                      </Button>
                    )}
                  </div>
                  {index < recentEncounters.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <StartEncounterDialog
        isOpen={showStartDialog}
        onClose={() => setShowStartDialog(false)}
        patientId={patientId}
      />

      {selectedEncounterId && (
        <>
          <CreateOrderDialog
            isOpen={showOrderDialog}
            onClose={() => {
              setShowOrderDialog(false);
              setSelectedEncounterId(null);
            }}
            encounterId={selectedEncounterId}
          />
          
          <UpdateEncounterDialog
            isOpen={showUpdateDialog}
            onClose={() => {
              setShowUpdateDialog(false);
              setSelectedEncounterId(null);
            }}
            encounterId={selectedEncounterId}
          />
        </>
      )}
    </div>
  );
}