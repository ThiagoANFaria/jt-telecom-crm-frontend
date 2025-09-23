-- Create enum for user levels
CREATE TYPE user_level AS ENUM ('user', 'admin', 'master');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    user_level user_level NOT NULL DEFAULT 'user',
    tenant_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    permissions JSONB DEFAULT '[]',
    company_name TEXT
);

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role user_level NOT NULL,
    tenant_id UUID,
    granted_by UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role, tenant_id)
);

-- Create tenants table with enum types
CREATE TYPE tenant_plan AS ENUM ('basic', 'pro', 'enterprise');
CREATE TYPE tenant_status AS ENUM ('trial', 'active', 'suspended', 'cancelled');

CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT,
    plan tenant_plan DEFAULT 'basic',
    status tenant_status DEFAULT 'trial',
    max_users INTEGER NOT NULL DEFAULT 5,
    current_users INTEGER NOT NULL DEFAULT 0,
    admin_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{"max_leads": 1000, "max_clients": 500, "custom_branding": false, "integrations_enabled": []}'
);

-- Create function to check if user is master
CREATE OR REPLACE FUNCTION public.is_master(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    -- Check in profiles table
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = _user_id AND user_level = 'master'
    )
    OR
    -- Check in user_roles table
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = _user_id AND role = 'master'
    )
  );
$$;

-- Create function to check if user is tenant admin
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

-- Create function to get user tenant
CREATE OR REPLACE FUNCTION public.get_user_tenant(_user_id UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id;
$$;

-- Create function to check if user has specific role
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

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Masters can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_master(auth.uid()));

CREATE POLICY "Masters can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (is_master(auth.uid()));

CREATE POLICY "Tenant admins can view profiles in their tenant" 
ON public.profiles 
FOR SELECT 
USING (is_tenant_admin(auth.uid(), tenant_id) OR id = auth.uid());

CREATE POLICY "Tenant admins can update profiles in their tenant" 
ON public.profiles 
FOR UPDATE 
USING (is_tenant_admin(auth.uid(), tenant_id));

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Masters can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (is_master(auth.uid()));

CREATE POLICY "Tenant admins can view roles in their tenant" 
ON public.user_roles 
FOR SELECT 
USING (is_tenant_admin(auth.uid(), tenant_id));

CREATE POLICY "Tenant admins can manage user roles in their tenant" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (is_tenant_admin(auth.uid(), tenant_id) AND role IN ('user', 'admin'));

-- RLS Policies for tenants table
CREATE POLICY "Masters can view all tenants" 
ON public.tenants 
FOR SELECT 
USING (is_master(auth.uid()));

CREATE POLICY "Masters can insert tenants" 
ON public.tenants 
FOR INSERT 
WITH CHECK (is_master(auth.uid()));

CREATE POLICY "Masters can update all tenants" 
ON public.tenants 
FOR UPDATE 
USING (is_master(auth.uid()));

CREATE POLICY "Masters can delete tenants" 
ON public.tenants 
FOR DELETE 
USING (is_master(auth.uid()));

CREATE POLICY "Users can view their own tenant" 
ON public.tenants 
FOR SELECT 
USING (id = get_user_tenant(auth.uid()));

-- Create function to handle new user creation
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
  
  -- Insert into profiles table
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
  
  -- Insert corresponding role
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

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle tenant admin creation
CREATE OR REPLACE FUNCTION public.create_tenant_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If admin_user_id was set, create admin role
  IF NEW.admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, tenant_id, granted_by)
    VALUES (NEW.admin_user_id, 'admin', NEW.id, auth.uid())
    ON CONFLICT (user_id, role, tenant_id) DO NOTHING;
    
    -- Update admin profile with tenant_id
    UPDATE public.profiles 
    SET tenant_id = NEW.id, user_level = 'admin'
    WHERE id = NEW.admin_user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for tenant admin creation
CREATE TRIGGER create_tenant_admin_trigger
  AFTER INSERT ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.create_tenant_admin();

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Synchronize master user if it exists in auth.users
DO $$
DECLARE
  master_user_id UUID;
BEGIN
  -- Check if master user exists in auth.users
  SELECT id INTO master_user_id 
  FROM auth.users 
  WHERE email = 'master@jttelecom.com' 
  LIMIT 1;
  
  IF master_user_id IS NOT NULL THEN
    -- Insert or update profile
    INSERT INTO public.profiles (id, email, user_level, name)
    VALUES (master_user_id, 'master@jttelecom.com', 'master', 'Master User')
    ON CONFLICT (id) DO UPDATE SET
      user_level = 'master',
      email = 'master@jttelecom.com';
    
    -- Insert master role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (master_user_id, 'master')
    ON CONFLICT (user_id, role, tenant_id) DO NOTHING;
  END IF;
END $$;