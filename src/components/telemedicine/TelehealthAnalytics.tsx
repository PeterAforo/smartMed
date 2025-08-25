import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Clock, Star, Wifi, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const TelehealthAnalytics = () => {
  const { toast } = useToast();

  // Mock analytics data
  const analyticsData = {
    weeklyStats: {
      totalSessions: 142,
      change: '+12%',
      trend: 'up'
    },
    monthlyStats: {
      uniquePatients: 89,
      change: '+8%',
      trend: 'up'
    },
    averageSession: {
      duration: 23.5,
      change: '-2min',
      trend: 'down'
    },
    satisfaction: {
      rating: 4.7,
      change: '+0.3',
      trend: 'up'
    },
    platformUsage: [
      { platform: 'Video Calls', sessions: 128, percentage: 90 },
      { platform: 'Phone Calls', sessions: 14, percentage: 10 }
    ],
    sessionQuality: [
      { quality: 'Excellent', count: 98, percentage: 69 },
      { quality: 'Good', count: 32, percentage: 23 },
      { quality: 'Fair', count: 10, percentage: 7 },
      { quality: 'Poor', count: 2, percentage: 1 }
    ],
    peakHours: [
      { time: '9:00 AM', sessions: 18 },
      { time: '10:00 AM', sessions: 22 },
      { time: '11:00 AM', sessions: 15 },
      { time: '2:00 PM', sessions: 25 },
      { time: '3:00 PM', sessions: 20 },
      { time: '4:00 PM', sessions: 17 }
    ]
  };

  const handleGenerateReport = (reportType: string) => {
    toast({
      title: "Generating Report",
      description: `${reportType} report is being generated and will be available for download shortly.`,
    });
  };

  const handleViewReport = (reportType: string) => {
    toast({
      title: "Opening Report",
      description: `${reportType} report is now available for viewing.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Sessions</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.weeklyStats.totalSessions}</div>
            <p className="text-xs text-green-600">
              {analyticsData.weeklyStats.change} from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.monthlyStats.uniquePatients}</div>
            <p className="text-xs text-blue-600">
              {analyticsData.monthlyStats.change} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageSession.duration}min</div>
            <p className="text-xs text-orange-600">
              {analyticsData.averageSession.change} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.satisfaction.rating}/5</div>
            <p className="text-xs text-green-600">
              {analyticsData.satisfaction.change} this quarter
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Platform Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Usage</CardTitle>
            <CardDescription>Distribution of session types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.platformUsage.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.platform}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{item.sessions}</span>
                    <Badge variant="outline">{item.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Session Quality */}
        <Card>
          <CardHeader>
            <CardTitle>Session Quality</CardTitle>
            <CardDescription>Quality distribution of completed sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.sessionQuality.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      item.quality === 'Excellent' ? 'bg-green-500' :
                      item.quality === 'Good' ? 'bg-blue-500' :
                      item.quality === 'Fair' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium">{item.quality}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                    <Badge variant="outline">{item.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Session Hours</CardTitle>
          <CardDescription>Most active times for telemedicine sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {analyticsData.peakHours.map((hour, index) => (
              <div key={index} className="text-center p-3 border rounded-lg">
                <div className="text-sm font-medium">{hour.time}</div>
                <div className="text-lg font-bold text-blue-600">{hour.sessions}</div>
                <div className="text-xs text-muted-foreground">sessions</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Reports</CardTitle>
          <CardDescription>Generate and access detailed telemedicine reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Session Analytics</h4>
              <p className="text-sm text-muted-foreground">Detailed session performance and usage metrics</p>
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => handleGenerateReport('Session Analytics')}>
                  <Download className="mr-2 h-4 w-4" />
                  Generate
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleViewReport('Session Analytics')}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Patient Satisfaction</h4>
              <p className="text-sm text-muted-foreground">Patient feedback and satisfaction scores</p>
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => handleGenerateReport('Patient Satisfaction')}>
                  <Download className="mr-2 h-4 w-4" />
                  Generate
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleViewReport('Patient Satisfaction')}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Technical Performance</h4>
              <p className="text-sm text-muted-foreground">Platform performance and technical metrics</p>
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => handleGenerateReport('Technical Performance')}>
                  <Download className="mr-2 h-4 w-4" />
                  Generate
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleViewReport('Technical Performance')}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};