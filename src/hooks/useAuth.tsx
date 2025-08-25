import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Tenant {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface Branch {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  tenant_id: string;
  employee_id?: string;
  department?: string;
  phone?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  tenant: Tenant | null;
  branches: Branch[];
  currentBranch: Branch | null;
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
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [hasCrossBranchAccess, setHasCrossBranchAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const cleanupAuthState = () => {
    // Clear localStorage items
    localStorage.removeItem('nchs_auth');
    localStorage.removeItem('nchs_user');
    
    // Remove all Supabase auth keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          // Defer data fetching to prevent potential deadlocks
          setTimeout(() => {
            loadUserData(session.user.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          // Clear all user data
          setProfile(null);
          setTenant(null);
          setBranches([]);
          setCurrentBranch(null);
          setUserRoles([]);
          setHasCrossBranchAccess(false);
          cleanupAuthState();
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Login Successful",
          description: "Welcome to SmartMed!",
        });
        
        // Force page reload for clean state
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      }

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

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      if (error) throw error;

      toast({
        title: "Registration Successful",
        description: "Please check your email to confirm your account.",
      });

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const switchBranch = async (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    if (branch) {
      setCurrentBranch(branch);
      localStorage.setItem('currentBranchId', branchId);
    }
  };

  const hasRole = (role: string) => {
    return userRoles.includes(role);
  };

  const signOut = async () => {
    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignore errors
      }
      
      // Force page reload for clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Force reload anyway
      window.location.href = '/';
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load tenant
      if (profileData.tenant_id) {
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', profileData.tenant_id)
          .single();

        if (tenantError) throw tenantError;
        setTenant(tenantData);

        // Load branches for this tenant
        const { data: branchesData, error: branchesError } = await supabase
          .from('branches')
          .select('*')
          .eq('tenant_id', profileData.tenant_id)
          .eq('is_active', true);

        if (branchesError) throw branchesError;
        setBranches(branchesData || []);

        // Load user's accessible branches
        const { data: userBranchesData, error: userBranchesError } = await supabase
          .from('user_branches')
          .select('branch_id, is_primary, branches(*)')
          .eq('user_id', userId);

        if (userBranchesError) throw userBranchesError;

        // Set current branch (primary branch or from localStorage)
        const savedBranchId = localStorage.getItem('currentBranchId');
        const primaryBranch = userBranchesData?.find(ub => ub.is_primary)?.branches;
        const savedBranch = savedBranchId ? branchesData?.find(b => b.id === savedBranchId) : null;
        
        setCurrentBranch(savedBranch || primaryBranch || branchesData?.[0] || null);

        // Load user roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        if (rolesError) throw rolesError;
        setUserRoles(rolesData?.map(r => r.role) || []);

        // Check cross-branch access
        const { data: crossBranchData, error: crossBranchError } = await supabase
          .rpc('has_cross_branch_access');

        if (!crossBranchError) {
          setHasCrossBranchAccess(crossBranchData || false);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const value = {
    user,
    session,
    profile,
    tenant,
    branches,
    currentBranch,
    loading,
    signIn,
    signUp,
    signOut,
    switchBranch,
    hasRole,
    hasCrossBranchAccess
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};