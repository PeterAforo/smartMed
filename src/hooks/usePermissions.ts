import { useAuth } from '@/hooks/useAuth';

// Define comprehensive role hierarchy 
export const ROLES = {
  // Administrative roles
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  
  // Medical roles
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  PHARMACIST: 'pharmacist',
  RADIOLOGIST: 'radiologist',
  LAB_TECHNICIAN: 'lab_technician',
  
  // Support roles
  RECEPTIONIST: 'receptionist',
  CASHIER: 'cashier',
  ACCOUNTANT: 'accountant',
  HR_OFFICER: 'hr_officer',
  
  // Basic roles
  STAFF: 'staff',
  VIEWER: 'viewer',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Define permissions for each module
export const PERMISSIONS = {
  // Patient management
  PATIENTS_VIEW: 'patients:view',
  PATIENTS_CREATE: 'patients:create',
  PATIENTS_EDIT: 'patients:edit',
  PATIENTS_DELETE: 'patients:delete',
  
  // Appointments
  APPOINTMENTS_VIEW: 'appointments:view',
  APPOINTMENTS_CREATE: 'appointments:create',
  APPOINTMENTS_EDIT: 'appointments:edit',
  APPOINTMENTS_DELETE: 'appointments:delete',
  
  // Medical records
  MEDICAL_RECORDS_VIEW: 'medical_records:view',
  MEDICAL_RECORDS_CREATE: 'medical_records:create',
  MEDICAL_RECORDS_EDIT: 'medical_records:edit',
  
  // Laboratory
  LAB_RESULTS_VIEW: 'lab_results:view',
  LAB_RESULTS_CREATE: 'lab_results:create',
  LAB_RESULTS_APPROVE: 'lab_results:approve',
  
  // Pharmacy
  PHARMACY_VIEW: 'pharmacy:view',
  PHARMACY_DISPENSE: 'pharmacy:dispense',
  PHARMACY_MANAGE: 'pharmacy:manage',
  
  // Financial
  FINANCIAL_VIEW: 'financial:view',
  FINANCIAL_MANAGE: 'financial:manage',
  BILLING_CREATE: 'billing:create',
  BILLING_PROCESS: 'billing:process',
  
  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_FINANCIAL: 'reports:financial',
  REPORTS_CLINICAL: 'reports:clinical',
  
  // System administration
  SYSTEM_SETTINGS: 'system:settings',
  USER_MANAGEMENT: 'users:manage',
  BRANCH_MANAGEMENT: 'branches:manage',
  ROLE_MANAGEMENT: 'roles:manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role-permission mapping
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  
  [ROLES.ADMIN]: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.PATIENTS_CREATE,
    PERMISSIONS.PATIENTS_EDIT,
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_EDIT,
    PERMISSIONS.MEDICAL_RECORDS_VIEW,
    PERMISSIONS.LAB_RESULTS_VIEW,
    PERMISSIONS.PHARMACY_VIEW,
    PERMISSIONS.FINANCIAL_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_FINANCIAL,
    PERMISSIONS.REPORTS_CLINICAL,
    PERMISSIONS.USER_MANAGEMENT,
    PERMISSIONS.SYSTEM_SETTINGS,
  ],
  
  [ROLES.MANAGER]: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.PATIENTS_CREATE,
    PERMISSIONS.PATIENTS_EDIT,
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_EDIT,
    PERMISSIONS.MEDICAL_RECORDS_VIEW,
    PERMISSIONS.LAB_RESULTS_VIEW,
    PERMISSIONS.PHARMACY_VIEW,
    PERMISSIONS.FINANCIAL_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_FINANCIAL,
    PERMISSIONS.REPORTS_CLINICAL,
  ],
  
  [ROLES.DOCTOR]: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.PATIENTS_CREATE,
    PERMISSIONS.PATIENTS_EDIT,
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_EDIT,
    PERMISSIONS.MEDICAL_RECORDS_VIEW,
    PERMISSIONS.MEDICAL_RECORDS_CREATE,
    PERMISSIONS.MEDICAL_RECORDS_EDIT,
    PERMISSIONS.LAB_RESULTS_VIEW,
    PERMISSIONS.LAB_RESULTS_CREATE,
    PERMISSIONS.PHARMACY_VIEW,
    PERMISSIONS.REPORTS_CLINICAL,
  ],
  
  [ROLES.NURSE]: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.PATIENTS_CREATE,
    PERMISSIONS.PATIENTS_EDIT,
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.MEDICAL_RECORDS_VIEW,
    PERMISSIONS.LAB_RESULTS_VIEW,
    PERMISSIONS.PHARMACY_VIEW,
  ],
  
  [ROLES.PHARMACIST]: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.PHARMACY_VIEW,
    PERMISSIONS.PHARMACY_DISPENSE,
    PERMISSIONS.PHARMACY_MANAGE,
  ],
  
  [ROLES.RADIOLOGIST]: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.MEDICAL_RECORDS_VIEW,
    PERMISSIONS.LAB_RESULTS_VIEW,
    PERMISSIONS.LAB_RESULTS_CREATE,
    PERMISSIONS.LAB_RESULTS_APPROVE,
  ],
  
  [ROLES.LAB_TECHNICIAN]: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.LAB_RESULTS_VIEW,
    PERMISSIONS.LAB_RESULTS_CREATE,
  ],
  
  [ROLES.RECEPTIONIST]: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.PATIENTS_CREATE,
    PERMISSIONS.PATIENTS_EDIT,
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_EDIT,
  ],
  
  [ROLES.CASHIER]: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.FINANCIAL_VIEW,
    PERMISSIONS.BILLING_CREATE,
    PERMISSIONS.BILLING_PROCESS,
  ],
  
  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.FINANCIAL_VIEW,
    PERMISSIONS.FINANCIAL_MANAGE,
    PERMISSIONS.BILLING_CREATE,
    PERMISSIONS.BILLING_PROCESS,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_FINANCIAL,
  ],
  
  [ROLES.HR_OFFICER]: [
    PERMISSIONS.USER_MANAGEMENT,
    PERMISSIONS.REPORTS_VIEW,
  ],
  
  [ROLES.STAFF]: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_VIEW,
  ],
  
  [ROLES.VIEWER]: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ],
};

export function usePermissions() {
  const { hasRole } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    // Check if user has any role that grants this permission
    for (const [role, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      if (hasRole(role) && permissions.includes(permission)) {
        return true;
      }
    }
    return false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const canAccessModule = (module: string): boolean => {
    const modulePermissions = Object.values(PERMISSIONS).filter(permission => 
      permission.startsWith(module.toLowerCase())
    );
    return hasAnyPermission(modulePermissions);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessModule,
    hasRole,
  };
}