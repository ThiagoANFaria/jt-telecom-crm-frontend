import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { masterPanelService } from '@/services/masterPanel';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  Users, 
  Building2, 
  Settings, 
  BarChart3, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Globe,
  Key,
  Calendar,
  RefreshCw,
  UserCheck,
  Crown,
  Database,
  LogOut
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  slug?: string;
  domain: string;
  created_at: string;
  status: 'active' | 'inactive' | 'suspended' | 'trial';
  admin_email?: string;
  admin_name?: string;
  phone?: string;
  plan?: 'basic' | 'professional' | 'enterprise';
  users_count?: number;
  storage_used?: string;
  last_activity?: string;
}

interface NewTenant {
  name: string;
  slug?: string;
  domain: string;
  admin_email: string;
  admin_name: string;
  admin_password: string;
  phone: string;
  plan: 'basic' | 'professional' | 'enterprise';
  description?: string;
}

const MasterPanel: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('tenants');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [newTenant, setNewTenant] = useState<NewTenant>({
    name: '',
    slug: '',
    domain: '',
    admin_email: '',
    admin_name: '',
    admin_password: '',
    phone: '',
    plan: 'basic',
    description: ''
  });
  
  const { user, logout } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log('🚪 [MasterPanel] Botão Sair clicado!');
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
    }
  };

  // Verificar se o usuário é Master e carregar dados
  useEffect(() => {
    console.log('🔐 [MasterPanel] useEffect verificação');
    console.log('👤 [MasterPanel] User:', user?.email);
    console.log('📋 [MasterPanel] Profile:', { name: profile?.name, level: profile?.user_level });
    
    // Aguardar tanto user quanto profile estarem carregados
    if (!user || !profile) {
      console.log('⏳ [MasterPanel] Aguardando user/profile...');
      return; // Ainda carregando, não fazer nada
    }
    
    if (profile.user_level !== 'master') {
      console.log('🚫 [MasterPanel] Usuário não é master!');
      toast({
        title: 'Acesso negado',
        description: 'Apenas usuários Master podem acessar este módulo.',
        variant: 'destructive'
      });
    } else {
      fetchData();
    }
  }, [user, profile]);

  const fetchData = async () => {
    try {
      console.log('🚀 [MasterPanel] Iniciando fetchData...');
      const startTime = performance.now();
      
      setIsLoading(true);
      
      // Buscar tenants do Supabase usando o serviço Master Panel
      console.log('🔍 [MasterPanel] Chamando masterPanelService.getTenants()...');
      const tenantsStartTime = performance.now();
      const tenantsData = await masterPanelService.getTenants();
      console.log(`✅ [MasterPanel] Tenants recebidos em ${performance.now() - tenantsStartTime}ms`);
      console.log(`📊 [MasterPanel] Quantidade de tenants: ${tenantsData.length}`);
      
      if (tenantsData.length > 0) {
        console.log('📝 [MasterPanel] Primeiros tenants:', tenantsData.slice(0, 2).map(t => ({ 
          name: t.name, 
          plan: t.plan, 
          status: t.status 
        })));
      } else {
        console.warn('⚠️ [MasterPanel] ALERTA: Nenhum tenant retornado!');
      }
      
      const mappedTenants = tenantsData.map((tenant: any) => ({
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
        plan: tenant.plan,
        users_count: tenant.current_users,
        status: tenant.status,
        created_at: tenant.created_at,
        admin_email: '',
        phone: ''
      }));
      
      console.log('🗂️ [MasterPanel] Tenants mapeados:', mappedTenants.length);
      setTenants(mappedTenants);
      
      // Buscar usuários do Supabase
      try {
        console.log('👥 [MasterPanel] Buscando usuários...');
        const usersStartTime = performance.now();
        const usersData = await masterPanelService.getUsers();
        console.log(`✅ [MasterPanel] ${usersData.length} usuários carregados em ${performance.now() - usersStartTime}ms`);
        setUsers(usersData);
      } catch (error: any) {
        console.error('❌ [MasterPanel] Erro ao buscar usuários:', error);
        setUsers([]);
      }

      const totalTime = performance.now() - startTime;
      console.log(`🎯 [MasterPanel] fetchData COMPLETO em ${totalTime}ms`);

      toast({
        title: '✅ Dados carregados com sucesso',
        description: `${tenantsData.length} tenant(s) encontrado(s)`,
      });

    } catch (error: any) {
      console.error('💥 [MasterPanel] ERRO FATAL em fetchData:', error);
      console.error('💥 [MasterPanel] Stack trace:', error.stack);
      
      let errorMessage = 'Não foi possível carregar os dados.';
      let errorDetails = error.message;
      
      // Identificar tipo de erro
      if (error.message.includes('RLS')) {
        errorMessage = 'Erro de permissão (RLS)';
        errorDetails = 'Verifique as políticas de segurança da tabela tenants';
      } else if (error.message.includes('autenticação') || error.message.includes('authenticated')) {
        errorMessage = 'Erro de autenticação';
        errorDetails = 'Faça login novamente';
      } else if (error.message.includes('master')) {
        errorMessage = 'Acesso negado';
        errorDetails = 'Apenas usuários Master podem acessar';
      }
      
      toast({
        title: `❌ ${errorMessage}`,
        description: errorDetails,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTenant = async () => {
    if (!newTenant.name.trim() || !newTenant.admin_email.trim() || !newTenant.admin_password.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome, email e senha do administrador.',
        variant: 'destructive',
      });
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newTenant.admin_email)) {
      toast({
        title: 'Email inválido',
        description: 'Digite um email válido.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const newTenantData = await masterPanelService.createTenant({
        name: newTenant.name,
        slug: newTenant.slug || undefined,
        domain: newTenant.domain,
        plan: newTenant.plan,
        admin_email: newTenant.admin_email,
        admin_password: newTenant.admin_password
      });

      // Mostrar toast de sucesso
      toast({
        title: 'Tenant criado com sucesso!',
        description: `Administrador: ${newTenant.admin_email}`,
      });

      // Resetar formulário
      setNewTenant({
        name: '',
        slug: '',
        domain: '',
        admin_name: '',
        admin_email: '',
        admin_password: '',
        phone: '',
        plan: 'basic',
        description: ''
      });

      setIsCreateModalOpen(false);
      
      // Recarregar dados após a criação
      await fetchData();

    } catch (error: any) {
      console.error('Error creating tenant:', error);
      toast({
        title: 'Erro ao criar tenant',
        description: error.message || 'Falha ao criar novo tenant.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTenant = (tenant: Tenant) => {
    // HANDLER SIMPLIFICADO PARA DIAGNÓSTICO
    alert(`✏️ EDITAR CLICOU: ${tenant.name}`);
    console.log('✏️ handleEditTenant chamado para:', tenant.name);
  };

  const handleViewTenant = (tenant: Tenant) => {
    // HANDLER SIMPLIFICADO PARA DIAGNÓSTICO
    alert(`👁️ VISUALIZAR CLICOU: ${tenant.name}`);
    console.log('👁️ handleViewTenant chamado para:', tenant.name);
  };

  const handleSaveEdit = async () => {
    if (!selectedTenant) return;
    
    try {
      setIsLoading(true);
      await masterPanelService.updateTenant(selectedTenant.id, {
        name: selectedTenant.name,
        domain: selectedTenant.domain,
        plan: selectedTenant.plan,
      });
      
      toast({
        title: 'Tenant atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
      
      setIsEditModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message || 'Não foi possível salvar as alterações.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm('Tem certeza que deseja excluir este tenant? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setIsLoading(true);
      await masterPanelService.deleteTenant(tenantId);
      toast({
        title: 'Tenant excluído',
        description: 'Tenant removido com sucesso.',
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Não foi possível excluir o tenant.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-gray-100 text-gray-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'basic': return 'Básico';
      case 'professional': return 'Profissional';
      case 'enterprise': return 'Enterprise';
      default: return 'Básico';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'suspended': return 'Suspenso';
      case 'trial': return 'Trial';
      default: return 'Desconhecido';
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'outline';
      case 'suspended': return 'destructive';
      case 'inactive': return 'secondary';
      default: return 'secondary';
    }
  };

  if (!user || !profile || profile.user_level !== 'master') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Este módulo é exclusivo para usuários Master.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="w-8 h-8 text-yellow-600" />
          <div>
            <h1 className="text-3xl font-bold text-[#0057B8]">Master Panel</h1>
            <p className="text-muted-foreground">Gestão de Tenants e Sistema</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-100 ml-2"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-[#0057B8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0057B8]">{tenants.length}</div>
            <p className="text-xs text-muted-foreground">
              {tenants.filter(t => t.status === 'active' || t.status === 'trial').length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tenants.reduce((acc, tenant) => acc + (tenant.users_count || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              em todos os tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Premium</CardTitle>
            <Crown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {tenants.filter(t => t.plan === 'professional' || t.plan === 'enterprise').length}
            </div>
            <p className="text-xs text-muted-foreground">
              tenants premium+
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Armazenamento</CardTitle>
            <Database className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">2.4GB</div>
            <p className="text-xs text-muted-foreground">
              total utilizado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Gestão de Tenants</h2>
            <div className="flex gap-2">
              {/* BOTÃO DE TESTE - DIAGNÓSTICO */}
              <Button 
                onClick={() => {
                  alert('🟢 BOTÃO DE TESTE FUNCIONOU!');
                  console.log('🟢 TESTE: Botão de teste clicado com sucesso');
                }}
                variant="destructive"
                title="Botão de teste para diagnóstico"
              >
                🔴 TESTE CLIQUE
              </Button>
              
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#0057B8] hover:bg-[#003d82]">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Tenant
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Tenant</DialogTitle>
                  </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label htmlFor="name">Nome da Empresa *</Label>
                       <Input
                         id="name"
                         value={newTenant.name}
                         onChange={(e) => setNewTenant(prev => ({ ...prev, name: e.target.value }))}
                         placeholder="JT Tecnologia Ltda"
                       />
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="slug">Slug (identificador único)</Label>
                       <Input
                         id="slug"
                         value={newTenant.slug || ''}
                         onChange={(e) => setNewTenant(prev => ({ ...prev, slug: e.target.value }))}
                         placeholder="teste-qa"
                       />
                       <p className="text-xs text-muted-foreground">
                         Deixe vazio para gerar automaticamente
                       </p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label htmlFor="domain">Domínio</Label>
                       <Input
                         id="domain"
                         value={newTenant.domain}
                         onChange={(e) => setNewTenant(prev => ({ ...prev, domain: e.target.value }))}
                         placeholder="empresa.com.br"
                       />
                       <p className="text-xs text-muted-foreground">
                         Domínio personalizado (opcional)
                       </p>
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="plan">Plano *</Label>
                       <Select value={newTenant.plan} onValueChange={(value) => setNewTenant(prev => ({ ...prev, plan: value as any }))}>
                         <SelectTrigger>
                           <SelectValue placeholder="Selecione o plano" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="basic">Básico</SelectItem>
                           <SelectItem value="professional">Profissional</SelectItem>
                           <SelectItem value="enterprise">Enterprise</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                  </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label htmlFor="admin_email">Email do Admin *</Label>
                       <Input
                         id="admin_email"
                         type="email"
                         value={newTenant.admin_email}
                         onChange={(e) => setNewTenant(prev => ({ ...prev, admin_email: e.target.value }))}
                         placeholder="admin@empresa.com"
                       />
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="admin_password">Senha do Admin *</Label>
                       <Input
                         id="admin_password"
                         type="password"
                         value={newTenant.admin_password}
                         onChange={(e) => setNewTenant(prev => ({ ...prev, admin_password: e.target.value }))}
                         placeholder="Senha do administrador"
                       />
                     </div>
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="description">Descrição (opcional)</Label>
                     <Textarea
                       id="description"
                       value={newTenant.description}
                       onChange={(e) => setNewTenant(prev => ({ ...prev, description: e.target.value }))}
                       placeholder="Descrição do tenant..."
                       rows={3}
                     />
                   </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateTenant}
                    disabled={isLoading}
                    className="bg-[#0057B8] hover:bg-[#003d82]"
                  >
                    {isLoading ? 'Criando...' : 'Criar Tenant'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          {/* Modal de Edição */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Editar Tenant</DialogTitle>
              </DialogHeader>
              {selectedTenant && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Nome da Empresa</Label>
                      <Input
                        id="edit-name"
                        value={selectedTenant.name}
                        onChange={(e) => setSelectedTenant({ ...selectedTenant, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-domain">Domínio</Label>
                      <Input
                        id="edit-domain"
                        value={selectedTenant.domain || ''}
                        onChange={(e) => setSelectedTenant({ ...selectedTenant, domain: e.target.value })}
                        placeholder="empresa.com.br"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-plan">Plano</Label>
                    <Select 
                      value={selectedTenant.plan} 
                      onValueChange={(value) => setSelectedTenant({ ...selectedTenant, plan: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Básico</SelectItem>
                        <SelectItem value="professional">Profissional</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveEdit}
                  disabled={isLoading}
                  className="bg-[#0057B8] hover:bg-[#003d82]"
                >
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Card>
            <CardContent>
              <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Nome</TableHead>
                     <TableHead>Domínio</TableHead>
                     <TableHead>Plano</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead>Usuários</TableHead>
                     <TableHead>Data de Criação</TableHead>
                     <TableHead>Ações</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {tenants.length === 0 ? (
                     <TableRow>
                       <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                         Nenhuma tenant cadastrada
                       </TableCell>
                     </TableRow>
                   ) : (
                     tenants.map((tenant) => (
                       <TableRow key={tenant.id}>
                         <TableCell>
                           <div className="font-medium">{tenant.name}</div>
                         </TableCell>
                         <TableCell>
                           <span className="font-mono text-sm">{tenant.domain || '-'}</span>
                         </TableCell>
                         <TableCell>
                           <Badge className={getPlanColor(tenant.plan)}>
                             {getPlanLabel(tenant.plan)}
                           </Badge>
                         </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(tenant.status)}>
                              {getStatusLabel(tenant.status)}
                            </Badge>
                          </TableCell>
                         <TableCell>
                           {tenant.users_count || 0}
                         </TableCell>
                         <TableCell>
                           {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                         </TableCell>
                             <TableCell>
                              <div className="flex gap-2">
                                {/* BOTÕES SIMPLIFICADOS PARA DIAGNÓSTICO */}
                                 <Button 
                                   variant="outline" 
                                   size="sm" 
                                   onClick={() => handleEditTenant(tenant)}
                                   title="Editar tenant"
                                 >
                                   <Edit className="w-4 h-4" />
                                 </Button>
                                 <Button 
                                   variant="outline" 
                                   size="sm"
                                   onClick={() => tenant.slug && navigate(`/t/${tenant.slug}`)}
                                   title="Visualizar tenant"
                                   disabled={!tenant.slug}
                                 >
                                   <Eye className="w-4 h-4" />
                                 </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTenant(tenant.id);
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                  title="Excluir tenant"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                       </TableRow>
                     ))
                   )}
                 </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuários do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <UserCheck className="w-8 h-8 text-blue-500" />
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                      <Badge variant={user.user_level === 'master' ? 'default' : 'secondary'}>
                        {user.user_level === 'master' ? 'Master' : user.user_level === 'admin' ? 'Admin' : 'Usuário'}
                      </Badge>
                    </div>
                     <div className="text-sm text-muted-foreground">
                       {new Date(user.created_at).toLocaleDateString('pt-BR')}
                     </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Versão do Sistema:</span>
                  <Badge>v2.1.0</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Última Atualização:</span>
                  <span className="text-sm text-muted-foreground">18/01/2024 14:30</span>
                </div>
                <div className="flex justify-between">
                  <span>Status do Servidor:</span>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Backup Automático:</span>
                  <Badge className="bg-blue-100 text-blue-800">Ativo</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações Master</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações Globais
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Key className="w-4 h-4 mr-2" />
                  Gerenciar API Keys
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Backup do Sistema
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Relatórios do Sistema
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MasterPanel;