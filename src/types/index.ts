
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed' | 'lost' | 'Novo' | 'Qualificado' | 'Em Negociação';
  source: 'website' | 'referral' | 'social' | 'email' | 'phone' | 'other' | 'Website' | 'Instagram' | 'Indicação';
  createdAt?: Date;
  created_at?: string;
  updated_at?: string;
  company?: string;
  position?: string;
  score?: number;
  tags?: (string | Tag)[];
  notes?: string;
  budget?: number;
  timeline?: string;
  interests?: string[];
  whatsapp?: string;
  cnpj_cpf?: string;
  ie_rg?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
  responsible?: string;
  next_contact?: string;
  last_contact?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt?: Date;
  created_at?: string; // Para compatibilidade com backend
  updated_at?: string; // Para compatibilidade com backend
  whatsapp?: string;
  company?: string;
  cnpj_cpf?: string;
  ie_rg?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
  status?: string;
  products?: string[];
  notes?: string;
  monthly_value?: number;
  annual_value?: number;
  payment_status?: 'paid' | 'pending' | 'overdue' | 'em_dia' | 'em_atraso' | 'pendente';
  contract_start?: string;
  contract_end?: string;
  contract_value?: number; // Valor do contrato
  responsible?: string; // Responsável pelo cliente
}

export interface Proposal {
  id: string;
  titulo: string; // Campo da API
  title?: string; // Para compatibilidade
  description?: string;
  status: 'rascunho' | 'enviada' | 'aceita' | 'rejeitada' | 'revisao' | 'draft';
  createdAt?: Date;
  created_at?: string;
  data_criacao?: string; // Campo da API
  updated_at?: string;
  client_id?: string;
  cliente_id?: string; // Campo da API
  lead_id?: string;
  client_name?: string; // Nome do cliente
  client_email?: string; // Email do cliente
  client_phone?: string; // Telefone do cliente
  amount?: number;
  discount?: number;
  total_amount?: number;
  valid_until?: string;
  template_id?: string;
  notes?: string;
  number?: string;
  content?: string;
  created_date?: string;
  expiry_date?: string;
}

export interface Contract {
  id: string;
  titulo: string; // Campo da API
  title?: string; // Para compatibilidade
  description?: string;
  status: 'pendente' | 'ativo' | 'concluido' | 'cancelado' | 'active';
  createdAt?: Date;
  created_at?: string;
  data_criacao?: string; // Campo da API
  client_id?: string;
  cliente_id?: string; // Campo da API
  lead_id?: string;
  client_name?: string; // Nome do cliente
  client_email?: string; // Email do cliente  
  client_phone?: string; // Telefone do cliente
  amount?: number;
  start_date?: string;
  end_date?: string;
  validade?: string; // Campo da API
  template_id?: string; // ID do template usado
  notes?: string; // Observações
  content?: string; // Conteúdo do contrato
  d4sign_document_id?: string; // ID do documento no D4Sign
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  created_at?: string;
  priority?: string;
  assigned_to?: string;
  due_date?: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  user_level?: 'master' | 'admin' | 'user';
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  created_at: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  description?: string;
  leads?: number;
  order?: number;
}

export interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  lead?: Lead;
}

export interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  type: string;
}

export interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  proposal?: Proposal;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at?: string;
}

export interface DashboardSummary {
  totalLeads: number;
  totalClients: number;
  totalProposals: number;
  totalContracts: number;
  monthlyRevenue: number;
  conversionRate: number;
  activeContractsThisMonth?: number;
  meetingsHeld?: number;
  revenue_this_month?: number;
  conversion_rate?: number;
  total_leads?: number;
  total_clients?: number;
  total_proposals?: number;
  total_contracts?: number;
}

export interface SalesReport {
  total_sales: number;
  monthly_sales: number;
  conversion_rate: number;
  avg_deal_size: number;
  period?: {
    start_date: string;
    end_date: string;
  };
  summary?: {
    total_revenue: number;
    total_deals: number;
    average_deal_size: number;
    conversion_rate: number;
    growth_rate: number;
  };
  by_salesperson?: any[];
  monthly_evolution?: any[];
}
