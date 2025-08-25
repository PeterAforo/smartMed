import DashboardLayout from "@/components/layout/DashboardLayout";
import { RoleBasedStats } from "@/components/dashboard/RoleBasedStats";
import RecentActivities from "@/components/dashboard/RecentActivities";
import AIInsights from "@/components/dashboard/AIInsights";
import QuickActions from "@/components/dashboard/QuickActions";
import { DashboardAnalyticsSection } from "@/components/analytics/DashboardAnalyticsSection";

export default function Dashboard() {
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
      </div>
    </DashboardLayout>
  );
}