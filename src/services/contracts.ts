import { supabase } from '@/integrations/supabase/client';
import { Contract, Client, Lead } from '@/types';

// Interface para aditivos contratuais
interface ContractAddendum {
  id: string;
  contract_id: string;
  type: 'amendment' | 'extension' | 'value_change' | 'scope_change';
  title: string;
  description: string;
  old_value?: number;
  new_value?: number;
  old_end_date?: string;
  new_end_date?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'active' | 'rejected';
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

// Interface para renovações
interface ContractRenewal {
  id: string;
  contract_id: string;
  original_end_date: string;
  new_end_date: string;
  renewal_terms: string;
  automatic_renewal: boolean;
  notification_sent: boolean;
  status: 'pending' | 'approved' | 'executed' | 'declined';
  created_at: string;
  executed_at?: string;
}

// Interface para assinatura digital
interface DigitalSignature {
  id: string;
  contract_id: string;
  d4sign_document_id?: string;
  d4sign_document_key?: string;
  signer_name: string;
  signer_email: string;
  signer_cpf?: string;
  status: 'pending' | 'sent' | 'signed' | 'refused' | 'expired';
  sent_at?: string;
  signed_at?: string;
  signature_url?: string;
  certificate_url?: string;
}

// Interface para histórico de status
interface ContractStatusHistory {
  id: string;
  contract_id: string;
  old_status: string;
  new_status: string;
  reason: string;
  changed_by: string;
  changed_at: string;
}

export const contractService = {
  // === CRUD BÁSICO DE CONTRATOS ===
  
  // Buscar todos os contratos do usuário
  async getContracts(): Promise<Contract[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          clients!contracts_client_id_fkey(name, email, phone, company, cnpj_cpf),
          leads!contracts_lead_id_fkey(name, email, phone, company, cnpj_cpf)
        `)
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(contract => ({
        ...contract,
        client_name: contract.clients?.name || contract.leads?.name || contract.client_name,
        client_email: contract.clients?.email || contract.leads?.email || contract.client_email,
        client_phone: contract.clients?.phone || contract.leads?.phone || contract.client_phone,
        status: contract.status as 'pendente' | 'ativo' | 'concluido' | 'cancelado' | 'active',
      })) as Contract[];
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      throw error;
    }
  },

  // Buscar contrato por ID
  async getContractById(id: string): Promise<Contract | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          clients!contracts_client_id_fkey(name, email, phone, company, cnpj_cpf, address),
          leads!contracts_lead_id_fkey(name, email, phone, company, cnpj_cpf, address)
        `)
        .eq('id', id)
        .eq('user_id', user.user.id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        client_name: data.clients?.name || data.leads?.name || data.client_name,
        client_email: data.clients?.email || data.leads?.email || data.client_email,
        client_phone: data.clients?.phone || data.leads?.phone || data.client_phone,
        status: data.status as 'pendente' | 'ativo' | 'concluido' | 'cancelado' | 'active',
      } as Contract;
    } catch (error) {
      console.error('Erro ao buscar contrato:', error);
      throw error;
    }
  },

  // Criar novo contrato
  async createContract(contractData: Omit<Contract, 'id' | 'created_at' | 'updated_at'>): Promise<Contract> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const newContract = {
        ...contractData,
        user_id: user.user.id,
        status: contractData.status || 'pendente',
      };

      const { data, error } = await supabase
        .from('contracts')
        .insert(newContract)
        .select()
        .single();

      if (error) throw error;

      // Registrar no histórico de status
      await this.addStatusHistory(data.id, '', 'pendente', 'Contrato criado', user.user.id);

      return {
        ...data,
        status: data.status as 'pendente' | 'ativo' | 'concluido' | 'cancelado' | 'active',
      } as Contract;
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      throw error;
    }
  },

  // Atualizar contrato
  async updateContract(id: string, contractData: Partial<Contract>): Promise<Contract> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      // Buscar status atual para histórico
      const currentContract = await this.getContractById(id);
      const oldStatus = currentContract?.status || '';

      const updateData = {
        ...contractData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('contracts')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error) throw error;

      // Registrar mudança de status se houve alteração
      if (contractData.status && contractData.status !== oldStatus) {
        await this.addStatusHistory(id, oldStatus, contractData.status, 'Status atualizado', user.user.id);
      }

      return {
        ...data,
        status: data.status as 'pendente' | 'ativo' | 'concluido' | 'cancelado' | 'active',
      } as Contract;
    } catch (error) {
      console.error('Erro ao atualizar contrato:', error);
      throw error;
    }
  },

  // Deletar contrato
  async deleteContract(id: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar contrato:', error);
      throw error;
    }
  },

  // === SISTEMA DE ASSINATURA DIGITAL ===

  // Enviar contrato para assinatura no D4Sign
  async sendToD4Sign(contractId: string, signerData: {
    name: string;
    email: string;
    cpf?: string;
  }): Promise<{ d4sign_document_id: string; signature_url: string }> {
    try {
      // Por enquanto retorna mock até implementarmos a integração real
      const mockD4SignResponse = {
        d4sign_document_id: `d4_${Date.now()}`,
        signature_url: `https://secure.d4sign.com.br/sign/${Date.now()}`,
      };

      // Atualizar contrato com ID do D4Sign
      await this.updateContract(contractId, {
        d4sign_document_id: mockD4SignResponse.d4sign_document_id,
        status: 'pendente',
      });

      // Registrar na tabela de assinaturas digitais (mock por enquanto)
      console.log('Enviando para D4Sign:', {
        contract_id: contractId,
        d4sign_document_id: mockD4SignResponse.d4sign_document_id,
        signer_name: signerData.name,
        signer_email: signerData.email,
        signer_cpf: signerData.cpf,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });

      return mockD4SignResponse;
    } catch (error) {
      console.error('Erro ao enviar para D4Sign:', error);
      throw error;
    }
  },

  // Verificar status da assinatura no D4Sign
  async checkD4SignStatus(contractId: string): Promise<{
    status: 'pending' | 'sent' | 'signed' | 'refused' | 'expired';
    signed_at?: string;
    certificate_url?: string;
  }> {
    try {
      const contract = await this.getContractById(contractId);
      if (!contract?.d4sign_document_id) {
        throw new Error('Contrato não enviado para assinatura');
      }

      // Mock da verificação até implementarmos a API real
      const mockStatus = {
        status: 'signed' as const,
        signed_at: new Date().toISOString(),
        certificate_url: `https://secure.d4sign.com.br/certificate/${contract.d4sign_document_id}`,
      };

      // Se foi assinado, atualizar status do contrato
      if (mockStatus.status === 'signed') {
        await this.updateContract(contractId, { status: 'ativo' });
      }

      return mockStatus;
    } catch (error) {
      console.error('Erro ao verificar status D4Sign:', error);
      throw error;
    }
  },

  // === SISTEMA DE RENOVAÇÕES ===

  // Criar renovação de contrato
  async createRenewal(contractId: string, renewalData: {
    new_end_date: string;
    renewal_terms?: string;
    automatic_renewal?: boolean;
  }): Promise<ContractRenewal> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const contract = await this.getContractById(contractId);
      if (!contract) throw new Error('Contrato não encontrado');

      const renewal: ContractRenewal = {
        id: crypto.randomUUID(),
        contract_id: contractId,
        original_end_date: contract.end_date || '',
        new_end_date: renewalData.new_end_date,
        renewal_terms: renewalData.renewal_terms || '',
        automatic_renewal: renewalData.automatic_renewal || false,
        notification_sent: false,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      // Por enquanto apenas log até termos a tabela
      console.log('Renovação criada:', renewal);

      return renewal;
    } catch (error) {
      console.error('Erro ao criar renovação:', error);
      throw error;
    }
  },

  // Processar renovação automática
  async processAutomaticRenewals(): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      // Buscar contratos próximos do vencimento
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data: contractsToRenew, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('status', 'ativo')
        .lte('end_date', thirtyDaysFromNow.toISOString().split('T')[0]);

      if (error) throw error;

      for (const contract of contractsToRenew) {
        console.log(`Processando renovação automática para contrato ${contract.id}`);
        // Aqui implementaríamos a lógica de renovação automática
      }
    } catch (error) {
      console.error('Erro ao processar renovações automáticas:', error);
      throw error;
    }
  },

  // === SISTEMA DE ADITIVOS ===

  // Criar aditivo contratual
  async createAddendum(contractId: string, addendumData: {
    type: 'amendment' | 'extension' | 'value_change' | 'scope_change';
    title: string;
    description: string;
    old_value?: number;
    new_value?: number;
    old_end_date?: string;
    new_end_date?: string;
  }): Promise<ContractAddendum> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const addendum: ContractAddendum = {
        id: crypto.randomUUID(),
        contract_id: contractId,
        type: addendumData.type,
        title: addendumData.title,
        description: addendumData.description,
        old_value: addendumData.old_value,
        new_value: addendumData.new_value,
        old_end_date: addendumData.old_end_date,
        new_end_date: addendumData.new_end_date,
        status: 'draft',
        created_at: new Date().toISOString(),
      };

      // Por enquanto apenas log até termos a tabela
      console.log('Aditivo criado:', addendum);

      return addendum;
    } catch (error) {
      console.error('Erro ao criar aditivo:', error);
      throw error;
    }
  },

  // Aprovar aditivo
  async approveAddendum(addendumId: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      console.log('Aditivo aprovado:', {
        id: addendumId,
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.user.id,
      });

      // Aqui aplicaríamos as mudanças no contrato principal
    } catch (error) {
      console.error('Erro ao aprovar aditivo:', error);
      throw error;
    }
  },

  // === HISTÓRICO E AUDITORIA ===

  // Adicionar ao histórico de status
  async addStatusHistory(contractId: string, oldStatus: string, newStatus: string, reason: string, userId: string): Promise<void> {
    try {
      const historyEntry: ContractStatusHistory = {
        id: crypto.randomUUID(),
        contract_id: contractId,
        old_status: oldStatus,
        new_status: newStatus,
        reason,
        changed_by: userId,
        changed_at: new Date().toISOString(),
      };

      // Por enquanto apenas log até termos a tabela
      console.log('Histórico de status:', historyEntry);
    } catch (error) {
      console.error('Erro ao adicionar histórico:', error);
      throw error;
    }
  },

  // Buscar histórico de status
  async getStatusHistory(contractId: string): Promise<ContractStatusHistory[]> {
    try {
      // Mock até termos a tabela
      return [
        {
          id: '1',
          contract_id: contractId,
          old_status: '',
          new_status: 'pendente',
          reason: 'Contrato criado',
          changed_by: 'user123',
          changed_at: new Date().toISOString(),
        }
      ];
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      throw error;
    }
  },

  // === VALIDAÇÕES E VERIFICAÇÕES ===

  // Verificar vencimentos próximos
  async getExpiringContracts(days: number = 30): Promise<Contract[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);

      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('status', 'ativo')
        .lte('end_date', targetDate.toISOString().split('T')[0])
        .order('end_date', { ascending: true });

      if (error) throw error;

      return data.map(contract => ({
        ...contract,
        status: contract.status as 'pendente' | 'ativo' | 'concluido' | 'cancelado' | 'active',
      })) as Contract[];
    } catch (error) {
      console.error('Erro ao buscar contratos vencendo:', error);
      throw error;
    }
  },

  // Validar dados do contrato
  async validateContract(contractData: Partial<Contract>): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    if (!contractData.titulo) {
      errors.push('Título é obrigatório');
    }

    if (!contractData.client_id && !contractData.lead_id) {
      errors.push('Cliente ou lead deve ser selecionado');
    }

    if (!contractData.start_date) {
      errors.push('Data de início é obrigatória');
    }

    if (!contractData.end_date) {
      errors.push('Data de término é obrigatória');
    }

    if (contractData.start_date && contractData.end_date) {
      const startDate = new Date(contractData.start_date);
      const endDate = new Date(contractData.end_date);
      
      if (endDate <= startDate) {
        errors.push('Data de término deve ser posterior à data de início');
      }
    }

    if (contractData.amount && contractData.amount <= 0) {
      errors.push('Valor deve ser maior que zero');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // === FILTROS E BUSCA ===

  // Buscar contratos com filtros
  async searchContracts(filters: {
    searchTerm?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    clientId?: string;
    minAmount?: number;
    maxAmount?: number;
    expiringOnly?: boolean;
  }): Promise<Contract[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('contracts')
        .select(`
          *,
          clients!contracts_client_id_fkey(name, email, phone, company),
          leads!contracts_lead_id_fkey(name, email, phone, company)
        `)
        .eq('user_id', user.user.id);

      // Filtro por termo de busca
      if (filters.searchTerm) {
        query = query.or(`titulo.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,client_name.ilike.%${filters.searchTerm}%`);
      }

      // Filtro por status
      if (filters.status && filters.status !== 'todos') {
        query = query.eq('status', filters.status);
      }

      // Filtro por data
      if (filters.dateFrom) {
        query = query.gte('start_date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('end_date', filters.dateTo);
      }

      // Filtro por cliente
      if (filters.clientId) {
        query = query.eq('client_id', filters.clientId);
      }

      // Filtro por valor
      if (filters.minAmount) {
        query = query.gte('amount', filters.minAmount);
      }
      if (filters.maxAmount) {
        query = query.lte('amount', filters.maxAmount);
      }

      // Filtro por vencimento próximo
      if (filters.expiringOnly) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        query = query.lte('end_date', thirtyDaysFromNow.toISOString().split('T')[0]);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(contract => ({
        ...contract,
        client_name: contract.clients?.name || contract.leads?.name || contract.client_name,
        client_email: contract.clients?.email || contract.leads?.email || contract.client_email,
        client_phone: contract.clients?.phone || contract.leads?.phone || contract.client_phone,
        status: contract.status as 'pendente' | 'ativo' | 'concluido' | 'cancelado' | 'active',
      })) as Contract[];
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      throw error;
    }
  },

  // === ESTATÍSTICAS ===

  // Obter estatísticas dos contratos
  async getContractStats(): Promise<{
    total: number;
    ativo: number;
    pendente: number;
    concluido: number;
    cancelado: number;
    valorTotal: number;
    valorAtivo: number;
    renovacoesPendentes: number;
    vencendoEm30Dias: number;
  }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('contracts')
        .select('status, amount, end_date')
        .eq('user_id', user.user.id);

      if (error) throw error;

      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      const stats = {
        total: data.length,
        ativo: data.filter(c => c.status === 'ativo').length,
        pendente: data.filter(c => c.status === 'pendente').length,
        concluido: data.filter(c => c.status === 'concluido').length,
        cancelado: data.filter(c => c.status === 'cancelado').length,
        valorTotal: data.reduce((sum, c) => sum + (Number(c.amount) || 0), 0),
        valorAtivo: data.filter(c => c.status === 'ativo').reduce((sum, c) => sum + (Number(c.amount) || 0), 0),
        renovacoesPendentes: 0, // Implementar quando tivermos a tabela
        vencendoEm30Dias: data.filter(c => 
          c.status === 'ativo' && 
          c.end_date && 
          new Date(c.end_date) <= thirtyDaysFromNow
        ).length,
      };

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  },

  // === EXPORTAÇÃO ===

  // Exportar contratos para CSV
  async exportContractsToCSV(filters?: any): Promise<string> {
    try {
      const contracts = filters ? await this.searchContracts(filters) : await this.getContracts();
      
      const csvHeaders = 'Título,Cliente,Status,Valor,Data Início,Data Término,Próximo Vencimento\n';
      const csvData = contracts.map(contract => {
        const endDate = contract.end_date ? new Date(contract.end_date) : null;
        const daysToExpiry = endDate ? Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : '';
        
        return `"${contract.titulo}"` +
               `,"${contract.client_name || ''}"` +
               `,"${contract.status}"` +
               `,"${contract.amount || 0}"` +
               `,"${contract.start_date ? new Date(contract.start_date).toLocaleDateString() : ''}"` +
               `,"${contract.end_date ? new Date(contract.end_date).toLocaleDateString() : ''}"` +
               `,"${daysToExpiry ? `${daysToExpiry} dias` : ''}"`;
      }).join('\n');

      return csvHeaders + csvData;
    } catch (error) {
      console.error('Erro ao exportar contratos:', error);
      throw error;
    }
  },

  // === NOTIFICAÇÕES ===

  // Verificar e enviar notificações de vencimento
  async checkAndSendExpiryNotifications(): Promise<void> {
    try {
      const expiringContracts = await this.getExpiringContracts(30);
      
      for (const contract of expiringContracts) {
        // Implementar envio de notificações (email, WhatsApp, etc.)
        console.log(`Notificação de vencimento para contrato ${contract.titulo}`);
      }
    } catch (error) {
      console.error('Erro ao verificar notificações:', error);
      throw error;
    }
  },
};