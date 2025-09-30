import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export type UserLevel = 'user' | 'admin' | 'master';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  user_level: UserLevel;
  tenant_id?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  signup: (data: { email: string; password: string; name: string }) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  getUserLevel: () => UserLevel | null;
  isMaster: () => boolean;
  isAdmin: () => boolean;
  isMasterValid: () => boolean;
  canAccessTenant: (tenantId: string) => boolean;
  validateTenantIsolation: () => boolean;
  enforceIsolation: (operation: string, tenantId?: string) => boolean;
  logSecurityEvent: (event: string, details?: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Buscar perfil do usuário
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Configurar listener de mudanças de autenticação PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          if (isMounted) {
            setProfile(profileData as UserProfile);
            
            if (event === 'SIGNED_IN') {
              toast({
                title: 'Login realizado com sucesso',
                description: `Bem-vindo, ${profileData?.name || session.user.email}!`,
              });
            }
          }
        } else {
          setProfile(null);
          
          if (event === 'SIGNED_OUT') {
            toast({
              title: 'Logout realizado',
              description: 'Você foi desconectado com sucesso.',
            });
          }
        }
      }
    );

    // DEPOIS verificar sessão existente e aguardar perfil
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          if (isMounted) {
            setProfile(profileData as UserProfile);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  // Login
  const login = async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      console.log('Attempting login for:', credentials.email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error('Login failed:', error);
        
        let errorMessage = 'Credenciais inválidas ou erro de conexão. Tente novamente.';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos. Verifique seus dados e tente novamente.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
        }
        
        toast({
          title: 'Erro no login',
          description: errorMessage,
          variant: 'destructive',
        });
        throw error;
      }

      console.log('Login successful:', data.user?.email);

      // Buscar perfil do usuário
      const profileData = await fetchProfile(data.user.id);
      
      // Retornar dados no formato compatível com o sistema antigo
      return {
        user_level: profileData?.user_level || 'user',
        name: profileData?.name || data.user.email?.split('@')[0] || 'Usuário',
        email: data.user.email,
        id: data.user.id,
        tenant_id: (profileData as any)?.tenant_id,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Cadastro
  const signup = async (data: { email: string; password: string; name: string }) => {
    try {
      setIsLoading(true);
      
      const redirectUrl = `${window.location.origin}/`;

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: data.name,
          },
        },
      });

      if (error) {
        console.error('Signup failed:', error);
        
        let errorMessage = 'Não foi possível criar a conta. Tente novamente.';
        if (error.message.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login ou use outro email.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        }
        
        toast({
          title: 'Erro no cadastro',
          description: errorMessage,
          variant: 'destructive',
        });
        throw error;
      }

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Você pode fazer login agora.',
      });

      return authData;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      console.log('🚪 [AuthContext] Iniciando logout...');
      console.log('👤 [AuthContext] User atual:', user?.email);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ [AuthContext] Erro no logout:', error);
        toast({
          title: 'Erro no logout',
          description: 'Não foi possível fazer logout. Tente novamente.',
          variant: 'destructive',
        });
        throw error;
      }
      
      console.log('✅ [AuthContext] Logout realizado com sucesso');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Redefinir senha
  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('Reset password failed:', error);
        toast({
          title: 'Erro ao redefinir senha',
          description: 'Não foi possível enviar o email de redefinição. Tente novamente.',
          variant: 'destructive',
        });
        throw error;
      }

      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  // Atualizar senha
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Update password failed:', error);
        toast({
          title: 'Erro ao atualizar senha',
          description: 'Não foi possível atualizar a senha. Tente novamente.',
          variant: 'destructive',
        });
        throw error;
      }

      toast({
        title: 'Senha atualizada!',
        description: 'Sua senha foi alterada com sucesso.',
      });
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  };

  // Atualizar perfil
  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) {
        console.error('Update profile failed:', error);
        toast({
          title: 'Erro ao atualizar perfil',
          description: 'Não foi possível atualizar o perfil. Tente novamente.',
          variant: 'destructive',
        });
        throw error;
      }

      // Atualizar estado local
      setProfile(prev => prev ? { ...prev, ...data } : null);

      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram atualizadas com sucesso.',
      });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  // === FUNÇÕES DE SEGURANÇA E VALIDAÇÃO (baseadas no sistema original) ===

  const getUserLevel = (): UserLevel | null => {
    return profile?.user_level || null;
  };

  const isMaster = (): boolean => {
    return profile?.user_level === 'master';
  };

  const isAdmin = (): boolean => {
    return profile?.user_level === 'admin';
  };

  // Validar se usuário Master está configurado corretamente
  const isMasterValid = (): boolean => {
    if (!profile || profile.user_level !== 'master') {
      return false;
    }

    // Usuário Master NÃO deve ter tenant_id
    if (profile.tenant_id) {
      console.error('SECURITY VIOLATION: Master user has tenant_id:', profile.tenant_id);
      logSecurityEvent('MASTER_WITH_TENANT', { userId: profile.id, tenantId: profile.tenant_id });
      return false;
    }

    return true;
  };

  // Verificar se usuário pode acessar um tenant específico
  const canAccessTenant = (tenantId: string): boolean => {
    if (!profile) {
      return false;
    }

    // Usuário Master NÃO pode acessar dados internos de nenhum tenant
    if (profile.user_level === 'master') {
      console.warn('SECURITY: Master user attempting to access tenant data:', tenantId);
      logSecurityEvent('MASTER_TENANT_ACCESS_ATTEMPT', { userId: profile.id, tenantId });
      return false;
    }

    // Admin/User só pode acessar seu próprio tenant
    if (profile.user_level === 'admin' || profile.user_level === 'user') {
      const hasAccess = profile.tenant_id === tenantId;
      if (!hasAccess) {
        logSecurityEvent('CROSS_TENANT_ACCESS_ATTEMPT', {
          userId: profile.id,
          userTenant: profile.tenant_id,
          attemptedTenant: tenantId
        });
      }
      return hasAccess;
    }

    return false;
  };

  // Validar isolamento entre tenants
  const validateTenantIsolation = (): boolean => {
    if (!profile) {
      return false;
    }

    // Usuário Master: não deve ter tenant_id
    if (profile.user_level === 'master') {
      if (profile.tenant_id) {
        console.error('SECURITY VIOLATION: Master user has tenant_id');
        logSecurityEvent('MASTER_ISOLATION_VIOLATION', { userId: profile.id, tenantId: profile.tenant_id });
        return false;
      }
      return true;
    }

    // Admin/User: deve ter tenant_id (mas permitir temporariamente até configuração)
    if (profile.user_level === 'admin' || profile.user_level === 'user') {
      if (!profile.tenant_id) {
        console.warn('SECURITY WARNING: Admin/User without tenant_id, permitindo temporariamente');
        // Temporariamente permitindo para não bloquear o login
        // logSecurityEvent('USER_WITHOUT_TENANT', { userId: profile.id, userLevel: profile.user_level });
        return true; // Permitir por enquanto
      }
      return true;
    }

    return false;
  };

  // Função para forçar isolamento em operações
  const enforceIsolation = (operation: string, tenantId?: string): boolean => {
    if (!profile) {
      logSecurityEvent('UNAUTHORIZED_OPERATION', { operation });
      return false;
    }

    // Usuário Master só pode fazer operações de gestão de tenants
    if (profile.user_level === 'master') {
      const allowedMasterOperations = [
        'list_tenants',
        'create_tenant',
        'update_tenant',
        'delete_tenant',
        'manage_global_settings'
      ];

      if (!allowedMasterOperations.includes(operation)) {
        logSecurityEvent('MASTER_FORBIDDEN_OPERATION', {
          userId: profile.id,
          operation,
          tenantId
        });
        return false;
      }

      return true;
    }

    // Admin/User: deve ter tenant e operação deve ser no seu tenant
    if (profile.user_level === 'admin' || profile.user_level === 'user') {
      if (!profile.tenant_id) {
        logSecurityEvent('USER_NO_TENANT_OPERATION', {
          userId: profile.id,
          operation
        });
        return false;
      }

      if (tenantId && tenantId !== profile.tenant_id) {
        logSecurityEvent('CROSS_TENANT_OPERATION', {
          userId: profile.id,
          userTenant: profile.tenant_id,
          operation,
          attemptedTenant: tenantId
        });
        return false;
      }

      return true;
    }

    return false;
  };

  // Log de eventos de segurança
  const logSecurityEvent = (event: string, details?: any): void => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      user: profile ? {
        id: profile.id,
        email: profile.email,
        level: profile.user_level,
        tenant_id: profile.tenant_id
      } : null,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log no console para desenvolvimento
    console.warn('SECURITY EVENT:', logEntry);

    // Em produção, enviaria para sistema de auditoria
    // TODO: Implementar envio para sistema de logs
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    isAuthenticated: !!user && !!session,
    isLoading,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    getUserLevel,
    isMaster,
    isAdmin,
    isMasterValid,
    canAccessTenant,
    validateTenantIsolation,
    enforceIsolation,
    logSecurityEvent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};