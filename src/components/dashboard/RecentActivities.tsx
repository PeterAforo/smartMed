import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRealtimeActivities } from "@/hooks/useRealtime";
import { 
  User, 
  Calendar, 
  Bed, 
  AlertTriangle, 
  DollarSign, 
  LogIn, 
  LogOut,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function getActivityIcon(activityType: string) {
  switch (activityType) {
    case 'patient_created':
      return User;
    case 'appointment_scheduled':
    case 'appointment_completed':
      return Calendar;
    case 'bed_assigned':
    case 'bed_released':
      return Bed;
    case 'alert_created':
    case 'alert_resolved':
      return AlertTriangle;
    case 'revenue_recorded':
      return DollarSign;
    case 'user_login':
      return LogIn;
    case 'user_logout':
      return LogOut;
    default:
      return Clock;
  }
}

function getActivityColor(activityType: string) {
  switch (activityType) {
    case 'patient_created':
      return 'bg-blue-500/10 text-blue-500';
    case 'appointment_scheduled':
      return 'bg-green-500/10 text-green-500';
    case 'appointment_completed':
      return 'bg-emerald-500/10 text-emerald-500';
    case 'bed_assigned':
      return 'bg-orange-500/10 text-orange-500';
    case 'bed_released':
      return 'bg-cyan-500/10 text-cyan-500';
    case 'alert_created':
      return 'bg-red-500/10 text-red-500';
    case 'alert_resolved':
      return 'bg-green-500/10 text-green-500';
    case 'revenue_recorded':
      return 'bg-purple-500/10 text-purple-500';
    case 'user_login':
      return 'bg-indigo-500/10 text-indigo-500';
    case 'user_logout':
      return 'bg-gray-500/10 text-gray-500';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export default function RecentActivities() {
  const { data: activities, loading: isLoading } = useRealtimeActivities();
  const error = null; // Real-time hook handles errors internally

  if (isLoading) {
    return (
      <Card className="healthcare-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system activities and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="healthcare-card border-destructive">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system activities and updates</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Failed to load recent activities</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="healthcare-card">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest system activities and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities && activities.length > 0 ? (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.activity_type);
              const colorClass = getActivityColor(activity.activity_type);
              
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {activity.activity_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activities</p>
              <p className="text-sm text-muted-foreground mt-2">
                Activities will appear here as they occur
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}