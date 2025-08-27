import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, HardDrive, Cloud, Download, Upload, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CreateBackupJobDialog } from '@/components/backup/CreateBackupJobDialog';

const Backup = () => {
  const { toast } = useToast();
  const [createJobDialogOpen, setCreateJobDialogOpen] = useState(false);

  // Mock backup jobs data
  const [backupJobs] = useState([
    {
      id: 1,
      name: 'Patient Records Daily Backup',
      type: 'automated',
      source: 'Patient Database',
      destination: 'AWS S3 - Primary',
      schedule: 'Daily at 2:00 AM',
      lastRun: '2024-01-18 02:00:15',
      nextRun: '2024-01-19 02:00:00',
      status: 'completed',
      duration: '45 minutes',
      dataSize: '2.4 GB',
      retentionPeriod: '7 years'
    },
    {
      id: 2,
      name: 'System Configuration Backup',
      type: 'automated',
      source: 'System Config',
      destination: 'Local Storage',
      schedule: 'Weekly on Sunday',
      lastRun: '2024-01-14 03:00:00',
      nextRun: '2024-01-21 03:00:00',
      status: 'completed',
      duration: '15 minutes',
      dataSize: '120 MB',
      retentionPeriod: '1 year'
    },
    {
      id: 3,
      name: 'Medical Images Backup',
      type: 'automated',
      source: 'PACS System',
      destination: 'Google Cloud Storage',
      schedule: 'Daily at 3:00 AM',
      lastRun: '2024-01-18 03:00:22',
      nextRun: '2024-01-19 03:00:00',
      status: 'running',
      duration: '2 hours 15 minutes',
      dataSize: '8.7 GB',
      retentionPeriod: '10 years'
    },
    {
      id: 4,
      name: 'EMR Archive Backup',
      type: 'manual',
      source: 'EMR System',
      destination: 'Offsite Storage',
      schedule: 'On-demand',
      lastRun: '2024-01-15 10:30:00',
      nextRun: 'Manual trigger',
      status: 'failed',
      duration: 'N/A',
      dataSize: '1.2 GB',
      retentionPeriod: 'Permanent'
    }
  ]);

  // Mock storage locations
  const [storageLocations] = useState([
    {
      id: 1,
      name: 'AWS S3 - Primary',
      type: 'cloud',
      capacity: '500 GB',
      used: '245 GB',
      available: '255 GB',
      status: 'healthy',
      location: 'US-East-1',
      encryption: 'AES-256'
    },
    {
      id: 2,
      name: 'Local NAS Storage',
      type: 'local',
      capacity: '2 TB',
      used: '1.2 TB',
      available: '800 GB',
      status: 'healthy',
      location: 'Data Center',
      encryption: 'AES-256'
    },
    {
      id: 3,
      name: 'Google Cloud Storage',
      type: 'cloud',
      capacity: '1 TB',
      used: '450 GB',
      available: '574 GB',
      status: 'warning',
      location: 'US-Central-1',
      encryption: 'Google KMS'
    },
    {
      id: 4,
      name: 'Offsite Tape Storage',
      type: 'tape',
      capacity: '10 TB',
      used: '3.2 TB',
      available: '6.8 TB',
      status: 'healthy',
      location: 'Iron Mountain',
      encryption: 'Hardware'
    }
  ]);

  const [backupStats] = useState({
    totalBackups: 156,
    successfulBackups: 152,
    failedBackups: 4,
    totalDataBackedUp: '1.2 TB',
    averageBackupTime: '45 minutes',
    lastSuccessfulBackup: '2024-01-18 03:45:22'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'running': return 'bg-blue-500 text-white';
      case 'failed': return 'bg-red-500 text-white';
      case 'scheduled': return 'bg-yellow-500 text-white';
      case 'healthy': return 'bg-green-500 text-white';
      case 'warning': return 'bg-yellow-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cloud': return <Cloud className="h-4 w-4" />;
      case 'local': return <HardDrive className="h-4 w-4" />;
      case 'tape': return <Database className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const handleRunBackup = (jobId: number) => {
    toast({
      title: "Backup Started",
      description: "Manual backup job has been initiated.",
    });
  };

  const handleStopBackup = (jobId: number) => {
    toast({
      title: "Backup Stopped",
      description: "Backup job has been stopped successfully.",
    });
  };

  const handleRestoreData = () => {
    toast({
      title: "Restore Initiated",
      description: "Data restoration process has been started.",
    });
  };

  const calculateUsagePercentage = (used: string, capacity: string) => {
    const usedValue = parseFloat(used.replace(/[^\d.]/g, ''));
    const capacityValue = parseFloat(capacity.replace(/[^\d.]/g, ''));
    
    // Convert to same unit for calculation
    const usedGB = used.includes('TB') ? usedValue * 1024 : usedValue;
    const capacityGB = capacity.includes('TB') ? capacityValue * 1024 : capacityValue;
    
    return Math.round((usedGB / capacityGB) * 100);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Backup & Recovery</h1>
          <p className="text-muted-foreground">
            Data protection, backup management, and disaster recovery operations
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{backupStats.totalBackups}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful Backups</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{backupStats.successfulBackups}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((backupStats.successfulBackups / backupStats.totalBackups) * 100)}% success rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Backups</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{backupStats.failedBackups}</div>
              <p className="text-xs text-muted-foreground">
                Requiring attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Backed Up</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{backupStats.totalDataBackedUp}</div>
              <p className="text-xs text-muted-foreground">
                Total protected data
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{backupStats.averageBackupTime}</div>
              <p className="text-xs text-muted-foreground">
                Per backup job
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Successful</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">✓</div>
              <p className="text-xs text-muted-foreground">
                {backupStats.lastSuccessfulBackup}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="backup-jobs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="backup-jobs">Backup Jobs</TabsTrigger>
            <TabsTrigger value="storage">Storage Locations</TabsTrigger>
            <TabsTrigger value="recovery">Data Recovery</TabsTrigger>
            <TabsTrigger value="schedules">Backup Schedules</TabsTrigger>
          </TabsList>

          <TabsContent value="backup-jobs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Backup Jobs Management</CardTitle>
                <CardDescription>
                  Monitor and manage automated and manual backup operations
                </CardDescription>
                <Button onClick={() => setCreateJobDialogOpen(true)}>
                  <Database className="mr-2 h-4 w-4" />
                  Create New Backup Job
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {backupJobs.map((job) => (
                    <div key={job.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{job.name}</h3>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {job.type.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          {job.status === 'running' ? (
                            <Button size="sm" variant="destructive" onClick={() => handleStopBackup(job.id)}>
                              Stop Backup
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => handleRunBackup(job.id)}>
                              Run Now
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            Configure
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="space-y-1">
                            <div><span className="font-medium">Source:</span> {job.source}</div>
                            <div><span className="font-medium">Destination:</span> {job.destination}</div>
                            <div><span className="font-medium">Schedule:</span> {job.schedule}</div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="space-y-1">
                            <div><span className="font-medium">Last Run:</span> {job.lastRun}</div>
                            <div><span className="font-medium">Next Run:</span> {job.nextRun}</div>
                            <div><span className="font-medium">Duration:</span> {job.duration}</div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="space-y-1">
                            <div><span className="font-medium">Data Size:</span> {job.dataSize}</div>
                            <div><span className="font-medium">Retention:</span> {job.retentionPeriod}</div>
                            <div>
                              <span className="font-medium">Status:</span> 
                              <span className={`ml-1 ${
                                job.status === 'completed' ? 'text-green-600' :
                                job.status === 'running' ? 'text-blue-600' :
                                job.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                {job.status === 'running' ? 'In Progress...' : 
                                 job.status === 'completed' ? 'Success' :
                                 job.status === 'failed' ? 'Failed' : 'Scheduled'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Storage Locations</CardTitle>
                <CardDescription>
                  Manage backup storage destinations and monitor capacity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {storageLocations.map((storage) => (
                    <Card key={storage.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center space-x-2">
                            {getTypeIcon(storage.type)}
                            <span>{storage.name}</span>
                          </CardTitle>
                          <Badge className={getStatusColor(storage.status)}>
                            {storage.status.toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Used:</span>
                            <span className="font-medium">{storage.used} / {storage.capacity}</span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Usage</span>
                              <span>{calculateUsagePercentage(storage.used, storage.capacity)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  calculateUsagePercentage(storage.used, storage.capacity) > 80 ? 'bg-red-500' :
                                  calculateUsagePercentage(storage.used, storage.capacity) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${calculateUsagePercentage(storage.used, storage.capacity)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div><span className="font-medium">Available:</span> {storage.available}</div>
                            <div><span className="font-medium">Location:</span> {storage.location}</div>
                            <div><span className="font-medium">Encryption:</span> {storage.encryption}</div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              Configure
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              Test Connection
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recovery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Recovery Center</CardTitle>
                <CardDescription>
                  Restore data from backups and manage recovery operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Available Restore Points</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { date: '2024-01-18 02:00:15', type: 'Patient Records', size: '2.4 GB' },
                        { date: '2024-01-17 02:00:12', type: 'Patient Records', size: '2.3 GB' },
                        { date: '2024-01-16 02:00:08', type: 'Patient Records', size: '2.3 GB' },
                        { date: '2024-01-18 03:00:22', type: 'Medical Images', size: '8.7 GB' }
                      ].map((point, index) => (
                        <div key={index} className="p-3 border rounded flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">{point.type}</p>
                            <p className="text-xs text-muted-foreground">{point.date}</p>
                            <p className="text-xs text-muted-foreground">Size: {point.size}</p>
                          </div>
                          <Button size="sm" onClick={handleRestoreData}>
                            <Download className="mr-2 h-4 w-4" />
                            Restore
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recovery Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full h-12 justify-start">
                        <Database className="mr-3 h-5 w-5" />
                        Full System Restore
                      </Button>
                      <Button variant="outline" className="w-full h-12 justify-start">
                        <HardDrive className="mr-3 h-5 w-5" />
                        Selective Data Restore
                      </Button>
                      <Button variant="outline" className="w-full h-12 justify-start">
                        <Upload className="mr-3 h-5 w-5" />
                        Point-in-Time Recovery
                      </Button>
                      <Button variant="outline" className="w-full h-12 justify-start">
                        <Cloud className="mr-3 h-5 w-5" />
                        Cloud Recovery
                      </Button>
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">
                          <AlertTriangle className="h-4 w-4 inline mr-2" />
                          Recovery operations should be performed during maintenance windows
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Backup Schedules</CardTitle>
                <CardDescription>
                  Configure automated backup schedules and retention policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Button variant="outline" className="h-20 flex-col">
                    <Clock className="h-6 w-6 mb-2" />
                    Schedule Manager
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Database className="h-6 w-6 mb-2" />
                    Retention Policies
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <CheckCircle className="h-6 w-6 mb-2" />
                    Backup Verification
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <AlertTriangle className="h-6 w-6 mb-2" />
                    Failure Notifications
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <HardDrive className="h-6 w-6 mb-2" />
                    Storage Policies
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Cloud className="h-6 w-6 mb-2" />
                    Cloud Integration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog */}
        <CreateBackupJobDialog 
          open={createJobDialogOpen} 
          onOpenChange={setCreateJobDialogOpen} 
        />
      </div>
    </DashboardLayout>
  );
};

export default Backup;