-- 1. Adicionar coluna slug à tabela tenants
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- 2. Criar índice para slug
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);

-- 3. Criar tabela tenant_members
CREATE TABLE IF NOT EXISTS public.tenant_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- 4. Habilitar RLS em tenant_members
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para tenant_members
CREATE POLICY "Users can view their own memberships"
ON public.tenant_members
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Tenant owners can manage members"
ON public.tenant_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = tenant_members.tenant_id
    AND tm.user_id = auth.uid()
    AND tm.role = 'owner'
  )
);

CREATE POLICY "Masters can manage all members"
ON public.tenant_members
FOR ALL
USING (is_master(auth.uid()));

-- 6. Função para gerar slug único
CREATE OR REPLACE FUNCTION public.generate_unique_slug(tenant_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Criar slug base a partir do nome
  base_slug := lower(regexp_replace(tenant_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Verificar se já existe e adicionar número se necessário
  WHILE EXISTS (SELECT 1 FROM public.tenants WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- 7. Trigger para criar slug automaticamente se não fornecido
CREATE OR REPLACE FUNCTION public.ensure_tenant_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_unique_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tenant_slug_trigger
BEFORE INSERT OR UPDATE ON public.tenants
FOR EACH ROW
EXECUTE FUNCTION public.ensure_tenant_slug();

-- 8. Trigger para criar owner automaticamente quando tenant é criado
CREATE OR REPLACE FUNCTION public.create_tenant_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Se admin_user_id foi definido, criar entrada como owner
  IF NEW.admin_user_id IS NOT NULL THEN
    INSERT INTO public.tenant_members (tenant_id, user_id, role)
    VALUES (NEW.id, NEW.admin_user_id, 'owner')
    ON CONFLICT (tenant_id, user_id) DO UPDATE
    SET role = 'owner';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER tenant_owner_trigger
AFTER INSERT OR UPDATE ON public.tenants
FOR EACH ROW
EXECUTE FUNCTION public.create_tenant_owner();

-- 9. Atualizar tenants existentes com slugs
DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN SELECT id, name FROM public.tenants WHERE slug IS NULL LOOP
    UPDATE public.tenants 
    SET slug = public.generate_unique_slug(t.name)
    WHERE id = t.id;
  END LOOP;
END $$;