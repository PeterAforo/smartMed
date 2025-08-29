import DashboardLayout from "@/components/layout/DashboardLayout";
import { ExternalServiceManager } from "@/components/integrations/ExternalServiceManager";
import { WebhookManager } from "@/components/webhooks/WebhookManager";
import ExternalIntegrationHub from '@/components/integration/ExternalIntegrationHub';
import ProductionReadiness from '@/components/deployment/ProductionReadiness';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Integrations() {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Integrations & Deployment</h1>
          <p className="text-muted-foreground">Manage external integrations and production deployment</p>
        </div>

        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services">External Services</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="hub">Integration Hub</TabsTrigger>
            <TabsTrigger value="deployment">Production Ready</TabsTrigger>
          </TabsList>

          <TabsContent value="services">
            <ExternalServiceManager />
          </TabsContent>

          <TabsContent value="webhooks">
            <WebhookManager />
          </TabsContent>

          <TabsContent value="hub">
            <ExternalIntegrationHub />
          </TabsContent>

          <TabsContent value="deployment">
            <ProductionReadiness />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}