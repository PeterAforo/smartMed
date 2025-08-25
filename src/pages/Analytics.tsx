import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InteractiveAnalytics } from "@/components/analytics/InteractiveAnalytics";
import { ReportGenerator } from "@/components/analytics/ReportGenerator";
import { ComparativeAnalytics } from "@/components/analytics/ComparativeAnalytics";
import { 
  BarChart3, 
  FileText, 
  TrendingUp, 
  Download
} from "lucide-react";

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Advanced Analytics
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Comprehensive analytics, reporting, and data insights for healthcare operations.
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Comparison</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <InteractiveAnalytics />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <ComparativeAnalytics />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportGenerator />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <ReportGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}