import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InventoryManager from '@/components/inventory/InventoryManager';
import HRManagement from '@/components/hr/HRManagement';

const Operations = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Operations Management</h1>
          <p className="text-muted-foreground">Manage inventory, human resources, and operational workflows</p>
        </div>

        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
            <TabsTrigger value="hr">Human Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <InventoryManager />
          </TabsContent>

          <TabsContent value="hr">
            <HRManagement />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Operations;