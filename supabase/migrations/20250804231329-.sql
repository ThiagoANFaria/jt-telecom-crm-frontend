-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  user_level TEXT DEFAULT 'user' CHECK (user_level IN ('master', 'admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Criar tabela de tags
CREATE TABLE public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Policies para tags
CREATE POLICY "Users can manage their own tags" ON public.tags
  FOR ALL USING (auth.uid() = user_id);

-- Criar tabela de leads
CREATE TABLE public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  company TEXT,
  position TEXT,
  status TEXT DEFAULT 'Novo' CHECK (status IN ('Novo', 'Qualificado', 'Em Negociação', 'Fechado', 'Perdido')),
  source TEXT DEFAULT 'Website' CHECK (source IN ('Website', 'Instagram', 'Indicação', 'Email', 'Telefone', 'Outros')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  budget DECIMAL(15,2),
  timeline TEXT,
  notes TEXT,
  cnpj_cpf TEXT,
  ie_rg TEXT,
  address TEXT,
  number TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  cep TEXT,
  responsible TEXT,
  next_contact TIMESTAMP WITH TIME ZONE,
  last_contact TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policies para leads
CREATE POLICY "Users can manage their own leads" ON public.leads
  FOR ALL USING (auth.uid() = user_id);

-- Criar tabela de clientes
CREATE TABLE public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  company TEXT,
  cnpj_cpf TEXT,
  ie_rg TEXT,
  address TEXT,
  number TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  cep TEXT,
  status TEXT DEFAULT 'Ativo',
  notes TEXT,
  monthly_value DECIMAL(15,2),
  annual_value DECIMAL(15,2),
  payment_status TEXT DEFAULT 'em_dia' CHECK (payment_status IN ('em_dia', 'em_atraso', 'pendente')),
  contract_start DATE,
  contract_end DATE,
  contract_value DECIMAL(15,2),
  responsible TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policies para clients
CREATE POLICY "Users can manage their own clients" ON public.clients
  FOR ALL USING (auth.uid() = user_id);

-- Criar tabela de propostas
CREATE TABLE public.proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviada', 'aceita', 'rejeitada', 'revisao')),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  amount DECIMAL(15,2),
  discount DECIMAL(15,2),
  total_amount DECIMAL(15,2),
  valid_until DATE,
  template_id TEXT,
  notes TEXT,
  number TEXT,
  content TEXT,
  expiry_date DATE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para proposals
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Policies para proposals
CREATE POLICY "Users can manage their own proposals" ON public.proposals
  FOR ALL USING (auth.uid() = user_id);

-- Criar tabela de contratos
CREATE TABLE public.contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'ativo', 'concluido', 'cancelado')),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  amount DECIMAL(15,2),
  start_date DATE,
  end_date DATE,
  validade DATE,
  template_id TEXT,
  notes TEXT,
  content TEXT,
  d4sign_document_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para contracts
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Policies para contracts
CREATE POLICY "Users can manage their own contracts" ON public.contracts
  FOR ALL USING (auth.uid() = user_id);

-- Criar tabela de smartbots
CREATE TABLE public.smartbots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'pausado')),
  canal TEXT DEFAULT 'whatsapp' CHECK (canal IN ('whatsapp', 'telegram', 'webchat', 'email')),
  configuracoes JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para smartbots
ALTER TABLE public.smartbots ENABLE ROW LEVEL SECURITY;

-- Policies para smartbots
CREATE POLICY "Users can manage their own smartbots" ON public.smartbots
  FOR ALL USING (auth.uid() = user_id);

-- Criar tabela de tarefas
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
  priority TEXT DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
  assigned_to TEXT,
  due_date DATE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policies para tasks
CREATE POLICY "Users can manage their own tasks" ON public.tasks
  FOR ALL USING (auth.uid() = user_id);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_smartbots_updated_at BEFORE UPDATE ON public.smartbots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil quando usuário se cadastra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();