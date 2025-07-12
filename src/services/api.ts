
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.app.jttecnologia.com.br';

// API Service for JT VOX
export const apiService = {
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Armazenar token no localStorage
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async getTenants() {
    return [
      { id: '1', name: 'JT Telecom', domain: 'jttelecom.com.br', created_at: '2024-01-01', active: true }
    ];
  },

  async getUsers() {
    return [
      { id: '1', name: 'Admin User', email: 'admin@jttelecom.com.br', createdAt: new Date().toISOString() }
    ];
  },

  async getClients() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      // Fallback para dados mock apenas em caso de erro
      return [
        { 
          id: '1', 
          name: 'Cliente Exemplo', 
          email: 'cliente@exemplo.com', 
          phone: '(11) 99999-9999',
          company: 'Empresa Exemplo',
          status: 'active' as const,
          createdAt: new Date(),
          monthly_value: 1500,
          payment_status: 'paid' as const,
          contract_start: '2024-01-01'
        }
      ];
    }
  },

  async makeCall(phone: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/telephony/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ phone })
      });

      if (!response.ok) {
        throw new Error('Failed to make call');
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed, using mock response:', error);
      // Mock response para desenvolvimento
      return {
        call_id: `call_${Date.now()}`,
        status: 'initiated',
        phone: phone,
        timestamp: new Date().toISOString()
      };
    }
  },

  async sendWhatsAppMessage(phone: string, message: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          phone, 
          message,
          platform: 'whatsapp'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send WhatsApp message');
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed, using mock response:', error);
      // Mock response para desenvolvimento
      return {
        message_id: `msg_${Date.now()}`,
        status: 'sent',
        phone: phone,
        message: message,
        timestamp: new Date().toISOString()
      };
    }
  },

  async getCallHistory(contactId: string, contactType: 'lead' | 'client') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/telephony/history/${contactType}/${contactId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get call history');
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed, using mock response:', error);
      // Mock response para desenvolvimento
      return [
        {
          id: '1',
          phone: '11999999999',
          direction: 'outbound',
          status: 'completed',
          duration: 180,
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          recording_url: '/recordings/call_001.mp3',
          call_transcript: 'Cliente interessado em plano empresarial. Solicitou orçamento para 50 ramais.',
          meeting_transcript: 'Reunião agendada para próxima semana. Cliente quer apresentação completa dos serviços.'
        },
        {
          id: '2',
          phone: '11999999999',
          direction: 'inbound',
          status: 'completed',
          duration: 240,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          recording_url: '/recordings/call_002.mp3',
          call_transcript: 'Cliente ligou para tirar dúvidas sobre faturamento. Explicado processo de cobrança.',
          meeting_transcript: 'Dúvidas esclarecidas. Cliente satisfeito com o atendimento.'
        }
      ];
    }
  },

  async getChatHistory(contactId: string, contactType: 'lead' | 'client') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot/history/${contactType}/${contactId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get chat history');
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed, using mock response:', error);
      // Mock response para desenvolvimento
      return [
        {
          id: '1',
          message: 'Olá! Gostaria de saber mais sobre os planos de telefonia.',
          response: 'Olá! Claro, temos diversos planos. Qual o porte da sua empresa?',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          platform: 'whatsapp',
          status: 'delivered'
        },
        {
          id: '2',
          message: 'Somos uma empresa de médio porte, cerca de 30 funcionários.',
          response: 'Perfeito! Para empresas desse porte, recomendamos nosso plano Business Pro. Posso agendar uma apresentação?',
          timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
          platform: 'whatsapp',
          status: 'delivered'
        },
        {
          id: '3',
          message: 'Sim, gostaria de agendar. Qual a disponibilidade?',
          response: 'Ótimo! Tenho disponibilidade para amanhã às 14h ou quinta-feira às 10h. Qual prefere?',
          timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
          platform: 'whatsapp',
          status: 'delivered'
        }
      ];
    }
  },

  async updateCallTranscript(callId: string, callTranscript: string, meetingTranscript?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/telephony/calls/${callId}/transcript`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          call_transcript: callTranscript, 
          meeting_transcript: meetingTranscript 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update transcript');
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed, using mock response:', error);
      return {
        success: true,
        message: 'Transcrições atualizadas com sucesso'
      };
    }
  },

  async getClient(id: string) {
    return { 
      id, 
      name: 'Cliente Exemplo', 
      email: 'cliente@exemplo.com', 
      phone: '(11) 99999-9999',
      company: 'Empresa Exemplo',
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      monthly_value: 1500,
        payment_status: 'paid' as const,
        contract_start: '2024-01-01',
        notes: 'Notas do cliente',
        createdAt: new Date()
    };
  },

  async createClient(data: any) {
    return { 
      id: Date.now().toString(), 
      ...data, 
      createdAt: new Date()
    };
  },

  async updateClient(id: string, data: any) {
    return { 
      id, 
      ...data, 
      createdAt: new Date()
    };
  },

  async deleteClient(id: string) {
    return { success: true };
  },

  async getLeads() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leads`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      // Fallback para dados mock apenas em caso de erro
      return [
        {
          id: '1',
          name: 'João Silva',
          email: 'joao@empresa.com',
          phone: '(11) 99999-9999',
          company: 'Empresa ABC',
          status: 'qualified',
          source: 'website',
          score: 85,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Maria Santos',
          email: 'maria@company.com',
          phone: '(11) 88888-8888',
          company: 'Company XYZ',
          status: 'contacted',
          source: 'referral',
          score: 70,
          createdAt: new Date().toISOString()
        }
      ];
    }
  },

  async createLead(data: any) {
    return { 
      id: Date.now().toString(), 
      ...data, 
      createdAt: new Date()
    };
  },

  async updateLead(id: string, data: any) {
    return { 
      id, 
      ...data, 
      createdAt: new Date()
    };
  },

  async deleteLead(id: string) {
    return { success: true };
  },

  async getProposals() {
    return [
      {
        id: '1',
        title: 'Proposta Exemplo',
        client_id: '1',
        amount: 15000,
        status: 'draft' as const,
        created_date: '2024-01-01',
        expiry_date: '2024-02-01',
        createdAt: new Date()
      }
    ];
  },

  async createProposal(data: any) {
    return { 
      id: Date.now().toString(), 
      ...data, 
      createdAt: new Date()
    };
  },

  async updateProposal(id: string, data: any) {
    return { 
      id, 
      ...data, 
      createdAt: new Date()
    };
  },

  async deleteProposal(id: string) {
    return { success: true };
  },

  async getContracts() {
    return [
      {
        id: '1',
        title: 'Contrato Exemplo',
        client_id: '1',
        amount: 15000,
        status: 'active' as const,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        description: 'Contrato exemplo',
        createdAt: new Date()
      }
    ];
  },

  async getDashboardSummary() {
    return {
      totalLeads: 150,
      totalClients: 85,
      totalProposals: 45,
      totalContracts: 30,
      monthlyRevenue: 125000,
      conversionRate: 65.5,
      revenue_this_month: 125000,
      conversion_rate: 65.5,
      activeContractsThisMonth: 12,
      meetingsHeld: 28
    };
  },

  async triggerAutomation(data: any) {
    return { success: true, message: 'Automação iniciada', status: 'running' };
  },

  async sendChatbotMessage(message: string) {
    return { response: 'Resposta do chatbot', timestamp: new Date().toISOString() };
  }
};

// Export as named export for compatibility
export const api = apiService;
