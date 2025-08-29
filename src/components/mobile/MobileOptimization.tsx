import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Zap, 
  Settings,
  Eye,
  Download,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Moon,
  Sun,
  Contrast,
  Type,
  Accessibility
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  fontSize: number;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

interface PerformanceSettings {
  offlineMode: boolean;
  lowDataMode: boolean;
  cacheEnabled: boolean;
  imageQuality: 'high' | 'medium' | 'low';
  animationsEnabled: boolean;
  autoSync: boolean;
}

export function MobileOptimization() {
  const [deviceOrientation, setDeviceOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [connectionType, setConnectionType] = useState<'4g' | '3g' | 'wifi'>('wifi');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    fontSize: 16,
    colorBlindness: 'none'
  });

  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>({
    offlineMode: false,
    lowDataMode: false,
    cacheEnabled: true,
    imageQuality: 'medium',
    animationsEnabled: true,
    autoSync: true
  });

  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    // Simulate device orientation changes
    const handleOrientationChange = () => {
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      setDeviceOrientation(orientation);
    };

    window.addEventListener('resize', handleOrientationChange);
    handleOrientationChange();

    // Simulate network status
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const applyOptimizations = () => {
    toast({
      title: "Optimizations Applied",
      description: "Mobile experience has been optimized for your device",
    });
  };

  const getConnectionIcon = () => {
    switch (connectionType) {
      case 'wifi': return <Wifi className="h-4 w-4 text-green-500" />;
      case '4g': return <Signal className="h-4 w-4 text-blue-500" />;
      case '3g': return <Signal className="h-4 w-4 text-yellow-500" />;
      default: return <WifiOff className="h-4 w-4 text-red-500" />;
    }
  };

  const getBatteryColor = () => {
    if (batteryLevel > 50) return 'text-green-500';
    if (batteryLevel > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const responsiveBreakpoints = [
    { name: 'Mobile Portrait', width: 375, height: 667, device: 'mobile' },
    { name: 'Mobile Landscape', width: 667, height: 375, device: 'mobile' },
    { name: 'Tablet Portrait', width: 768, height: 1024, device: 'tablet' },
    { name: 'Tablet Landscape', width: 1024, height: 768, device: 'tablet' },
    { name: 'Desktop', width: 1440, height: 900, device: 'desktop' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Mobile Optimization
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Optimize your application for mobile devices and accessibility
          </p>
        </div>
        <Button onClick={applyOptimizations}>
          <Zap className="h-4 w-4 mr-2" />
          Apply Optimizations
        </Button>
      </div>

      {/* Device Status Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isMobile ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                <span className="text-sm font-medium">
                  {isMobile ? 'Mobile' : 'Desktop'} • {deviceOrientation}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {getConnectionIcon()}
                <span className="text-sm capitalize">{connectionType}</span>
              </div>

              {networkStatus === 'offline' && (
                <Badge variant="destructive" className="text-xs">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Battery className={`h-4 w-4 ${getBatteryColor()}`} />
                <span className="text-sm">{batteryLevel}%</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Responsive Design Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Responsive Preview
            </CardTitle>
            <CardDescription>
              Test your application across different screen sizes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {responsiveBreakpoints.map((breakpoint) => {
                const Icon = breakpoint.device === 'mobile' ? Smartphone : 
                           breakpoint.device === 'tablet' ? Tablet : Monitor;
                
                return (
                  <div key={breakpoint.name} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{breakpoint.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {breakpoint.width} × {breakpoint.height}
                      </span>
                    </div>
                    <div className="bg-muted rounded p-2">
                      <div 
                        className="bg-background border rounded shadow-sm mx-auto"
                        style={{ 
                          width: `${Math.min(breakpoint.width / 4, 120)}px`,
                          height: `${Math.min(breakpoint.height / 4, 80)}px`
                        }}
                      >
                        <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                          Preview
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Performance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Performance Settings
            </CardTitle>
            <CardDescription>
              Configure performance optimizations for mobile devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Offline Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable offline functionality with service workers
                  </p>
                </div>
                <Switch
                  checked={performanceSettings.offlineMode}
                  onCheckedChange={(checked) =>
                    setPerformanceSettings(prev => ({ ...prev, offlineMode: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Low Data Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Reduce data usage by compressing content
                  </p>
                </div>
                <Switch
                  checked={performanceSettings.lowDataMode}
                  onCheckedChange={(checked) =>
                    setPerformanceSettings(prev => ({ ...prev, lowDataMode: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Cache Enabled</Label>
                  <p className="text-xs text-muted-foreground">
                    Store frequently used data locally
                  </p>
                </div>
                <Switch
                  checked={performanceSettings.cacheEnabled}
                  onCheckedChange={(checked) =>
                    setPerformanceSettings(prev => ({ ...prev, cacheEnabled: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Animations</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable smooth transitions and animations
                  </p>
                </div>
                <Switch
                  checked={performanceSettings.animationsEnabled}
                  onCheckedChange={(checked) =>
                    setPerformanceSettings(prev => ({ ...prev, animationsEnabled: checked }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Image Quality</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((quality) => (
                    <Button
                      key={quality}
                      variant={performanceSettings.imageQuality === quality ? 'default' : 'outline'}
                      size="sm"
                      className="capitalize"
                      onClick={() =>
                        setPerformanceSettings(prev => ({ 
                          ...prev, 
                          imageQuality: quality as 'high' | 'medium' | 'low'
                        }))
                      }
                    >
                      {quality}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="h-5 w-5" />
              Accessibility Settings
            </CardTitle>
            <CardDescription>
              Configure accessibility features for better usability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">High Contrast</Label>
                  <p className="text-xs text-muted-foreground">
                    Increase contrast for better visibility
                  </p>
                </div>
                <Switch
                  checked={accessibilitySettings.highContrast}
                  onCheckedChange={(checked) =>
                    setAccessibilitySettings(prev => ({ ...prev, highContrast: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Large Text</Label>
                  <p className="text-xs text-muted-foreground">
                    Increase font size for better readability
                  </p>
                </div>
                <Switch
                  checked={accessibilitySettings.largeText}
                  onCheckedChange={(checked) =>
                    setAccessibilitySettings(prev => ({ ...prev, largeText: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Reduced Motion</Label>
                  <p className="text-xs text-muted-foreground">
                    Minimize animations for motion sensitivity
                  </p>
                </div>
                <Switch
                  checked={accessibilitySettings.reducedMotion}
                  onCheckedChange={(checked) =>
                    setAccessibilitySettings(prev => ({ ...prev, reducedMotion: checked }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Font Size: {accessibilitySettings.fontSize}px
                </Label>
                <Slider
                  value={[accessibilitySettings.fontSize]}
                  onValueChange={([value]) =>
                    setAccessibilitySettings(prev => ({ ...prev, fontSize: value }))
                  }
                  min={12}
                  max={24}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Color Blindness Support</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'none', label: 'None' },
                    { value: 'protanopia', label: 'Protanopia' },
                    { value: 'deuteranopia', label: 'Deuteranopia' },
                    { value: 'tritanopia', label: 'Tritanopia' }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={accessibilitySettings.colorBlindness === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setAccessibilitySettings(prev => ({ 
                          ...prev, 
                          colorBlindness: option.value as typeof accessibilitySettings.colorBlindness
                        }))
                      }
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Touch Optimization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Touch Optimization
            </CardTitle>
            <CardDescription>
              Mobile-specific interaction optimizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm mb-2">Touch Target Size</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-red-100 border border-red-300 rounded mx-auto mb-1"></div>
                    <p className="text-xs text-red-600">Too Small</p>
                    <p className="text-xs text-muted-foreground">32px</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-green-100 border border-green-300 rounded mx-auto mb-1"></div>
                    <p className="text-xs text-green-600">Optimal</p>
                    <p className="text-xs text-muted-foreground">44px</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 border border-blue-300 rounded mx-auto mb-1"></div>
                    <p className="text-xs text-blue-600">Large</p>
                    <p className="text-xs text-muted-foreground">56px</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Gesture Support</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Swipe Navigation',
                    'Pull to Refresh',
                    'Pinch to Zoom',
                    'Long Press Actions'
                  ].map((gesture) => (
                    <div key={gesture} className="flex items-center gap-2 p-2 border rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs">{gesture}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Performance Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Touch Response Time</span>
                    <span className="text-green-600">12ms</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Scroll Performance</span>
                    <span className="text-green-600">60fps</span>
                  </div>
                  <Progress value={95} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Battery Impact</span>
                    <span className="text-yellow-600">Low</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile-Specific Features */}
      <Card>
        <CardHeader>
          <CardTitle>Mobile-Specific Features</CardTitle>
          <CardDescription>
            Features optimized for mobile healthcare workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Offline Support</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Continue working even without internet connection
              </p>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Active
              </Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Quick Actions</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Fast access to common healthcare tasks
              </p>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Configured
              </Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Voice Navigation</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Hands-free operation for clinical settings
              </p>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                Beta
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}