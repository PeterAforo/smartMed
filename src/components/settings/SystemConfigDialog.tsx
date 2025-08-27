import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Key, Shield, Mail, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SystemConfigDialog = ({ open, onOpenChange }: SystemConfigDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [configData, setConfigData] = useState({
    // General Settings
    hospitalName: 'City General Hospital',
    timezone: 'UTC-5',
    language: 'en',
    dateFormat: 'MM/dd/yyyy',
    currency: 'USD',
    
    // System Settings
    autoBackup: true,
    backupFrequency: 'daily',
    maintenanceMode: false,
    debugMode: false,
    
    // Security Settings
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginAttempts: '5',
    twoFactorRequired: false,
    
    // Integration Settings
    emailService: 'enabled',
    smsService: 'enabled',
    pushNotifications: true,
    
    // Performance Settings
    cacheTimeout: '300',
    maxConcurrentUsers: '100',
    apiRateLimit: '1000'
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setConfigData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Configuration Updated",
      description: "System configuration has been saved successfully."
    });

    setIsSubmitting(false);
    onOpenChange(false);
  };

  const resetToDefaults = () => {
    setConfigData({
      hospitalName: 'City General Hospital',
      timezone: 'UTC-5',
      language: 'en',
      dateFormat: 'MM/dd/yyyy',
      currency: 'USD',
      autoBackup: true,
      backupFrequency: 'daily',
      maintenanceMode: false,
      debugMode: false,
      sessionTimeout: '30',
      passwordExpiry: '90',
      loginAttempts: '5',
      twoFactorRequired: false,
      emailService: 'enabled',
      smsService: 'enabled',
      pushNotifications: true,
      cacheTimeout: '300',
      maxConcurrentUsers: '100',
      apiRateLimit: '1000'
    });

    toast({
      title: "Reset to Defaults",
      description: "Configuration has been reset to default values."
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Configuration
          </DialogTitle>
          <DialogDescription>
            Configure system-wide settings and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <h3 className="text-lg font-semibold">General Settings</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hospitalName">Hospital Name</Label>
                <Input
                  id="hospitalName"
                  value={configData.hospitalName}
                  onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={configData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC-8">UTC-8 (Pacific)</SelectItem>
                    <SelectItem value="UTC-7">UTC-7 (Mountain)</SelectItem>
                    <SelectItem value="UTC-6">UTC-6 (Central)</SelectItem>
                    <SelectItem value="UTC-5">UTC-5 (Eastern)</SelectItem>
                    <SelectItem value="UTC+0">UTC+0 (GMT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={configData.language} onValueChange={(value) => handleInputChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select value={configData.dateFormat} onValueChange={(value) => handleInputChange('dateFormat', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={configData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* System Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">System Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Automatic Backup</h4>
                  <p className="text-sm text-muted-foreground">Enable automatic system backups</p>
                </div>
                <Switch
                  checked={configData.autoBackup}
                  onCheckedChange={(checked) => handleInputChange('autoBackup', checked)}
                />
              </div>

              {configData.autoBackup && (
                <div className="space-y-2 ml-4">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select value={configData.backupFrequency} onValueChange={(value) => handleInputChange('backupFrequency', value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Maintenance Mode</h4>
                  <p className="text-sm text-muted-foreground">Enable maintenance mode for system updates</p>
                </div>
                <div className="flex items-center gap-2">
                  {configData.maintenanceMode && <Badge variant="secondary">Active</Badge>}
                  <Switch
                    checked={configData.maintenanceMode}
                    onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Debug Mode</h4>
                  <p className="text-sm text-muted-foreground">Enable detailed logging for troubleshooting</p>
                </div>
                <Switch
                  checked={configData.debugMode}
                  onCheckedChange={(checked) => handleInputChange('debugMode', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Security Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Security Settings</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (min)</Label>
                <Select value={configData.sessionTimeout} onValueChange={(value) => handleInputChange('sessionTimeout', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                <Select value={configData.passwordExpiry} onValueChange={(value) => handleInputChange('passwordExpiry', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                <Select value={configData.loginAttempts} onValueChange={(value) => handleInputChange('loginAttempts', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 attempts</SelectItem>
                    <SelectItem value="5">5 attempts</SelectItem>
                    <SelectItem value="10">10 attempts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Require Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">Enforce 2FA for all user accounts</p>
              </div>
              <Switch
                checked={configData.twoFactorRequired}
                onCheckedChange={(checked) => handleInputChange('twoFactorRequired', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Performance Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Performance Settings</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cacheTimeout">Cache Timeout (sec)</Label>
                <Input
                  id="cacheTimeout"
                  type="number"
                  value={configData.cacheTimeout}
                  onChange={(e) => handleInputChange('cacheTimeout', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxConcurrentUsers">Max Concurrent Users</Label>
                <Input
                  id="maxConcurrentUsers"
                  type="number"
                  value={configData.maxConcurrentUsers}
                  onChange={(e) => handleInputChange('maxConcurrentUsers', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiRateLimit">API Rate Limit (req/hour)</Label>
                <Input
                  id="apiRateLimit"
                  type="number"
                  value={configData.apiRateLimit}
                  onChange={(e) => handleInputChange('apiRateLimit', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Configuration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};