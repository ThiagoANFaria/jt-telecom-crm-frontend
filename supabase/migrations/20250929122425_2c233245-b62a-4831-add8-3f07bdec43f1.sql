-- Corrigir a função is_master para usar apenas a tabela profiles
CREATE OR REPLACE FUNCTION public.is_master(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = _user_id 
    AND user_level = 'master'
  );
$$;

-- Atualizar o usuário master@jttelecom.com para garantir que tenha user_level = 'master'
UPDATE public.profiles 
SET user_level = 'master', 
    is_active = true,
    updated_at = now()
WHERE email = 'master@jttelecom.com';

-- Inserir role master se não existir (usando WHERE NOT EXISTS para evitar conflito)
INSERT INTO public.user_roles (user_id, role)
SELECT 
  p.id,
  'master'::user_level
FROM public.profiles p
WHERE p.email = 'master@jttelecom.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = p.id AND ur.role = 'master'::user_level
);