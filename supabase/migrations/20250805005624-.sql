-- Criar enums para tipos de usuário, status e planos de tenant
CREATE TYPE user_level AS ENUM ('user', 'admin', 'master');
CREATE TYPE tenant_status AS ENUM ('active', 'inactive', 'suspended', 'trial');
CREATE TYPE tenant_plan AS ENUM ('basic', 'professional', 'enterprise');

-- Criar tabela de tenants (empresas/organizações)
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  status tenant_status NOT NULL DEFAULT 'trial',
  plan tenant_plan NOT NULL DEFAULT 'basic',
  max_users INTEGER NOT NULL DEFAULT 5,
  current_users INTEGER NOT NULL DEFAULT 0,
  admin_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{
    "max_leads": 1000,
    "max_clients": 500,
    "integrations_enabled": [],
    "custom_branding": false
  }'::jsonb
);

-- Habilitar RLS na tabela tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Atualizar tabela profiles para incluir tenant_id e campos adicionais
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id),
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

-- Criar tabela de roles/permissões para evitar recursão RLS
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_level NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role, tenant_id)
);

-- Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função para verificar se usuário tem role específico (SECURITY DEFINER para evitar recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_level)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para verificar se usuário é master (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_master(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'master'
  )
$$;

-- Função para verificar se usuário é admin do tenant (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_tenant_admin(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
      AND tenant_id = _tenant_id
  )
$$;

-- Função para obter tenant do usuário (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_user_tenant(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT tenant_id
  FROM public.profiles
  WHERE id = _user_id
$$;

-- Políticas RLS para tabela tenants
CREATE POLICY "Masters can view all tenants" 
ON public.tenants 
FOR SELECT 
USING (public.is_master(auth.uid()));

CREATE POLICY "Masters can manage all tenants" 
ON public.tenants 
FOR ALL 
USING (public.is_master(auth.uid()));

CREATE POLICY "Users can view their own tenant" 
ON public.tenants 
FOR SELECT 
USING (id = public.get_user_tenant(auth.uid()));

-- Políticas RLS para tabela user_roles
CREATE POLICY "Masters can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.is_master(auth.uid()));

CREATE POLICY "Masters can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.is_master(auth.uid()));

CREATE POLICY "Tenant admins can view roles in their tenant" 
ON public.user_roles 
FOR SELECT 
USING (public.is_tenant_admin(auth.uid(), tenant_id));

CREATE POLICY "Tenant admins can manage user roles in their tenant" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  public.is_tenant_admin(auth.uid(), tenant_id) 
  AND role IN ('user', 'admin')
);

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Atualizar políticas da tabela profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Novas políticas para profiles considerando tenant isolation
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Masters can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_master(auth.uid()));

CREATE POLICY "Tenant admins can view profiles in their tenant" 
ON public.profiles 
FOR SELECT 
USING (
  public.is_tenant_admin(auth.uid(), tenant_id)
  OR id = auth.uid()
);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Masters can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (public.is_master(auth.uid()));

CREATE POLICY "Tenant admins can update profiles in their tenant" 
ON public.profiles 
FOR UPDATE 
USING (public.is_tenant_admin(auth.uid(), tenant_id));

-- Trigger para atualizar updated_at nos tenants
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar tenant admin quando tenant é criado
CREATE OR REPLACE FUNCTION public.create_tenant_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Se admin_user_id foi definido, criar role de admin
  IF NEW.admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, tenant_id, granted_by)
    VALUES (NEW.admin_user_id, 'admin', NEW.id, auth.uid())
    ON CONFLICT (user_id, role, tenant_id) DO NOTHING;
    
    -- Atualizar profile do admin com tenant_id
    UPDATE public.profiles 
    SET tenant_id = NEW.id, user_level = 'admin'
    WHERE id = NEW.admin_user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar após inserção de tenant
CREATE TRIGGER after_tenant_insert
  AFTER INSERT ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.create_tenant_admin();

-- Atualizar função handle_new_user para considerar roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, user_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'user'
  );
  
  -- Criar role padrão de user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;