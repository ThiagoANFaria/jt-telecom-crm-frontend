import { supabase } from '@/integrations/supabase/client';
import type { Lead } from '@/types';

export class LeadsService {
  
  // Buscar todos os leads do usuário
  async getLeads(userId: string): Promise<Lead[]> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar leads:', error);
        throw error;
      }

      return data?.map(lead => ({
        ...lead,
        createdAt: new Date(lead.created_at),
        status: lead.status as Lead['status'],
        source: lead.source as Lead['source']
      })) || [];
    } catch (error) {
      console.error('Erro no serviço de leads:', error);
      throw error;
    }
  }

  // Criar novo lead
  async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'created_at' | 'updated_at'>, userId: string): Promise<Lead> {
    try {
      // Calcular score baseado nos dados do lead
      const score = this.calculateLeadScore(leadData);
      
      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...leadData,
          user_id: userId,
          score,
          status: leadData.status || 'Novo',
          source: leadData.source || 'Website'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar lead:', error);
        throw error;
      }

      return {
        ...data,
        createdAt: new Date(data.created_at),
        status: data.status as Lead['status'],
        source: data.source as Lead['source']
      };
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      throw error;
    }
  }

  // Atualizar lead
  async updateLead(leadId: string, updates: Partial<Lead>, userId: string): Promise<Lead> {
    try {
      // Recalcular score se necessário
      if (updates.email || updates.phone || updates.company || updates.position) {
        updates.score = this.calculateLeadScore(updates as Lead);
      }

      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar lead:', error);
        throw error;
      }

      return {
        ...data,
        createdAt: new Date(data.created_at),
        status: data.status as Lead['status'],
        source: data.source as Lead['source']
      };
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      throw error;
    }
  }

  // Deletar lead
  async deleteLead(leadId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId)
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao deletar lead:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao deletar lead:', error);
      throw error;
    }
  }

  // Buscar leads com filtros
  async searchLeads(searchTerm: string, userId: string, filters?: any): Promise<Lead[]> {
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId);

      // Aplicar filtro de busca
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      // Aplicar filtros adicionais
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.source && filters.source !== 'all') {
        query = query.eq('source', filters.source);
      }

      if (filters?.scoreMin) {
        query = query.gte('score', filters.scoreMin);
      }

      if (filters?.scoreMax) {
        query = query.lte('score', filters.scoreMax);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar leads:', error);
        throw error;
      }

      return data?.map(lead => ({
        ...lead,
        createdAt: new Date(lead.created_at),
        status: lead.status as Lead['status'],
        source: lead.source as Lead['source']
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      throw error;
    }
  }

  // Converter lead para cliente
  async convertToClient(leadId: string, userId: string): Promise<void> {
    try {
      // Buscar dados do lead
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .eq('user_id', userId)
        .single();

      if (leadError || !lead) {
        console.error('Lead não encontrado:', leadError);
        throw new Error('Lead não encontrado');
      }

      // Criar cliente baseado no lead
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          whatsapp: lead.whatsapp,
          company: lead.company,
          cnpj_cpf: lead.cnpj_cpf,
          ie_rg: lead.ie_rg,
          address: lead.address,
          number: lead.number,
          neighborhood: lead.neighborhood,
          city: lead.city,
          state: lead.state,
          cep: lead.cep,
          notes: lead.notes,
          responsible: lead.responsible,
          user_id: userId,
          status: 'Ativo'
        });

      if (clientError) {
        console.error('Erro ao criar cliente:', clientError);
        throw clientError;
      }

      // Atualizar status do lead para "convertido"
      await this.updateLead(leadId, { status: 'closed' }, userId);

    } catch (error) {
      console.error('Erro ao converter lead:', error);
      throw error;
    }
  }

  // Calcular score do lead
  private calculateLeadScore(lead: Partial<Lead>): number {
    let score = 0;

    // Email válido (+20 pontos)
    if (lead.email && lead.email.includes('@')) {
      score += 20;
    }

    // Telefone válido (+15 pontos)
    if (lead.phone && lead.phone.length >= 10) {
      score += 15;
    }

    // WhatsApp (+10 pontos)
    if (lead.whatsapp) {
      score += 10;
    }

    // Empresa (+25 pontos)
    if (lead.company) {
      score += 25;
    }

    // Cargo/Posição (+15 pontos)
    if (lead.position) {
      score += 15;
    }

    // CNPJ/CPF (+10 pontos)
    if (lead.cnpj_cpf) {
      score += 10;
    }

    // Endereço completo (+5 pontos)
    if (lead.address && lead.city) {
      score += 5;
    }

    return Math.min(score, 100); // Máximo 100 pontos
  }

  // Obter estatísticas de leads
  async getLeadsStats(userId: string): Promise<any> {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('status, source, score, created_at')
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
      }

      const total = leads?.length || 0;
      const porStatus = leads?.reduce((acc: any, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const porFonte = leads?.reduce((acc: any, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {}) || {};

      const scoreMedia = leads?.reduce((sum, lead) => sum + (lead.score || 0), 0) / total || 0;

      // Leads do mês atual
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const leadsDoMes = leads?.filter(lead => 
        new Date(lead.created_at) >= inicioMes
      ).length || 0;

      return {
        total,
        porStatus,
        porFonte,
        scoreMedia: Math.round(scoreMedia),
        leadsDoMes,
        taxaConversao: porStatus.closed ? (porStatus.closed / total * 100) : 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  // Atualizar último contato
  async updateLastContact(leadId: string, userId: string): Promise<void> {
    try {
      await this.updateLead(leadId, { 
        last_contact: new Date().toISOString() 
      }, userId);
    } catch (error) {
      console.error('Erro ao atualizar último contato:', error);
      throw error;
    }
  }

  // Agendar próximo contato
  async scheduleNextContact(leadId: string, nextContactDate: string, userId: string): Promise<void> {
    try {
      await this.updateLead(leadId, { 
        next_contact: nextContactDate 
      }, userId);
    } catch (error) {
      console.error('Erro ao agendar contato:', error);
      throw error;
    }
  }

  // Buscar leads por status
  async getLeadsByStatus(status: string, userId: string): Promise<Lead[]> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar leads por status:', error);
        throw error;
      }

      return data?.map(lead => ({
        ...lead,
        createdAt: new Date(lead.created_at),
        status: lead.status as Lead['status'],
        source: lead.source as Lead['source']
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar leads por status:', error);
      throw error;
    }
  }

  // Buscar leads por score
  async getLeadsByScore(minScore: number, maxScore: number, userId: string): Promise<Lead[]> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId)
        .gte('score', minScore)
        .lte('score', maxScore)
        .order('score', { ascending: false });

      if (error) {
        console.error('Erro ao buscar leads por score:', error);
        throw error;
      }

      return data?.map(lead => ({
        ...lead,
        createdAt: new Date(lead.created_at),
        status: lead.status as Lead['status'],
        source: lead.source as Lead['source']
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar leads por score:', error);
      throw error;
    }
  }
}

export const leadsService = new LeadsService();