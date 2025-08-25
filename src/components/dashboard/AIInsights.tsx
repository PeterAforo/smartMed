import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAIInsights, useTakeActionOnInsight } from "@/hooks/useDashboardData";
import { toast } from "sonner";
import { 
  Brain, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Lightbulb,
  Target,
  BarChart3
} from "lucide-react";

function getInsightIcon(insightType: string) {
  switch (insightType) {
    case 'operational':
      return Target;
    case 'financial':
      return TrendingUp;
    case 'clinical':
      return AlertCircle;
    case 'predictive':
      return BarChart3;
    case 'recommendation':
      return Lightbulb;
    default:
      return Brain;
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'critical':
      return 'bg-destructive text-destructive-foreground';
    case 'high':
      return 'bg-orange-500 text-white';
    case 'medium':
      return 'bg-blue-500 text-white';
    case 'low':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export default function AIInsights() {
  const { data: insights, isLoading, error } = useAIInsights();
  const takeActionMutation = useTakeActionOnInsight();

  const handleTakeAction = async (insightId: string, title: string) => {
    try {
      await takeActionMutation.mutateAsync(insightId);
      toast.success(`Action taken on: ${title}`);
    } catch (error) {
      toast.error('Failed to take action. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Card className="healthcare-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Smart recommendations and predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
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
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Smart recommendations and predictions
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Failed to load AI insights</p>
        </CardContent>
      </Card>
    );
  }

  // Mock insights if no data (for demonstration)
  const mockInsights = insights?.length ? insights : [
    {
      id: '1',
      insight_type: 'operational',
      priority: 'high',
      title: 'Peak Hour Optimization',
      description: 'Analysis shows 60% of appointments occur between 9-11 AM. Consider redistributing slots to reduce wait times.',
      confidence_score: 0.89,
      is_actionable: true,
      action_taken: false,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      insight_type: 'financial',
      priority: 'medium',
      title: 'Revenue Opportunity',
      description: 'Bed utilization is at 75%. Increasing to 85% could generate an additional $15K monthly revenue.',
      confidence_score: 0.76,
      is_actionable: true,
      action_taken: false,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      insight_type: 'predictive',
      priority: 'low',
      title: 'Seasonal Trends',
      description: 'Historical data suggests 20% increase in respiratory cases expected in the next 4 weeks.',
      confidence_score: 0.82,
      is_actionable: false,
      action_taken: false,
      created_at: new Date().toISOString()
    }
  ];

  return (
    <Card className="healthcare-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI-Powered Insights
        </CardTitle>
        <CardDescription>
          Smart recommendations and predictions based on your data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockInsights.map((insight) => {
            const Icon = getInsightIcon(insight.insight_type);
            const priorityColor = getPriorityColor(insight.priority);
            
            return (
              <div key={insight.id} className="p-4 border rounded-lg bg-muted/20">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-foreground">{insight.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${priorityColor}`}>
                      {insight.priority}
                    </Badge>
                    {insight.confidence_score && (
                      <Badge variant="outline" className="text-xs">
                        {Math.round(insight.confidence_score * 100)}% confidence
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {insight.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {insight.insight_type}
                    </Badge>
                    {insight.is_actionable && (
                      <Badge variant="secondary" className="text-xs">
                        Actionable
                      </Badge>
                    )}
                    {insight.action_taken ? (
                      <div className="flex items-center gap-1 text-xs text-success">
                        <CheckCircle className="h-3 w-3" />
                        Action taken
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Pending
                      </div>
                    )}
                  </div>
                  
                  {insight.is_actionable && !insight.action_taken && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => handleTakeAction(insight.id, insight.title)}
                      disabled={takeActionMutation.isPending}
                    >
                      {takeActionMutation.isPending ? 'Taking Action...' : 'Take Action'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          
          {mockInsights.length === 0 && (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No insights available</p>
              <p className="text-sm text-muted-foreground mt-2">
                AI insights will appear as data becomes available
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}