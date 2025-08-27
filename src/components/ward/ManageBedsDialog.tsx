import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bed, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ManageBedsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wardName?: string;
}

export const ManageBedsDialog = ({ open, onOpenChange, wardName }: ManageBedsDialogProps) => {
  const { toast } = useToast();
  const [selectedBed, setSelectedBed] = useState<string>('');
  
  // Mock bed data
  const [beds] = useState([
    { 
      id: '1A', 
      status: 'occupied', 
      patient: 'John Doe', 
      admissionDate: '2024-01-10',
      condition: 'Stable',
      equipment: ['Monitor', 'Oxygen']
    },
    { 
      id: '2A', 
      status: 'occupied', 
      patient: 'Jane Smith', 
      admissionDate: '2024-01-12',
      condition: 'Critical',
      equipment: ['Ventilator', 'Monitor', 'IV Pump']
    },
    { 
      id: '3A', 
      status: 'available', 
      patient: null, 
      admissionDate: null,
      condition: null,
      equipment: ['Monitor']
    },
    { 
      id: '4A', 
      status: 'maintenance', 
      patient: null, 
      admissionDate: null,
      condition: null,
      equipment: []
    },
    { 
      id: '5A', 
      status: 'cleaning', 
      patient: null, 
      admissionDate: null,
      condition: null,
      equipment: ['Monitor']
    },
    { 
      id: '6A', 
      status: 'available', 
      patient: null, 
      admissionDate: null,
      condition: null,
      equipment: ['Monitor', 'Oxygen']
    },
  ]);

  const getBedStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'available': return 'bg-green-100 text-green-800';
      case 'cleaning': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string | null) => {
    if (!condition) return '';
    switch (condition.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'serious': return 'bg-orange-100 text-orange-800';
      case 'stable': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getBedStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied': return <User className="h-4 w-4" />;
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'cleaning': case 'maintenance': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bed className="h-4 w-4" />;
    }
  };

  const handleBedAction = (bedId: string, action: string) => {
    let message = '';
    switch (action) {
      case 'discharge':
        message = `Patient discharged from bed ${bedId}`;
        break;
      case 'transfer':
        message = `Transfer initiated for patient in bed ${bedId}`;
        break;
      case 'clean':
        message = `Cleaning scheduled for bed ${bedId}`;
        break;
      case 'maintenance':
        message = `Maintenance scheduled for bed ${bedId}`;
        break;
      case 'activate':
        message = `Bed ${bedId} is now available`;
        break;
      default:
        message = `Action completed for bed ${bedId}`;
    }

    toast({
      title: "Bed Status Updated",
      description: message
    });
  };

  const occupiedBeds = beds.filter(bed => bed.status === 'occupied').length;
  const availableBeds = beds.filter(bed => bed.status === 'available').length;
  const maintenanceBeds = beds.filter(bed => bed.status === 'maintenance' || bed.status === 'cleaning').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Manage Beds - {wardName || 'Ward'}
          </DialogTitle>
          <DialogDescription>
            Monitor and manage bed allocation and availability
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{occupiedBeds}</div>
              <div className="text-sm text-red-600">Occupied</div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{availableBeds}</div>
              <div className="text-sm text-green-600">Available</div>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{maintenanceBeds}</div>
              <div className="text-sm text-yellow-600">Maintenance</div>
            </div>
          </div>

          {/* Bed Grid */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Bed Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {beds.map((bed) => (
                <div 
                  key={bed.id} 
                  className={`p-4 border rounded-lg ${selectedBed === bed.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedBed(bed.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getBedStatusIcon(bed.status)}
                      <span className="font-semibold">Bed {bed.id}</span>
                    </div>
                    <Badge className={getBedStatusColor(bed.status)}>
                      {bed.status.toUpperCase()}
                    </Badge>
                  </div>

                  {bed.patient && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{bed.patient}</span>
                        {bed.condition && (
                          <Badge className={getConditionColor(bed.condition)}>
                            {bed.condition}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Admitted: {bed.admissionDate}
                      </div>
                    </div>
                  )}

                  {bed.equipment.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm text-muted-foreground mb-1">Equipment:</div>
                      <div className="flex flex-wrap gap-1">
                        {bed.equipment.map((equipment, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {equipment}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    {bed.status === 'occupied' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBedAction(bed.id, 'discharge');
                          }}
                        >
                          Discharge
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBedAction(bed.id, 'transfer');
                          }}
                        >
                          Transfer
                        </Button>
                      </>
                    )}
                    {bed.status === 'available' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBedAction(bed.id, 'clean');
                        }}
                      >
                        Schedule Clean
                      </Button>
                    )}
                    {(bed.status === 'cleaning' || bed.status === 'maintenance') && (
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBedAction(bed.id, 'activate');
                        }}
                      >
                        Mark Available
                      </Button>
                    )}
                    {bed.status !== 'maintenance' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBedAction(bed.id, 'maintenance');
                        }}
                      >
                        Maintenance
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};