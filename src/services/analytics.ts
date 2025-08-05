import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  tenant_id: string;
  kpis: {
    total_leads: number;
    total_clients: number;
    total_proposals: number;
    total_contracts: number;
    conversion_rate: number;
    monthly_revenue: number;
    active_deals: number;
    completed_tasks: number;
  };
  funil_vendas: {
    etapas: Array<{
      nome: string;
      quantidade: number;
      percentual_conversao: number;
      tempo_medio_dias: number;
      cor: string;
    }>;
  };
  origem_leads: Array<{
    canal: string;
    quantidade: number;
    percentual: number;
    conversao: number;
  }>;
  tendencias: {
    leads_por_mes: Array<{
      mes: string;
      quantidade: number;
      conversoes: number;
    }>;
    revenue_por_mes: Array<{
      mes: string;
      valor: number;
    }>;
  };
  performance_usuarios: Array<{
    usuario: string;
    leads: number;
    conversoes: number;
    revenue: number;
  }>;
  timestamp: string;
}

export interface FilterOptions {
  period?: number; // dias
  start_date?: string;
  end_date?: string;
  user_id?: string;
  source?: string;
}

class AnalyticsService {
  // KPIs principais
  async getKPIs(filters: FilterOptions = {}): Promise<AnalyticsData['kpis']> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { period = 30 } = filters;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // Total de leads
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, created_at, status')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString());

    if (leadsError) throw leadsError;

    // Total de clientes
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString());

    if (clientsError) throw clientsError;

    // Total de propostas
    const { data: proposals, error: proposalsError } = await supabase
      .from('proposals')
      .select('id, created_at, status, total_amount')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString());

    if (proposalsError) throw proposalsError;

    // Total de contratos
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('id, created_at, status, amount')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString());

    if (contractsError) throw contractsError;

    // Deals ativos
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('id, value')
      .eq('user_id', user.id);

    if (dealsError) throw dealsError;

    // Tasks completadas
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'concluida')
      .gte('created_at', startDate.toISOString());

    if (tasksError) throw tasksError;

    const totalLeads = leads?.length || 0;
    const totalClients = clients?.length || 0;
    const conversionRate = totalLeads > 0 ? (totalClients / totalLeads) * 100 : 0;
    const monthlyRevenue = contracts?.reduce((sum, contract) => sum + (Number(contract.amount) || 0), 0) || 0;

    return {
      total_leads: totalLeads,
      total_clients: totalClients,
      total_proposals: proposals?.length || 0,
      total_contracts: contracts?.length || 0,
      conversion_rate: conversionRate,
      monthly_revenue: monthlyRevenue,
      active_deals: deals?.length || 0,
      completed_tasks: tasks?.length || 0,
    };
  }

  // Funil de vendas
  async getFunilVendas(filters: FilterOptions = {}): Promise<AnalyticsData['funil_vendas']> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { period = 30 } = filters;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // Buscar pipelines e stages do usuário
    const { data: pipelines, error: pipelinesError } = await supabase
      .from('pipelines')
      .select(`
        id,
        name,
        pipeline_stages (
          id,
          name,
          position,
          color
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (pipelinesError) throw pipelinesError;

    // Buscar deals por stage
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('id, stage_id, created_at, updated_at')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString());

    if (dealsError) throw dealsError;

    // Montar funil
    const etapas = [];
    const allStages = pipelines?.flatMap(p => p.pipeline_stages) || [];
    
    for (const stage of allStages.sort((a, b) => a.position - b.position)) {
      const stageDeals = deals?.filter(d => d.stage_id === stage.id) || [];
      const quantidade = stageDeals.length;
      
      // Calcular tempo médio na etapa (simplificado)
      const tempoMedio = stageDeals.length > 0 
        ? stageDeals.reduce((acc, deal) => {
            const created = new Date(deal.created_at);
            const updated = new Date(deal.updated_at);
            return acc + (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / stageDeals.length
        : 0;

      etapas.push({
        nome: stage.name,
        quantidade,
        percentual_conversao: quantidade > 0 ? (quantidade / (deals?.length || 1)) * 100 : 0,
        tempo_medio_dias: Math.round(tempoMedio),
        cor: stage.color || '#3B82F6'
      });
    }

    return { etapas };
  }

  // Origem de leads
  async getOrigemLeads(filters: FilterOptions = {}): Promise<AnalyticsData['origem_leads']> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { period = 30 } = filters;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const { data: leads, error } = await supabase
      .from('leads')
      .select('source, status')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    // Agrupar por source
    const groupedBySource = leads?.reduce((acc, lead) => {
      const source = lead.source || 'Não informado';
      if (!acc[source]) {
        acc[source] = { total: 0, converted: 0 };
      }
      acc[source].total++;
      if (lead.status === 'Convertido' || lead.status === 'Cliente') {
        acc[source].converted++;
      }
      return acc;
    }, {} as Record<string, { total: number; converted: number }>) || {};

    const total = leads?.length || 0;
    
    return Object.entries(groupedBySource).map(([canal, data]) => ({
      canal,
      quantidade: data.total,
      percentual: total > 0 ? (data.total / total) * 100 : 0,
      conversao: data.total > 0 ? (data.converted / data.total) * 100 : 0
    }));
  }

  // Tendências mensais
  async getTendencias(filters: FilterOptions = {}): Promise<AnalyticsData['tendencias']> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { period = 30 } = filters;
    const months = Math.ceil(period / 30);
    
    // Buscar leads dos últimos meses
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('created_at, status')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString());

    if (leadsError) throw leadsError;

    // Buscar contratos para revenue
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('created_at, amount')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString());

    if (contractsError) throw contractsError;

    // Agrupar por mês
    const leadsPorMes = [];
    const revenuePorMes = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

      const monthLeads = leads?.filter(l => l.created_at.startsWith(monthKey)) || [];
      const monthConversions = monthLeads.filter(l => l.status === 'Convertido' || l.status === 'Cliente');
      const monthContracts = contracts?.filter(c => c.created_at.startsWith(monthKey)) || [];
      
      leadsPorMes.push({
        mes: monthName,
        quantidade: monthLeads.length,
        conversoes: monthConversions.length
      });

      revenuePorMes.push({
        mes: monthName,
        valor: monthContracts.reduce((sum, contract) => sum + (Number(contract.amount) || 0), 0)
      });
    }

    return { leads_por_mes: leadsPorMes, revenue_por_mes: revenuePorMes };
  }

  // Performance por usuário (para casos multi-tenant)
  async getPerformanceUsuarios(filters: FilterOptions = {}): Promise<AnalyticsData['performance_usuarios']> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', user.id)
      .single();

    const kpis = await this.getKPIs(filters);
    
    return [{
      usuario: profile?.name || profile?.email || 'Usuário',
      leads: kpis.total_leads,
      conversoes: kpis.total_clients,
      revenue: kpis.monthly_revenue
    }];
  }

  // Método principal que combina todos os dados
  async getAnalyticsData(filters: FilterOptions = {}): Promise<AnalyticsData> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    const [kpis, funilVendas, origemLeads, tendencias, performanceUsuarios] = await Promise.all([
      this.getKPIs(filters),
      this.getFunilVendas(filters),
      this.getOrigemLeads(filters),
      this.getTendencias(filters),
      this.getPerformanceUsuarios(filters)
    ]);

    return {
      tenant_id: profile?.tenant_id || 'default',
      kpis,
      funil_vendas: funilVendas,
      origem_leads: origemLeads,
      tendencias,
      performance_usuarios: performanceUsuarios,
      timestamp: new Date().toISOString()
    };
  }

  // Exportar dados para relatórios
  async exportAnalyticsData(filters: FilterOptions = {}, format: 'json' | 'csv' = 'json') {
    const data = await this.getAnalyticsData(filters);
    
    if (format === 'json') {
      return data;
    } else if (format === 'csv') {
      // Converter para CSV (implementação simplificada)
      const csv = [
        'Métrica,Valor',
        `Total de Leads,${data.kpis.total_leads}`,
        `Total de Clientes,${data.kpis.total_clients}`,
        `Taxa de Conversão,${data.kpis.conversion_rate.toFixed(2)}%`,
        `Revenue Mensal,${data.kpis.monthly_revenue}`,
        `Deals Ativos,${data.kpis.active_deals}`,
        `Tasks Completadas,${data.kpis.completed_tasks}`
      ].join('\n');
      
      return csv;
    }
  }
}

export const analyticsService = new AnalyticsService();