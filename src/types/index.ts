
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  createdAt: Date;
  company?: string;
  position?: string;
  score?: number;
  tags?: string[];
  notes?: string;
  budget?: number;
  timeline?: string;
  interests?: string[];
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
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
  payment_status?: string;
  contract_start?: string;
  contract_end?: string;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  client_id?: string;
  amount?: number;
  discount?: number;
  total_amount?: number;
  valid_until?: string;
  template_id?: string;
  notes?: string;
  number?: string;
  content?: string;
}

export interface Contract {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  client_id?: string;
  amount?: number;
  start_date?: string;
  end_date?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
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
}
