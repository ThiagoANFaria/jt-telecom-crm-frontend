import { supabase } from '@/integrations/supabase/client';

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  description?: string;
  is_encrypted?: boolean;
  user_id: string;
  tenant_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SettingsCategory {
  general: {
    company_name: string;
    company_domain: string;
    dark_mode: boolean;
    auto_save: boolean;
    language: string;
    timezone: string;
  };
  leads: {
    auto_qualification: boolean;
    lead_sources: string[];
    follow_up_days: number;
    scoring_enabled: boolean;
    max_leads: number;
    custom_fields: any[];
  };
  clients: {
    payment_notifications: boolean;
    payment_tracking: boolean;
    default_tags: string[];
    contract_alerts: boolean;
    max_clients: number;
  };
  proposals: {
    template_id: string;
    auto_numbering: boolean;
    default_validity: number;
    variables: any[];
    approval_process: boolean;
  };
  contracts: {
    template_id: string;
    digital_signature: boolean;
    auto_renewal: boolean;
    notification_days: number;
  };
  jtvox: {
    pabx_server: string;
    recording_enabled: boolean;
    auto_transcription: boolean;
    report_frequency: string;
    extension_settings: any;
  };
  smartbot: {
    openai_enabled: boolean;
    default_model: string;
    response_delay: number;
    training_data: any[];
    active_bots: string[];
  };
  integrations: {
    smtp_settings: any;
    openai_settings: any;
    d4sign_settings: any;
    webhook_urls: string[];
    api_keys: any;
  };
}

class SettingsService {
  async getSettings(category?: string): Promise<SystemSetting[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    let query = supabase
      .from('system_settings')
      .select('*')
      .eq('user_id', user.id)
      .order('category', { ascending: true })
      .order('key', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getSetting(key: string, category: string = 'general'): Promise<SystemSetting | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('user_id', user.id)
      .eq('key', key)
      .eq('category', category)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async setSetting(
    key: string, 
    value: any, 
    category: string = 'general',
    description?: string,
    isEncrypted: boolean = false
  ): Promise<SystemSetting> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const settingData = {
      key,
      value,
      category,
      description,
      is_encrypted: isEncrypted,
      user_id: user.id,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('system_settings')
      .upsert(settingData, {
        onConflict: 'user_id,key,category'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async setMultipleSettings(settings: Array<{
    key: string;
    value: any;
    category: string;
    description?: string;
    isEncrypted?: boolean;
  }>): Promise<SystemSetting[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const settingsData = settings.map(setting => ({
      key: setting.key,
      value: setting.value,
      category: setting.category,
      description: setting.description,
      is_encrypted: setting.isEncrypted || false,
      user_id: user.id,
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('system_settings')
      .upsert(settingsData, {
        onConflict: 'user_id,key,category'
      })
      .select();

    if (error) throw error;
    return data || [];
  }

  async deleteSetting(key: string, category: string = 'general'): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('system_settings')
      .delete()
      .eq('user_id', user.id)
      .eq('key', key)
      .eq('category', category);

    if (error) throw error;
  }

  async getSettingsByCategory(): Promise<Record<string, SystemSetting[]>> {
    const settings = await this.getSettings();
    return settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {} as Record<string, SystemSetting[]>);
  }

  // Métodos específicos para diferentes categorias
  async getGeneralSettings(): Promise<Partial<SettingsCategory['general']>> {
    const settings = await this.getSettings('general');
    return this.transformSettingsToObject(settings);
  }

  async getLeadSettings(): Promise<Partial<SettingsCategory['leads']>> {
    const settings = await this.getSettings('leads');
    return this.transformSettingsToObject(settings);
  }

  async getClientSettings(): Promise<Partial<SettingsCategory['clients']>> {
    const settings = await this.getSettings('clients');
    return this.transformSettingsToObject(settings);
  }

  async getIntegrationSettings(): Promise<Partial<SettingsCategory['integrations']>> {
    const settings = await this.getSettings('integrations');
    return this.transformSettingsToObject(settings);
  }

  private transformSettingsToObject(settings: SystemSetting[]): any {
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as any);
  }

  // Configurações padrão do sistema
  async initializeDefaultSettings(): Promise<void> {
    const defaultSettings = [
      // General
      { key: 'company_name', value: 'Minha Empresa', category: 'general', description: 'Nome da empresa' },
      { key: 'dark_mode', value: false, category: 'general', description: 'Modo escuro' },
      { key: 'auto_save', value: true, category: 'general', description: 'Salvamento automático' },
      { key: 'language', value: 'pt-BR', category: 'general', description: 'Idioma do sistema' },
      { key: 'timezone', value: 'America/Sao_Paulo', category: 'general', description: 'Fuso horário' },

      // Leads
      { key: 'auto_qualification', value: true, category: 'leads', description: 'Qualificação automática de leads' },
      { key: 'lead_sources', value: ['Website', 'Facebook', 'Google Ads', 'Indicação'], category: 'leads', description: 'Fontes de leads' },
      { key: 'follow_up_days', value: 7, category: 'leads', description: 'Dias para follow-up' },
      { key: 'scoring_enabled', value: true, category: 'leads', description: 'Sistema de pontuação' },
      { key: 'max_leads', value: 1000, category: 'leads', description: 'Limite máximo de leads' },

      // Clients
      { key: 'payment_notifications', value: true, category: 'clients', description: 'Notificações de pagamento' },
      { key: 'payment_tracking', value: true, category: 'clients', description: 'Acompanhamento de pagamentos' },
      { key: 'contract_alerts', value: true, category: 'clients', description: 'Alertas de contratos' },
      { key: 'max_clients', value: 500, category: 'clients', description: 'Limite máximo de clientes' },

      // Integrations
      { key: 'webhook_urls', value: [], category: 'integrations', description: 'URLs de webhooks' },
      
      // PABX
      { key: 'pabx_token', value: '', category: 'pabx', description: 'Token de autenticação do PABX', isEncrypted: true },
      { key: 'pabx_usuario', value: 'jt_tecnologia', category: 'pabx', description: 'Usuário de autenticação do PABX' },
      { key: 'pabx_enabled', value: false, category: 'pabx', description: 'Integração PABX habilitada' }
    ];

    await this.setMultipleSettings(defaultSettings);
  }
}

export const settingsService = new SettingsService();