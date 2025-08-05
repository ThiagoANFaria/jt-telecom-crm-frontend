-- Verificar se já existe e inserir o perfil do usuário Master se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'master@jttelecom.com') THEN
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
    );
  END IF;
END $$;