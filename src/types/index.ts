
export interface User {
  id: string;
  name: string;
  email: string;
  user_level: 'master' | 'admin' | 'user';
  tenant_id?: string;
  created_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  created_at: string;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  createdAt: string;
  monthly_value?: number;
  payment_status?: 'paid' | 'pending' | 'overdue';
  contract_start?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  source: 'website' | 'social' | 'referral' | 'advertising' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  score: string;
  tags: string[];
  notes?: string;
  created_at: string;
  createdAt: string;
  whatsapp?: string;
  cnpj_cpf?: string;
  ie_rg?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
}

export interface Contract {
  id: string;
  title: string;
  client_name: string;
  client_id: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  amount: number;
  created_at: string;
  createdAt: string;
}

export interface Proposal {
  id: string;
  title: string;
  client_name: string;
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  created_at: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface DashboardSummary {
  totalLeads: number;
  total_leads: number;
  totalClients: number;
  total_clients: number;
  totalProposals: number;
  total_proposals: number;
  totalContracts: number;
  total_contracts: number;
  conversionRate: number;
  conversion_rate: number;
  revenue_this_month: number;
}

export interface Activity {
  id: string;
  type: 'lead' | 'client' | 'contract' | 'proposal' | 'call' | 'email';
  description: string;
  created_at: string;
  user_name?: string;
}

export interface CallLog {
  id: string;
  phone_number: string;
  duration: number;
  type: 'inbound' | 'outbound';
  status: 'completed' | 'missed' | 'busy';
  created_at: string;
  notes?: string;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  created_at: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  pipeline_id: string;
}

export interface ChatbotFlow {
  id: string;
  name: string;
  trigger: string;
  response: string;
  active: boolean;
  created_at: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
  created_at: string;
}
