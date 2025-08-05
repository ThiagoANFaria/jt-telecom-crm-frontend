-- Criar função helper para verificar se usuário é master
CREATE OR REPLACE FUNCTION is_master(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = user_id 
    AND user_level = 'master' 
    AND tenant_id IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função helper para verificar se usuário é admin de tenant
CREATE OR REPLACE FUNCTION is_tenant_admin(user_id uuid, tenant_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = user_id 
    AND user_level = 'admin' 
    AND profiles.tenant_id = is_tenant_admin.tenant_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para obter tenant do usuário
CREATE OR REPLACE FUNCTION get_user_tenant(user_id uuid)
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT tenant_id 
    FROM profiles 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir um usuário Master inicial
-- Este será o superadmin que pode acessar o Painel Master
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'master@jttelecom.com',
  crypt('JTMaster2024!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Criar perfil para o usuário Master
INSERT INTO profiles (
  id,
  email,
  name,
  user_level,
  tenant_id,
  is_active,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'master@jttelecom.com'),
  'master@jttelecom.com',
  'Master Admin JT Telecom',
  'master',
  NULL, -- Master não tem tenant_id
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  user_level = 'master',
  tenant_id = NULL,
  name = 'Master Admin JT Telecom';

-- Atualizar RLS policies para tenants
DROP POLICY IF EXISTS "Masters can manage all tenants" ON tenants;
DROP POLICY IF EXISTS "Masters can view all tenants" ON tenants;
DROP POLICY IF EXISTS "Users can view their own tenant" ON tenants;

CREATE POLICY "Masters can manage all tenants" 
ON tenants FOR ALL 
TO authenticated 
USING (is_master(auth.uid()));

CREATE POLICY "Masters can view all tenants" 
ON tenants FOR SELECT 
TO authenticated 
USING (is_master(auth.uid()));

CREATE POLICY "Users can view their own tenant" 
ON tenants FOR SELECT 
TO authenticated 
USING (id = get_user_tenant(auth.uid()));

-- Atualizar RLS policies para profiles
DROP POLICY IF EXISTS "Masters can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Masters can update any profile" ON profiles;
DROP POLICY IF EXISTS "Tenant admins can view profiles in their tenant" ON profiles;
DROP POLICY IF EXISTS "Tenant admins can update profiles in their tenant" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Masters can view all profiles" 
ON profiles FOR SELECT 
TO authenticated 
USING (is_master(auth.uid()));

CREATE POLICY "Masters can update any profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (is_master(auth.uid()));

CREATE POLICY "Tenant admins can view profiles in their tenant" 
ON profiles FOR SELECT 
TO authenticated 
USING (is_tenant_admin(auth.uid(), tenant_id) OR id = auth.uid());

CREATE POLICY "Tenant admins can update profiles in their tenant" 
ON profiles FOR UPDATE 
TO authenticated 
USING (is_tenant_admin(auth.uid(), tenant_id));

CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
TO authenticated 
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (id = auth.uid());

-- Atualizar RLS policies para user_roles
DROP POLICY IF EXISTS "Masters can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Masters can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Tenant admins can view roles in their tenant" ON user_roles;
DROP POLICY IF EXISTS "Tenant admins can manage user roles in their tenant" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

CREATE POLICY "Masters can view all roles" 
ON user_roles FOR SELECT 
TO authenticated 
USING (is_master(auth.uid()));

CREATE POLICY "Masters can manage all roles" 
ON user_roles FOR ALL 
TO authenticated 
USING (is_master(auth.uid()));

CREATE POLICY "Tenant admins can view roles in their tenant" 
ON user_roles FOR SELECT 
TO authenticated 
USING (is_tenant_admin(auth.uid(), tenant_id));

CREATE POLICY "Tenant admins can manage user roles in their tenant" 
ON user_roles FOR INSERT 
TO authenticated 
WITH CHECK (is_tenant_admin(auth.uid(), tenant_id) AND role = ANY(ARRAY['user'::user_level, 'admin'::user_level]));

CREATE POLICY "Users can view their own roles" 
ON user_roles FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Garantir que o Master pode acessar system_logs
DROP POLICY IF EXISTS "Masters can view all logs" ON system_logs;
CREATE POLICY "Masters can view all logs" 
ON system_logs FOR SELECT 
TO authenticated 
USING (is_master(auth.uid()));

-- Permitir apenas Masters inserir logs do sistema
CREATE POLICY "Masters can insert system logs" 
ON system_logs FOR INSERT 
TO authenticated 
WITH CHECK (is_master(auth.uid()));

-- Trigger para automaticamente criar profile quando usuário é criado
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, user_level, is_active, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    'user', -- Default level
    true,
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();