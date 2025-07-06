
import { User, Tenant, Client, Lead, Contract, Proposal, Task, DashboardSummary, Activity, CallLog, Pipeline, ChatbotFlow, AutomationRule } from '../types';

// Mock data for development
const mockUsers: User[] = [
  { id: '1', name: 'Admin Master', email: 'admin@jttelecom.com.br', user_level: 'master', created_at: '2024-01-01' },
  { id: '2', name: 'Admin Tenant', email: 'admin@cliente.com', user_level: 'admin', tenant_id: '1', created_at: '2024-01-02' },
  { id: '3', name: 'Usuário Final', email: 'usuario@cliente.com', user_level: 'user', tenant_id: '1', created_at: '2024-01-03' }
];

const mockTenants: Tenant[] = [
  { id: '1', name: 'Empresa ABC', domain: 'abc.com', created_at: '2024-01-01', active: true },
  { id: '2', name: 'Empresa XYZ', domain: 'xyz.com', created_at: '2024-01-02', active: true }
];

const mockClients: Client[] = [
  { 
    id: '1', 
    name: 'João Silva', 
    email: 'joao@email.com', 
    phone: '(11) 99999-9999', 
    company: 'Empresa A', 
    status: 'active', 
    created_at: '2024-01-01',
    createdAt: '2024-01-01',
    monthly_value: 1500,
    payment_status: 'paid',
    contract_start: '2024-01-01'
  },
  { 
    id: '2', 
    name: 'Maria Santos', 
    email: 'maria@email.com', 
    phone: '(11) 88888-8888', 
    company: 'Empresa B', 
    status: 'active', 
    created_at: '2024-01-02',
    createdAt: '2024-01-02',
    monthly_value: 2500,
    payment_status: 'pending',
    contract_start: '2024-01-15'
  }
];

const mockLeads: Lead[] = [
  { 
    id: '1', 
    name: 'Pedro Costa', 
    email: 'pedro@email.com', 
    phone: '(11) 77777-7777', 
    company: 'Startup Tech', 
    source: 'website', 
    status: 'new', 
    score: '85', 
    tags: ['hot', 'tech'], 
    created_at: '2024-01-01',
    createdAt: '2024-01-01',
    whatsapp: '(11) 77777-7777',
    city: 'São Paulo',
    state: 'SP'
  }
];

const mockContracts: Contract[] = [
  { 
    id: '1', 
    title: 'Contrato Telecom', 
    client_name: 'João Silva', 
    client_id: '1',
    status: 'active', 
    start_date: '2024-01-01', 
    end_date: '2024-12-31', 
    amount: 18000, 
    created_at: '2024-01-01',
    createdAt: '2024-01-01'
  }
];

const mockProposals: Proposal[] = [
  { 
    id: '1', 
    title: 'Proposta Sistema VoIP', 
    client_name: 'Maria Santos', 
    amount: 25000, 
    status: 'sent', 
    created_at: '2024-01-01',
    createdAt: '2024-01-01'
  }
];

const mockDashboardSummary: DashboardSummary = {
  totalLeads: 15,
  total_leads: 15,
  totalClients: 8,
  total_clients: 8,
  totalProposals: 5,
  total_proposals: 5,
  totalContracts: 3,
  total_contracts: 3,
  conversionRate: 25.5,
  conversion_rate: 25.5,
  revenue_this_month: 45000
};

// API functions
export const api = {
  // Auth
  async login(credentials: { email: string; password: string }): Promise<{ user: User; token: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const user = mockUsers.find(u => u.email === credentials.email);
    if (!user) throw new Error('Usuário não encontrado');
    return { user, token: 'mock-token' };
  },

  // Master functions
  async getTenants(): Promise<Tenant[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTenants;
  },

  async getUsers(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUsers;
  },

  // CRM functions
  async getClients(): Promise<Client[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockClients;
  },

  async getLeads(): Promise<Lead[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockLeads;
  },

  async getContracts(): Promise<Contract[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockContracts;
  },

  async getProposals(): Promise<Proposal[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProposals;
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDashboardSummary;
  },

  async createLead(lead: Partial<Lead>): Promise<Lead> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newLead: Lead = {
      id: Date.now().toString(),
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company,
      source: lead.source || 'website',
      status: lead.status || 'new',
      score: lead.score || '0',
      tags: lead.tags || [],
      notes: lead.notes,
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      whatsapp: lead.whatsapp,
      cnpj_cpf: lead.cnpj_cpf,
      ie_rg: lead.ie_rg,
      address: lead.address,
      number: lead.number,
      neighborhood: lead.neighborhood,
      city: lead.city,
      state: lead.state,
      cep: lead.cep
    };
    mockLeads.push(newLead);
    return newLead;
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockLeads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead não encontrado');
    mockLeads[index] = { ...mockLeads[index], ...updates };
    return mockLeads[index];
  },

  async createProposal(proposal: Partial<Proposal>): Promise<Proposal> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newProposal: Proposal = {
      id: Date.now().toString(),
      title: proposal.title || '',
      client_name: proposal.client_name || '',
      amount: proposal.amount || 0,
      status: proposal.status || 'draft',
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    mockProposals.push(newProposal);
    return newProposal;
  },

  async updateProposal(id: string, updates: Partial<Proposal>): Promise<Proposal> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockProposals.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Proposta não encontrada');
    mockProposals[index] = { ...mockProposals[index], ...updates };
    return mockProposals[index];
  }
};
