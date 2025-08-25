import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Bed, Activity, Heart, Calendar, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/hooks/useDashboardData";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
  description?: string;
}

function StatCard({ title, value, change, trend, icon: Icon, description }: StatCardProps) {
  return (
    <Card className="healthcare-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center gap-1 text-xs">
          {trend === 'up' ? (
            <TrendingUp className="h-3 w-3 text-success" />
          ) : (
            <TrendingDown className="h-3 w-3 text-destructive" />
          )}
          <span className={`font-medium ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
            {change}
          </span>
          <span className="text-muted-foreground">
            {description || 'from last month'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardStats() {
  const { currentBranch, hasCrossBranchAccess, tenant } = useAuth();
  const { data: statsData, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Branch Context Header Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-5 w-32" />
        </div>
        
        {/* Stats Grid Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="healthcare-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <div className="flex items-center gap-1">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="healthcare-card border-destructive">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">Failed to load dashboard statistics</p>
            <p className="text-sm text-muted-foreground mt-2">Please try refreshing the page</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Patients",
      value: statsData?.totalPatients?.toLocaleString() || "0",
      change: "+12.5%",
      trend: 'up' as const,
      icon: Users,
      description: "active patients"
    },
    {
      title: "Active Beds",
      value: statsData?.activeBeds || "0/0",
      change: `${statsData?.bedOccupancyRate || 0}%`,
      trend: Number(statsData?.bedOccupancyRate || 0) > 80 ? 'up' : 'down',
      icon: Bed,
      description: "occupancy rate"
    },
    {
      title: "Today's Appointments",
      value: statsData?.todayAppointments?.toString() || "0",
      change: "+5.2%",
      trend: 'up' as const,
      icon: Calendar,
      description: "scheduled today"
    },
    {
      title: "Active Alerts",
      value: statsData?.activeAlerts?.toString() || "0",
      change: "-25%",
      trend: 'down' as const,
      icon: AlertTriangle,
      description: "need attention"
    },
    {
      title: "Staff Count",
      value: statsData?.staffCount?.toString() || "0",
      change: "+2.3%",
      trend: 'up' as const,
      icon: Heart,
      description: "total staff"
    },
    {
      title: "Today's Revenue", 
      value: `$${statsData?.todayRevenue?.toLocaleString() || "0"}`,
      change: "+18.2%",
      trend: 'up' as const,
      icon: Activity,
      description: "collected today"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Branch Context Header */}
      {currentBranch && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">
              {hasCrossBranchAccess ? `${tenant?.name} - All Branches` : `${currentBranch.name}`}
            </h3>
            {!hasCrossBranchAccess && (
              <Badge variant="outline" className="text-xs">
                Branch Specific
              </Badge>
            )}
          </div>
          {hasCrossBranchAccess && (
            <Badge variant="secondary" className="text-xs">
              Cross-Branch Access
            </Badge>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
            description={stat.description}
          />
        ))}
      </div>
    </div>
  );
}