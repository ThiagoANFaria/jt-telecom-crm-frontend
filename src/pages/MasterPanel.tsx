import React, { useState, useEffect } from 'react';
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
  Database
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  created_at: string;
  active: boolean;
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

  // Verificar se o usuário é Master
  useEffect(() => {
    if (!user || !profile || profile.user_level !== 'master') {
      toast({
        title: 'Acesso negado',
        description: 'Apenas usuários Master podem acessar este módulo.',
        variant: 'destructive'
      });
    } else {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar tenants do Supabase usando o serviço Master Panel
      const tenantsData = await masterPanelService.getTenants();
      setTenants(tenantsData.map((tenant: any) => ({
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
        plan: tenant.plan,
        users_count: tenant.current_users,
        active: tenant.status === 'active' || tenant.status === 'trial',
        created_at: tenant.created_at,
        admin_email: '', // Será buscado separadamente se necessário
        phone: '',
        status: tenant.status
      })));
      
      // Buscar usuários do Supabase
      try {
        const usersData = await masterPanelService.getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setUsers([]);
      }

      toast({
        title: 'Dados carregados',
        description: `${tenantsData.length} tenants carregados com sucesso.`,
      });

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: error.message || 'Não foi possível carregar os dados.',
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
      setTimeout(async () => {
        await fetchData();
        
        // Mostrar toast com instrução de login
        toast({
          title: 'Redirecionando para o login',
          description: `O administrador pode fazer login em /auth`,
        });
        
        // Fazer logout do master e redirecionar
        setTimeout(async () => {
          await logout();
          window.location.href = '/auth';
        }, 2000);
      }, 1000);

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
    setSelectedTenant(tenant);
    setIsEditModalOpen(true);
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
              {tenants.filter(t => t.active).length} ativos
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
                           <Badge variant={tenant.active ? 'default' : 'secondary'}>
                             {tenant.active ? 'Ativo' : 'Inativo'}
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
                             <Button variant="outline" size="sm" onClick={() => handleEditTenant(tenant)}>
                               <Edit className="w-4 h-4" />
                             </Button>
                             <Button variant="outline" size="sm">
                               <Eye className="w-4 h-4" />
                             </Button>
                             <Button 
                               variant="outline" 
                               size="sm" 
                               onClick={() => handleDeleteTenant(tenant.id)}
                               className="text-red-600 hover:text-red-700"
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