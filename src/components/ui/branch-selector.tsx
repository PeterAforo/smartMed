import { ChevronDown, MapPin, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export function BranchSelector() {
  const { currentBranch, branches, switchBranch, hasCrossBranchAccess, tenant } = useAuth();

  if (!currentBranch || branches.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-sidebar-accent/20 rounded-lg">
        <MapPin className="h-4 w-4 text-sidebar-foreground/70" />
        <span className="text-sm font-medium text-sidebar-foreground">
          {currentBranch?.name || "No Branch"}
        </span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-sidebar-accent/20 border-sidebar-border hover:bg-sidebar-accent/30"
        >
          <MapPin className="h-4 w-4" />
          <span className="font-medium">{currentBranch.name}</span>
          {hasCrossBranchAccess && (
            <Badge variant="secondary" className="text-xs ml-1">
              All Access
            </Badge>
          )}
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          {tenant?.name} - Branches
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {branches.map((branch) => (
          <DropdownMenuItem
            key={branch.id}
            onClick={() => switchBranch(branch.id)}
            className={`flex items-center gap-2 ${
              currentBranch.id === branch.id ? 'bg-sidebar-accent' : ''
            }`}
          >
            <MapPin className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="font-medium">{branch.name}</span>
              {branch.address && (
                <span className="text-xs text-muted-foreground">{branch.address}</span>
              )}
            </div>
            {currentBranch.id === branch.id && (
              <Badge variant="secondary" className="ml-auto text-xs">
                Current
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}