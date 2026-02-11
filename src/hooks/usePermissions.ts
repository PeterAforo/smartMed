import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';

export type Permission = 
  | 'patients:read' | 'patients:write' | 'patients:delete'
  | 'appointments:read' | 'appointments:write' | 'appointments:delete'
  | 'billing:read' | 'billing:write'
  | 'reports:read' | 'reports:generate'
  | 'settings:read' | 'settings:write'
  | 'users:read' | 'users:write' | 'users:delete'
  | 'admin:all';

export type Role = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'cashier' | 'lab_tech' | 'pharmacist' | 'radiologist' | 'manager';

// Permission constants for components
export const PERMISSIONS = {
  PATIENTS_VIEW: 'patients:read' as Permission,
  PATIENTS_EDIT: 'patients:write' as Permission,
  PATIENTS_DELETE: 'patients:delete' as Permission,
  APPOINTMENTS_VIEW: 'appointments:read' as Permission,
  APPOINTMENTS_EDIT: 'appointments:write' as Permission,
  APPOINTMENTS_DELETE: 'appointments:delete' as Permission,
  FINANCIAL_VIEW: 'billing:read' as Permission,
  FINANCIAL_EDIT: 'billing:write' as Permission,
  REPORTS_VIEW: 'reports:read' as Permission,
  REPORTS_GENERATE: 'reports:generate' as Permission,
  SYSTEM_SETTINGS: 'settings:read' as Permission,
  SYSTEM_SETTINGS_EDIT: 'settings:write' as Permission,
  USER_MANAGEMENT: 'users:read' as Permission,
  USER_MANAGEMENT_EDIT: 'users:write' as Permission,
  USER_MANAGEMENT_DELETE: 'users:delete' as Permission,
  ADMIN: 'admin:all' as Permission,
};

const rolePermissions: Record<string, Permission[]> = {
  admin: ['admin:all', 'patients:read', 'patients:write', 'patients:delete', 
          'appointments:read', 'appointments:write', 'appointments:delete',
          'billing:read', 'billing:write', 'reports:read', 'reports:generate',
          'settings:read', 'settings:write', 'users:read', 'users:write', 'users:delete'],
  doctor: ['patients:read', 'patients:write', 'appointments:read', 'appointments:write',
           'reports:read'],
  nurse: ['patients:read', 'appointments:read', 'appointments:write'],
  receptionist: ['patients:read', 'patients:write', 'appointments:read', 'appointments:write'],
  cashier: ['patients:read', 'billing:read', 'billing:write'],
  lab_tech: ['patients:read', 'reports:read'],
  pharmacist: ['patients:read'],
  radiologist: ['patients:read', 'reports:read'],
  manager: ['patients:read', 'appointments:read', 'billing:read', 'reports:read', 'reports:generate']
};

export const usePermissions = () => {
  const { user, hasRole } = useAuth();

  const permissions = useMemo(() => {
    if (!user) return [];
    
    const userRoles = user.roles || [];
    const allPermissions = new Set<Permission>();
    
    userRoles.forEach(role => {
      const perms = rolePermissions[role] || [];
      perms.forEach(p => allPermissions.add(p));
    });
    
    return Array.from(allPermissions);
  }, [user]);

  const hasPermission = (permission: Permission): boolean => {
    if (permissions.includes('admin:all')) return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (perms: Permission[]): boolean => {
    return perms.some(p => hasPermission(p));
  };

  const hasAllPermissions = (perms: Permission[]): boolean => {
    return perms.every(p => hasPermission(p));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isAdmin: hasRole('admin'),
    isDoctor: hasRole('doctor'),
    isNurse: hasRole('nurse')
  };
};
