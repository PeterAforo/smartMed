import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Activity,
  UserPlus,
  CheckSquare,
  Bed,
  Users,
  Stethoscope,
  Heart,
  TestTube,
  Package,
  Calculator,
  CreditCard,
  Shield,
  FileText,
  Pill,
  Camera,
  Zap,
  Building,
  Store,
  UserCheck,
  Calendar,
  FileHeart,
  Scissors,
  Siren,
  Baby,
  Globe,
  Video,
  MessageSquare,
  BarChart3,
  CheckCircle,
  Archive,
  Database,
  Plug,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// All 33 SmartMed modules
const mainModules = [
  { title: "Dashboard", url: "/dashboard", icon: Activity },
  { title: "Registration", url: "/registration", icon: UserPlus },
  { title: "Check-in", url: "/checkin", icon: CheckSquare },
  { title: "Inpatient Dept.", url: "/inpatient", icon: Bed },
  { title: "Ward Management", url: "/ward", icon: Users },
  { title: "Doctor", url: "/doctor", icon: Stethoscope },
  { title: "Nurse", url: "/nurse", icon: Heart },
  { title: "Laboratory", url: "/lab", icon: TestTube },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Accounts", url: "/accounts", icon: Calculator },
  { title: "Cashier", url: "/cashier", icon: CreditCard },
  { title: "Insurance", url: "/insurance", icon: Shield },
  { title: "Claims", url: "/claims", icon: FileText },
  { title: "Pharmacy", url: "/pharmacy", icon: Pill },
  { title: "Imaging", url: "/imaging", icon: Camera },
  { title: "Radiology", url: "/radiology", icon: Zap },
  { title: "Corporate", url: "/corporate", icon: Building },
  { title: "Stores", url: "/stores", icon: Store },
  { title: "HR", url: "/hr", icon: UserCheck },
  { title: "Appointments", url: "/appointments", icon: Calendar },
  { title: "EMR/EHR", url: "/emr", icon: FileHeart },
  { title: "Operating Theatre", url: "/theatre", icon: Scissors },
  { title: "Emergency Room", url: "/emergency", icon: Siren },
  { title: "Obstetrics", url: "/obstetrics", icon: Baby },
  { title: "Patient Portal", url: "/patient-portal", icon: Globe },
  { title: "Telemedicine", url: "/telemedicine", icon: Video },
  { title: "Feedback & Satisfaction", url: "/feedback", icon: MessageSquare },
];

const systemModules = [
  { title: "Reports & Analytics", url: "/reports", icon: BarChart3 },
  { title: "Advanced Analytics", url: "/analytics", icon: Activity },
  { title: "Quality & Compliance", url: "/compliance", icon: CheckCircle },
  { title: "Audit & Logging", url: "/audit", icon: Archive },
  { title: "Backup & Recovery", url: "/backup", icon: Database },
  { title: "API Integration", url: "/api", icon: Plug },
  { title: "System Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isMainModuleActive = mainModules.some((i) => isActive(i.url));
  const isSystemModuleActive = systemModules.some((i) => isActive(i.url));
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors";

  const handleLogout = () => {
    localStorage.removeItem('nchs_auth');
    localStorage.removeItem('nchs_user');
    window.location.href = '/';
  };

  const collapsed = state === "collapsed";

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-72"} border-r bg-sidebar shadow-sm`}
      collapsible="icon"
    >
      {/* Header */}
      <div className="p-4 border-b bg-sidebar-primary shadow-sm">
        <div className="flex items-center gap-3">
          {!collapsed && (
            <>
              <div className="p-1.5 bg-primary-foreground/10 rounded-lg">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary-foreground">SmartMed</h2>
                <p className="text-xs text-primary-foreground/80">Smart Healthcare</p>
              </div>
            </>
          )}
          {collapsed && (
            <div className="p-1.5 bg-primary-foreground/10 rounded-lg mx-auto">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
        </div>
      </div>

      <SidebarContent className="flex flex-col h-full">
        {/* Main Modules */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
            {!collapsed && "Hospital Modules"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainModules.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className={`h-4 w-4 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
                      {!collapsed && (
                        <span className="text-sm font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        {/* System Modules */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
            {!collapsed && "System & Admin"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {systemModules.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className={`h-4 w-4 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
                      {!collapsed && (
                        <span className="text-sm font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout */}
        <div className="mt-auto p-4">
          <Button 
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className={`w-full ${collapsed ? 'px-2' : ''} border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground`}
          >
            <LogOut className={`h-4 w-4 ${collapsed ? '' : 'mr-2'}`} />
            {!collapsed && "Logout"}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}