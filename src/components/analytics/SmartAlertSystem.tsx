import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Info, 
  Clock,
  X,
  Settings,
  Filter,
  Bell,
  BellOff,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useSmartAlerts } from '@/hooks/useSmartAlerts';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface SmartAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  category: 'appointments' | 'revenue' | 'patients' | 'system' | 'queue';
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  acknowledged: boolean;
  autoResolve?: boolean;
  threshold?: {
    metric: string;
    value: number;
    condition: 'above' | 'below' | 'equal';
  };
}

interface SmartAlertSystemProps {
  className?: string;
}

export function SmartAlertSystem({ className }: SmartAlertSystemProps) {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'unacknowledged'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const { 
    alerts, 
    acknowledgeAlert, 
    dismissAlert, 
    alertRules,
    updateAlertRule,
    isLoading 
  } = useSmartAlerts();

  // Filter alerts based on current filter
  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'critical':
        return alert.type === 'critical';
      case 'warning':
        return alert.type === 'warning';
      case 'unacknowledged':
        return !alert.acknowledged;
      default:
        return true;
    }
  });

  // Play sound for new critical alerts
  useEffect(() => {
    const criticalAlerts = alerts.filter(alert => 
      alert.type === 'critical' && !alert.acknowledged
    );
    
    if (criticalAlerts.length > 0 && soundEnabled) {
      // Would play alert sound here
      console.log('🚨 Critical alert sound');
    }
  }, [alerts, soundEnabled]);

  // Show toast for new alerts
  useEffect(() => {
    const newAlerts = alerts.filter(alert => 
      !alert.acknowledged && 
      new Date().getTime() - alert.timestamp.getTime() < 5000 // Last 5 seconds
    );
    
    newAlerts.forEach(alert => {
      if (alert.type === 'critical') {
        toast({
          title: "🚨 Critical Alert",
          description: alert.title,
          variant: "destructive",
        });
      }
    });
  }, [alerts, toast]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-destructive border-destructive/20 bg-destructive/5';
      case 'warning': return 'text-warning border-warning/20 bg-warning/5';
      case 'success': return 'text-success border-success/20 bg-success/5';
      default: return 'text-info border-info/20 bg-info/5';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appointments': return <Activity className="h-3 w-3" />;
      case 'revenue': return <DollarSign className="h-3 w-3" />;
      case 'patients': return <Users className="h-3 w-3" />;
      case 'queue': return <Clock className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      toast({
        title: "Alert Acknowledged",
        description: "Alert has been marked as acknowledged.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to acknowledge alert.",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = async (alertId: string) => {
    try {
      await dismissAlert(alertId);
      toast({
        title: "Alert Dismissed",
        description: "Alert has been dismissed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to dismiss alert.",
        variant: "destructive",
      });
    }
  };

  const criticalCount = alerts.filter(a => a.type === 'critical' && !a.acknowledged).length;
  const warningCount = alerts.filter(a => a.type === 'warning' && !a.acknowledged).length;

  return (
    <Card className={cn('healthcare-card', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle>Smart Alerts</CardTitle>
            </div>
            
            {(criticalCount > 0 || warningCount > 0) && (
              <div className="flex gap-2">
                {criticalCount > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    {criticalCount} Critical
                  </Badge>
                )}
                {warningCount > 0 && (
                  <Badge variant="outline" className="border-warning text-warning">
                    {warningCount} Warning
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex gap-1">
              {['all', 'critical', 'warning', 'unacknowledged'].map((filterType) => (
                <Button
                  key={filterType}
                  variant={filter === filterType ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(filterType as any)}
                  className="text-xs capitalize"
                >
                  {filterType === 'unacknowledged' ? 'New' : filterType}
                </Button>
              ))}
            </div>
            
            {/* Sound toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Button>
            
            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filter === 'all' ? 'No alerts' : `No ${filter} alerts`}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              All systems are operating normally
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'p-4 rounded-lg border transition-all duration-200',
                    getAlertColor(alert.type),
                    alert.acknowledged && 'opacity-60'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0 mt-0.5">
                        {getAlertIcon(alert.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(alert.category)}
                            <Badge variant="outline" className="text-xs capitalize">
                              {alert.category}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.message}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                          </div>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              'text-xs',
                              alert.priority === 'high' && 'border-destructive text-destructive',
                              alert.priority === 'medium' && 'border-warning text-warning'
                            )}
                          >
                            {alert.priority} priority
                          </Badge>
                          {alert.acknowledged && (
                            <Badge variant="outline" className="text-xs">
                              Acknowledged
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!alert.acknowledged && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                          className="text-xs"
                        >
                          Acknowledge
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismiss(alert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}