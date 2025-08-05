import { supabase } from '@/integrations/supabase/client';

export interface SystemHealth {
  database: {
    status: 'healthy' | 'degraded' | 'down';
    latency: number;
    connections: number;
    last_check: string;
  };
  api: {
    status: 'healthy' | 'degraded' | 'down';
    response_time: number;
    last_check: string;
  };
  storage: {
    status: 'healthy' | 'degraded' | 'down';
    usage_percentage: number;
    available_space: string;
  };
}

export interface SystemInfo {
  version: string;
  environment: 'development' | 'staging' | 'production';
  uptime: string;
  build_date: string;
  git_commit: string;
  node_version: string;
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface SystemMetrics {
  health: SystemHealth;
  info: SystemInfo;
  alerts: SystemAlert[];
  performance: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    active_sessions: number;
  };
}

class SystemService {
  // Verificar saúde do sistema
  async getSystemHealth(): Promise<SystemHealth> {
    const start = Date.now();
    
    try {
      // Teste de conectividade com o banco
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      const dbLatency = Date.now() - start;
      const dbStatus = error ? 'down' : dbLatency > 2000 ? 'degraded' : 'healthy';
      
      // Simular métricas de conexão (em um ambiente real, isso viria do backend)
      const connections = Math.floor(Math.random() * 50) + 10;
      
      return {
        database: {
          status: dbStatus,
          latency: dbLatency,
          connections,
          last_check: new Date().toISOString()
        },
        api: {
          status: 'healthy',
          response_time: dbLatency,
          last_check: new Date().toISOString()
        },
        storage: {
          status: 'healthy',
          usage_percentage: Math.floor(Math.random() * 30) + 20,
          available_space: '85.2 GB'
        }
      };
    } catch (error) {
      return {
        database: {
          status: 'down',
          latency: -1,
          connections: 0,
          last_check: new Date().toISOString()
        },
        api: {
          status: 'down',
          response_time: -1,
          last_check: new Date().toISOString()
        },
        storage: {
          status: 'down',
          usage_percentage: 0,
          available_space: 'N/A'
        }
      };
    }
  }

  // Obter informações do sistema
  async getSystemInfo(): Promise<SystemInfo> {
    // Em um ambiente real, essas informações viriam do backend
    return {
      version: '2.1.0',
      environment: 'production',
      uptime: this.formatUptime(Date.now() - (Date.now() - 7 * 24 * 60 * 60 * 1000)),
      build_date: '2024-01-15T10:30:00Z',
      git_commit: 'a3f2b1c',
      node_version: '18.17.0'
    };
  }

  // Obter alertas do sistema
  async getSystemAlerts(): Promise<SystemAlert[]> {
    // Buscar logs de sistema que possam ser considerados alertas
    const { data: logs, error } = await supabase
      .from('system_logs')
      .select('*')
      .eq('resource_type', 'system')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Converter logs em alertas
    const alerts: SystemAlert[] = logs?.map(log => ({
      id: log.id,
      type: this.getAlertType(log.action),
      title: `Sistema: ${log.action}`,
      message: `Ação realizada: ${log.action}`,
      timestamp: log.created_at,
      resolved: true
    })) || [];

    // Adicionar alguns alertas simulados para demonstração
    const simulatedAlerts: SystemAlert[] = [
      {
        id: 'alert-1',
        type: 'info',
        title: 'Sistema atualizado',
        message: 'Sistema atualizado para versão 2.1.0 com sucesso',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        resolved: true
      },
      {
        id: 'alert-2',
        type: 'warning',
        title: 'Alto uso de memória',
        message: 'Uso de memória atingiu 85% - monitoramento ativo',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        resolved: false
      }
    ];

    return [...alerts, ...simulatedAlerts];
  }

  // Obter métricas de performance
  async getPerformanceMetrics() {
    // Simular métricas de performance
    return {
      cpu_usage: Math.floor(Math.random() * 40) + 20,
      memory_usage: Math.floor(Math.random() * 30) + 50,
      disk_usage: Math.floor(Math.random() * 20) + 30,
      active_sessions: Math.floor(Math.random() * 100) + 50
    };
  }

  // Obter todas as métricas do sistema
  async getSystemMetrics(): Promise<SystemMetrics> {
    const [health, info, alerts, performance] = await Promise.all([
      this.getSystemHealth(),
      this.getSystemInfo(),
      this.getSystemAlerts(),
      this.getPerformanceMetrics()
    ]);

    return {
      health,
      info,
      alerts,
      performance
    };
  }

  // Verificar se o usuário é admin
  async isUserAdmin(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_level')
      .eq('id', user.id)
      .single();

    return profile?.user_level === 'admin' || profile?.user_level === 'master';
  }

  // Funções auxiliares
  private formatUptime(ms: number): string {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${days}d ${hours}h ${minutes}m`;
  }

  private getAlertType(action: string): 'error' | 'warning' | 'info' {
    if (action.includes('error') || action.includes('failed')) return 'error';
    if (action.includes('warning') || action.includes('high')) return 'warning';
    return 'info';
  }

  // Registrar evento de sistema
  async logSystemEvent(action: string, details?: any) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('system_logs')
      .insert({
        action,
        resource_type: 'system',
        user_id: user?.id,
        new_data: details,
        ip_address: '127.0.0.1' // Em produção, capturar IP real
      });

    if (error) throw error;
  }
}

export const systemService = new SystemService();