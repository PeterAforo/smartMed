import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  Wifi, 
  Download, 
  Upload,
  Clock,
  Zap,
  Activity,
  BarChart3,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  target: number;
  description: string;
  trend: 'up' | 'down' | 'stable';
}

interface DeviceMetrics {
  device: 'mobile' | 'tablet' | 'desktop';
  users: number;
  loadTime: number;
  bounceRate: number;
  performance: number;
}

const performanceMetrics: PerformanceMetric[] = [
  {
    id: 'fcp',
    name: 'First Contentful Paint',
    value: 1.2,
    unit: 's',
    status: 'good',
    target: 1.8,
    description: 'Time until first content appears',
    trend: 'down'
  },
  {
    id: 'lcp',
    name: 'Largest Contentful Paint',
    value: 2.1,
    unit: 's',
    status: 'good',
    target: 2.5,
    description: 'Time until largest content element loads',
    trend: 'stable'
  },
  {
    id: 'fid',
    name: 'First Input Delay',
    value: 45,
    unit: 'ms',
    status: 'warning',
    target: 100,
    description: 'Time until page responds to user input',
    trend: 'up'
  },
  {
    id: 'cls',
    name: 'Cumulative Layout Shift',
    value: 0.08,
    unit: '',
    status: 'good',
    target: 0.1,
    description: 'Visual stability of page elements',
    trend: 'down'
  },
  {
    id: 'ttfb',
    name: 'Time to First Byte',
    value: 320,
    unit: 'ms',
    status: 'good',
    target: 600,
    description: 'Server response time',
    trend: 'stable'
  },
  {
    id: 'bundle',
    name: 'Bundle Size',
    value: 1.2,
    unit: 'MB',
    status: 'warning',
    target: 1.0,
    description: 'Total JavaScript bundle size',
    trend: 'up'
  }
];

const deviceMetrics: DeviceMetrics[] = [
  {
    device: 'mobile',
    users: 65,
    loadTime: 2.8,
    bounceRate: 25,
    performance: 78
  },
  {
    device: 'tablet',
    users: 20,
    loadTime: 2.1,
    bounceRate: 18,
    performance: 85
  },
  {
    device: 'desktop',
    users: 15,
    loadTime: 1.6,
    bounceRate: 12,
    performance: 92
  }
];

export function PerformanceMonitor() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const { toast } = useToast();

  const runOptimization = async () => {
    setIsOptimizing(true);
    toast({
      title: "Performance Optimization",
      description: "Running automatic performance optimizations...",
    });

    // Simulate optimization process
    setTimeout(() => {
      setIsOptimizing(false);
      toast({
        title: "Optimization Complete",
        description: "Performance improvements have been applied",
      });
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-green-500 rotate-180" />;
      case 'stable': return <Activity className="h-3 w-3 text-blue-500" />;
      default: return null;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      case 'desktop': return Monitor;
      default: return Monitor;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Performance Monitor
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Real-time performance monitoring and optimization for all devices
          </p>
        </div>
        <Button 
          onClick={runOptimization} 
          disabled={isOptimizing}
          className="flex items-center gap-2"
        >
          {isOptimizing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          {isOptimizing ? 'Optimizing...' : 'Optimize Performance'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Overall Performance Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">84</div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>
              <Progress value={84} className="h-2" />
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium text-green-600">92</div>
                  <div className="text-muted-foreground">Desktop</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-yellow-600">85</div>
                  <div className="text-muted-foreground">Tablet</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-orange-600">78</div>
                  <div className="text-muted-foreground">Mobile</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Real-time Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Avg Load Time</span>
                </div>
                <span className="text-sm font-medium">2.1s</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Uptime</span>
                </div>
                <span className="text-sm font-medium">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Cache Hit Rate</span>
                </div>
                <span className="text-sm font-medium">87%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Error Rate</span>
                </div>
                <span className="text-sm font-medium">0.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Optimize Images
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Zap className="h-4 w-4 mr-2" />
                Minify Assets
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Core Metrics</TabsTrigger>
          <TabsTrigger value="devices">Device Performance</TabsTrigger>
          <TabsTrigger value="optimization">Optimization Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4">
            {performanceMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{metric.name}</h3>
                        {getTrendIcon(metric.trend)}
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusBadge(metric.status)} text-white text-xs`}
                        >
                          {metric.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{metric.description}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                        {metric.value}{metric.unit}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Target: {metric.target}{metric.unit}
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={(metric.value / metric.target) * 100} 
                    className="mt-3 h-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {deviceMetrics.map((device) => {
              const DeviceIcon = getDeviceIcon(device.device);
              return (
                <Card 
                  key={device.device}
                  className={`cursor-pointer transition-colors ${
                    selectedDevice === device.device ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedDevice(device.device)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 capitalize">
                      <DeviceIcon className="h-5 w-5 text-primary" />
                      {device.device}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Users</span>
                        <span className="text-sm font-medium">{device.users}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Load Time</span>
                        <span className="text-sm font-medium">{device.loadTime}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Bounce Rate</span>
                        <span className="text-sm font-medium">{device.bounceRate}%</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Performance</span>
                          <span className="text-sm font-medium">{device.performance}/100</span>
                        </div>
                        <Progress value={device.performance} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {selectedDevice.charAt(0).toUpperCase() + selectedDevice.slice(1)} Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedDevice === 'mobile' && (
                  <>
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Reduce JavaScript Bundle</h4>
                        <p className="text-sm text-yellow-700">Consider code splitting and lazy loading to improve mobile performance</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">Optimize Images</h4>
                        <p className="text-sm text-blue-700">Use WebP format and responsive images for better mobile experience</p>
                      </div>
                    </div>
                  </>
                )}
                {selectedDevice === 'tablet' && (
                  <>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800">Good Performance</h4>
                        <p className="text-sm text-green-700">Tablet performance is well optimized</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">Touch Optimization</h4>
                        <p className="text-sm text-blue-700">Ensure touch targets are appropriately sized for tablet usage</p>
                      </div>
                    </div>
                  </>
                )}
                {selectedDevice === 'desktop' && (
                  <>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800">Excellent Performance</h4>
                        <p className="text-sm text-green-700">Desktop performance meets all targets</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">Keyboard Navigation</h4>
                        <p className="text-sm text-blue-700">Maintain accessibility with proper keyboard navigation</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Immediate Improvements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">Enable Gzip Compression</p>
                      <p className="text-xs text-muted-foreground">Reduce payload by 70%</p>
                    </div>
                    <Button size="sm" variant="outline">Apply</Button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">Optimize CSS Delivery</p>
                      <p className="text-xs text-muted-foreground">Eliminate render blocking</p>
                    </div>
                    <Button size="sm" variant="outline">Apply</Button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">Preload Critical Resources</p>
                      <p className="text-xs text-muted-foreground">Improve perceived speed</p>
                    </div>
                    <Button size="sm" variant="outline">Apply</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-500" />
                  Advanced Optimizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">Implement Service Worker</p>
                      <p className="text-xs text-muted-foreground">Enable offline functionality</p>
                    </div>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">Database Query Optimization</p>
                      <p className="text-xs text-muted-foreground">Reduce server response time</p>
                    </div>
                    <Button size="sm" variant="outline">Analyze</Button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">CDN Configuration</p>
                      <p className="text-xs text-muted-foreground">Global content delivery</p>
                    </div>
                    <Button size="sm" variant="outline">Setup</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Checklist</CardTitle>
              <CardDescription>
                Essential optimizations for maximum performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { item: 'Minify CSS and JavaScript', status: 'completed' },
                  { item: 'Optimize images (WebP, lazy loading)', status: 'completed' },
                  { item: 'Enable browser caching', status: 'completed' },
                  { item: 'Use HTTP/2', status: 'completed' },
                  { item: 'Implement code splitting', status: 'pending' },
                  { item: 'Reduce third-party scripts', status: 'pending' },
                  { item: 'Optimize web fonts', status: 'in-progress' },
                  { item: 'Monitor Core Web Vitals', status: 'completed' }
                ].map((check, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded border">
                    {check.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : check.status === 'in-progress' ? (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">{check.item}</span>
                    <Badge 
                      variant="secondary" 
                      className={`ml-auto text-xs ${
                        check.status === 'completed' ? 'bg-green-100 text-green-700' :
                        check.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}
                    >
                      {check.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}