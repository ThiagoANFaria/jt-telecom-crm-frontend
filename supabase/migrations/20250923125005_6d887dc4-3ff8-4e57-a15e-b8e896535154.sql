-- Migração complementar para corrigir triggers e security warnings

-- 1. Recriar função handle_new_user com security definer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- 2. Recriar função create_tenant_admin com security definer
CREATE OR REPLACE FUNCTION public.create_tenant_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- 3. Corrigir funções existentes com security definer e search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_level)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_master(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.is_tenant_admin(_user_id uuid, _tenant_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_user_tenant(_user_id uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id;
$function$;

-- 4. Recriar triggers
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
CREATE TRIGGER handle_new_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS create_tenant_admin_trigger ON public.tenants;
CREATE TRIGGER create_tenant_admin_trigger
  AFTER INSERT ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.create_tenant_admin();

-- 5. Adicionar triggers de updated_at nas tabelas que precisam
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenants_updated_at ON public.tenants;
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_proposals_updated_at ON public.proposals;
CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_contracts_updated_at ON public.contracts;
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_integrations_updated_at ON public.integrations;
CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_automations_updated_at ON public.automations;
CREATE TRIGGER update_automations_updated_at
  BEFORE UPDATE ON public.automations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_smartbots_updated_at ON public.smartbots;
CREATE TRIGGER update_smartbots_updated_at
  BEFORE UPDATE ON public.smartbots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON public.system_settings;
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();