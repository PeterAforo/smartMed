import DashboardLayout from "@/components/layout/DashboardLayout";
import { RoleBasedStats } from "@/components/dashboard/RoleBasedStats";
import RecentActivities from "@/components/dashboard/RecentActivities";
import AIInsights from "@/components/dashboard/AIInsights";
import QuickActions from "@/components/dashboard/QuickActions";
import { DashboardAnalyticsSection } from "@/components/analytics/DashboardAnalyticsSection";
import { PerformanceMonitor } from "@/components/performance/PerformanceMonitor";
import { MobileOptimization } from "@/components/mobile/MobileOptimization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Index() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Healthcare Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back! Here's your comprehensive hospital overview with real-time data and AI insights.
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Role-based Key Stats */}
            <RoleBasedStats />

            {/* Analytics Overview */}
            <DashboardAnalyticsSection />

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              <AIInsights />
              <RecentActivities />
            </div>

            {/* Quick Actions */}
            <QuickActions />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceMonitor />
          </TabsContent>

          <TabsContent value="mobile">
            <MobileOptimization />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}