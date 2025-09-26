-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recriar a função handle_new_user com melhor tratamento de erros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_email text;
  user_level_value text;
BEGIN
  user_email := NEW.email;
  
  -- Determinar o nível do usuário
  user_level_value := CASE 
    WHEN NEW.email = 'master@jttelecom.com' THEN 'master'
    ELSE COALESCE(NEW.raw_user_meta_data->>'user_level', 'user')
  END;
  
  -- Inserir na tabela profiles com tratamento de conflito
  INSERT INTO public.profiles (id, name, email, user_level)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'full_name', 
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    user_level_value
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    user_level = EXCLUDED.user_level,
    updated_at = now();
  
  -- Inserir role correspondente com tratamento de conflito
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id, 
    user_level_value::user_level
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não bloquear o signup
    RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recriar a trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();