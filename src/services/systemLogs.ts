import { supabase } from '@/integrations/supabase/client';

export interface SystemLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_data?: any;
  new_data?: any;
  ip_address?: any;
  user_agent?: string;
  created_at: string;
}

export interface LogFilter {
  user_id?: string;
  action?: string;
  resource_type?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
}

export interface LogStats {
  total_logs: number;
  actions_count: Record<string, number>;
  resources_count: Record<string, number>;
  users_activity: Record<string, number>;
  daily_activity: Array<{ date: string; count: number }>;
}

class SystemLogsService {
  async getLogs(filter: LogFilter = {}): Promise<SystemLog[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Verificar se o usuário tem permissão para visualizar logs
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_level')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false });

    // Se não for master, só pode ver seus próprios logs
    if (profile?.user_level !== 'master') {
      query = query.eq('user_id', user.id);
    }

    if (filter.user_id && profile?.user_level === 'master') {
      query = query.eq('user_id', filter.user_id);
    }

    if (filter.action) {
      query = query.eq('action', filter.action);
    }

    if (filter.resource_type) {
      query = query.eq('resource_type', filter.resource_type);
    }

    if (filter.date_from) {
      query = query.gte('created_at', filter.date_from);
    }

    if (filter.date_to) {
      query = query.lte('created_at', filter.date_to);
    }

    query = query.limit(filter.limit || 100);

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async createLog(log: Omit<SystemLog, 'id' | 'created_at'>): Promise<SystemLog> {
    const { data, error } = await supabase
      .from('system_logs')
      .insert({
        ...log,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async logAction(
    action: string,
    resourceType: string,
    resourceId?: string,
    oldData?: any,
    newData?: any
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await this.createLog({
        user_id: user?.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        old_data: oldData,
        new_data: newData,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      });
    } catch (error) {
      // Log de sistema não deve quebrar a aplicação
      console.error('Erro ao criar log do sistema:', error);
    }
  }

  async getLogStats(dateFrom?: string, dateTo?: string): Promise<LogStats> {
    const filter: LogFilter = { limit: 10000 };
    if (dateFrom) filter.date_from = dateFrom;
    if (dateTo) filter.date_to = dateTo;

    const logs = await this.getLogs(filter);

    // Contagem de ações
    const actions_count = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Contagem de recursos
    const resources_count = logs.reduce((acc, log) => {
      acc[log.resource_type] = (acc[log.resource_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Atividade por usuário
    const users_activity = logs.reduce((acc, log) => {
      if (log.user_id) {
        acc[log.user_id] = (acc[log.user_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Atividade diária
    const daily_activity = this.groupLogsByDay(logs);

    return {
      total_logs: logs.length,
      actions_count,
      resources_count,
      users_activity,
      daily_activity
    };
  }

  async getRecentActivity(limit: number = 20): Promise<SystemLog[]> {
    return this.getLogs({ limit });
  }

  async getUserActivity(userId: string, limit: number = 50): Promise<SystemLog[]> {
    return this.getLogs({ user_id: userId, limit });
  }

  async getResourceActivity(resourceType: string, resourceId: string): Promise<SystemLog[]> {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async searchLogs(searchTerm: string, limit: number = 100): Promise<SystemLog[]> {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .or(`action.ilike.%${searchTerm}%,resource_type.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async exportLogs(filter: LogFilter = {}): Promise<string> {
    const logs = await this.getLogs(filter);
    
    // Converter logs para CSV
    const headers = ['Data/Hora', 'Usuário', 'Ação', 'Recurso', 'IP', 'User Agent'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        new Date(log.created_at).toLocaleString('pt-BR'),
        log.user_id || 'Sistema',
        log.action,
        `${log.resource_type}${log.resource_id ? `:${log.resource_id}` : ''}`,
        log.ip_address || 'N/A',
        log.user_agent || 'N/A'
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  async deleteOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { data, error } = await supabase
      .from('system_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select('id');

    if (error) throw error;
    return data?.length || 0;
  }

  private groupLogsByDay(logs: SystemLog[]): Array<{ date: string; count: number }> {
    const grouped = logs.reduce((acc, log) => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  // Métodos para ações específicas
  async logLogin(userId: string): Promise<void> {
    await this.logAction('login', 'auth', userId);
  }

  async logLogout(userId: string): Promise<void> {
    await this.logAction('logout', 'auth', userId);
  }

  async logCreate(resourceType: string, resourceId: string, data: any): Promise<void> {
    await this.logAction('create', resourceType, resourceId, null, data);
  }

  async logUpdate(resourceType: string, resourceId: string, oldData: any, newData: any): Promise<void> {
    await this.logAction('update', resourceType, resourceId, oldData, newData);
  }

  async logDelete(resourceType: string, resourceId: string, data: any): Promise<void> {
    await this.logAction('delete', resourceType, resourceId, data, null);
  }

  async logView(resourceType: string, resourceId: string): Promise<void> {
    await this.logAction('view', resourceType, resourceId);
  }

  // Monitoramento em tempo real
  subscribeToLogs(callback: (payload: any) => void) {
    return supabase
      .channel('system_logs')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'system_logs'
      }, callback)
      .subscribe();
  }
}

export const systemLogsService = new SystemLogsService();