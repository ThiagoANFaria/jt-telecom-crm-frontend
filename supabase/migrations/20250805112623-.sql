-- Criar o usuário Master no auth.users (simulação via função)
-- Como não podemos inserir diretamente em auth.users, vamos criar via função

-- Primeiro, vamos criar um perfil master diretamente
INSERT INTO profiles (
  id,
  email,
  full_name,
  user_level,
  tenant_id,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'master@jttelecom.com',
  'Super Administrador',
  'master',
  NULL,
  NOW(),
  NOW()
);

-- Função para registrar o usuário master via Supabase Auth
CREATE OR REPLACE FUNCTION create_master_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Esta função será chamada pelo frontend para criar o usuário master
  -- via supabase.auth.admin.createUser() ou signup
  RAISE NOTICE 'Função preparada para criar usuário master';
END;
$$;