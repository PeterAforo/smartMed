import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Users, Eye, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ViewAllRegistrationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewAllRegistrationsDialog = ({ open, onOpenChange }: ViewAllRegistrationsDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch all patients from API
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: () => api.getPatients({ limit: 100 }),
    enabled: open
  });

  // Transform patients to registration format
  const allRegistrations = patients.map((p: any) => ({
    id: p.id,
    name: `${p.first_name} ${p.last_name}`,
    time: new Date(p.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    status: 'completed',
    patientId: p.patient_number,
    phone: p.phone || 'N/A',
    insurance: p.insurance_info?.provider || 'Cash'
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRegistrations = allRegistrations.filter(reg => {
    const matchesSearch = reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Patient Registrations
          </DialogTitle>
          <DialogDescription>
            View and manage all patient registrations for today
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, patient ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <Separator />

          {/* Registration List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredRegistrations.length > 0 ? (
              filteredRegistrations.map((reg) => (
                <div key={reg.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{reg.name}</h4>
                      <Badge variant="outline" className="font-mono text-xs">{reg.patientId}</Badge>
                      <Badge className={getStatusColor(reg.status)}>
                        {reg.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Time: {reg.time}</span>
                      <span>Phone: {reg.phone}</span>
                      <span>Insurance: {reg.insurance}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    {reg.status === 'pending' && (
                      <Button size="sm">
                        Complete Registration
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No registrations found matching your criteria</p>
              </div>
            )}
          </div>

          {/* Summary */}
          <Separator />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Total registrations: {allRegistrations.length}</span>
            <span>Showing: {filteredRegistrations.length} results</span>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};