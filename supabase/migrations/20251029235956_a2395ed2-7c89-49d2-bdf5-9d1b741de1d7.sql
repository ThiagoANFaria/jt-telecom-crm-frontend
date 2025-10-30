-- Adicionar constraint unique se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_roles_user_id_role_key'
  ) THEN
    ALTER TABLE public.user_roles 
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END $$;

-- Garantir que o perfil master existe com user_level correto
INSERT INTO public.profiles (id, email, name, user_level, tenant_id, is_active)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', 'Super Administrador Master'),
  'master',
  NULL,
  true
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'master@jttelecom.com'
  AND p.id IS NULL;

-- Atualizar profile existente para garantir user_level master
UPDATE public.profiles
SET user_level = 'master',
    tenant_id = NULL,
    is_active = true,
    updated_at = now()
WHERE email = 'master@jttelecom.com';

-- Garantir que existe role 'master' na tabela user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
  p.id,
  'master'::user_level
FROM public.profiles p
WHERE p.email = 'master@jttelecom.com'
ON CONFLICT (user_id, role) DO NOTHING;