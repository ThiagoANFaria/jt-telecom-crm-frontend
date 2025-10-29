
-- Criar trigger para novos usuários
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Criar profile para o usuário master existente (se houver)
INSERT INTO public.profiles (id, email, name, user_level, tenant_id, is_active)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', 'Super Administrador Master'),
  'master',
  NULL,
  true
FROM auth.users
WHERE email = 'master@jttelecom.com'
ON CONFLICT (id) DO UPDATE SET
  user_level = 'master',
  tenant_id = NULL,
  is_active = true,
  updated_at = now();
