import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Calendar, FileText, BarChart3 } from "lucide-react";
import { useState } from "react";
import { NewPatientModal } from "./modals/NewPatientModal";
import { ScheduleAppointmentModal } from "./modals/ScheduleAppointmentModal";
import { ViewReportsModal } from "./modals/ViewReportsModal";
import { LabResultsModal } from "./modals/LabResultsModal";

export default function QuickActions() {
  const [newPatientOpen, setNewPatientOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [labResultsOpen, setLabResultsOpen] = useState(false);

  const actions = [
    {
      title: "New Patient",
      description: "Register a new patient",
      icon: UserPlus,
      onClick: () => setNewPatientOpen(true),
      className: "bg-primary text-primary-foreground hover:bg-primary/90"
    },
    {
      title: "Schedule",
      description: "Book an appointment",
      icon: Calendar,
      onClick: () => setScheduleOpen(true),
      className: "bg-secondary text-secondary-foreground hover:bg-secondary/90"
    },
    {
      title: "Lab Results",
      description: "View test results",
      icon: FileText,
      onClick: () => setLabResultsOpen(true),
      className: "bg-accent text-accent-foreground hover:bg-accent/90"
    },
    {
      title: "Reports",
      description: "Generate reports",
      icon: BarChart3,
      onClick: () => setReportsOpen(true),
      className: "bg-muted text-muted-foreground hover:bg-muted/90"
    }
  ];

  return (
    <>
      <Card className="healthcare-card">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className={`h-20 flex flex-col gap-2 ${action.className}`}
                  onClick={action.onClick}
                >
                  <Icon className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs opacity-80">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <NewPatientModal open={newPatientOpen} onOpenChange={setNewPatientOpen} />
      <ScheduleAppointmentModal open={scheduleOpen} onOpenChange={setScheduleOpen} />
      <LabResultsModal open={labResultsOpen} onOpenChange={setLabResultsOpen} />
      <ViewReportsModal open={reportsOpen} onOpenChange={setReportsOpen} />
    </>
  );
}