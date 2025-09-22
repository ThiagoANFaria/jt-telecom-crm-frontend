-- Criar trigger para chamar handle_new_user quando um usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verificar se a função create_tenant_admin existe e funciona corretamente
DROP TRIGGER IF EXISTS trigger_create_tenant_admin ON public.tenants;

CREATE TRIGGER trigger_create_tenant_admin
  AFTER INSERT ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.create_tenant_admin();