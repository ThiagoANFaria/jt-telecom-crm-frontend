
// API Service for JT VOX
export const apiService = {
  async login(email: string, password: string) {
    // Simulated login response - replace with real API call
    console.log('Login attempt:', email);
    
    // Mock successful login response
    return {
      access_token: 'mock-jwt-token',
      user: {
        id: '1',
        name: 'Admin User',
        email: email,
        user_level: 'admin' as const,
        tenant_id: '1',
        createdAt: new Date()
      }
    };
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
    return [
      {
        id: '1',
        name: 'Lead Exemplo',
        email: 'lead@exemplo.com',
        phone: '(11) 99999-9999',
        company: 'Empresa Exemplo',
        source: 'website' as const,
        status: 'new' as const,
        score: 85,
        createdAt: new Date()
      }
    ];
  },

  async getLead(id: string) {
    return {
      id,
      name: 'Lead Exemplo',
      email: 'lead@exemplo.com',
      phone: '(11) 99999-9999',
      company: 'Empresa Exemplo',
      source: 'website' as const,
        status: 'new' as const,
        score: 85,
        createdAt: new Date()
    };
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
