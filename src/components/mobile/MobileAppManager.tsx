import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Smartphone, 
  Download, 
  Upload,
  Wifi,
  Bluetooth,
  Camera,
  Fingerprint,
  Bell,
  MapPin,
  Battery,
  Signal,
  Settings,
  RefreshCw,
  Cloud,
  Shield
} from 'lucide-react';

const MobileAppManager = () => {
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [offlineMode, setOfflineMode] = useState(true);

  const mobileStats = [
    { label: 'Active Users', value: '2,847', trend: '+12%', icon: Smartphone },
    { label: 'App Version', value: '2.1.4', trend: 'Latest', icon: Download },
    { label: 'Sync Success', value: '99.2%', trend: '+0.3%', icon: RefreshCw },
    { label: 'Push Delivery', value: '94.8%', trend: '+2.1%', icon: Bell }
  ];

  const deviceMetrics = [
    { type: 'iOS', count: 1654, percentage: 58, color: 'bg-blue-500' },
    { type: 'Android', count: 1193, percentage: 42, color: 'bg-green-500' }
  ];

  const features = [
    {
      name: 'Offline Sync',
      description: 'Work offline and sync when connected',
      enabled: offlineMode,
      status: 'stable',
      icon: Cloud
    },
    {
      name: 'Biometric Authentication',
      description: 'Fingerprint and face recognition',
      enabled: biometricAuth,
      status: 'beta',
      icon: Fingerprint
    },
    {
      name: 'Push Notifications',
      description: 'Real-time appointment reminders',
      enabled: pushNotifications,
      status: 'stable',
      icon: Bell
    },
    {
      name: 'Location Services',
      description: 'Find nearby facilities',
      enabled: true,
      status: 'stable',
      icon: MapPin
    },
    {
      name: 'Camera Integration',
      description: 'Scan documents and QR codes',
      enabled: true,
      status: 'stable',
      icon: Camera
    },
    {
      name: 'Background Sync',
      description: 'Automatic data synchronization',
      enabled: syncEnabled,
      status: 'stable',
      icon: Wifi
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'stable': return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Stable</Badge>;
      case 'beta': return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Beta</Badge>;
      case 'experimental': return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">Experimental</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {mobileStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
                  <IconComponent className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-green-600">{stat.trend}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Device Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deviceMetrics.map((device, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{device.type}</span>
                      <span className="text-sm text-muted-foreground">{device.count} users</span>
                    </div>
                    <Progress value={device.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">{device.percentage}% of total users</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* App Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  App Health Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Mobile app is running smoothly. All systems operational.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Crash Rate</span>
                    <span className="text-sm font-medium text-green-600">0.12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Rating</span>
                    <span className="text-sm font-medium">4.7/5.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Battery Optimization</span>
                    <span className="text-sm font-medium text-green-600">Excellent</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Network Efficiency</span>
                    <span className="text-sm font-medium text-green-600">95%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Mobile Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5 text-primary" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{feature.name}</h3>
                              {getStatusBadge(feature.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={feature.enabled}
                          onCheckedChange={(checked) => {
                            switch (feature.name) {
                              case 'Offline Sync':
                                setOfflineMode(checked);
                                break;
                              case 'Biometric Authentication':
                                setBiometricAuth(checked);
                                break;
                              case 'Push Notifications':
                                setPushNotifications(checked);
                                break;
                              case 'Background Sync':
                                setSyncEnabled(checked);
                                break;
                            }
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Mobile App Deployment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Download className="h-4 w-4" />
                <AlertDescription>
                  <strong>Mobile Setup Instructions:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                    <li>Export project to GitHub and git pull to your local machine</li>
                    <li>Run <code className="bg-muted px-1 rounded">npm install</code> to install dependencies</li>
                    <li>Add platforms: <code className="bg-muted px-1 rounded">npx cap add ios</code> and/or <code className="bg-muted px-1 rounded">npx cap add android</code></li>
                    <li>Update platforms: <code className="bg-muted px-1 rounded">npx cap update ios/android</code></li>
                    <li>Build the project: <code className="bg-muted px-1 rounded">npm run build</code></li>
                    <li>Sync to platforms: <code className="bg-muted px-1 rounded">npx cap sync</code></li>
                    <li>Run on device: <code className="bg-muted px-1 rounded">npx cap run ios/android</code></li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">iOS Deployment</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Xcode Version</span>
                      <span className="text-sm font-medium">15.0+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">iOS Target</span>
                      <span className="text-sm font-medium">13.0+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Bundle ID</span>
                      <span className="text-sm font-medium text-xs">app.lovable.e2a0794f0e45452e9c694a66c1ac7678</span>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Build for iOS
                  </Button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Android Deployment</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Android Studio</span>
                      <span className="text-sm font-medium">Required</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Min SDK</span>
                      <span className="text-sm font-medium">22 (Android 5.1)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Target SDK</span>
                      <span className="text-sm font-medium">34</span>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Build for Android
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Signal className="h-5 w-5" />
                Mobile Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Daily Active Users</h4>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-sm text-green-600">+8.2% from yesterday</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Session Duration</h4>
                  <div className="text-2xl font-bold">12m 34s</div>
                  <p className="text-sm text-green-600">+15% from last week</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Retention Rate</h4>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-sm text-green-600">Above industry average</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Feature Usage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Appointment Booking</span>
                    <span className="text-sm font-medium">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Medical Records</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Prescription Tracking</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Mobile Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="appVersion">App Version</Label>
                  <Input id="appVersion" value="2.1.4" readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minVersion">Minimum Supported Version</Label>
                  <Input id="minVersion" defaultValue="2.0.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="updateMessage">Update Message</Label>
                  <Input id="updateMessage" placeholder="Please update to the latest version..." />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Force Update</p>
                    <p className="text-xs text-muted-foreground">Require users to update before using the app</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Maintenance Mode</p>
                    <p className="text-xs text-muted-foreground">Show maintenance message to mobile users</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
              </div>
              <Button>Save Configuration</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileAppManager;