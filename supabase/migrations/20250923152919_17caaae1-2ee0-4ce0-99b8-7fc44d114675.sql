-- Criar tipos enumerados
CREATE TYPE user_level AS ENUM ('master', 'admin', 'user');
CREATE TYPE tenant_plan AS ENUM ('basic', 'pro', 'enterprise');
CREATE TYPE tenant_status AS ENUM ('trial', 'active', 'suspended', 'cancelled');

-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  email TEXT NOT NULL,
  user_level TEXT NOT NULL DEFAULT 'user',
  company_name TEXT,
  tenant_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  permissions JSONB DEFAULT '[]'
);

-- Criar tabela de tenants (organizações)
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  plan tenant_plan DEFAULT 'basic',
  status tenant_status DEFAULT 'trial',
  max_users INTEGER NOT NULL DEFAULT 5,
  current_users INTEGER NOT NULL DEFAULT 0,
  admin_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{"max_leads": 1000, "max_clients": 500, "custom_branding": false, "integrations_enabled": []}'
);

-- Criar tabela de funções de usuário
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role user_level NOT NULL,
  tenant_id UUID,
  granted_by UUID,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role, tenant_id)
);

-- Criar tabela de leads
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  company TEXT,
  position TEXT,
  status TEXT DEFAULT 'Novo',
  source TEXT DEFAULT 'Website',
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
  score INTEGER DEFAULT 0,
  budget NUMERIC,
  next_contact TIMESTAMP WITH TIME ZONE,
  last_contact TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de clientes
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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
  payment_status TEXT DEFAULT 'em_dia',
  responsible TEXT,
  monthly_value NUMERIC,
  annual_value NUMERIC,
  contract_start DATE,
  contract_end DATE,
  contract_value NUMERIC,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de propostas
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'rascunho',
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  template_id TEXT,
  notes TEXT,
  number TEXT,
  content TEXT,
  client_id UUID,
  lead_id UUID,
  amount NUMERIC,
  discount NUMERIC,
  total_amount NUMERIC,
  valid_until DATE,
  expiry_date DATE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de contratos
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pendente',
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  template_id TEXT,
  notes TEXT,
  content TEXT,
  d4sign_document_id TEXT,
  client_id UUID,
  lead_id UUID,
  amount NUMERIC,
  start_date DATE,
  end_date DATE,
  validade DATE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de tarefas
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pendente',
  priority TEXT DEFAULT 'media',
  assigned_to TEXT,
  due_date DATE,
  client_id UUID,
  lead_id UUID,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de pipelines
CREATE TABLE public.pipelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de estágios do pipeline
CREATE TABLE public.pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pipeline_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de negócios
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  pipeline_id UUID NOT NULL,
  stage_id UUID NOT NULL,
  lead_id UUID,
  client_id UUID,
  value NUMERIC DEFAULT 0,
  probability INTEGER DEFAULT 0,
  expected_close_date DATE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de tags
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de smartbots
CREATE TABLE public.smartbots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'ativo',
  canal TEXT DEFAULT 'whatsapp',
  configuracoes JSONB DEFAULT '{}',
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de automações
CREATE TABLE public.automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de logs de automação
CREATE TABLE public.automation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id UUID NOT NULL,
  trigger_data JSONB,
  execution_time_ms INTEGER,
  execution_result TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de integrações
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  credentials JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de histórico de chamadas
CREATE TABLE public.call_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  extension TEXT,
  external_id TEXT,
  caller TEXT NOT NULL,
  called TEXT NOT NULL,
  status TEXT NOT NULL,
  direction TEXT NOT NULL,
  recording_url TEXT,
  user_id UUID NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de configurações do sistema
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  user_id UUID NOT NULL,
  tenant_id UUID,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de logs do sistema
CREATE TABLE public.system_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  user_id UUID,
  old_data JSONB,
  new_data JSONB,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smartbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Função para verificar se usuário é master
CREATE OR REPLACE FUNCTION public.is_master(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = _user_id AND user_level = 'master'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = _user_id AND role = 'master'
    )
  );
$$;

-- Função para verificar se usuário é admin do tenant
CREATE OR REPLACE FUNCTION public.is_tenant_admin(_user_id UUID, _tenant_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = _user_id
      AND ur.role = 'admin'
      AND (
        _tenant_id IS NULL 
        OR ur.tenant_id = _tenant_id 
        OR p.tenant_id = _tenant_id
      )
  );
$$;

-- Função para obter tenant do usuário
CREATE OR REPLACE FUNCTION public.get_user_tenant(_user_id UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id;
$$;

-- Função para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_level)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Função para lidar com novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  user_email := NEW.email;
  
  INSERT INTO public.profiles (id, name, email, user_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    CASE 
      WHEN NEW.email = 'master@jttelecom.com' THEN 'master'
      ELSE COALESCE(NEW.raw_user_meta_data->>'user_level', 'user')
    END
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id, 
    CASE 
      WHEN NEW.email = 'master@jttelecom.com' THEN 'master'::user_level
      ELSE COALESCE(NEW.raw_user_meta_data->>'user_level', 'user')::user_level
    END
  );
  
  RETURN NEW;
END;
$$;

-- Função para criar admin do tenant
CREATE OR REPLACE FUNCTION public.create_tenant_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, tenant_id, granted_by)
    VALUES (NEW.admin_user_id, 'admin', NEW.id, auth.uid())
    ON CONFLICT (user_id, role, tenant_id) DO NOTHING;
    
    UPDATE public.profiles 
    SET tenant_id = NEW.id, user_level = 'admin'
    WHERE id = NEW.admin_user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER on_tenant_created
  AFTER INSERT ON public.tenants
  FOR EACH ROW EXECUTE PROCEDURE public.create_tenant_admin();

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_smartbots_updated_at
  BEFORE UPDATE ON public.smartbots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_automations_updated_at
  BEFORE UPDATE ON public.automations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_call_history_updated_at
  BEFORE UPDATE ON public.call_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Masters can view all profiles" ON public.profiles
  FOR SELECT USING (is_master(auth.uid()));

CREATE POLICY "Masters can update any profile" ON public.profiles
  FOR UPDATE USING (is_master(auth.uid()));

CREATE POLICY "Tenant admins can view profiles in their tenant" ON public.profiles
  FOR SELECT USING (is_tenant_admin(auth.uid(), tenant_id) OR id = auth.uid());

CREATE POLICY "Tenant admins can update profiles in their tenant" ON public.profiles
  FOR UPDATE USING (is_tenant_admin(auth.uid(), tenant_id));

-- Políticas RLS para tenants
CREATE POLICY "Masters can view all tenants" ON public.tenants
  FOR SELECT USING (is_master(auth.uid()));

CREATE POLICY "Masters can insert tenants" ON public.tenants
  FOR INSERT WITH CHECK (is_master(auth.uid()));

CREATE POLICY "Masters can update all tenants" ON public.tenants
  FOR UPDATE USING (is_master(auth.uid()));

CREATE POLICY "Masters can delete tenants" ON public.tenants
  FOR DELETE USING (is_master(auth.uid()));

CREATE POLICY "Users can view their own tenant" ON public.tenants
  FOR SELECT USING (id = get_user_tenant(auth.uid()));

-- Políticas RLS para user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Masters can manage all roles" ON public.user_roles
  FOR ALL USING (is_master(auth.uid()));

CREATE POLICY "Tenant admins can view roles in their tenant" ON public.user_roles
  FOR SELECT USING (is_tenant_admin(auth.uid(), tenant_id));

CREATE POLICY "Tenant admins can manage user roles in their tenant" ON public.user_roles
  FOR INSERT WITH CHECK (is_tenant_admin(auth.uid(), tenant_id) AND role IN ('user', 'admin'));

-- Políticas RLS para dados do usuário (leads, clients, etc.)
CREATE POLICY "Users can manage their own leads" ON public.leads
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own clients" ON public.clients
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own proposals" ON public.proposals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own contracts" ON public.contracts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tasks" ON public.tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own pipelines" ON public.pipelines
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage stages of their pipelines" ON public.pipeline_stages
  FOR ALL USING (EXISTS (
    SELECT 1 FROM pipelines 
    WHERE pipelines.id = pipeline_stages.pipeline_id 
    AND pipelines.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own deals" ON public.deals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tags" ON public.tags
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own smartbots" ON public.smartbots
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own automations" ON public.automations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view logs of their automations" ON public.automation_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM automations 
    WHERE automations.id = automation_logs.automation_id 
    AND automations.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own integrations" ON public.integrations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own call history" ON public.call_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings" ON public.system_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own activity logs" ON public.system_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Masters can view all logs" ON public.system_logs
  FOR SELECT USING (is_master(auth.uid()));