export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
}

export interface Contract {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
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
