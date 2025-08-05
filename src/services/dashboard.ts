import { supabase } from '@/integrations/supabase/client';

export interface DashboardMetrics {
  total_leads: number;
  total_clients: number;
  total_proposals: number;
  total_contracts: number;
  revenue_this_month: number;
  conversion_rate: number;
  leads_this_month: number;
  clients_this_month: number;
  proposals_this_month: number;
  contracts_this_month: number;
}

export const dashboardService = {
  async getDashboardSummary(): Promise<DashboardMetrics> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Buscar totais
    const [
      { count: totalLeads },
      { count: totalClients },
      { count: totalProposals },
      { count: totalContracts },
      { count: leadsThisMonth },
      { count: clientsThisMonth },
      { count: proposalsThisMonth },
      { count: contractsThisMonth }
    ] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('proposals').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('contracts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('leads').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString()),
      supabase.from('clients').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString()),
      supabase.from('proposals').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString()),
      supabase.from('contracts').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())
    ]);

    // Calcular receita do mês
    const { data: contractsWithValue } = await supabase
      .from('contracts')
      .select('amount')
      .eq('user_id', user.id)
      .eq('status', 'ativo')
      .gte('created_at', startOfMonth.toISOString());

    const revenueThisMonth = contractsWithValue?.reduce((sum, contract) => 
      sum + (Number(contract.amount) || 0), 0) || 0;

    // Calcular taxa de conversão
    const conversionRate = totalLeads > 0 ? (totalClients / totalLeads) * 100 : 0;

    return {
      total_leads: totalLeads || 0,
      total_clients: totalClients || 0,
      total_proposals: totalProposals || 0,
      total_contracts: totalContracts || 0,
      revenue_this_month: revenueThisMonth,
      conversion_rate: conversionRate,
      leads_this_month: leadsThisMonth || 0,
      clients_this_month: clientsThisMonth || 0,
      proposals_this_month: proposalsThisMonth || 0,
      contracts_this_month: contractsThisMonth || 0
    };
  }
};