import { supabase } from '@/integrations/supabase/client';
import type { Client } from '@/types';

export class ClientsService {
  
  // Buscar todos os clientes do usuário
  async getClients(userId: string): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar clientes:', error);
        throw error;
      }

      return data?.map(client => ({
        ...client,
        createdAt: new Date(client.created_at),
        payment_status: client.payment_status as Client['payment_status']
      })) || [];
    } catch (error) {
      console.error('Erro no serviço de clientes:', error);
      throw error;
    }
  }

  // Criar novo cliente
  async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'created_at' | 'updated_at'>, userId: string): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          user_id: userId,
          status: clientData.status || 'Ativo',
          payment_status: clientData.payment_status || 'em_dia'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar cliente:', error);
        throw error;
      }

      return {
        ...data,
        createdAt: new Date(data.created_at),
        payment_status: data.payment_status as Client['payment_status']
      };
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  // Atualizar cliente
  async updateClient(clientId: string, updates: Partial<Client>, userId: string): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar cliente:', error);
        throw error;
      }

      return {
        ...data,
        createdAt: new Date(data.created_at),
        payment_status: data.payment_status as Client['payment_status']
      };
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  }

  // Deletar cliente
  async deleteClient(clientId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao deletar cliente:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  }

  // Buscar clientes com filtros
  async searchClients(searchTerm: string, userId: string, filters?: any): Promise<Client[]> {
    try {
      let query = supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.payment_status && filters.payment_status !== 'all') {
        query = query.eq('payment_status', filters.payment_status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar clientes:', error);
        throw error;
      }

      return data?.map(client => ({
        ...client,
        createdAt: new Date(client.created_at),
        payment_status: client.payment_status as Client['payment_status']
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  }

  // Obter estatísticas de clientes
  async getClientsStats(userId: string): Promise<any> {
    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('status, payment_status, monthly_value, annual_value, contract_start, created_at')
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
      }

      const total = clients?.length || 0;
      const ativos = clients?.filter(c => c.status === 'Ativo').length || 0;
      const inativos = clients?.filter(c => c.status === 'Inativo').length || 0;
      
      const emDia = clients?.filter(c => c.payment_status === 'em_dia').length || 0;
      const emAtraso = clients?.filter(c => c.payment_status === 'em_atraso').length || 0;
      const pendente = clients?.filter(c => c.payment_status === 'pendente').length || 0;

      const receitaMensal = clients?.reduce((sum, client) => 
        sum + (client.monthly_value || 0), 0) || 0;
      
      const receitaAnual = clients?.reduce((sum, client) => 
        sum + (client.annual_value || 0), 0) || 0;

      // Clientes do mês atual
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const clientesDoMes = clients?.filter(client => 
        new Date(client.created_at) >= inicioMes
      ).length || 0;

      return {
        total,
        ativos,
        inativos,
        emDia,
        emAtraso,
        pendente,
        receitaMensal,
        receitaAnual,
        clientesDoMes,
        porStatus: {
          ativo: ativos,
          inativo: inativos
        },
        porPagamento: {
          em_dia: emDia,
          em_atraso: emAtraso,
          pendente: pendente
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  // Buscar cliente por ID
  async getClientById(clientId: string, userId: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar cliente:', error);
        throw error;
      }

      if (!data) return null;

      return {
        ...data,
        createdAt: new Date(data.created_at),
        payment_status: data.payment_status as Client['payment_status']
      };
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }
  }

  // Buscar clientes por status de pagamento
  async getClientsByPaymentStatus(paymentStatus: string, userId: string): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .eq('payment_status', paymentStatus)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar clientes por status de pagamento:', error);
        throw error;
      }

      return data?.map(client => ({
        ...client,
        createdAt: new Date(client.created_at),
        payment_status: client.payment_status as Client['payment_status']
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar clientes por status de pagamento:', error);
      throw error;
    }
  }

  // Buscar clientes por valor de contrato
  async getClientsByContractValue(minValue: number, maxValue: number, userId: string): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .gte('contract_value', minValue)
        .lte('contract_value', maxValue)
        .order('contract_value', { ascending: false });

      if (error) {
        console.error('Erro ao buscar clientes por valor:', error);
        throw error;
      }

      return data?.map(client => ({
        ...client,
        createdAt: new Date(client.created_at),
        payment_status: client.payment_status as Client['payment_status']
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar clientes por valor:', error);
      throw error;
    }
  }

  // Atualizar status de pagamento
  async updatePaymentStatus(clientId: string, paymentStatus: Client['payment_status'], userId: string): Promise<void> {
    try {
      await this.updateClient(clientId, { payment_status: paymentStatus }, userId);
    } catch (error) {
      console.error('Erro ao atualizar status de pagamento:', error);
      throw error;
    }
  }

  // Buscar histórico de interações (propostas e contratos relacionados)
  async getClientHistory(clientId: string, userId: string): Promise<any> {
    try {
      // Buscar propostas do cliente
      const { data: proposals, error: proposalsError } = await supabase
        .from('proposals')
        .select('*')
        .eq('client_id', clientId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Buscar contratos do cliente
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('*')
        .eq('client_id', clientId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (proposalsError || contractsError) {
        console.error('Erro ao buscar histórico:', proposalsError || contractsError);
        throw proposalsError || contractsError;
      }

      return {
        proposals: proposals || [],
        contracts: contracts || [],
        totalProposals: proposals?.length || 0,
        totalContracts: contracts?.length || 0
      };
    } catch (error) {
      console.error('Erro ao buscar histórico do cliente:', error);
      throw error;
    }
  }
}

export const clientsService = new ClientsService();