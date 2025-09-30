-- ========================================
-- CORREÇÃO COMPLETA DAS POLÍTICAS RLS PARA TENANTS
-- ========================================

-- 1. Remover todas as políticas RLS existentes da tabela tenants
DROP POLICY IF EXISTS "Masters can view all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Masters can insert tenants" ON public.tenants;
DROP POLICY IF EXISTS "Masters can update all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Masters can delete tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;

-- 2. Criar política simplificada e robusta para SELECT (visualização)
CREATE POLICY "Masters and users can view tenants"
ON public.tenants
FOR SELECT
USING (
  -- Permitir se for master
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_level = 'master'
  )
  OR
  -- OU se for o próprio tenant do usuário
  id = (
    SELECT tenant_id FROM public.profiles
    WHERE profiles.id = auth.uid()
  )
);

-- 3. Criar política simplificada para INSERT (criação)
CREATE POLICY "Masters can create tenants"
ON public.tenants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_level = 'master'
  )
);

-- 4. Criar política simplificada para UPDATE (atualização)
CREATE POLICY "Masters can update tenants"
ON public.tenants
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_level = 'master'
  )
);

-- 5. Criar política simplificada para DELETE (exclusão)
CREATE POLICY "Masters can delete tenants"
ON public.tenants
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_level = 'master'
  )
);

-- 6. Garantir que RLS está habilitado
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 7. Inserir tenant de teste para verificação
INSERT INTO public.tenants (
  name,
  domain,
  plan,
  status,
  max_users,
  current_users,
  settings
)
VALUES (
  'Empresa Teste RLS',
  'teste-rls.com.br',
  'professional',
  'active',
  25,
  1,
  '{"max_leads": 5000, "max_clients": 2000, "custom_branding": false, "integrations_enabled": ["email", "whatsapp", "api"]}'::jsonb
)
ON CONFLICT DO NOTHING;