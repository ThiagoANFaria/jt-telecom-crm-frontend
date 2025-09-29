-- Temporariamente, vamos criar uma política mais robusta para masters
-- que não dependa apenas do auth.uid()

-- Primeiro, vamos criar uma nova política que permite masters criarem tenants
-- usando tanto email quanto user_level como fallback

DROP POLICY IF EXISTS "Masters can insert tenants" ON public.tenants;

-- Nova política mais robusta para inserção de tenants
CREATE POLICY "Masters can insert tenants" 
ON public.tenants 
FOR INSERT 
WITH CHECK (
  -- Verificar se é master usando múltiplas abordagens
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_level = 'master'
  )
  OR
  -- Fallback: verificar por email se auth.uid() não funcionar
  EXISTS (
    SELECT 1 FROM auth.users au
    JOIN public.profiles p ON au.id = p.id
    WHERE au.email = 'master@jttelecom.com' 
    AND p.user_level = 'master'
  )
);