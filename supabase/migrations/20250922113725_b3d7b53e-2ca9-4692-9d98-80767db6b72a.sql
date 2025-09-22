-- Criar tabela profiles (se não existir ou ajustar estrutura)
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    user_level TEXT NOT NULL DEFAULT 'user' CHECK (user_level IN ('user', 'admin', 'master')),
    tenant_id UUID REFERENCES public.tenants(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    name TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    permissions JSONB DEFAULT '[]'::jsonb,
    company_name TEXT
);

-- Criar tabela user_roles (se não existir ou ajustar estrutura)
DROP TABLE IF EXISTS public.user_roles CASCADE;
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_level NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id),
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, role, tenant_id)
);

-- Recriar tabela tenants com estrutura correta
DROP TABLE IF EXISTS public.tenants CASCADE;
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    plan tenant_plan DEFAULT 'basic'::tenant_plan,
    status tenant_status DEFAULT 'trial'::tenant_status,
    max_users INTEGER NOT NULL DEFAULT 5,
    current_users INTEGER NOT NULL DEFAULT 0,
    admin_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{"max_leads": 1000, "max_clients": 500, "custom_branding": false, "integrations_enabled": []}'::jsonb
);

-- Agora recriar a referência foreign key em profiles
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_tenant_id_fkey 
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);

-- Criar ou substituir função is_master melhorada
CREATE OR REPLACE FUNCTION public.is_master(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    -- Verificar na tabela profiles
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = _user_id AND user_level = 'master'
    )
    OR
    -- Verificar na tabela user_roles
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = _user_id AND role = 'master'
    )
  );
$$;

-- Função para verificar se é admin de tenant
CREATE OR REPLACE FUNCTION public.is_tenant_admin(_user_id uuid, _tenant_id uuid DEFAULT NULL)
RETURNS boolean
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
CREATE OR REPLACE FUNCTION public.get_user_tenant(_user_id uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id;
$$;

-- Ativar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tabela PROFILES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Masters can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Masters can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Tenant admins can view profiles in their tenant" ON public.profiles;
DROP POLICY IF EXISTS "Tenant admins can update profiles in their tenant" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Masters can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_master(auth.uid()));

CREATE POLICY "Masters can update any profile"
ON public.profiles FOR UPDATE
USING (public.is_master(auth.uid()));

CREATE POLICY "Tenant admins can view profiles in their tenant"
ON public.profiles FOR SELECT
USING (
  public.is_tenant_admin(auth.uid(), tenant_id) 
  OR id = auth.uid()
);

CREATE POLICY "Tenant admins can update profiles in their tenant"
ON public.profiles FOR UPDATE
USING (public.is_tenant_admin(auth.uid(), tenant_id));

-- Políticas RLS para tabela USER_ROLES
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Masters can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Masters can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Tenant admins can view roles in their tenant" ON public.user_roles;
DROP POLICY IF EXISTS "Tenant admins can manage user roles in their tenant" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Masters can manage all roles"
ON public.user_roles FOR ALL
USING (public.is_master(auth.uid()));

CREATE POLICY "Tenant admins can view roles in their tenant"
ON public.user_roles FOR SELECT
USING (public.is_tenant_admin(auth.uid(), tenant_id));

CREATE POLICY "Tenant admins can manage user roles in their tenant"
ON public.user_roles FOR INSERT
WITH CHECK (
  public.is_tenant_admin(auth.uid(), tenant_id) 
  AND role IN ('user', 'admin')
);

-- Políticas RLS para tabela TENANTS
DROP POLICY IF EXISTS "Masters can manage all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Masters can view all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Masters can insert tenants" ON public.tenants;
DROP POLICY IF EXISTS "Masters can update all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Masters can delete tenants" ON public.tenants;

CREATE POLICY "Masters can insert tenants"
ON public.tenants FOR INSERT
WITH CHECK (public.is_master(auth.uid()));

CREATE POLICY "Masters can view all tenants"
ON public.tenants FOR SELECT
USING (public.is_master(auth.uid()));

CREATE POLICY "Masters can update all tenants"
ON public.tenants FOR UPDATE
USING (public.is_master(auth.uid()));

CREATE POLICY "Masters can delete tenants"
ON public.tenants FOR DELETE
USING (public.is_master(auth.uid()));

CREATE POLICY "Users can view their own tenant"
ON public.tenants FOR SELECT
USING (id = public.get_user_tenant(auth.uid()));

-- Função para criar admin do tenant
CREATE OR REPLACE FUNCTION public.create_tenant_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Função para tratar novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  user_email := NEW.email;
  
  -- Inserir na tabela profiles
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
  
  -- Inserir role correspondente
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

-- Criar triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS trigger_create_tenant_admin ON public.tenants;
CREATE TRIGGER trigger_create_tenant_admin
  AFTER INSERT ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.create_tenant_admin();

-- Trigger para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Sincronizar usuário master inicial (caso já exista)
DO $$
DECLARE
  master_user_id uuid;
BEGIN
  -- Verificar se existe usuário com email master@jttelecom.com
  SELECT id INTO master_user_id
  FROM auth.users
  WHERE email = 'master@jttelecom.com';
  
  IF master_user_id IS NOT NULL THEN
    -- Atualizar ou inserir profile
    INSERT INTO public.profiles (id, email, user_level, name)
    VALUES (master_user_id, 'master@jttelecom.com', 'master', 'Master User')
    ON CONFLICT (id) DO UPDATE SET 
      user_level = 'master',
      email = 'master@jttelecom.com';
    
    -- Inserir role master
    INSERT INTO public.user_roles (user_id, role)
    VALUES (master_user_id, 'master')
    ON CONFLICT (user_id, role, tenant_id) DO NOTHING;
  END IF;
END;
$$;