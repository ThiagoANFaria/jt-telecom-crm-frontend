-- Atualizar a política de visualização de tenants para ser mais robusta
DROP POLICY IF EXISTS "Masters can view all tenants" ON public.tenants;

CREATE POLICY "Masters can view all tenants" 
ON public.tenants 
FOR SELECT 
USING (
  -- Verificar se o usuário é master diretamente na tabela profiles
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.user_level = 'master'
  )
  OR
  -- Verificação adicional pelo email do master
  EXISTS (
    SELECT 1
    FROM auth.users au
    JOIN public.profiles p ON au.id = p.id
    WHERE au.email = 'master@jttelecom.com'
    AND p.user_level = 'master'
    AND p.id = auth.uid()
  )
);