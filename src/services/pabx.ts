// Serviço de integração com PABX em Nuvem
// API: https://emnuvem.meupabxip.com.br/suite/api

import { supabase } from '@/integrations/supabase/client';
import { settingsService } from './settings';

export interface PabxCall {
  id: string;
  caller: string;
  called: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  status: 'ringing' | 'answered' | 'busy' | 'no_answer' | 'failed' | 'completed';
  direction: 'inbound' | 'outbound';
  recording_url?: string;
  cost?: number;
  extension?: string;
  user_id?: string;
}

export interface PabxExtension {
  id: string;
  number: string;
  name: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  department?: string;
}

export interface PabxCallRequest {
  extension: string;
  phone: string;
  caller_id?: string;
}

export interface PabxCallHistory {
  id: string;
  caller: string;
  called: string;
  start_time: string;
  end_time?: string;
  duration: number;
  status: string;
  direction: 'inbound' | 'outbound';
  recording_url?: string;
  cost?: number;
  extension?: string;
}

class PabxService {
  private baseUrl = 'https://emnuvem.meupabxip.com.br/suite/api';

  private async getAuthCredentials() {
    const usuario = await settingsService.getSetting('pabx_usuario', 'pabx');
    const token = await settingsService.getSetting('pabx_token', 'pabx');
    
    return {
      usuario: usuario?.value || 'jt_tecnologia',
      token: token?.value || ''
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const { usuario, token } = await this.getAuthCredentials();
    
    if (!token) {
      throw new Error('Token do PABX não configurado. Configure o token nas Configurações do sistema.');
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    // Adicionar autenticação via parâmetros URL conforme documentação
    const separator = endpoint.includes('?') ? '&' : '?';
    const authenticatedUrl = `${url}${separator}autenticacao_usuario=${usuario}&autenticacao_token=${token}`;

    const response = await fetch(authenticatedUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`PABX API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Realizar chamada (Click2Call)
  async makeCall(extension: string, phone: string, callerId?: string): Promise<{ call_id: string; status: string }> {
    try {
      const response = await this.request<{ call_id: string; status: string }>('/discar_numero', {
        method: 'POST',
        body: JSON.stringify({
          ramal: extension,
          numero: phone,
          caller_id: callerId
        }),
      });

      // Salvar chamada local no Supabase
      await this.saveCallToDatabase({
        caller: extension,
        called: phone,
        start_time: new Date().toISOString(),
        status: 'ringing',
        direction: 'outbound',
        extension: extension
      });

      return response;
    } catch (error) {
      console.error('Erro ao realizar chamada:', error);
      throw error;
    }
  }

  // Listar chamadas online/ativas
  async getActiveCalls(): Promise<PabxCall[]> {
    try {
      const response = await this.request<{ chamadas: any[] }>('/listar_chamadas_online');
      
      return response.chamadas?.map(call => ({
        id: call.id || call.uniqueid,
        caller: call.caller || call.calleridnum,
        called: call.called || call.calleridname,
        start_time: call.start_time || call.answertime,
        duration: call.duration || 0,
        status: call.status || 'ringing',
        direction: call.direction || 'inbound',
        extension: call.extension || call.channel
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar chamadas ativas:', error);
      return [];
    }
  }

  // Buscar histórico de chamadas
  async getCallHistory(filters?: {
    startDate?: string;
    endDate?: string;
    extension?: string;
    phone?: string;
    direction?: 'inbound' | 'outbound';
  }): Promise<PabxCallHistory[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.startDate) params.append('data_inicio', filters.startDate);
      if (filters?.endDate) params.append('data_fim', filters.endDate);
      if (filters?.extension) params.append('ramal', filters.extension);
      if (filters?.phone) params.append('numero', filters.phone);

      const queryString = params.toString();
      const endpoint = `/listar_historico_chamada${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.request<{ chamadas: any[] }>(endpoint);
      
      const calls = response.chamadas?.map(call => ({
        id: call.id || call.uniqueid,
        caller: call.caller || call.src,
        called: call.called || call.dst,
        start_time: call.start_time || call.calldate,
        end_time: call.end_time || call.end,
        duration: parseInt(call.duration) || 0,
        status: call.disposition || call.status,
        direction: call.direction || (call.src?.length <= 4 ? 'outbound' : 'inbound'),
        recording_url: call.recording_url || call.recordingfile,
        cost: parseFloat(call.cost) || 0,
        extension: call.extension || call.src
      })) || [];

      // Sincronizar com banco local
      await this.syncCallsToDatabase(calls);
      
      return calls;
    } catch (error) {
      console.error('Erro ao buscar histórico de chamadas:', error);
      
      // Em caso de erro na API, buscar dados locais
      return this.getLocalCallHistory(filters);
    }
  }

  // Buscar ramais
  async getExtensions(): Promise<PabxExtension[]> {
    try {
      const response = await this.request<{ ramais: any[] }>('/listar_ramais');
      
      return response.ramais?.map(ramal => ({
        id: ramal.id,
        number: ramal.name || ramal.numero,
        name: ramal.callerid || ramal.nome,
        status: ramal.status || 'offline',
        department: ramal.department || ramal.setor
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar ramais:', error);
      return [];
    }
  }

  // Buscar URL de gravação
  async getRecordingUrl(callId: string): Promise<string | null> {
    try {
      const history = await this.getCallHistory();
      const call = history.find(c => c.id === callId);
      return call?.recording_url || null;
    } catch (error) {
      console.error('Erro ao buscar gravação:', error);
      return null;
    }
  }

  // Salvar chamada no banco local
  private async saveCallToDatabase(call: Partial<PabxCall>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('call_history').insert({
        user_id: user.id,
        caller: call.caller,
        called: call.called,
        start_time: call.start_time,
        end_time: call.end_time,
        duration: call.duration,
        status: call.status,
        direction: call.direction,
        recording_url: call.recording_url,
        cost: call.cost,
        extension: call.extension,
        external_id: call.id
      });
    } catch (error) {
      console.error('Erro ao salvar chamada no banco local:', error);
    }
  }

  // Sincronizar chamadas com banco local
  private async syncCallsToDatabase(calls: PabxCallHistory[]): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      for (const call of calls) {
        await supabase.from('call_history').upsert({
          user_id: user.id,
          external_id: call.id,
          caller: call.caller,
          called: call.called,
          start_time: call.start_time,
          end_time: call.end_time,
          duration: call.duration,
          status: call.status,
          direction: call.direction,
          recording_url: call.recording_url,
          cost: call.cost,
          extension: call.extension
        }, {
          onConflict: 'external_id,user_id'
        });
      }
    } catch (error) {
      console.error('Erro ao sincronizar chamadas:', error);
    }
  }

  // Buscar histórico local em caso de falha da API
  private async getLocalCallHistory(filters?: {
    startDate?: string;
    endDate?: string;
    extension?: string;
    phone?: string;
    direction?: 'inbound' | 'outbound';
  }): Promise<PabxCallHistory[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('call_history')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('start_time', filters.startDate);
      }
      
      if (filters?.endDate) {
        query = query.lte('start_time', filters.endDate);
      }
      
      if (filters?.extension) {
        query = query.eq('extension', filters.extension);
      }
      
      if (filters?.phone) {
        query = query.or(`caller.eq.${filters.phone},called.eq.${filters.phone}`);
      }
      
      if (filters?.direction) {
        query = query.eq('direction', filters.direction);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      return data?.map(call => ({
        id: call.external_id || call.id,
        caller: call.caller,
        called: call.called,
        start_time: call.start_time,
        end_time: call.end_time,
        duration: call.duration || 0,
        status: call.status,
        direction: (call.direction === 'inbound' || call.direction === 'outbound') ? call.direction : 'outbound',
        recording_url: call.recording_url,
        cost: call.cost,
        extension: call.extension
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar histórico local:', error);
      return [];
    }
  }

  // Testar conectividade com o PABX
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.getExtensions();
      return { success: true, message: 'Conexão com PABX estabelecida com sucesso' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido ao conectar com PABX' 
      };
    }
  }
}

export const pabxService = new PabxService();