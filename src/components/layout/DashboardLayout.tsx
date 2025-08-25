import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { Bell, Search, User, Settings, KeyRound, Palette, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BranchSelector } from "@/components/ui/branch-selector";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut, profile, tenant, currentBranch } = useAuth();

  const userInitials = profile 
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  const displayName = profile 
    ? `${profile.first_name} ${profile.last_name}`.trim() || user?.email
    : user?.email || 'User';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-16 items-center justify-between px-6">
              {/* Left side - Sidebar trigger and search */}
              <div className="flex items-center gap-4 flex-1">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                
                <div className="relative max-w-md flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search patients, records, modules..."
                    className="pl-9 bg-background/50 border-border/50"
                  />
                </div>
              </div>

              {/* Center - Branch Selector */}
              <div className="hidden md:block">
                <BranchSelector />
              </div>

              {/* Right side - Notifications and user */}
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-destructive">
                    3
                  </Badge>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="text-xs font-medium">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:flex flex-col items-start text-left">
                        <span className="text-sm font-medium">{displayName}</span>
                        {tenant && (
                          <span className="text-xs text-muted-foreground">{tenant.name}</span>
                        )}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <span className="font-semibold">{displayName}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                        {tenant && currentBranch && (
                          <div className="text-xs text-muted-foreground">
                            {tenant.name} - {currentBranch.name}
                          </div>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Change Password
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Palette className="mr-2 h-4 w-4" />
                      Preferences
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={signOut}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-6 bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}