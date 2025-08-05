import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Pipeline = Database['public']['Tables']['pipelines']['Row'];
type PipelineInsert = Database['public']['Tables']['pipelines']['Insert'];
type PipelineUpdate = Database['public']['Tables']['pipelines']['Update'];

type PipelineStage = Database['public']['Tables']['pipeline_stages']['Row'];
type PipelineStageInsert = Database['public']['Tables']['pipeline_stages']['Insert'];
type PipelineStageUpdate = Database['public']['Tables']['pipeline_stages']['Update'];

type Deal = Database['public']['Tables']['deals']['Row'];
type DealInsert = Database['public']['Tables']['deals']['Insert'];
type DealUpdate = Database['public']['Tables']['deals']['Update'];

// Pipeline CRUD
export const pipelineService = {
  // Listar pipelines do usuário
  async getPipelines(): Promise<Pipeline[]> {
    const { data, error } = await supabase
      .from('pipelines')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Criar pipeline
  async createPipeline(pipeline: Omit<PipelineInsert, 'user_id'>): Promise<Pipeline> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('pipelines')
      .insert([{ ...pipeline, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar pipeline
  async updatePipeline(id: string, updates: PipelineUpdate): Promise<Pipeline> {
    const { data, error } = await supabase
      .from('pipelines')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Excluir pipeline (soft delete)
  async deletePipeline(id: string): Promise<void> {
    const { error } = await supabase
      .from('pipelines')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  // Obter pipeline com estágios
  async getPipelineWithStages(id: string): Promise<Pipeline & { stages: PipelineStage[] }> {
    const { data: pipeline, error: pipelineError } = await supabase
      .from('pipelines')
      .select('*')
      .eq('id', id)
      .single();

    if (pipelineError) throw pipelineError;

    const { data: stages, error: stagesError } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('pipeline_id', id)
      .order('position');

    if (stagesError) throw stagesError;

    return { ...pipeline, stages: stages || [] };
  },
};

// Pipeline Stages CRUD
export const stageService = {
  // Listar estágios de um pipeline
  async getStages(pipelineId: string): Promise<PipelineStage[]> {
    const { data, error } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('pipeline_id', pipelineId)
      .order('position');

    if (error) throw error;
    return data || [];
  },

  // Criar estágio
  async createStage(stage: Omit<PipelineStageInsert, 'position'>): Promise<PipelineStage> {
    // Obter próxima posição
    const { data: existingStages, error: countError } = await supabase
      .from('pipeline_stages')
      .select('position')
      .eq('pipeline_id', stage.pipeline_id)
      .order('position', { ascending: false })
      .limit(1);

    if (countError) throw countError;

    const nextPosition = existingStages.length > 0 ? existingStages[0].position + 1 : 0;

    const { data, error } = await supabase
      .from('pipeline_stages')
      .insert([{ ...stage, position: nextPosition }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar estágio
  async updateStage(id: string, updates: PipelineStageUpdate): Promise<PipelineStage> {
    const { data, error } = await supabase
      .from('pipeline_stages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Excluir estágio
  async deleteStage(id: string): Promise<void> {
    const { error } = await supabase
      .from('pipeline_stages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Reordenar estágios
  async reorderStages(stages: { id: string; position: number }[]): Promise<void> {
    const updates = stages.map(stage => 
      supabase
        .from('pipeline_stages')
        .update({ position: stage.position })
        .eq('id', stage.id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter(result => result.error);
    
    if (errors.length > 0) {
      throw errors[0].error;
    }
  },
};

// Deals CRUD
export const dealService = {
  // Listar deals de um pipeline
  async getDeals(pipelineId?: string, stageId?: string): Promise<Deal[]> {
    let query = supabase
      .from('deals')
      .select('*, leads(*), clients(*)');

    if (pipelineId) {
      query = query.eq('pipeline_id', pipelineId);
    }

    if (stageId) {
      query = query.eq('stage_id', stageId);
    }

    query = query.order('position').order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Criar deal
  async createDeal(deal: Omit<DealInsert, 'user_id' | 'position'>): Promise<Deal> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Obter próxima posição no estágio
    const { data: existingDeals, error: countError } = await supabase
      .from('deals')
      .select('position')
      .eq('stage_id', deal.stage_id)
      .order('position', { ascending: false })
      .limit(1);

    if (countError) throw countError;

    const nextPosition = existingDeals.length > 0 ? existingDeals[0].position + 1 : 0;

    const { data, error } = await supabase
      .from('deals')
      .insert([{ ...deal, user_id: user.id, position: nextPosition }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar deal
  async updateDeal(id: string, updates: DealUpdate): Promise<Deal> {
    const { data, error } = await supabase
      .from('deals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Excluir deal
  async deleteDeal(id: string): Promise<void> {
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Mover deal para outro estágio
  async moveDeal(dealId: string, newStageId: string, newPosition: number): Promise<Deal> {
    const { data, error } = await supabase
      .from('deals')
      .update({ 
        stage_id: newStageId, 
        position: newPosition,
        updated_at: new Date().toISOString()
      })
      .eq('id', dealId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Reordenar deals dentro de um estágio
  async reorderDeals(deals: { id: string; position: number }[]): Promise<void> {
    const updates = deals.map(deal => 
      supabase
        .from('deals')
        .update({ position: deal.position })
        .eq('id', deal.id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter(result => result.error);
    
    if (errors.length > 0) {
      throw errors[0].error;
    }
  },

  // Obter estatísticas do pipeline
  async getPipelineStats(pipelineId: string) {
    const { data: deals, error } = await supabase
      .from('deals')
      .select('stage_id, value, probability')
      .eq('pipeline_id', pipelineId);

    if (error) throw error;

    const stats = {
      totalValue: deals?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0,
      totalDeals: deals?.length || 0,
      avgDealValue: 0,
      stageStats: {} as Record<string, { count: number; value: number; avgValue: number }>
    };

    if (stats.totalDeals > 0) {
      stats.avgDealValue = stats.totalValue / stats.totalDeals;
    }

    // Estatísticas por estágio
    deals?.forEach(deal => {
      if (!stats.stageStats[deal.stage_id]) {
        stats.stageStats[deal.stage_id] = { count: 0, value: 0, avgValue: 0 };
      }
      stats.stageStats[deal.stage_id].count++;
      stats.stageStats[deal.stage_id].value += deal.value || 0;
    });

    // Calcular média por estágio
    Object.keys(stats.stageStats).forEach(stageId => {
      const stage = stats.stageStats[stageId];
      stage.avgValue = stage.count > 0 ? stage.value / stage.count : 0;
    });

    return stats;
  },
};

// Real-time subscriptions
export const pipelineRealtimeService = {
  // Subscrever mudanças em deals
  subscribeToDeals(pipelineId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`deals-${pipelineId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deals',
          filter: `pipeline_id=eq.${pipelineId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscrever mudanças em estágios
  subscribeToStages(pipelineId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`stages-${pipelineId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pipeline_stages',
          filter: `pipeline_id=eq.${pipelineId}`
        },
        callback
      )
      .subscribe();
  },

  // Limpar subscrições
  unsubscribe(channel: any) {
    return supabase.removeChannel(channel);
  },
};