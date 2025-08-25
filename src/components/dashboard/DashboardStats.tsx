import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Bed, Activity, Heart, Calendar, AlertTriangle } from "lucide-react";

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
  const stats = [
    {
      title: "Total Patients",
      value: "2,847",
      change: "+12.5%",
      trend: 'up' as const,
      icon: Users,
      description: "this month"
    },
    {
      title: "Active Beds",
      value: "187/250",
      change: "+5.2%",
      trend: 'up' as const,
      icon: Bed,
      description: "occupancy rate"
    },
    {
      title: "Daily Appointments",
      value: "156",
      change: "-3.1%",
      trend: 'down' as const,
      icon: Calendar,
      description: "today"
    },
    {
      title: "Critical Alerts",
      value: "8",
      change: "-25%",
      trend: 'down' as const,
      icon: AlertTriangle,
      description: "active alerts"
    },
    {
      title: "Staff on Duty",
      value: "89",
      change: "+2.3%",
      trend: 'up' as const,
      icon: Heart,
      description: "current shift"
    },
    {
      title: "Revenue Today",
      value: "$28,450",
      change: "+18.2%",
      trend: 'up' as const,
      icon: Activity,
      description: "vs yesterday"
    }
  ];

  return (
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
  );
}