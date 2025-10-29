import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Users, ArrowLeft, Crown, Shield } from 'lucide-react';

interface TenantData {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  status: string;
  plan: string;
  max_users: number;
  current_users: number;
  created_at: string;
}

interface MemberData {
  id: string;
  role: string;
  user_id: string;
  profiles?: {
    name?: string;
    email?: string;
  };
}

export default function TenantView() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadTenantData();
    }
  }, [slug]);

  const loadTenantData = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 [TenantView] Carregando tenant:', slug);

      // 1. Verificar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({
          title: 'Não autenticado',
          description: 'Faça login para acessar esta página.',
          variant: 'destructive'
        });
        navigate('/auth');
        return;
      }

      // 2. Buscar tenant pelo slug
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (tenantError) {
        console.error('❌ [TenantView] Erro ao buscar tenant:', tenantError);
        throw tenantError;
      }

      if (!tenantData) {
        toast({
          title: 'Tenant não encontrado',
          description: `Não existe tenant com slug "${slug}"`,
          variant: 'destructive'
        });
        navigate('/master-panel');
        return;
      }

      console.log('✅ [TenantView] Tenant encontrado:', tenantData);
      setTenant(tenantData);

      // 3. Buscar membros do tenant
      const { data: membersData, error: membersError } = await supabase
        .from('tenant_members')
        .select('id, role, user_id, created_at')
        .eq('tenant_id', tenantData.id);

      if (membersError) {
        console.error('⚠️ [TenantView] Erro ao buscar membros:', membersError);
      } else {
        console.log('✅ [TenantView] Membros carregados:', membersData?.length || 0);
        
        // Buscar perfis dos membros
        if (membersData && membersData.length > 0) {
          const userIds = membersData.map(m => m.user_id);
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, name, email')
            .in('id', userIds);

          // Combinar dados
          const membersWithProfiles = membersData.map(member => ({
            ...member,
            profiles: profilesData?.find(p => p.id === member.user_id)
          }));

          setMembers(membersWithProfiles);

          // Verificar role do usuário atual
          const userMember = membersWithProfiles.find(m => m.user_id === user.id);
          setCurrentUserRole(userMember?.role || null);
          console.log('👤 [TenantView] Role do usuário:', userMember?.role || 'sem acesso');
        } else {
          setMembers([]);
        }
      }

    } catch (error: any) {
      console.error('💥 [TenantView] Erro fatal:', error);
      toast({
        title: 'Erro ao carregar tenant',
        description: error.message || 'Não foi possível carregar as informações',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-yellow-500"><Crown className="w-3 h-3 mr-1" />Owner</Badge>;
      case 'admin':
        return <Badge className="bg-blue-500"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'member':
        return <Badge variant="secondary"><Users className="w-3 h-3 mr-1" />Membro</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'basic':
        return <Badge variant="secondary">Básico</Badge>;
      case 'professional':
        return <Badge className="bg-blue-500">Profissional</Badge>;
      case 'enterprise':
        return <Badge className="bg-purple-500">Enterprise</Badge>;
      default:
        return <Badge>{plan}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando tenant...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Tenant não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              O tenant "{slug}" não existe ou você não tem acesso.
            </p>
            <Button onClick={() => navigate('/master-panel')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/master-panel')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{tenant.name}</h1>
            <p className="text-muted-foreground">
              <code className="text-sm bg-muted px-2 py-1 rounded">/t/{tenant.slug}</code>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {getPlanBadge(tenant.plan)}
          <Badge variant={tenant.status === 'active' ? 'default' : 'outline'}>
            {tenant.status}
          </Badge>
        </div>
      </div>

      {/* Informações do Tenant */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenant.current_users} / {tenant.max_users}
            </div>
            <p className="text-xs text-muted-foreground">usuários ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{tenant.plan}</div>
            <p className="text-xs text-muted-foreground">plano atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Seu Acesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {currentUserRole ? (
                getRoleBadge(currentUserRole)
              ) : (
                <Badge variant="destructive">Sem acesso</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {currentUserRole === 'owner' && 'Controle total'}
              {currentUserRole === 'admin' && 'Gerenciamento'}
              {currentUserRole === 'member' && 'Acesso limitado'}
              {!currentUserRole && 'Sem permissões'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Membros */}
      <Card>
        <CardHeader>
          <CardTitle>Membros do Tenant ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum membro encontrado
            </p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.profiles?.name || 'Usuário'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.profiles?.email || member.user_id.substring(0, 8)}
                      </p>
                    </div>
                  </div>
                  {getRoleBadge(member.role)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      {tenant.domain && (
        <Card>
          <CardHeader>
            <CardTitle>Domínio Customizado</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-sm bg-muted px-3 py-2 rounded block">
              {tenant.domain}
            </code>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
