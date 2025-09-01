import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Activity, 
  Users, 
  DollarSign, 
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { LiveMetricsGrid } from './LiveMetricsGrid';
import { RealTimeChart } from './RealTimeChart';
import { SmartAlertSystem } from './SmartAlertSystem';
import { LiveOperationalMonitor } from './LiveOperationalMonitor';
import { useLiveAnalytics } from '@/hooks/useLiveAnalytics';
import { cn } from '@/lib/utils';

interface LiveAnalyticsDashboardProps {
  className?: string;
}

export function LiveAnalyticsDashboard({ className }: LiveAnalyticsDashboardProps) {
  const [isLive, setIsLive] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const { 
    liveMetrics, 
    realtimeData, 
    connectionStatus,
    toggleLiveUpdates,
    refreshData 
  } = useLiveAnalytics({
    enabled: isLive,
    interval: refreshInterval
  });

  useEffect(() => {
    if (realtimeData) {
      setLastUpdated(new Date());
    }
  }, [realtimeData]);

  const handleToggleLive = () => {
    setIsLive(!isLive);
    toggleLiveUpdates(!isLive);
  };

  const handleRefresh = () => {
    refreshData();
    setLastUpdated(new Date());
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-success';
      case 'connecting': return 'text-warning';
      case 'disconnected': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const refreshIntervals = [
    { label: '1s', value: 1000 },
    { label: '5s', value: 5000 },
    { label: '10s', value: 10000 },
    { label: '30s', value: 30000 },
    { label: '1m', value: 60000 }
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Live Dashboard Header */}
      <Card className="healthcare-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Activity className={cn('h-5 w-5', getConnectionStatusColor())} />
                <CardTitle className="text-xl">Live Analytics Dashboard</CardTitle>
              </div>
              <Badge 
                variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {connectionStatus}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Refresh Interval Selector */}
              <div className="flex items-center gap-2">
                <Label htmlFor="refresh-interval" className="text-sm">Refresh:</Label>
                <div className="flex gap-1">
                  {refreshIntervals.map((interval) => (
                    <Button
                      key={interval.value}
                      variant={refreshInterval === interval.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRefreshInterval(interval.value)}
                      className="text-xs px-2"
                    >
                      {interval.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Live Toggle */}
              <div className="flex items-center gap-2">
                <Label htmlFor="live-mode" className="text-sm">Live:</Label>
                <Switch
                  id="live-mode"
                  checked={isLive}
                  onCheckedChange={handleToggleLive}
                />
                {isLive ? (
                  <Play className="h-4 w-4 text-success" />
                ) : (
                  <Pause className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Manual Refresh */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            {isLive && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                Real-time updates active
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Smart Alerts System */}
      <SmartAlertSystem />

      {/* Live Metrics Grid */}
      <LiveMetricsGrid 
        metrics={liveMetrics} 
        isLive={isLive}
        lastUpdated={lastUpdated}
      />

      {/* Real-time Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RealTimeChart
          title="Live Appointments"
          data={realtimeData?.appointments || []}
          dataKey="count"
          color="hsl(var(--primary))"
          isLive={isLive}
          icon={Calendar}
        />
        
        <RealTimeChart
          title="Live Revenue"
          data={realtimeData?.revenue || []}
          dataKey="amount"
          color="hsl(var(--success))"
          isLive={isLive}
          icon={DollarSign}
          formatter={(value) => `₵${value.toLocaleString()}`}
        />
      </div>

      {/* Live Operational Monitor */}
      <LiveOperationalMonitor isLive={isLive} />

      {/* Live Patient Flow */}
      <Card className="healthcare-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Live Patient Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RealTimeChart
            title="Patient Activity"
            data={realtimeData?.patientFlow || []}
            dataKey="patients"
            type="area"
            color="hsl(var(--secondary))"
            isLive={isLive}
            showAnimation={true}
            height={300}
          />
        </CardContent>
      </Card>
    </div>
  );
}