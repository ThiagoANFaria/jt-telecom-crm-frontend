import { supabase } from '@/integrations/supabase/client';

/**
 * Serviço seguro de verificação de roles usando funções RPC do servidor
 * Nunca confie apenas em verificações client-side para autorização
 */

export const roleVerificationService = {
  /**
   * Verifica se o usuário atual é Master usando função RPC segura
   */
  async isMaster(userId?: string): Promise<boolean> {
    try {
      const id = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!id) return false;

      const { data, error } = await supabase.rpc('is_master', { _user_id: id });
      
      if (error) {
        console.error('Erro ao verificar role master:', error);
        return false;
      }
      
      return data === true;
    } catch (error) {
      console.error('Erro ao verificar role master:', error);
      return false;
    }
  },

  /**
   * Verifica se o usuário é admin de um tenant específico
   */
  async isTenantAdmin(userId?: string, tenantId?: string): Promise<boolean> {
    try {
      const id = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!id) return false;

      const { data, error } = await supabase.rpc('is_tenant_admin', { 
        _user_id: id,
        _tenant_id: tenantId || null
      });
      
      if (error) {
        console.error('Erro ao verificar role admin:', error);
        return false;
      }
      
      return data === true;
    } catch (error) {
      console.error('Erro ao verificar role admin:', error);
      return false;
    }
  },

  /**
   * Verifica se o usuário possui uma role específica
   */
  async hasRole(role: 'master' | 'admin' | 'user', userId?: string): Promise<boolean> {
    try {
      const id = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!id) return false;

      const { data, error } = await supabase.rpc('has_role', { 
        _user_id: id,
        _role: role
      });
      
      if (error) {
        console.error(`Erro ao verificar role ${role}:`, error);
        return false;
      }
      
      return data === true;
    } catch (error) {
      console.error(`Erro ao verificar role ${role}:`, error);
      return false;
    }
  },

  /**
   * Obtém todas as roles do usuário
   */
  async getUserRoles(userId?: string): Promise<string[]> {
    try {
      const id = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!id) return [];

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', id);
      
      if (error) {
        console.error('Erro ao buscar roles do usuário:', error);
        return [];
      }
      
      return data?.map(r => r.role) || [];
    } catch (error) {
      console.error('Erro ao buscar roles do usuário:', error);
      return [];
    }
  }
};
