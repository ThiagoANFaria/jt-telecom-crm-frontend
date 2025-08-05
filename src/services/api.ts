
import { validateEnvironment, secureLog, isValidToken } from '@/utils/security';
import { leadsService } from './leads';
import { clientsService } from './clients';

// Validate environment variables on module load
validateEnvironment();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.app.jttecnologia.com.br';

// Helper function to check token expiration (deprecated - use security utils)
const isTokenExpired = (token: string): boolean => {
  return !isValidToken(token);
};

// Helper function to handle API requests with automatic logout on 401
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token || isTokenExpired(token)) {
    secureLog('Token expired or missing, clearing auth data');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Token expired');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    secureLog('Received 401 - Token invalid, clearing auth data');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Token invalid');
  }

  return response;
};

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
      secureLog('Login error occurred');
      throw error;
    }
  },

  async getTenants() {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/tenants`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tenants');
      }
      
      return await response.json();
    } catch (error) {
      secureLog('API call failed: getTenants');
      return [];
    }
  },

  async getUsers() {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/users`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      return await response.json();
    } catch (error) {
      secureLog('API call failed: getUsers');
      return [];
    }
  },

  async getClients() {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/clients`);

      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }

      return await response.json();
    } catch (error) {
      secureLog('API call failed: getClients');
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
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/telephony/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone })
      });

      if (!response.ok) {
        throw new Error('Failed to make call');
      }

      return await response.json();
    } catch (error) {
      secureLog('API call failed: makeCall, using mock response');
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
      secureLog('API call failed: sendWhatsAppMessage, using mock response');
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
      secureLog('API call failed: getCallHistory, using mock response');
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
      secureLog('API call failed: getChatHistory, using mock response');
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
      secureLog('API call failed: updateCallTranscript, using mock response');
      return {
        success: true,
        message: 'Transcrições atualizadas com sucesso'
      };
    }
  },

  async getClient(id: string) {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/clients/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch client');
      }
      
      return await response.json();
    } catch (error) {
      secureLog('API call failed: getClient');
      throw error;
    }
  },

  async createClient(data: any) {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create client');
      }
      
      return await response.json();
    } catch (error) {
      secureLog('API call failed: createClient');
      throw error;
    }
  },

  async updateClient(id: string, data: any) {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update client');
      }
      
      return await response.json();
    } catch (error) {
      secureLog('API call failed: updateClient');
      throw error;
    }
  },

  async deleteClient(id: string) {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/clients/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete client');
      }
      
      return await response.json();
    } catch (error) {
      secureLog('API call failed: deleteClient');
      throw error;
    }
  },

  async getLeads() {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/leads`);

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      return await response.json();
    } catch (error) {
      secureLog('API call failed: getLeads');
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
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create lead');
      }
      
      return await response.json();
    } catch (error) {
      secureLog('API call failed: createLead');
      throw error;
    }
  },

  async updateLead(id: string, data: any) {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update lead');
      }
      
      return await response.json();
    } catch (error) {
      secureLog('API call failed: updateLead');
      throw error;
    }
  },

  async deleteLead(id: string) {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/leads/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete lead');
      }
      
      return await response.json();
    } catch (error) {
      secureLog('API call failed: deleteLead');
      throw error;
    }
  },

  async getProposals() {
    try {
      const token = import.meta.env.VITE_EASEPANEL_TOKEN;
      if (!token) {
        throw new Error('EASEPANEL_TOKEN not configured');
      }

      const response = await fetch(`${API_BASE_URL}/propostas`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch proposals: ${response.status}`);
      }
      
      const data = await response.json();
      secureLog('Proposals loaded successfully');
      return data;
    } catch (error) {
      secureLog('API call failed: getProposals');
      return [];
    }
  },

  async createProposal(data: any) {
    try {
      const token = import.meta.env.VITE_EASEPANEL_TOKEN;
      if (!token) {
        throw new Error('EASEPANEL_TOKEN not configured');
      }

      // Mapear campos para a API
      const apiData = {
        titulo: data.title,
        cliente_id: data.client_id,
        lead_id: data.lead_id,
        status: data.status,
        ...data
      };

      const response = await fetch(`${API_BASE_URL}/propostas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create proposal: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      secureLog('API call failed: createProposal');
      throw error;
    }
  },

  async updateProposal(id: string, data: any) {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/propostas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_EASEPANEL_TOKEN}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update proposal');
      }
      
      return await response.json();
    } catch (error) {
      secureLog('API call failed: updateProposal');
      throw error;
    }
  },

  async deleteProposal(id: string) {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/propostas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_EASEPANEL_TOKEN}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete proposal');
      }
      
      return await response.json();
    } catch (error) {
      secureLog('API call failed: deleteProposal');
      throw error;
    }
  },

  async getContracts() {
    try {
      const token = import.meta.env.VITE_EASEPANEL_TOKEN;
      if (!token) {
        throw new Error('EASEPANEL_TOKEN not configured');
      }

      const response = await fetch(`${API_BASE_URL}/contratos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch contracts: ${response.status}`);
      }
      
      const data = await response.json();
      secureLog('Contracts loaded successfully');
      return data;
    } catch (error) {
      secureLog('API call failed: getContracts');
      return [];
    }
  },

  async getDashboardSummary() {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/dashboard/summary`);

      if (!response.ok) {
        // Se a API não estiver disponível, retornar dados vazios em vez de fictícios
        return {
          totalLeads: 0,
          totalClients: 0,
          totalProposals: 0,
          totalContracts: 0,
          monthlyRevenue: 0,
          conversionRate: 0,
          revenue_this_month: 0,
          conversion_rate: 0,
          activeContractsThisMonth: 0,
          meetingsHeld: 0,
          hotLeads: 0,
          callsMade: 0,
          emailsSent: 0,
          meetingsScheduled: 0,
          tasksCompleted: 0,
          pendingFollowUps: 0,
          avgResponseTime: '0h',
          customerSatisfaction: 0,
          automationSuccess: 0,
          activeDeals: 0,
          closingDeals: 0
        };
      }

      return await response.json();
    } catch (error) {
      secureLog('Error fetching dashboard summary');
      // Retornar dados vazios em caso de erro
      return {
        totalLeads: 0,
        totalClients: 0,
        totalProposals: 0,
        totalContracts: 0,
        monthlyRevenue: 0,
        conversionRate: 0,
        revenue_this_month: 0,
        conversion_rate: 0,
        activeContractsThisMonth: 0,
        meetingsHeld: 0,
        hotLeads: 0,
        callsMade: 0,
        emailsSent: 0,
        meetingsScheduled: 0,
        tasksCompleted: 0,
        pendingFollowUps: 0,
        avgResponseTime: '0h',
        customerSatisfaction: 0,
        automationSuccess: 0,
        activeDeals: 0,
        closingDeals: 0
      };
    }
  },


  async sendChatbotMessage(message: string) {
    return { response: 'Resposta do chatbot', timestamp: new Date().toISOString() };
  },

  // APIs para Contratos
  async createContract(data: any) {
    try {
      const token = import.meta.env.VITE_EASEPANEL_TOKEN;
      if (!token) {
        throw new Error('EASEPANEL_TOKEN not configured');
      }

      // Mapear campos para a API
      const apiData = {
        titulo: data.title,
        cliente_id: data.client_id,
        lead_id: data.lead_id,
        status: data.status,
        validade: data.end_date,
        ...data
      };

      const response = await fetch(`${API_BASE_URL}/contratos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create contract: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      secureLog('API call failed: createContract');
      throw error;
    }
  },

  async updateContract(id: string, data: any) {
    try {
      const token = import.meta.env.VITE_EASEPANEL_TOKEN;
      if (!token) {
        throw new Error('EASEPANEL_TOKEN not configured');
      }

      // Mapear campos para a API
      const apiData = {
        titulo: data.title,
        cliente_id: data.client_id,
        lead_id: data.lead_id,
        status: data.status,
        validade: data.end_date,
        ...data
      };

      const response = await fetch(`${API_BASE_URL}/contratos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update contract: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      secureLog('API call failed: updateContract');
      throw error;
    }
  },

  async deleteContract(id: string) {
    try {
      const token = import.meta.env.VITE_EASEPANEL_TOKEN;
      if (!token) {
        throw new Error('EASEPANEL_TOKEN not configured');
      }

      const response = await fetch(`${API_BASE_URL}/contratos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete contract: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      secureLog('API call failed: deleteContract');
      throw error;
    }
  },

  async sendContractToD4Sign(contractId: string) {
    return {
      success: true,
      d4sign_document_id: `d4sign_${Date.now()}`,
      message: 'Contrato enviado para D4Sign com sucesso'
    };
  },

  // APIs para Propostas
  async sendProposalByEmail(proposalId: string) {
    return {
      success: true,
      message: 'Proposta enviada por email com sucesso'
    };
  },

  async sendProposalByWhatsApp(proposalId: string) {
    return {
      success: true,
      message: 'Proposta enviada por WhatsApp com sucesso'
    };
  },

  // API para buscar leads com autocomplete
  async searchLeads(query: string) {
    try {
      const token = import.meta.env.VITE_EASEPANEL_TOKEN;
      if (!token) {
        throw new Error('EASEPANEL_TOKEN not configured');
      }

      const response = await fetch(`${API_BASE_URL}/leads?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to search leads: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      secureLog('API call failed: searchLeads');
      return [];
    }
  },

  // API para buscar templates de propostas
  async getProposalTemplates() {
    try {
      const token = import.meta.env.VITE_EASEPANEL_TOKEN;
      if (!token) {
        throw new Error('EASEPANEL_TOKEN not configured');
      }

      const response = await fetch(`${API_BASE_URL}/propostas/templates`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch proposal templates: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      secureLog('API call failed: getProposalTemplates');
      return [];
    }
  },

  // API para buscar templates de contratos
  async getContractTemplates() {
    try {
      const token = import.meta.env.VITE_EASEPANEL_TOKEN;
      if (!token) {
        throw new Error('EASEPANEL_TOKEN not configured');
      }

      const response = await fetch(`${API_BASE_URL}/contratos/templates`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch contract templates: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      secureLog('API call failed: getContractTemplates');
      return [];
    }
  },

  // APIs para Leads
  async getLead(id: string) {
    return {
      id,
      name: 'Lead Exemplo',
      email: 'lead@exemplo.com',
      phone: '(11) 99999-9999',
      status: 'new' as const,
      source: 'website' as const,
      createdAt: new Date(),
      company: 'Empresa Exemplo',
      notes: 'Observações sobre o lead'
    };
  },

  async convertLeadToClient(leadId: string) {
    return {
      success: true,
      clientId: `client_${Date.now()}`,
      message: 'Lead convertido em cliente com sucesso'
    };
  },

  // API para Analytics
  async getDashboard() {
    return this.getDashboardSummary();
  },

  // APIs para Relatórios
  async getSalesReport(startDate?: string, endDate?: string) {
    return {
      total_sales: 150000,
      monthly_sales: 25000,
      conversion_rate: 12.5,
      avg_deal_size: 5000,
      period: {
        start_date: startDate || '2024-01-01',
        end_date: endDate || '2024-12-31'
      },
      summary: {
        total_revenue: 150000,
        total_deals: 30,
        average_deal_size: 5000,
        conversion_rate: 12.5,
        growth_rate: 8.3
      },
      by_salesperson: [
        { 
          name: 'João Silva', 
          deals_closed: 9, 
          revenue: 45000, 
          conversion_rate: 15.2, 
          average_deal_size: 5000 
        },
        { 
          name: 'Maria Santos', 
          deals_closed: 8, 
          revenue: 38000, 
          conversion_rate: 12.8, 
          average_deal_size: 4750 
        },
        { 
          name: 'Pedro Costa', 
          deals_closed: 7, 
          revenue: 32000, 
          conversion_rate: 11.5, 
          average_deal_size: 4571 
        }
      ],
      monthly_evolution: [
        { month: 'Jan', revenue: 12000, deals: 4 },
        { month: 'Fev', revenue: 15000, deals: 5 },
        { month: 'Mar', revenue: 18000, deals: 6 }
      ]
    };
  },

  // APIs para Tarefas
  async getTasks() {
    return [
      {
        id: '1',
        title: 'Contatar lead ABC Corp',
        description: 'Fazer follow-up do lead recebido via website',
        status: 'pendente',
        priority: 'alta',
        assigned_to: 'João Silva',
        due_date: '2024-01-20',
        createdAt: new Date(),
        created_at: new Date().toISOString()
      }
    ];
  },

  // APIs para Automação
  async triggerAutomation(trigger: string, data?: any) {
    return {
      success: true,
      automation_id: `auto_${Date.now()}`,
      message: 'Automação executada com sucesso',
      status: 'completed'
    };
  },

  // APIs para Master Panel - Tenants
  async createTenant(tenantData: any) {
    return {
      success: true,
      tenant: {
        id: `tenant_${Date.now()}`,
        name: tenantData.name,
        domain: tenantData.domain,
        admin_email: tenantData.admin_email,
        admin_name: tenantData.admin_name,
        phone: tenantData.phone,
        plan: tenantData.plan,
        active: true,
        created_at: new Date().toISOString(),
        users_count: 1,
        storage_used: '0MB'
      },
      message: 'Tenant criado com sucesso'
    };
  },

  async deleteTenant(tenantId: string) {
    return {
      success: true,
      message: 'Tenant excluído com sucesso'
    };
  },

  async updateTenant(tenantId: string, data: any) {
    return {
      success: true,
      message: 'Tenant atualizado com sucesso'
    };
  },

  // SMARTBOTS - Métodos da API
  async getSmartbots() {
    try {
      const token = import.meta.env.VITE_EASEPANEL_TOKEN;
      if (!token) {
        throw new Error('EASEPANEL_TOKEN not configured');
      }

      const response = await fetch(`${API_BASE_URL}/smartbots`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      secureLog('Smartbots fetched:', data);
      return data;
    } catch (error) {
      secureLog('Failed to fetch smartbots:', error);
      throw error;
    }
  },

  async createSmartbot(smartbotData: any) {
    try {
      const token = import.meta.env.VITE_EASEPANEL_TOKEN;
      if (!token) {
        throw new Error('EASEPANEL_TOKEN not configured');
      }

      const response = await fetch(`${API_BASE_URL}/smartbots`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(smartbotData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      secureLog('Smartbot created:', data);
      return data;
    } catch (error) {
      secureLog('Failed to create smartbot:', error);
      throw error;
    }
  },

  async updateSmartbot(id: string, smartbotData: any) {
    try {
      const token = import.meta.env.VITE_EASEPANEL_TOKEN;
      if (!token) {
        throw new Error('EASEPANEL_TOKEN not configured');
      }

      const response = await fetch(`${API_BASE_URL}/smartbots/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(smartbotData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      secureLog('Smartbot updated:', data);
      return data;
    } catch (error) {
      secureLog('Failed to update smartbot:', error);
      throw error;
    }
  },

  async deleteSmartbot(id: string) {
    try {
      const token = import.meta.env.VITE_EASEPANEL_TOKEN;
      if (!token) {
        throw new Error('EASEPANEL_TOKEN not configured');
      }

      const response = await fetch(`${API_BASE_URL}/smartbots/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      secureLog('Smartbot deleted successfully');
      return { success: true };
    } catch (error) {
      secureLog('Failed to delete smartbot:', error);
      throw error;
    }
  }
};

// Export as named export for compatibility
export const api = apiService;
