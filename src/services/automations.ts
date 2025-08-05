import { supabase } from '@/integrations/supabase/client';

export interface Automation {
  id: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_conditions: any;
  actions: any;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  last_executed_at?: string;
  execution_count: number;
}

export interface AutomationLog {
  id: string;
  automation_id: string;
  trigger_data: any;
  execution_result: string;
  execution_time_ms?: number;
  error_message?: string;
  created_at: string;
}

export interface AutomationExecution {
  trigger: string;
  data: any;
}

export interface AutomationTrigger {
  value: string;
  label: string;
  description: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    label: string;
  }>;
}

class AutomationService {
  // Triggers disponíveis
  private readonly triggers: AutomationTrigger[] = [
    {
      value: 'email_campaign',
      label: 'Campanha de Email',
      description: 'Dispara campanha de email automatizada',
      fields: [
        { name: 'template_id', type: 'text', required: true, label: 'ID do Template' },
        { name: 'recipients', type: 'array', required: true, label: 'Destinatários' },
        { name: 'subject', type: 'text', required: true, label: 'Assunto' }
      ]
    },
    {
      value: 'lead_followup',
      label: 'Follow-up de Lead',
      description: 'Acompanhamento automático de leads',
      fields: [
        { name: 'lead_id', type: 'text', required: true, label: 'ID do Lead' },
        { name: 'days_after', type: 'number', required: true, label: 'Dias após' },
        { name: 'message_template', type: 'text', required: true, label: 'Template da mensagem' }
      ]
    },
    {
      value: 'contract_reminder',
      label: 'Lembrete de Contrato',
      description: 'Lembretes de vencimento de contratos',
      fields: [
        { name: 'days_before', type: 'number', required: true, label: 'Dias antes do vencimento' },
        { name: 'notification_type', type: 'select', required: true, label: 'Tipo de notificação' }
      ]
    },
    {
      value: 'payment_notification',
      label: 'Notificação de Pagamento',
      description: 'Notificações de pagamentos pendentes',
      fields: [
        { name: 'client_id', type: 'text', required: false, label: 'ID do Cliente (opcional)' },
        { name: 'amount', type: 'number', required: true, label: 'Valor' },
        { name: 'due_date', type: 'date', required: true, label: 'Data de vencimento' }
      ]
    },
    {
      value: 'client_onboarding',
      label: 'Onboarding de Cliente',
      description: 'Processo de integração de novos clientes',
      fields: [
        { name: 'client_id', type: 'text', required: true, label: 'ID do Cliente' },
        { name: 'welcome_template', type: 'text', required: true, label: 'Template de boas-vindas' }
      ]
    },
    {
      value: 'task_assignment',
      label: 'Atribuição de Tarefa',
      description: 'Atribuição automática de tarefas',
      fields: [
        { name: 'assignee', type: 'text', required: true, label: 'Responsável' },
        { name: 'task_type', type: 'select', required: true, label: 'Tipo de tarefa' },
        { name: 'priority', type: 'select', required: true, label: 'Prioridade' }
      ]
    }
  ];

  getTriggers(): AutomationTrigger[] {
    return this.triggers;
  }

  getTrigger(value: string): AutomationTrigger | undefined {
    return this.triggers.find(trigger => trigger.value === value);
  }

  async getAutomations(): Promise<Automation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('automations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getAutomation(id: string): Promise<Automation | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('automations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createAutomation(automation: Omit<Automation, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'execution_count'>): Promise<Automation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('automations')
      .insert({
        ...automation,
        user_id: user.id,
        execution_count: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAutomation(id: string, updates: Partial<Automation>): Promise<Automation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('automations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAutomation(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('automations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async toggleAutomation(id: string): Promise<Automation> {
    const automation = await this.getAutomation(id);
    if (!automation) throw new Error('Automação não encontrada');

    return this.updateAutomation(id, { is_active: !automation.is_active });
  }

  async executeAutomation(execution: AutomationExecution): Promise<{
    success: boolean;
    result?: string;
    error?: string;
    execution_time?: number;
  }> {
    const startTime = Date.now();
    
    try {
      const trigger = this.getTrigger(execution.trigger);
      if (!trigger) {
        throw new Error(`Trigger '${execution.trigger}' não encontrado`);
      }

      // Validar dados obrigatórios
      const missingFields = trigger.fields
        .filter(field => field.required && !execution.data[field.name])
        .map(field => field.label);

      if (missingFields.length > 0) {
        throw new Error(`Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`);
      }

      // Simular execução da automação
      const result = await this.processAutomationTrigger(execution.trigger, execution.data);
      const execution_time = Date.now() - startTime;

      return {
        success: true,
        result,
        execution_time
      };
    } catch (error) {
      const execution_time = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        execution_time
      };
    }
  }

  async getAutomationLogs(automationId?: string, limit: number = 50): Promise<AutomationLog[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    let query = supabase
      .from('automation_logs')
      .select(`
        *,
        automations!inner(user_id)
      `)
      .eq('automations.user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (automationId) {
      query = query.eq('automation_id', automationId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async createAutomationLog(log: Omit<AutomationLog, 'id' | 'created_at'>): Promise<AutomationLog> {
    const { data, error } = await supabase
      .from('automation_logs')
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAutomationStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    total_executions: number;
    success_rate: number;
  }> {
    const automations = await this.getAutomations();
    const logs = await this.getAutomationLogs();

    const total = automations.length;
    const active = automations.filter(a => a.is_active).length;
    const inactive = total - active;
    const total_executions = automations.reduce((sum, a) => sum + a.execution_count, 0);
    
    const successfulLogs = logs.filter(log => !log.error_message).length;
    const success_rate = logs.length > 0 ? (successfulLogs / logs.length) * 100 : 0;

    return {
      total,
      active,
      inactive,
      total_executions,
      success_rate: Math.round(success_rate)
    };
  }

  private async processAutomationTrigger(trigger: string, data: any): Promise<string> {
    // Simular processamento de diferentes tipos de triggers
    switch (trigger) {
      case 'email_campaign':
        await this.delay(1000);
        return `Campanha de email enviada para ${data.recipients?.length || 0} destinatários`;

      case 'lead_followup':
        await this.delay(800);
        return `Follow-up agendado para o lead ${data.lead_id} em ${data.days_after} dias`;

      case 'contract_reminder':
        await this.delay(600);
        return `Lembrete de contrato configurado para ${data.days_before} dias antes do vencimento`;

      case 'payment_notification':
        await this.delay(500);
        return `Notificação de pagamento de R$ ${data.amount} enviada`;

      case 'client_onboarding':
        await this.delay(1200);
        return `Processo de onboarding iniciado para o cliente ${data.client_id}`;

      case 'task_assignment':
        await this.delay(400);
        return `Tarefa do tipo ${data.task_type} atribuída para ${data.assignee}`;

      default:
        throw new Error(`Trigger '${trigger}' não implementado`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Métodos para monitoramento em tempo real
  subscribeToAutomationChanges(callback: (payload: any) => void) {
    return supabase
      .channel('automation_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'automations'
      }, callback)
      .subscribe();
  }

  subscribeToAutomationLogs(callback: (payload: any) => void) {
    return supabase
      .channel('automation_logs')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'automation_logs'
      }, callback)
      .subscribe();
  }
}

export const automationService = new AutomationService();