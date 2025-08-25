import DashboardLayout from "@/components/layout/DashboardLayout";
import { InteractiveAnalytics } from "@/components/analytics/InteractiveAnalytics";

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Advanced Analytics
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Deep insights and interactive analytics for comprehensive performance analysis.
          </p>
        </div>

        {/* Interactive Analytics */}
        <InteractiveAnalytics />
      </div>
    </DashboardLayout>
  );
}