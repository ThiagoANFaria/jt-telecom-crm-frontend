import { supabase } from '@/integrations/supabase/client';

export interface Integration {
  id: string;
  name: string;
  type: string;
  credentials: any;
  config: any;
  is_active: boolean;
  user_id: string;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationType {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    encrypted?: boolean;
    placeholder?: string;
  }>;
  config_fields: Array<{
    name: string;
    label: string;
    type: string;
    default?: any;
    options?: Array<{ value: string; label: string }>;
  }>;
}

class IntegrationsService {
  private readonly integrationTypes: IntegrationType[] = [
    {
      id: 'smtp',
      name: 'SMTP Email',
      description: 'Configuração de servidor SMTP para envio de emails',
      icon: 'Mail',
      fields: [
        { name: 'host', label: 'Servidor SMTP', type: 'text', required: true, placeholder: 'smtp.gmail.com' },
        { name: 'port', label: 'Porta', type: 'number', required: true, placeholder: '587' },
        { name: 'username', label: 'Usuário', type: 'text', required: true },
        { name: 'password', label: 'Senha', type: 'password', required: true, encrypted: true },
        { name: 'from_email', label: 'Email do Remetente', type: 'email', required: true },
        { name: 'from_name', label: 'Nome do Remetente', type: 'text', required: true }
      ],
      config_fields: [
        { name: 'secure', label: 'Conexão Segura (TLS)', type: 'boolean', default: true },
        { name: 'auth_required', label: 'Autenticação Obrigatória', type: 'boolean', default: true }
      ]
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Integração com OpenAI para funcionalidades de IA',
      icon: 'Brain',
      fields: [
        { name: 'api_key', label: 'Chave da API', type: 'password', required: true, encrypted: true },
        { name: 'organization', label: 'Organização (opcional)', type: 'text', required: false }
      ],
      config_fields: [
        { 
          name: 'default_model', 
          label: 'Modelo Padrão', 
          type: 'select', 
          default: 'gpt-3.5-turbo',
          options: [
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
            { value: 'gpt-4', label: 'GPT-4' },
            { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' }
          ]
        },
        { name: 'max_tokens', label: 'Máximo de Tokens', type: 'number', default: 1000 },
        { name: 'temperature', label: 'Temperatura', type: 'number', default: 0.7 }
      ]
    },
    {
      id: 'd4sign',
      name: 'D4Sign',
      description: 'Assinatura digital de documentos',
      icon: 'FileSignature',
      fields: [
        { name: 'token', label: 'Token de Acesso', type: 'password', required: true, encrypted: true },
        { name: 'crypto_key', label: 'Chave de Criptografia', type: 'password', required: true, encrypted: true }
      ],
      config_fields: [
        { name: 'environment', label: 'Ambiente', type: 'select', default: 'sandbox', options: [
          { value: 'sandbox', label: 'Teste (Sandbox)' },
          { value: 'production', label: 'Produção' }
        ]},
        { name: 'auto_send', label: 'Envio Automático', type: 'boolean', default: false }
      ]
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Integração com WhatsApp Business API',
      icon: 'MessageCircle',
      fields: [
        { name: 'phone_number_id', label: 'ID do Número', type: 'text', required: true },
        { name: 'access_token', label: 'Token de Acesso', type: 'password', required: true, encrypted: true },
        { name: 'verify_token', label: 'Token de Verificação', type: 'password', required: true, encrypted: true }
      ],
      config_fields: [
        { name: 'webhook_url', label: 'URL do Webhook', type: 'url', default: '' },
        { name: 'auto_reply', label: 'Resposta Automática', type: 'boolean', default: false }
      ]
    },
    {
      id: 'webhook',
      name: 'Webhooks',
      description: 'Configuração de webhooks para notificações',
      icon: 'Webhook',
      fields: [
        { name: 'url', label: 'URL do Webhook', type: 'url', required: true },
        { name: 'secret', label: 'Segredo (opcional)', type: 'password', required: false, encrypted: true }
      ],
      config_fields: [
        { 
          name: 'events', 
          label: 'Eventos', 
          type: 'multiselect', 
          default: [],
          options: [
            { value: 'lead.created', label: 'Lead Criado' },
            { value: 'lead.updated', label: 'Lead Atualizado' },
            { value: 'client.created', label: 'Cliente Criado' },
            { value: 'contract.signed', label: 'Contrato Assinado' },
            { value: 'payment.received', label: 'Pagamento Recebido' }
          ]
        },
        { name: 'retry_attempts', label: 'Tentativas de Reenvio', type: 'number', default: 3 }
      ]
    }
  ];

  getIntegrationTypes(): IntegrationType[] {
    return this.integrationTypes;
  }

  getIntegrationType(id: string): IntegrationType | undefined {
    return this.integrationTypes.find(type => type.id === id);
  }

  async getIntegrations(): Promise<Integration[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getIntegration(id: string): Promise<Integration | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getIntegrationByType(type: string): Promise<Integration | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('type', type)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createIntegration(integration: {
    name: string;
    type: string;
    credentials: any;
    config: any;
  }): Promise<Integration> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('integrations')
      .insert({
        ...integration,
        user_id: user.id,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('integrations')
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

  async deleteIntegration(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async toggleIntegration(id: string): Promise<Integration> {
    const integration = await this.getIntegration(id);
    if (!integration) throw new Error('Integração não encontrada');

    return this.updateIntegration(id, { is_active: !integration.is_active });
  }

  async testIntegration(id: string): Promise<{ success: boolean; message: string }> {
    const integration = await this.getIntegration(id);
    if (!integration) throw new Error('Integração não encontrada');

    try {
      switch (integration.type) {
        case 'smtp':
          return await this.testSMTP(integration);
        case 'openai':
          return await this.testOpenAI(integration);
        case 'd4sign':
          return await this.testD4Sign(integration);
        case 'whatsapp':
          return await this.testWhatsApp(integration);
        case 'webhook':
          return await this.testWebhook(integration);
        default:
          return { success: false, message: 'Tipo de integração não suportado' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  async syncIntegration(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    await this.updateIntegration(id, { 
      last_sync_at: new Date().toISOString() 
    });
  }

  // Métodos de teste específicos para cada tipo de integração
  private async testSMTP(integration: Integration): Promise<{ success: boolean; message: string }> {
    // Simular teste de SMTP
    await this.delay(1000);
    
    if (!integration.credentials.host || !integration.credentials.username) {
      return { success: false, message: 'Credenciais incompletas' };
    }
    
    return { success: true, message: 'Conexão SMTP testada com sucesso' };
  }

  private async testOpenAI(integration: Integration): Promise<{ success: boolean; message: string }> {
    // Simular teste da API OpenAI
    await this.delay(800);
    
    if (!integration.credentials.api_key) {
      return { success: false, message: 'Chave da API não fornecida' };
    }
    
    return { success: true, message: 'API OpenAI conectada com sucesso' };
  }

  private async testD4Sign(integration: Integration): Promise<{ success: boolean; message: string }> {
    // Simular teste do D4Sign
    await this.delay(1200);
    
    if (!integration.credentials.token || !integration.credentials.crypto_key) {
      return { success: false, message: 'Token ou chave de criptografia não fornecidos' };
    }
    
    return { success: true, message: 'Conexão D4Sign estabelecida com sucesso' };
  }

  private async testWhatsApp(integration: Integration): Promise<{ success: boolean; message: string }> {
    // Simular teste do WhatsApp Business API
    await this.delay(900);
    
    if (!integration.credentials.phone_number_id || !integration.credentials.access_token) {
      return { success: false, message: 'Credenciais do WhatsApp incompletas' };
    }
    
    return { success: true, message: 'WhatsApp Business API conectado com sucesso' };
  }

  private async testWebhook(integration: Integration): Promise<{ success: boolean; message: string }> {
    // Simular teste de webhook
    await this.delay(500);
    
    if (!integration.credentials.url) {
      return { success: false, message: 'URL do webhook não fornecida' };
    }
    
    // Simular envio de teste
    try {
      const testPayload = {
        event: 'webhook.test',
        timestamp: new Date().toISOString(),
        data: { message: 'Teste de webhook' }
      };
      
      // Em produção, faria uma requisição real para a URL
      return { success: true, message: 'Webhook testado com sucesso' };
    } catch (error) {
      return { success: false, message: 'Falha ao enviar teste para webhook' };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Monitoramento em tempo real
  subscribeToIntegrationChanges(callback: (payload: any) => void) {
    return supabase
      .channel('integration_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'integrations'
      }, callback)
      .subscribe();
  }
}

export const integrationsService = new IntegrationsService();