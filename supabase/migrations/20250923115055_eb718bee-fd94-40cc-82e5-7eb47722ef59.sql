-- Criar enum para user_level
CREATE TYPE user_level AS ENUM ('user', 'admin', 'master');

-- Criar enum para tenant_plan
CREATE TYPE tenant_plan AS ENUM ('basic', 'premium', 'enterprise');

-- Criar enum para tenant_status
CREATE TYPE tenant_status AS ENUM ('trial', 'active', 'suspended', 'expired');

-- Criar tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  user_level user_level NOT NULL DEFAULT 'user',
  tenant_id UUID,
  name TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  permissions JSONB DEFAULT '[]',
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_level NOT NULL,
  tenant_id UUID,
  granted_by UUID,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role, tenant_id)
);

-- Criar tabela tenants
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  plan tenant_plan DEFAULT 'basic',
  status tenant_status DEFAULT 'trial',
  max_users INTEGER NOT NULL DEFAULT 5,
  current_users INTEGER NOT NULL DEFAULT 0,
  admin_user_id UUID,
  settings JSONB DEFAULT '{"max_leads": 1000, "max_clients": 500, "custom_branding": false, "integrations_enabled": []}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ativar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Criar função is_master
CREATE OR REPLACE FUNCTION public.is_master(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
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

-- Criar função is_tenant_admin
CREATE OR REPLACE FUNCTION public.is_tenant_admin(_user_id UUID, _tenant_id UUID DEFAULT NULL)
RETURNS BOOLEAN 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
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

-- Criar função get_user_tenant
CREATE OR REPLACE FUNCTION public.get_user_tenant(_user_id UUID DEFAULT auth.uid())
RETURNS UUID 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id;
$$;

-- Criar função has_role
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

-- Políticas RLS para profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Masters can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Masters can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Tenant admins can view profiles in their tenant" ON public.profiles;
DROP POLICY IF EXISTS "Tenant admins can update profiles in their tenant" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Masters can view all profiles" ON public.profiles
  FOR SELECT USING (is_master(auth.uid()));

CREATE POLICY "Masters can update any profile" ON public.profiles
  FOR UPDATE USING (is_master(auth.uid()));

CREATE POLICY "Tenant admins can view profiles in their tenant" ON public.profiles
  FOR SELECT USING (is_tenant_admin(auth.uid(), tenant_id) OR id = auth.uid());

CREATE POLICY "Tenant admins can update profiles in their tenant" ON public.profiles
  FOR UPDATE USING (is_tenant_admin(auth.uid(), tenant_id));

-- Políticas RLS para user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Masters can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Tenant admins can view roles in their tenant" ON public.user_roles;
DROP POLICY IF EXISTS "Tenant admins can manage user roles in their tenant" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Masters can manage all roles" ON public.user_roles
  FOR ALL USING (is_master(auth.uid()));

CREATE POLICY "Tenant admins can view roles in their tenant" ON public.user_roles
  FOR SELECT USING (is_tenant_admin(auth.uid(), tenant_id));

CREATE POLICY "Tenant admins can manage user roles in their tenant" ON public.user_roles
  FOR INSERT WITH CHECK (is_tenant_admin(auth.uid(), tenant_id) AND role IN ('user', 'admin'));

-- Políticas RLS para tenants
DROP POLICY IF EXISTS "Masters can view all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Masters can insert tenants" ON public.tenants;
DROP POLICY IF EXISTS "Masters can update all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Masters can delete tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;

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

-- Trigger para criar perfil quando novo usuário se registra
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

-- Criar trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para criar admin do tenant
CREATE OR REPLACE FUNCTION public.create_tenant_admin()
RETURNS TRIGGER
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

-- Criar trigger para novos tenants
DROP TRIGGER IF EXISTS on_tenant_created ON public.tenants;
CREATE TRIGGER on_tenant_created
  AFTER INSERT ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.create_tenant_admin();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Aplicar trigger de updated_at nas tabelas
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenants_updated_at ON public.tenants;
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir usuário master inicial se não existir
DO $$
BEGIN
  -- Verificar se o usuário master já existe
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'master@jttelecom.com') THEN
    -- Inserir o usuário master na tabela auth.users (isso será feito pelo trigger)
    -- Por enquanto, vamos apenas garantir que quando o usuário se registrar, será master
    RAISE NOTICE 'Schema multi-tenant criado. Usuário master será configurado automaticamente quando se registrar com email master@jttelecom.com';
  END IF;
END $$;