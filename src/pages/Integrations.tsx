import DashboardLayout from "@/components/layout/DashboardLayout";
import { ExternalServiceManager } from "@/components/integrations/ExternalServiceManager";
import { WebhookManager } from "@/components/webhooks/WebhookManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Integrations() {
  return (
    <DashboardLayout>
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">External Services</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <ExternalServiceManager />
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhookManager />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}