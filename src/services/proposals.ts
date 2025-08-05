import { supabase } from '@/integrations/supabase/client';
import { Proposal, Client, Lead } from '@/types';

// Interface para template de proposta
interface ProposalTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

// Interface para item de proposta
interface ProposalItem {
  id: string;
  proposal_id: string;
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// Interface para histórico/versionamento
interface ProposalVersion {
  id: string;
  proposal_id: string;
  version_number: number;
  content: string;
  changes_summary: string;
  created_at: string;
  created_by: string;
}

// Interface para aprovações
interface ProposalApproval {
  id: string;
  proposal_id: string;
  approver_id: string;
  approver_name: string;
  status: 'pending' | 'approved' | 'rejected';
  comments: string;
  approved_at?: string;
}

export const proposalService = {
  // === CRUD BÁSICO DE PROPOSTAS ===
  
  // Buscar todas as propostas do usuário
  async getProposals(): Promise<Proposal[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          clients!proposals_client_id_fkey(name, email, phone, company),
          leads!proposals_lead_id_fkey(name, email, phone, company)
        `)
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(proposal => ({
        ...proposal,
        client_name: proposal.clients?.name || proposal.leads?.name || proposal.client_name,
        client_email: proposal.clients?.email || proposal.leads?.email || proposal.client_email,
        client_phone: proposal.clients?.phone || proposal.leads?.phone || proposal.client_phone,
        status: proposal.status as 'rascunho' | 'enviada' | 'aceita' | 'rejeitada' | 'revisao' | 'draft',
      })) as Proposal[];
    } catch (error) {
      console.error('Erro ao buscar propostas:', error);
      throw error;
    }
  },

  // Buscar proposta por ID
  async getProposalById(id: string): Promise<Proposal | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          clients!proposals_client_id_fkey(name, email, phone, company, cnpj_cpf, address),
          leads!proposals_lead_id_fkey(name, email, phone, company, cnpj_cpf, address)
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
        status: data.status as 'rascunho' | 'enviada' | 'aceita' | 'rejeitada' | 'revisao' | 'draft',
      } as Proposal;
    } catch (error) {
      console.error('Erro ao buscar proposta:', error);
      throw error;
    }
  },

  // Criar nova proposta
  async createProposal(proposalData: Omit<Proposal, 'id' | 'created_at' | 'updated_at'>): Promise<Proposal> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      // Gerar número sequencial da proposta
      const proposalNumber = await this.generateProposalNumber();

      const newProposal = {
        ...proposalData,
        user_id: user.user.id,
        number: proposalNumber,
        total_amount: proposalData.amount ? Number(proposalData.amount) - (Number(proposalData.discount) || 0) : 0,
      };

      const { data, error } = await supabase
        .from('proposals')
        .insert(newProposal)
        .select()
        .single();

      if (error) throw error;

      // Criar primeira versão da proposta
      await this.createProposalVersion(data.id, 1, 'Versão inicial da proposta', 'Proposta criada');

      return {
        ...data,
        status: data.status as 'rascunho' | 'enviada' | 'aceita' | 'rejeitada' | 'revisao' | 'draft',
      } as Proposal;
    } catch (error) {
      console.error('Erro ao criar proposta:', error);
      throw error;
    }
  },

  // Atualizar proposta
  async updateProposal(id: string, proposalData: Partial<Proposal>): Promise<Proposal> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const updateData = {
        ...proposalData,
        total_amount: proposalData.amount ? Number(proposalData.amount) - (Number(proposalData.discount) || 0) : undefined,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('proposals')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error) throw error;

      // Criar nova versão se houve mudanças significativas
      const currentVersion = await this.getLatestProposalVersion(id);
      if (currentVersion) {
        await this.createProposalVersion(
          id,
          currentVersion.version_number + 1,
          JSON.stringify(updateData),
          'Proposta atualizada'
        );
      }

      return {
        ...data,
        status: data.status as 'rascunho' | 'enviada' | 'aceita' | 'rejeitada' | 'revisao' | 'draft',
      } as Proposal;
    } catch (error) {
      console.error('Erro ao atualizar proposta:', error);
      throw error;
    }
  },

  // Deletar proposta
  async deleteProposal(id: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar proposta:', error);
      throw error;
    }
  },

  // === SISTEMA DE TEMPLATES ===

  // Buscar templates de proposta
  async getProposalTemplates(): Promise<ProposalTemplate[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      // Por enquanto retorna templates mock até termos a tabela criada
      return [
        {
          id: '1',
          name: 'Template Básico',
          content: 'Proposta para {{cliente_nome}} - {{servico_descricao}}',
          variables: ['cliente_nome', 'servico_descricao'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Template Detalhado',
          content: 'Prezado(a) {{cliente_nome}}, segue proposta detalhada para {{servico_descricao}} no valor de R$ {{valor_total}}',
          variables: ['cliente_nome', 'servico_descricao', 'valor_total'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      throw error;
    }
  },

  // === SISTEMA DE VERSIONAMENTO ===

  // Criar nova versão da proposta
  async createProposalVersion(proposalId: string, versionNumber: number, content: string, changesSummary: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      // Por enquanto apenas logamos até termos a tabela de versions
      console.log('Nova versão criada:', {
        proposal_id: proposalId,
        version_number: versionNumber,
        content,
        changes_summary: changesSummary,
        created_by: user.user.id,
      });
    } catch (error) {
      console.error('Erro ao criar versão:', error);
      throw error;
    }
  },

  // Buscar versões da proposta
  async getProposalVersions(proposalId: string): Promise<ProposalVersion[]> {
    try {
      // Por enquanto retorna mock até termos a tabela
      return [
        {
          id: '1',
          proposal_id: proposalId,
          version_number: 1,
          content: 'Versão inicial',
          changes_summary: 'Proposta criada',
          created_at: new Date().toISOString(),
          created_by: 'user123',
        }
      ];
    } catch (error) {
      console.error('Erro ao buscar versões:', error);
      throw error;
    }
  },

  // Buscar última versão
  async getLatestProposalVersion(proposalId: string): Promise<ProposalVersion | null> {
    try {
      const versions = await this.getProposalVersions(proposalId);
      return versions.length > 0 ? versions[versions.length - 1] : null;
    } catch (error) {
      console.error('Erro ao buscar última versão:', error);
      return null;
    }
  },

  // === SISTEMA DE APROVAÇÕES ===

  // Buscar aprovações pendentes
  async getPendingApprovals(): Promise<ProposalApproval[]> {
    try {
      // Mock até termos a tabela
      return [];
    } catch (error) {
      console.error('Erro ao buscar aprovações:', error);
      throw error;
    }
  },

  // Aprovar proposta
  async approveProposal(proposalId: string, comments: string): Promise<void> {
    try {
      await this.updateProposal(proposalId, { status: 'aceita' });
      console.log('Proposta aprovada:', { proposalId, comments });
    } catch (error) {
      console.error('Erro ao aprovar proposta:', error);
      throw error;
    }
  },

  // Rejeitar proposta
  async rejectProposal(proposalId: string, comments: string): Promise<void> {
    try {
      await this.updateProposal(proposalId, { status: 'rejeitada' });
      console.log('Proposta rejeitada:', { proposalId, comments });
    } catch (error) {
      console.error('Erro ao rejeitar proposta:', error);
      throw error;
    }
  },

  // === FUNCIONALIDADES AUXILIARES ===

  // Gerar número sequencial da proposta
  async generateProposalNumber(): Promise<string> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { count, error } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user.id);

      if (error) throw error;

      const nextNumber = (count || 0) + 1;
      const year = new Date().getFullYear();
      return `PROP-${year}-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Erro ao gerar número da proposta:', error);
      return `PROP-${new Date().getFullYear()}-${Date.now()}`;
    }
  },

  // Duplicar proposta
  async duplicateProposal(id: string): Promise<Proposal> {
    try {
      const originalProposal = await this.getProposalById(id);
      if (!originalProposal) throw new Error('Proposta não encontrada');

      const duplicatedData = {
        ...originalProposal,
        titulo: `${originalProposal.titulo} (Cópia)`,
        status: 'rascunho' as const,
        number: undefined, // Será gerado automaticamente
      };

      // Remove campos que não devem ser duplicados
      delete duplicatedData.id;
      delete duplicatedData.created_at;
      delete duplicatedData.updated_at;

      return await this.createProposal(duplicatedData);
    } catch (error) {
      console.error('Erro ao duplicar proposta:', error);
      throw error;
    }
  },

  // Enviar proposta por email
  async sendProposalByEmail(proposalId: string, recipientEmail: string, subject: string, message: string): Promise<void> {
    try {
      // Por enquanto apenas log até implementarmos o serviço de email
      console.log('Enviando proposta por email:', {
        proposalId,
        recipientEmail,
        subject,
        message,
      });
      
      // Atualizar status para 'enviada'
      await this.updateProposal(proposalId, { status: 'enviada' });
    } catch (error) {
      console.error('Erro ao enviar proposta por email:', error);
      throw error;
    }
  },

  // Enviar proposta por WhatsApp
  async sendProposalByWhatsApp(proposalId: string, phoneNumber: string, message: string): Promise<void> {
    try {
      console.log('Enviando proposta por WhatsApp:', {
        proposalId,
        phoneNumber,
        message,
      });
      
      // Atualizar status para 'enviada'
      await this.updateProposal(proposalId, { status: 'enviada' });
    } catch (error) {
      console.error('Erro ao enviar proposta por WhatsApp:', error);
      throw error;
    }
  },

  // === FILTROS E BUSCA ===

  // Buscar propostas com filtros
  async searchProposals(filters: {
    searchTerm?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    clientId?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<Proposal[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('proposals')
        .select(`
          *,
          clients!proposals_client_id_fkey(name, email, phone, company),
          leads!proposals_lead_id_fkey(name, email, phone, company)
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
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
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

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(proposal => ({
        ...proposal,
        client_name: proposal.clients?.name || proposal.leads?.name || proposal.client_name,
        client_email: proposal.clients?.email || proposal.leads?.email || proposal.client_email,
        client_phone: proposal.clients?.phone || proposal.leads?.phone || proposal.client_phone,
        status: proposal.status as 'rascunho' | 'enviada' | 'aceita' | 'rejeitada' | 'revisao' | 'draft',
      })) as Proposal[];
    } catch (error) {
      console.error('Erro ao buscar propostas:', error);
      throw error;
    }
  },

  // === ESTATÍSTICAS ===

  // Obter estatísticas das propostas
  async getProposalStats(): Promise<{
    total: number;
    rascunho: number;
    enviada: number;
    aceita: number;
    rejeitada: number;
    valorTotal: number;
    valorAceito: number;
    taxaConversao: number;
  }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('proposals')
        .select('status, amount')
        .eq('user_id', user.user.id);

      if (error) throw error;

      const stats = {
        total: data.length,
        rascunho: data.filter(p => p.status === 'rascunho').length,
        enviada: data.filter(p => p.status === 'enviada').length,
        aceita: data.filter(p => p.status === 'aceita').length,
        rejeitada: data.filter(p => p.status === 'rejeitada').length,
        valorTotal: data.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
        valorAceito: data.filter(p => p.status === 'aceita').reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
        taxaConversao: 0,
      };

      stats.taxaConversao = stats.enviada > 0 ? (stats.aceita / stats.enviada) * 100 : 0;

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  },

  // === EXPORTAÇÃO ===

  // Exportar propostas para CSV
  async exportProposalsToCSV(filters?: any): Promise<string> {
    try {
      const proposals = filters ? await this.searchProposals(filters) : await this.getProposals();
      
      const csvHeaders = 'Número,Título,Cliente,Status,Valor,Data de Criação,Validade\n';
      const csvData = proposals.map(proposal => 
        `"${proposal.number || ''}"` +
        `,"${proposal.titulo}"` +
        `,"${proposal.client_name || ''}"` +
        `,"${proposal.status}"` +
        `,"${proposal.amount || 0}"` +
        `,"${new Date(proposal.created_at).toLocaleDateString()}"` +
        `,"${proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString() : ''}"`
      ).join('\n');

      return csvHeaders + csvData;
    } catch (error) {
      console.error('Erro ao exportar propostas:', error);
      throw error;
    }
  },
};