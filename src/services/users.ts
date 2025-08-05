import { supabase } from '@/integrations/supabase/client';

// Tipos baseados no sistema original
export type UserLevel = 'user' | 'admin' | 'master';
export type TenantStatus = 'active' | 'inactive' | 'suspended' | 'trial';
export type TenantPlan = 'basic' | 'professional' | 'enterprise';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  company_name?: string;
  user_level: UserLevel;
  tenant_id?: string;
  avatar_url?: string;
  last_login?: string;
  is_active: boolean;
  permissions?: string[];
  created_at: string;
  updated_at: string;
}

export interface TenantUser extends UserProfile {
  tenant_name?: string;
  roles?: UserRole[];
}

export interface MasterUser extends UserProfile {
  user_level: 'master';
}

export interface UserRole {
  id: string;
  user_id: string;
  role: UserLevel;
  tenant_id?: string;
  granted_by?: string;
  granted_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  status: TenantStatus;
  plan: TenantPlan;
  max_users: number;
  current_users: number;
  admin_user_id?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  settings: {
    max_leads: number;
    max_clients: number;
    integrations_enabled: string[];
    custom_branding: boolean;
  };
  admin_user?: UserProfile;
}

export const userService = {
  // === CRUD DE USUÁRIOS ===

  // Buscar todos os usuários (apenas Master pode ver todos)
  async getAllUsers(): Promise<TenantUser[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          tenants!profiles_tenant_id_fkey(name),
          user_roles!user_roles_user_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(profile => ({
        ...profile,
        tenant_name: profile.tenants?.name,
        roles: profile.user_roles || [],
      })) as TenantUser[];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  },

  // Buscar usuários do tenant (Admin pode ver usuários do seu tenant)
  async getTenantUsers(tenantId?: string): Promise<TenantUser[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('profiles')
        .select(`
          *,
          tenants!profiles_tenant_id_fkey(name),
          user_roles!user_roles_user_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(profile => ({
        ...profile,
        tenant_name: profile.tenants?.name,
        roles: profile.user_roles || [],
      })) as TenantUser[];
    } catch (error) {
      console.error('Erro ao buscar usuários do tenant:', error);
      throw error;
    }
  },

  // Buscar usuário por ID
  async getUserById(id: string): Promise<TenantUser | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          tenants!profiles_tenant_id_fkey(name),
          user_roles!user_roles_user_id_fkey(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        tenant_name: data.tenants?.name,
        roles: data.user_roles || [],
      } as TenantUser;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  },

  // Criar novo usuário
  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    user_level: UserLevel;
    tenant_id?: string;
    company_name?: string;
    permissions?: string[];
  }): Promise<TenantUser> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      // Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.name,
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Falha ao criar usuário');

      // Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          user_level: userData.user_level,
          tenant_id: userData.tenant_id,
          company_name: userData.company_name,
          permissions: userData.permissions || [],
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // Criar role
      if (userData.user_level !== 'user') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: userData.user_level,
            tenant_id: userData.tenant_id,
            granted_by: user.user.id,
          });

        if (roleError) throw roleError;
      }

      // Buscar usuário criado
      const createdUser = await this.getUserById(authData.user.id);
      if (!createdUser) throw new Error('Usuário criado não encontrado');

      // Atualizar contador de usuários do tenant
      if (userData.tenant_id) {
        await this.updateTenantUserCount(userData.tenant_id);
      }

      return createdUser;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  },

  // Atualizar usuário
  async updateUser(id: string, userData: Partial<UserProfile>): Promise<TenantUser> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const updateData = {
        ...userData,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Atualizar role se necessário
      if (userData.user_level) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: id,
            role: userData.user_level,
            tenant_id: userData.tenant_id,
            granted_by: user.user.id,
          });

        if (roleError) throw roleError;
      }

      const updatedUser = await this.getUserById(id);
      if (!updatedUser) throw new Error('Usuário atualizado não encontrado');

      return updatedUser;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  },

  // Deletar usuário
  async deleteUser(id: string): Promise<void> {
    try {
      // Deletar do Auth (cascade deletará perfil e roles)
      const { error } = await supabase.auth.admin.deleteUser(id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  },

  // Ativar/Desativar usuário
  async toggleUserStatus(id: string, isActive: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      throw error;
    }
  },

  // === GESTÃO DE ROLES E PERMISSÕES ===

  // Buscar roles do usuário
  async getUserRoles(userId: string): Promise<UserRole[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar roles do usuário:', error);
      throw error;
    }
  },

  // Adicionar role ao usuário
  async addUserRole(userId: string, role: UserLevel, tenantId?: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          tenant_id: tenantId,
          granted_by: user.user.id,
        });

      if (error) throw error;

      // Atualizar user_level no perfil
      await supabase
        .from('profiles')
        .update({ user_level: role })
        .eq('id', userId);
    } catch (error) {
      console.error('Erro ao adicionar role:', error);
      throw error;
    }
  },

  // Remover role do usuário
  async removeUserRole(userId: string, role: UserLevel, tenantId?: string): Promise<void> {
    try {
      let query = supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { error } = await query;

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao remover role:', error);
      throw error;
    }
  },

  // === GESTÃO DE TENANTS ===

  // Buscar todos os tenants (apenas Master)
  async getTenants(): Promise<Tenant[]> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          profiles!tenants_admin_user_id_fkey(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(tenant => ({
        ...tenant,
        admin_user: tenant.profiles,
        settings: tenant.settings as any,
      })) as unknown as Tenant[];
    } catch (error) {
      console.error('Erro ao buscar tenants:', error);
      throw error;
    }
  },

  // Buscar tenant por ID
  async getTenantById(id: string): Promise<Tenant | null> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          profiles!tenants_admin_user_id_fkey(id, name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        admin_user: data.profiles,
        settings: data.settings as any,
      } as unknown as Tenant;
    } catch (error) {
      console.error('Erro ao buscar tenant:', error);
      throw error;
    }
  },

  // Criar novo tenant
  async createTenant(tenantData: {
    name: string;
    domain?: string;
    plan: TenantPlan;
    max_users: number;
    admin_email: string;
    admin_name: string;
    admin_password: string;
    settings?: any;
  }): Promise<Tenant> {
    try {
      // Criar usuário admin primeiro
      const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
        email: tenantData.admin_email,
        password: tenantData.admin_password,
        email_confirm: true,
        user_metadata: {
          full_name: tenantData.admin_name,
        }
      });

      if (adminError) throw adminError;
      if (!adminUser.user) throw new Error('Falha ao criar admin');

      // Criar tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: tenantData.name,
          domain: tenantData.domain,
          plan: tenantData.plan,
          max_users: tenantData.max_users,
          admin_user_id: adminUser.user.id,
          current_users: 1,
          settings: tenantData.settings || {
            max_leads: 1000,
            max_clients: 500,
            integrations_enabled: [],
            custom_branding: false,
          },
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Atualizar perfil do admin
      await supabase
        .from('profiles')
        .update({
          name: tenantData.admin_name,
          user_level: 'admin',
          tenant_id: tenant.id,
        })
        .eq('id', adminUser.user.id);

      const createdTenant = await this.getTenantById(tenant.id);
      if (!createdTenant) throw new Error('Tenant criado não encontrado');

      return createdTenant;
    } catch (error) {
      console.error('Erro ao criar tenant:', error);
      throw error;
    }
  },

  // Atualizar tenant
  async updateTenant(id: string, tenantData: Partial<Tenant>): Promise<Tenant> {
    try {
      const updateData = {
        ...tenantData,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('tenants')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      const updatedTenant = await this.getTenantById(id);
      if (!updatedTenant) throw new Error('Tenant atualizado não encontrado');

      return updatedTenant;
    } catch (error) {
      console.error('Erro ao atualizar tenant:', error);
      throw error;
    }
  },

  // Deletar tenant
  async deleteTenant(id: string): Promise<void> {
    try {
      // Deletar usuários do tenant primeiro
      const users = await this.getTenantUsers(id);
      for (const user of users) {
        await this.deleteUser(user.id);
      }

      // Deletar tenant
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar tenant:', error);
      throw error;
    }
  },

  // Atualizar contador de usuários do tenant
  async updateTenantUserCount(tenantId: string): Promise<void> {
    try {
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      if (countError) throw countError;

      const { error } = await supabase
        .from('tenants')
        .update({ current_users: count || 0 })
        .eq('id', tenantId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar contador de usuários:', error);
      throw error;
    }
  },

  // === VALIDAÇÕES E VERIFICAÇÕES ===

  // Verificar se usuário pode gerenciar outro usuário
  async canManageUser(managerUserId: string, targetUserId: string): Promise<boolean> {
    try {
      const manager = await this.getUserById(managerUserId);
      const target = await this.getUserById(targetUserId);

      if (!manager || !target) return false;

      // Master pode gerenciar qualquer usuário
      if (manager.user_level === 'master') return true;

      // Admin pode gerenciar usuários do mesmo tenant (exceto outros admins)
      if (manager.user_level === 'admin' && manager.tenant_id === target.tenant_id) {
        return target.user_level === 'user';
      }

      // Usuário pode apenas gerenciar a si mesmo
      return managerUserId === targetUserId;
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
  },

  // Verificar limites do tenant
  async checkTenantLimits(tenantId: string): Promise<{
    canAddUser: boolean;
    currentUsers: number;
    maxUsers: number;
  }> {
    try {
      const tenant = await this.getTenantById(tenantId);
      if (!tenant) throw new Error('Tenant não encontrado');

      return {
        canAddUser: tenant.current_users < tenant.max_users,
        currentUsers: tenant.current_users,
        maxUsers: tenant.max_users,
      };
    } catch (error) {
      console.error('Erro ao verificar limites do tenant:', error);
      return {
        canAddUser: false,
        currentUsers: 0,
        maxUsers: 0,
      };
    }
  },

  // === FILTROS E BUSCA ===

  // Buscar usuários com filtros
  async searchUsers(filters: {
    searchTerm?: string;
    tenantId?: string;
    userLevel?: UserLevel;
    isActive?: boolean;
  }): Promise<TenantUser[]> {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          tenants!profiles_tenant_id_fkey(name),
          user_roles!user_roles_user_id_fkey(*)
        `);

      if (filters.searchTerm) {
        query = query.or(`name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%`);
      }

      if (filters.tenantId) {
        query = query.eq('tenant_id', filters.tenantId);
      }

      if (filters.userLevel) {
        query = query.eq('user_level', filters.userLevel);
      }

      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(profile => ({
        ...profile,
        tenant_name: profile.tenants?.name,
        roles: profile.user_roles || [],
      })) as TenantUser[];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  },

  // === ESTATÍSTICAS ===

  // Obter estatísticas de usuários
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    masterUsers: number;
    byTenant: { [tenantId: string]: number };
  }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_level, tenant_id, is_active');

      if (error) throw error;

      const stats = {
        totalUsers: data.length,
        activeUsers: data.filter(u => u.is_active).length,
        adminUsers: data.filter(u => u.user_level === 'admin').length,
        masterUsers: data.filter(u => u.user_level === 'master').length,
        byTenant: {} as { [tenantId: string]: number },
      };

      // Contar por tenant
      data.forEach(user => {
        if (user.tenant_id) {
          stats.byTenant[user.tenant_id] = (stats.byTenant[user.tenant_id] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  },
};