import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bed,
  Users,
  Wrench,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  UserCheck,
  Calendar,
  Stethoscope,
  Shield,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { useLiveOperationalData } from '@/hooks/useLiveOperationalData';
import { cn } from '@/lib/utils';

interface LiveOperationalMonitorProps {
  isLive: boolean;
  className?: string;
}

export function LiveOperationalMonitor({ isLive, className }: LiveOperationalMonitorProps) {
  const [activeTab, setActiveTab] = useState('beds');
  
  const { 
    beds, 
    staff, 
    equipment, 
    queue,
    isLoading,
    lastUpdated,
    refreshData 
  } = useLiveOperationalData({ enabled: isLive });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
      case 'online':
      case 'operational':
        return 'text-success';
      case 'occupied':
      case 'busy':
      case 'maintenance':
        return 'text-warning';
      case 'out_of_order':
      case 'offline':
      case 'critical':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
      case 'online':
      case 'operational':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'occupied':
      case 'busy':
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4" />;
      case 'out_of_order':
      case 'offline':
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const bedsStats = {
    total: beds.length,
    available: beds.filter(b => b.status === 'available').length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    maintenance: beds.filter(b => b.status === 'maintenance').length,
    occupancyRate: beds.length > 0 ? (beds.filter(b => b.status === 'occupied').length / beds.length) * 100 : 0
  };

  const staffStats = {
    total: staff.length,
    online: staff.filter(s => s.status === 'online').length,
    busy: staff.filter(s => s.status === 'busy').length,
    offline: staff.filter(s => s.status === 'offline').length,
    availabilityRate: staff.length > 0 ? (staff.filter(s => s.status === 'online').length / staff.length) * 100 : 0
  };

  const equipmentStats = {
    total: equipment.length,
    operational: equipment.filter(e => e.status === 'operational').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    outOfOrder: equipment.filter(e => e.status === 'out_of_order').length,
    operationalRate: equipment.length > 0 ? (equipment.filter(e => e.status === 'operational').length / equipment.length) * 100 : 0
  };

  return (
    <Card className={cn('healthcare-card', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Live Operations Monitor</CardTitle>
            {isLive && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">Live</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Updated: {lastUpdated?.toLocaleTimeString() || 'Never'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="beds" className="flex items-center gap-2">
              <Bed className="h-4 w-4" />
              <span className="hidden sm:inline">Beds</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Staff</span>
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Equipment</span>
            </TabsTrigger>
            <TabsTrigger value="queue" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Queue</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="beds" className="space-y-4">
            {/* Bed Statistics */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{bedsStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Beds</div>
              </div>
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">{bedsStats.available}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
              <div className="text-center p-3 bg-warning/10 rounded-lg">
                <div className="text-2xl font-bold text-warning">{bedsStats.occupied}</div>
                <div className="text-sm text-muted-foreground">Occupied</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{bedsStats.occupancyRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Occupancy</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Bed Occupancy Rate</span>
                <span>{bedsStats.occupancyRate.toFixed(1)}%</span>
              </div>
              <Progress value={bedsStats.occupancyRate} className="h-2" />
            </div>

            {/* Bed List */}
            <div className="grid gap-2 max-h-[300px] overflow-y-auto">
              {beds.map((bed) => (
                <div key={bed.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-1 rounded', getStatusColor(bed.status))}>
                      {getStatusIcon(bed.status)}
                    </div>
                    <div>
                      <div className="font-medium">{bed.room_number ? `Room ${bed.room_number}` : 'No Room'} - Bed {bed.bed_number}</div>
                      <div className="text-sm text-muted-foreground">{bed.bed_type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={cn('mb-1', getStatusColor(bed.status))}>
                      {bed.status}
                    </Badge>
                    {bed.patient_name && (
                      <div className="text-xs text-muted-foreground">{bed.patient_name}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            {/* Staff Statistics */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{staffStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Staff</div>
              </div>
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">{staffStats.online}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
              <div className="text-center p-3 bg-warning/10 rounded-lg">
                <div className="text-2xl font-bold text-warning">{staffStats.busy}</div>
                <div className="text-sm text-muted-foreground">Busy</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{staffStats.availabilityRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Staff Availability Rate</span>
                <span>{staffStats.availabilityRate.toFixed(1)}%</span>
              </div>
              <Progress value={staffStats.availabilityRate} className="h-2" />
            </div>

            {/* Staff List */}
            <div className="grid gap-2 max-h-[300px] overflow-y-auto">
              {staff.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-1 rounded', getStatusColor(member.status))}>
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{member.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={cn('mb-1', getStatusColor(member.status))}>
                      {member.status}
                    </Badge>
                    {member.current_location && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {member.current_location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            {/* Equipment Statistics */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{equipmentStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Equipment</div>
              </div>
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">{equipmentStats.operational}</div>
                <div className="text-sm text-muted-foreground">Operational</div>
              </div>
              <div className="text-center p-3 bg-warning/10 rounded-lg">
                <div className="text-2xl font-bold text-warning">{equipmentStats.maintenance}</div>
                <div className="text-sm text-muted-foreground">Maintenance</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{equipmentStats.operationalRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Operational</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Equipment Operational Rate</span>
                <span>{equipmentStats.operationalRate.toFixed(1)}%</span>
              </div>
              <Progress value={equipmentStats.operationalRate} className="h-2" />
            </div>

            {/* Equipment List */}
            <div className="grid gap-2 max-h-[300px] overflow-y-auto">
              {equipment.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-1 rounded', getStatusColor(item.status))}>
                      {getStatusIcon(item.status)}
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.equipment_code}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={cn('mb-1', getStatusColor(item.status))}>
                      {item.status}
                    </Badge>
                    {item.location && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="queue" className="space-y-4">
            {/* Queue Statistics */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{queue.length}</div>
                <div className="text-sm text-muted-foreground">In Queue</div>
              </div>
              <div className="text-center p-3 bg-warning/10 rounded-lg">
                <div className="text-2xl font-bold text-warning">
                  {queue.length > 0 ? Math.round(queue.reduce((sum, q) => sum + (q.wait_time_minutes || 0), 0) / queue.length) : 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg Wait (min)</div>
              </div>
              <div className="text-center p-3 bg-info/10 rounded-lg">
                <div className="text-2xl font-bold text-info">
                  {Math.max(...queue.map(q => q.wait_time_minutes || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Max Wait (min)</div>
              </div>
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">
                  {queue.filter(q => q.status === 'called').length}
                </div>
                <div className="text-sm text-muted-foreground">Being Served</div>
              </div>
            </div>

            {/* Queue List */}
            <div className="grid gap-2 max-h-[300px] overflow-y-auto">
              {queue.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                      {item.queue_position}
                    </div>
                    <div>
                      <div className="font-medium">{item.patient_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.appointment_type} • {item.check_in_time ? 
                          `Checked in ${new Date(item.check_in_time).toLocaleTimeString()}` : 
                          'Not checked in'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={cn('mb-1', getStatusColor(item.status))}>
                      {item.status}
                    </Badge>
                    {item.wait_time_minutes && (
                      <div className="text-xs text-muted-foreground">
                        {item.wait_time_minutes} min wait
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}