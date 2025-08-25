import { ReactNode } from 'react';
import { usePermissions, Permission, Role } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX } from 'lucide-react';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  role?: Role;
  roles?: Role[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showError?: boolean;
}

export function PermissionGuard({
  children,
  permission,
  permissions = [],
  role,
  roles = [],
  requireAll = false,
  fallback,
  showError = true,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole } = usePermissions();

  // Build permission array
  const allPermissions = [
    ...(permission ? [permission] : []),
    ...permissions,
  ];

  // Build roles array
  const allRoles = [
    ...(role ? [role] : []),
    ...roles,
  ];

  // Check permissions
  let hasPermissionAccess = true;
  if (allPermissions.length > 0) {
    hasPermissionAccess = requireAll 
      ? hasAllPermissions(allPermissions)
      : hasAnyPermission(allPermissions);
  }

  // Check roles
  let hasRoleAccess = true;
  if (allRoles.length > 0) {
    hasRoleAccess = allRoles.some(r => hasRole(r));
  }

  // Grant access if both checks pass
  const hasAccess = hasPermissionAccess && hasRoleAccess;

  if (hasAccess) {
    return <>{children}</>;
  }

  // Return fallback or error message
  if (fallback) {
    return <>{fallback}</>;
  }

  if (showError) {
    return (
      <Alert className="border-destructive/20 bg-destructive/5">
        <ShieldX className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-destructive">
          You don't have permission to access this feature. Contact your administrator if you believe this is an error.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

// Convenience components for common use cases
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard roles={['super_admin', 'admin']} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function MedicalStaffOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard roles={['doctor', 'nurse', 'radiologist', 'lab_technician']} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function FinancialStaffOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard roles={['accountant', 'cashier', 'admin', 'super_admin']} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}