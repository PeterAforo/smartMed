import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Wifi, 
  Battery, 
  Signal,
  Download,
  Star,
  Users,
  BarChart3,
  Zap,
  Shield,
  Globe,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  Heart,
  Calendar,
  Bell,
  MessageSquare,
  Camera,
  Fingerprint
} from 'lucide-react';

interface MobileAppDashboardProps {
  className?: string;
}

const MobileAppDashboard = ({ className }: MobileAppDashboardProps) => {
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  
  const appMetrics = {
    totalDownloads: '45,231',
    activeUsers: '32,847',
    appRating: 4.8,
    totalRatings: 1247,
    crashRate: '0.02%',
    avgSessionTime: '8m 32s',
    retentionRate: '78%',
    updateAdoption: '94%'
  };

  const deviceStats = [
    { device: 'iOS', users: 18423, percentage: 56, icon: Smartphone },
    { device: 'Android', users: 14424, percentage: 44, icon: Smartphone },
    { device: 'Tablet', users: 3247, percentage: 15, icon: Tablet },
    { device: 'Web App', users: 8934, percentage: 35, icon: Monitor }
  ];

  const featureUsage = [
    { feature: 'Appointment Booking', usage: 89, color: 'bg-blue-500' },
    { feature: 'Medical Records', usage: 76, color: 'bg-green-500' },
    { feature: 'Prescription Management', usage: 72, color: 'bg-purple-500' },
    { feature: 'Lab Results', usage: 68, color: 'bg-orange-500' },
    { feature: 'Messaging', usage: 54, color: 'bg-pink-500' },
    { feature: 'Vital Signs Tracking', usage: 45, color: 'bg-indigo-500' }
  ];

  const appFeatures = [
    {
      category: 'Patient Features',
      features: [
        { name: 'Appointment Booking', description: 'Schedule and manage appointments', status: 'live' },
        { name: 'Medical Records Access', description: 'View and download medical documents', status: 'live' },
        { name: 'Prescription Management', description: 'Track medications and request refills', status: 'live' },
        { name: 'Lab Results', description: 'View test results and trends', status: 'live' },
        { name: 'Secure Messaging', description: 'Communicate with healthcare providers', status: 'live' },
        { name: 'Bill Payment', description: 'View and pay medical bills', status: 'beta' }
      ]
    },
    {
      category: 'Health Tracking',
      features: [
        { name: 'Vital Signs Logging', description: 'Record blood pressure, weight, etc.', status: 'live' },
        { name: 'Medication Reminders', description: 'Never miss a dose', status: 'live' },
        { name: 'Symptom Tracker', description: 'Log symptoms and share with doctors', status: 'beta' },
        { name: 'Health Goals', description: 'Set and track health objectives', status: 'development' },
        { name: 'Wearable Integration', description: 'Sync with fitness trackers', status: 'development' }
      ]
    },
    {
      category: 'Security Features',
      features: [
        { name: 'Biometric Authentication', description: 'Fingerprint and face recognition', status: 'live' },
        { name: 'Two-Factor Authentication', description: 'Enhanced account security', status: 'live' },
        { name: 'Data Encryption', description: 'End-to-end encrypted communications', status: 'live' },
        { name: 'Session Management', description: 'Automatic logout for security', status: 'live' },
        { name: 'Privacy Controls', description: 'Granular data sharing permissions', status: 'beta' }
      ]
    }
  ];

  const recentUpdates = [
    {
      version: '2.4.1',
      date: '2024-01-20',
      type: 'Bug Fix',
      description: 'Fixed appointment booking timezone issues',
      downloads: '89%'
    },
    {
      version: '2.4.0',
      date: '2024-01-15',
      type: 'Feature',
      description: 'Added medication reminder push notifications',
      downloads: '94%'
    },
    {
      version: '2.3.2',
      date: '2024-01-10',
      type: 'Security',
      description: 'Enhanced biometric authentication security',
      downloads: '97%'
    },
    {
      version: '2.3.1',
      date: '2024-01-05',
      type: 'Performance',
      description: 'Improved app startup time by 40%',
      downloads: '98%'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge variant="default">Live</Badge>;
      case 'beta':
        return <Badge variant="secondary">Beta</Badge>;
      case 'development':
        return <Badge variant="outline">Development</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUpdateTypeBadge = (type: string) => {
    switch (type) {
      case 'Feature':
        return <Badge variant="default">Feature</Badge>;
      case 'Bug Fix':
        return <Badge variant="secondary">Bug Fix</Badge>;
      case 'Security':
        return <Badge variant="destructive">Security</Badge>;
      case 'Performance':
        return <Badge className="bg-purple-500">Performance</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className={`space-y-6 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Mobile App Dashboard</h2>
          <p className="text-muted-foreground">Patient mobile application analytics and management</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            App Store
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Google Play
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Downloads</p>
                <p className="text-2xl font-bold">{appMetrics.totalDownloads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{appMetrics.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">App Rating</p>
                <p className="text-2xl font-bold">{appMetrics.appRating}/5</p>
                <p className="text-xs text-muted-foreground">{appMetrics.totalRatings} ratings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Retention Rate</p>
                <p className="text-2xl font-bold">{appMetrics.retentionRate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="preview">App Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="h-5 w-5 mr-2" />
                  Device Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deviceStats.map((device, index) => {
                    const IconComponent = device.icon;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{device.device}</p>
                            <p className="text-sm text-muted-foreground">{device.users.toLocaleString()} users</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{device.percentage}%</p>
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-blue-500 rounded-full" 
                              style={{ width: `${device.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Feature Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Feature Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featureUsage.map((feature, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{feature.feature}</span>
                        <span className="text-sm text-muted-foreground">{feature.usage}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-2 ${feature.color} rounded-full transition-all duration-300`}
                          style={{ width: `${feature.usage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-sm text-muted-foreground">Avg Session Time</p>
                  <p className="text-xl font-bold">{appMetrics.avgSessionTime}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm text-muted-foreground">Crash Rate</p>
                  <p className="text-xl font-bold">{appMetrics.crashRate}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm text-muted-foreground">Update Adoption</p>
                  <p className="text-xl font-bold">{appMetrics.updateAdoption}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-sm text-muted-foreground">User Growth</p>
                  <p className="text-xl font-bold">+12%</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="space-y-6">
            {appFeatures.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {category.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{feature.name}</h4>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(feature.status)}
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Interactive analytics charts would appear here</p>
                  <p className="text-sm">Daily active users, session duration, feature adoption</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>World map visualization would appear here</p>
                  <p className="text-sm">User distribution by country and region</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="updates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>App Version History</CardTitle>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Push New Update
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUpdates.map((update, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Download className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">Version {update.version}</h4>
                          {getUpdateTypeBadge(update.type)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{update.description}</p>
                        <p className="text-xs text-muted-foreground">{update.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{update.downloads}</p>
                      <p className="text-sm text-muted-foreground">adoption</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>App Preview</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant={selectedDevice === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDevice('mobile')}
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Mobile
                  </Button>
                  <Button 
                    variant={selectedDevice === 'tablet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDevice('tablet')}
                  >
                    <Tablet className="h-4 w-4 mr-2" />
                    Tablet
                  </Button>
                  <Button 
                    variant={selectedDevice === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDevice('desktop')}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Desktop
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className={`
                  ${selectedDevice === 'mobile' ? 'w-80 h-[600px]' : 
                    selectedDevice === 'tablet' ? 'w-96 h-[500px]' : 
                    'w-full h-[400px]'}
                  border-2 border-gray-300 rounded-lg bg-gray-100 flex items-center justify-center
                `}>
                  <div className="text-center text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>App preview for {selectedDevice}</p>
                    <p className="text-sm">Interactive app mockup would appear here</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileAppDashboard;