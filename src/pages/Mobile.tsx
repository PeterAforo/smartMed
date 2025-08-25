import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PatientPortal from '@/components/patient/PatientPortal';
import MobileAppDashboard from '@/components/mobile/MobileAppDashboard';

const Mobile = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mobile & Patient Portal</h1>
          <p className="text-muted-foreground">Mobile applications and patient self-service portal</p>
        </div>

        <Tabs defaultValue="patient-portal" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="patient-portal">Patient Portal</TabsTrigger>
            <TabsTrigger value="mobile-dashboard">Mobile App Management</TabsTrigger>
          </TabsList>

          <TabsContent value="patient-portal">
            <PatientPortal />
          </TabsContent>

          <TabsContent value="mobile-dashboard">
            <MobileAppDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Mobile;