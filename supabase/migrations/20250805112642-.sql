-- Criar o perfil do usuário Master
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
  gen_random_uuid(),
  'master@jttelecom.com',
  'Super Administrador Master',
  'master',
  NULL,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  user_level = EXCLUDED.user_level,
  tenant_id = EXCLUDED.tenant_id,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();