import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  employee_id: string | null;
  department: string | null;
  phone: string | null;
  avatar_url: string | null;
  roles: string[];
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: { token: string } | null;
  profile: User | null;
  tenant: null;
  branches: never[];
  currentBranch: null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: { 
    first_name: string; 
    last_name: string; 
    employee_id?: string;
    tenant_id?: string;
    branch_id?: string;
  }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  switchBranch: (branchId: string) => Promise<void>;
  hasRole: (role: string) => boolean;
  hasCrossBranchAccess: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const cleanupAuthState = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('nchs_auth');
    localStorage.removeItem('nchs_user');
  };

  useEffect(() => {
    // Check for existing token on mount
    const token = api.getToken();
    if (token) {
      api.getMe()
        .then(({ user }) => {
          setUser(user);
        })
        .catch(() => {
          // Token invalid, clear it
          api.setToken(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      cleanupAuthState();
      
      const { user } = await api.signIn(email, password);
      setUser(user);

      toast({
        title: "Login Successful",
        description: "Welcome to Crystal Health Nexus!",
      });
      
      // Navigate to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: { 
    first_name: string; 
    last_name: string; 
    employee_id?: string;
    tenant_id?: string;
    branch_id?: string;
  }) => {
    try {
      cleanupAuthState();

      const { user } = await api.signUp({
        email,
        password,
        firstName: userData.first_name,
        lastName: userData.last_name,
        employeeId: userData.employee_id,
      });
      
      setUser(user);

      toast({
        title: "Registration Successful",
        description: "Your account has been created.",
      });

      // Navigate to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const switchBranch = async (branchId: string) => {
    // Not implemented for single-tenant setup
    console.log('Branch switching not implemented:', branchId);
  };

  const hasRole = (role: string) => {
    return user?.roles?.includes(role) || false;
  };

  const signOut = async () => {
    try {
      await api.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      cleanupAuthState();
      setUser(null);
      window.location.href = '/';
    }
  };

  const value: AuthContextType = {
    user,
    session: user ? { token: api.getToken()! } : null,
    profile: user,
    tenant: null,
    branches: [],
    currentBranch: null,
    loading,
    signIn,
    signUp,
    signOut,
    switchBranch,
    hasRole,
    hasCrossBranchAccess: false
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
