import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissions, PERMISSIONS } from '@/hooks/usePermissions';
import { useDashboardStats } from '@/hooks/useDashboardData';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Bed, 
  Activity,
  TestTube,
  Pill,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Shield
} from 'lucide-react';
import { MobileOptimizedCard } from '@/components/mobile/MobileOptimizedCard';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

function StatCard({ title, value, description, icon: Icon, trend, badge }: StatCardProps) {
  return (
    <MobileOptimizedCard title={title} description={description} compact>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {badge && (
                <Badge variant={badge.variant} className="text-xs">
                  {badge.text}
                </Badge>
              )}
            </div>
            {trend && (
              <div className={`flex items-center text-sm ${
                trend.positive ? 'text-success' : 'text-destructive'
              }`}>
                <TrendingUp className={`h-3 w-3 mr-1 ${
                  !trend.positive ? 'rotate-180' : ''
                }`} />
                {trend.value}% {trend.label}
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileOptimizedCard>
  );
}

export function RoleBasedStats() {
  const { hasPermission } = usePermissions();
  const { data: stats, isLoading } = useDashboardStats();

  const visibleStats = useMemo(() => {
    const allStats = [
      {
        id: 'patients',
        permission: PERMISSIONS.PATIENTS_VIEW,
        title: 'Total Patients',
        value: stats?.totalPatients || 0,
        description: 'Active patient records',
        icon: Users,
        trend: { value: 12, label: 'vs last month', positive: true },
      },
      {
        id: 'appointments',
        permission: PERMISSIONS.APPOINTMENTS_VIEW,
        title: 'Appointments Today',
        value: stats?.todayAppointments || 0,
        description: 'Scheduled for today',
        icon: Calendar,
        badge: (stats?.todayAppointments || 0) > 10 ? 
          { text: 'High Volume', variant: 'destructive' as const } : 
          { text: 'Normal', variant: 'secondary' as const },
      },
      {
        id: 'revenue',
        permission: PERMISSIONS.FINANCIAL_VIEW,
        title: 'Daily Revenue',
        value: `$${stats?.todayRevenue?.toLocaleString() || '0'}`,
        description: 'Today\'s earnings',
        icon: DollarSign,
        trend: { value: 8, label: 'vs yesterday', positive: true },
      },
      {
        id: 'beds',
        permission: PERMISSIONS.PATIENTS_VIEW,
        title: 'Bed Occupancy',
        value: `${stats?.bedOccupancyRate || '0'}%`,
        description: 'Current occupancy rate',
        icon: Bed,
        badge: parseFloat(stats?.bedOccupancyRate || '0') > 85 ? 
          { text: 'Critical', variant: 'destructive' as const } : 
          { text: 'Normal', variant: 'secondary' as const },
      },
      {
        id: 'alerts',
        permission: PERMISSIONS.SYSTEM_SETTINGS,
        title: 'Active Alerts',
        value: stats?.activeAlerts || 0,
        description: 'Require attention',
        icon: AlertTriangle,
        badge: (stats?.activeAlerts || 0) > 0 ? 
          { text: 'Action Needed', variant: 'destructive' as const } : 
          { text: 'All Clear', variant: 'secondary' as const },
      },
      {
        id: 'staff',
        permission: PERMISSIONS.USER_MANAGEMENT,
        title: 'Staff Count',
        value: stats?.staffCount || 0,
        description: 'Total staff members',
        icon: UserCheck,
      },
    ];

    return allStats.filter(stat => hasPermission(stat.permission));
  }, [stats, hasPermission]);

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="healthcare-card p-6 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-6 w-16 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visibleStats.length === 0) {
    return (
      <MobileOptimizedCard
        title="Dashboard Stats"
        description="Statistics based on your permissions"
      >
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No statistics available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Contact your administrator for access to dashboard metrics
            </p>
          </div>
        </div>
      </MobileOptimizedCard>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {visibleStats.map((stat) => (
        <StatCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          trend={stat.trend}
          badge={stat.badge}
        />
      ))}
    </div>
  );
}