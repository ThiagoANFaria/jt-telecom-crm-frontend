import { supabase } from '@/integrations/supabase/client';
import { systemLogsService } from './systemLogs';

export interface TenantData {
  id: string;
  name: string;
  domain?: string;
  status: 'trial' | 'active' | 'suspended' | 'inactive';
  plan: 'basic' | 'professional' | 'enterprise';
  max_users: number;
  current_users: number;
  admin_user_id?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  settings: any;
}

export interface SystemMetrics {
  total_tenants: number;
  active_tenants: number;
  trial_tenants: number;
  total_users: number;
  total_revenue: number;
  system_health: 'excellent' | 'good' | 'warning' | 'critical';
  uptime: number;
}

export interface UserData {
  id: string;
  name?: string;
  email?: string;
  user_level: string;
  tenant_id?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

class MasterPanelService {
  async getTenants(): Promise<TenantData[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Verificar se o usuário é master
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_level')
      .eq('id', user.id)
      .single();

    if (profile?.user_level !== 'master') {
      throw new Error('Acesso negado: apenas usuários master podem acessar');
    }

    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getTenant(id: string): Promise<TenantData | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createTenant(tenant: {
    name: string;
    domain?: string;
    plan: 'basic' | 'professional' | 'enterprise';
    admin_email: string;
    admin_password: string;
  }): Promise<TenantData> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Verificar se o usuário é master
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_level')
      .eq('id', user.id)
      .single();

    if (profile?.user_level !== 'master') {
      throw new Error('Acesso negado: apenas usuários master podem criar tenants');
    }

    // Criar usuário admin do tenant usando signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: tenant.admin_email,
      password: tenant.admin_password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: {
          name: 'Administrador',
          user_level: 'admin'
        }
      }
    });

    if (authError) throw authError;
    
    const adminUserId = authData.user?.id;
    if (!adminUserId) throw new Error('Falha ao criar usuário administrador');

    // Criar tenant
    const { data, error } = await supabase
      .from('tenants')
      .insert({
        name: tenant.name,
        domain: tenant.domain,
        plan: tenant.plan,
        admin_user_id: adminUserId,
        status: 'trial',
        max_users: this.getMaxUsersByPlan(tenant.plan),
        current_users: 1,
        settings: this.getDefaultSettings(tenant.plan)
      })
      .select()
      .single();

    if (error) throw error;

    // Log da criação
    try {
      await systemLogsService.logCreate('tenant', data.id, {
        name: tenant.name,
        plan: tenant.plan,
        admin_email: tenant.admin_email
      });
    } catch (logError) {
      console.error('Erro ao registrar log:', logError);
      // Não falhar a criação do tenant por causa do log
    }

    return data;
  }

  async updateTenant(id: string, updates: Partial<TenantData>): Promise<TenantData> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const oldData = await this.getTenant(id);

    const { data, error } = await supabase
      .from('tenants')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log da atualização
    await systemLogsService.logUpdate('tenant', id, oldData, data);

    return data;
  }

  async deleteTenant(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const tenantData = await this.getTenant(id);
    if (!tenantData) throw new Error('Tenant não encontrado');

    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log da exclusão
    await systemLogsService.logDelete('tenant', id, tenantData);
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const tenants = await this.getTenants();
    const users = await this.getUsers();

    const total_tenants = tenants.length;
    const active_tenants = tenants.filter(t => t.status === 'active').length;
    const trial_tenants = tenants.filter(t => t.status === 'trial').length;
    const total_users = users.length;

    // Calcular receita baseada nos planos
    const total_revenue = tenants.reduce((sum, tenant) => {
      if (tenant.status === 'active') {
        switch (tenant.plan) {
          case 'basic': return sum + 199;
          case 'professional': return sum + 299;
          case 'enterprise': return sum + 499;
          default: return sum;
        }
      }
      return sum;
    }, 0);

    // Determinar saúde do sistema
    let system_health: SystemMetrics['system_health'] = 'excellent';
    if (active_tenants < total_tenants * 0.9) system_health = 'good';
    if (active_tenants < total_tenants * 0.7) system_health = 'warning';
    if (active_tenants < total_tenants * 0.5) system_health = 'critical';

    return {
      total_tenants,
      active_tenants,
      trial_tenants,
      total_users,
      total_revenue,
      system_health,
      uptime: 99.9 // Simulado
    };
  }

  async getUsers(): Promise<UserData[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateUserRole(userId: string, role: 'user' | 'admin' | 'master', tenantId?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Atualizar perfil do usuário
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ user_level: role })
      .eq('id', userId);

    if (profileError) throw profileError;

    // Criar/atualizar role específica
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: role,
        tenant_id: tenantId,
        granted_by: user.id
      }, {
        onConflict: 'user_id,role,tenant_id'
      });

    if (roleError) throw roleError;

    // Log da atualização
    await systemLogsService.logUpdate('user_role', userId, null, { role, tenant_id: tenantId });
  }

  async suspendTenant(id: string, reason?: string): Promise<void> {
    await this.updateTenant(id, { 
      status: 'suspended'
    });

    await systemLogsService.logAction('suspend', 'tenant', id, null, { reason });
  }

  async activateTenant(id: string): Promise<void> {
    await this.updateTenant(id, { 
      status: 'active'
    });

    await systemLogsService.logAction('activate', 'tenant', id);
  }

  async getTenantStats(tenantId: string): Promise<{
    users_count: number;
    leads_count: number;
    clients_count: number;
    contracts_count: number;
    storage_used: number;
  }> {
    // Simular estatísticas do tenant
    // Em produção, isso seria uma consulta real ao banco
    return {
      users_count: Math.floor(Math.random() * 20) + 1,
      leads_count: Math.floor(Math.random() * 500) + 50,
      clients_count: Math.floor(Math.random() * 200) + 20,
      contracts_count: Math.floor(Math.random() * 100) + 10,
      storage_used: Math.floor(Math.random() * 1000) + 100 // MB
    };
  }

  async exportTenantData(tenantId: string): Promise<string> {
    const tenant = await this.getTenant(tenantId);
    const stats = await this.getTenantStats(tenantId);

    if (!tenant) throw new Error('Tenant não encontrado');

    const exportData = {
      tenant_info: tenant,
      statistics: stats,
      export_date: new Date().toISOString()
    };

    return JSON.stringify(exportData, null, 2);
  }

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    services: Array<{
      name: string;
      status: 'online' | 'offline' | 'degraded';
      response_time?: number;
    }>;
    last_check: string;
  }> {
    // Simular verificação de saúde do sistema
    const services = [
      { name: 'Database', status: 'online' as const, response_time: 25 },
      { name: 'Authentication', status: 'online' as const, response_time: 15 },
      { name: 'Storage', status: 'online' as const, response_time: 45 },
      { name: 'Email Service', status: 'online' as const, response_time: 120 },
      { name: 'Webhooks', status: 'degraded' as const, response_time: 300 }
    ];

    const hasOffline = services.some(s => s.status === 'offline' as any);
    const hasDegraded = services.some(s => s.status === 'degraded');

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (hasOffline) status = 'critical';
    else if (hasDegraded) status = 'warning';

    return {
      status,
      services,
      last_check: new Date().toISOString()
    };
  }

  private getMaxUsersByPlan(plan: string): number {
    switch (plan) {
      case 'basic': return 5;
      case 'professional': return 25;
      case 'enterprise': return 100;
      default: return 5;
    }
  }

  private getDefaultSettings(plan: string) {
    const baseSettings = {
      max_leads: 1000,
      max_clients: 500,
      custom_branding: false,
      integrations_enabled: ['email']
    };

    switch (plan) {
      case 'professional':
        return {
          ...baseSettings,
          max_leads: 5000,
          max_clients: 2000,
          integrations_enabled: ['email', 'whatsapp', 'api']
        };
      case 'enterprise':
        return {
          ...baseSettings,
          max_leads: 50000,
          max_clients: 10000,
          custom_branding: true,
          integrations_enabled: ['email', 'whatsapp', 'api', 'webhook', 'smartbot']
        };
      default:
        return baseSettings;
    }
  }

  // Monitoramento em tempo real
  subscribeToTenantChanges(callback: (payload: any) => void) {
    return supabase
      .channel('tenant_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tenants'
      }, callback)
      .subscribe();
  }
}

export const masterPanelService = new MasterPanelService();