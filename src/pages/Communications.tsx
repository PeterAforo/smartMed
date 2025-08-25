import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CommunicationHub } from '@/components/communication/CommunicationHub';
import { ExternalIntegrations } from '@/components/integration/ExternalIntegrations';
import { TelehealthPlatform } from '@/components/telehealth/TelehealthPlatform';
import { MessageSquare, Link, Video, Settings, Phone, Mail, Smartphone, Building2 } from 'lucide-react';

const Communications = () => {
  return (
      <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Communications & Integration</h1>
            <p className="text-muted-foreground">
              Manage patient communications, external integrations, and telehealth services
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <Phone className="h-4 w-4 mr-1" />
            Connected Systems
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Messages Sent</p>
                  <p className="text-2xl font-bold">1,284</p>
                </div>
                <Smartphone className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-2 text-sm text-green-500">
                +12% from last month
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Integrations</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <Building2 className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-2 text-sm text-green-500">
                All systems operational
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telehealth Sessions</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <Video className="h-8 w-8 text-purple-500" />
              </div>
              <div className="mt-2 text-sm text-green-500">
                +28% from last month
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                  <p className="text-2xl font-bold">87%</p>
                </div>
                <Mail className="h-8 w-8 text-orange-500" />
              </div>
              <div className="mt-2 text-sm text-green-500">
                +5% improvement
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="communications" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="communications" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Communications
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="telehealth" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Telehealth
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="communications" className="space-y-6">
            <CommunicationHub />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <ExternalIntegrations />
          </TabsContent>

          <TabsContent value="telehealth" className="space-y-6">
            <TelehealthPlatform />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Communication Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Communication Channel</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>SMS</option>
                      <option>Email</option>
                      <option>Phone Call</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Business Hours</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="time" defaultValue="08:00" className="p-2 border rounded-md" />
                      <input type="time" defaultValue="18:00" className="p-2 border rounded-md" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time Zone</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Eastern Time (ET)</option>
                      <option>Central Time (CT)</option>
                      <option>Mountain Time (MT)</option>
                      <option>Pacific Time (PT)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security & Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">HIPAA Compliance</h4>
                      <p className="text-sm text-muted-foreground">Ensure all communications are HIPAA compliant</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Message Encryption</h4>
                      <p className="text-sm text-muted-foreground">Enable end-to-end encryption</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Audit Logging</h4>
                      <p className="text-sm text-muted-foreground">Maintain detailed communication logs</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Data Retention</h4>
                      <p className="text-sm text-muted-foreground">Automatically archive old messages</p>
                    </div>
                    <select className="p-1 border rounded text-sm">
                      <option>1 Year</option>
                      <option>2 Years</option>
                      <option>5 Years</option>
                      <option>7 Years</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      </DashboardLayout>
  );
};

export default Communications;