// API Service for JT VOX - Connected to real backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.app.jttecnologia.com.br';

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

export const apiService = {
  async login(email: string, password: string) {
    console.log('Login attempt to real API:', email);
    console.log('API Base URL:', API_BASE_URL);
    
    try {
      console.log('Making request to:', `${API_BASE_URL}/auth/login`);
      
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Login response:', response);
      return response;
    } catch (error) {
      console.error('Login API error details:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      throw error;
    }
  },

  async getTenants() {
    return apiRequest('/tenants');
  },

  async getUsers() {
    return apiRequest('/users');
  },

  async getClients(page = 1, limit = 50, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    return apiRequest(`/clients?${params}`);
  },

  async getClient(id: string) {
    return apiRequest(`/clients/${id}`);
  },

  async createClient(data: any) {
    return apiRequest('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateClient(id: string, data: any) {
    return apiRequest(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteClient(id: string) {
    return apiRequest(`/clients/${id}`, {
      method: 'DELETE',
    });
  },

  async getLeads(page = 1, limit = 50, search = '', status = '', source = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
      ...(source && { source })
    });
    return apiRequest(`/leads?${params}`);
  },

  async getLead(id: string) {
    return apiRequest(`/leads/${id}`);
  },

  async createLead(data: any) {
    return apiRequest('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateLead(id: string, data: any) {
    return apiRequest(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteLead(id: string) {
    return apiRequest(`/leads/${id}`, {
      method: 'DELETE',
    });
  },

  async getProposals(page = 1, limit = 50, status = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });
    return apiRequest(`/proposals?${params}`);
  },

  async getProposal(id: string) {
    return apiRequest(`/proposals/${id}`);
  },

  async createProposal(data: any) {
    return apiRequest('/proposals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProposal(id: string, data: any) {
    return apiRequest(`/proposals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteProposal(id: string) {
    return apiRequest(`/proposals/${id}`, {
      method: 'DELETE',
    });
  },

  async sendProposalByEmail(proposalId: string, email: string) {
    return apiRequest(`/proposals/${proposalId}/send-email`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async sendProposalByWhatsApp(proposalId: string, phone: string) {
    return apiRequest(`/proposals/${proposalId}/send-whatsapp`, {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  async getTasks(page = 1, limit = 50, status = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });
    return apiRequest(`/tasks?${params}`);
  },

  async createTask(data: any) {
    return apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTask(id: string, data: any) {
    return apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTask(id: string) {
    return apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  async getContracts(page = 1, limit = 50, status = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });
    return apiRequest(`/contracts?${params}`);
  },

  async createContract(data: any) {
    return apiRequest('/contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateContract(id: string, data: any) {
    return apiRequest(`/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getDashboardSummary() {
    return apiRequest('/dashboard/summary');
  },

  async getAnalytics(period = '30d') {
    return apiRequest(`/analytics?period=${period}`);
  },

  async makeCall(phoneNumber: string, leadId?: string) {
    return apiRequest('/telephony/call', {
      method: 'POST',
      body: JSON.stringify({ 
        phoneNumber, 
        ...(leadId && { leadId }) 
      }),
    });
  },

  async getCallHistory(page = 1, limit = 50) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    return apiRequest(`/telephony/history?${params}`);
  },

  async triggerAutomation(data: any) {
    return apiRequest('/automation/trigger', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAutomations() {
    return apiRequest('/automation');
  },

  async sendChatbotMessage(message: string, sessionId?: string) {
    return apiRequest('/chatbot/message', {
      method: 'POST',
      body: JSON.stringify({ 
        message, 
        ...(sessionId && { sessionId }) 
      }),
    });
  },

  async getChatbotHistory(sessionId: string) {
    return apiRequest(`/chatbot/history/${sessionId}`);
  },

  async getReports(type = 'sales', period = '30d') {
    return apiRequest(`/reports?type=${type}&period=${period}`);
  },

  async generateReport(config: any) {
    return apiRequest('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  async getSettings() {
    return apiRequest('/settings');
  },

  async updateSettings(data: any) {
    return apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async uploadFile(file: File, type = 'document') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  async searchCNPJ(cnpj: string) {
    return apiRequest(`/utils/cnpj/${cnpj}`);
  },

  async searchCEP(cep: string) {
    return apiRequest(`/utils/cep/${cep}`);
  }
};

// Export api as alias for backward compatibility
export const api = apiService;