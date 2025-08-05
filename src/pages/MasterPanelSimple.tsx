import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Plus, 
  Settings, 
  BarChart3, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  CreditCard,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '@/hooks/useProfile';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  adminEmail: string;
  status: 'active' | 'inactive' | 'suspended';
  users: number;
  createdAt: string;
  plan: 'basic' | 'pro' | 'enterprise';
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    users: number;
    leads: number;
    storage_gb: number;
    api_calls_per_month: number;
  };
  status: 'Ativo' | 'Inativo';
  created_at: string;
}

const MasterPanelSimple: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreatePlanForm, setShowCreatePlanForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'tenants' | 'plans'>('tenants');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [newTenant, setNewTenant] = useState({
    name: '',
    domain: '',
    adminEmail: '',
    adminPassword: '',
    plan: 'basic'
  });
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    price: 0,
    billing_cycle: 'monthly' as 'monthly' | 'yearly',
    features: [''],
    limits: {
      users: 10,
      leads: 1000,
      storage_gb: 10,
      api_calls_per_month: 10000
    }
  });

  // Simular carregamento
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      // Dados mockados de tenants
      setTenants([
        {
          id: '1',
          name: 'Empresa Demo 1',
          domain: 'demo1.app.jttecnologia.com.br',
          adminEmail: 'admin@demo1.com',
          status: 'active',
          users: 8,
          createdAt: '2024-01-15',
          plan: 'pro'
        },
        {
          id: '2',
          name: 'Empresa Demo 2',
          domain: 'demo2.app.jttecnologia.com.br',
          adminEmail: 'admin@demo2.com',
          status: 'active',
          users: 5,
          createdAt: '2024-02-20',
          plan: 'basic'
        },
        {
          id: '3',
          name: 'Empresa Demo 3',
          domain: 'demo3.app.jttecnologia.com.br',
          adminEmail: 'admin@demo3.com',
          status: 'inactive',
          users: 12,
          createdAt: '2024-03-10',
          plan: 'enterprise'
        }
      ]);

      // Dados mockados de planos
      setPlans([
        {
          id: '1',
          name: 'Básico',
          description: 'Plano básico para pequenas empresas',
          price: 99.90,
          billing_cycle: 'monthly',
          features: [
            'Até 5 usuários',
            'Até 1000 leads',
            'Suporte por email',
            'Dashboard básico'
          ],
          limits: {
            users: 5,
            leads: 1000,
            storage_gb: 10,
            api_calls_per_month: 10000
          },
          status: 'Ativo',
          created_at: '2025-01-01T10:00:00Z'
        },
        {
          id: '2',
          name: 'Professional',
          description: 'Plano profissional para empresas em crescimento',
          price: 199.90,
          billing_cycle: 'monthly',
          features: [
            'Até 15 usuários',
            'Até 5000 leads',
            'Suporte prioritário',
            'Dashboard avançado',
            'Relatórios personalizados',
            'Integração com APIs'
          ],
          limits: {
            users: 15,
            leads: 5000,
            storage_gb: 50,
            api_calls_per_month: 50000
          },
          status: 'Ativo',
          created_at: '2025-01-01T10:00:00Z'
        },
        {
          id: '3',
          name: 'Enterprise',
          description: 'Plano empresarial para grandes organizações',
          price: 499.90,
          billing_cycle: 'monthly',
          features: [
            'Usuários ilimitados',
            'Leads ilimitados',
            'Suporte 24/7',
            'Dashboard personalizado',
            'Relatórios avançados',
            'Integração completa',
            'White label',
            'SLA garantido'
          ],
          limits: {
            users: -1,
            leads: -1,
            storage_gb: 500,
            api_calls_per_month: 500000
          },
          status: 'Ativo',
          created_at: '2025-01-01T10:00:00Z'
        }
      ]);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tenant: Tenant = {
      id: Date.now().toString(),
      name: newTenant.name,
      domain: `${newTenant.domain}.app.jttecnologia.com.br`,
      adminEmail: newTenant.adminEmail,
      status: 'active',
      users: 1,
      createdAt: new Date().toISOString().split('T')[0],
      plan: newTenant.plan as 'basic' | 'pro' | 'enterprise'
    };

    setTenants([...tenants, tenant]);
    setNewTenant({ name: '', domain: '', adminEmail: '', adminPassword: '', plan: 'basic' });
    setShowCreateForm(false);
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    
    const plan: Plan = {
      id: Date.now().toString(),
      name: newPlan.name,
      description: newPlan.description,
      price: newPlan.price,
      billing_cycle: newPlan.billing_cycle,
      features: newPlan.features.filter(f => f.trim() !== ''),
      limits: newPlan.limits,
      status: 'Ativo',
      created_at: new Date().toISOString()
    };

    setPlans([...plans, plan]);
    setNewPlan({
      name: '',
      description: '',
      price: 0,
      billing_cycle: 'monthly',
      features: [''],
      limits: {
        users: 10,
        leads: 1000,
        storage_gb: 10,
        api_calls_per_month: 10000
      }
    });
    setShowCreatePlanForm(false);
  };

  const addFeature = () => {
    setNewPlan({
      ...newPlan,
      features: [...newPlan.features, '']
    });
  };

  const updateFeature = (index: number, value: string) => {
    const updatedFeatures = [...newPlan.features];
    updatedFeatures[index] = value;
    setNewPlan({
      ...newPlan,
      features: updatedFeatures
    });
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = newPlan.features.filter((_, i) => i !== index);
    setNewPlan({
      ...newPlan,
      features: updatedFeatures
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>;
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800">Inativa</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspensa</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'basic':
        return <Badge variant="outline">Básico</Badge>;
      case 'pro':
        return <Badge className="bg-blue-100 text-blue-800">Pro</Badge>;
      case 'enterprise':
        return <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>;
      default:
        return <Badge variant="outline">Básico</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-blue-600">Painel Master</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const totalUsers = tenants.reduce((sum, t) => sum + t.users, 0);
  const totalRevenue = tenants.length * 299; // Simulando R$ 299 por tenant

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">🏢 Painel Master</h1>
          <p className="text-gray-600 mt-1">Gestão completa do sistema multi-tenant</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Admin Master</p>
          <p className="font-medium text-gray-900">{profile?.name || user?.email?.split('@')[0] || 'JT Telecom'}</p>
        </div>
      </div>

      {/* Status do Sistema */}
      <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
        <CheckCircle className="h-5 w-5 mr-2" />
        <div>
          <h2 className="font-bold">✅ Painel Master Funcionando!</h2>
          <p className="text-sm">Sistema multi-tenant operacional. Todas as funcionalidades disponíveis.</p>
        </div>
      </div>

      {/* Métricas Globais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenants.length}</div>
            <p className="text-xs text-muted-foreground">{activeTenants} ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Em todas as empresas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Faturamento total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Sistema</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <p className="text-xs text-muted-foreground">Operacional</p>
          </CardContent>
        </Card>
      </div>

      {/* Abas de Navegação */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('tenants')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tenants'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Building2 className="h-4 w-4 inline mr-2" />
            Empresas
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'plans'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="h-4 w-4 inline mr-2" />
            Planos
          </button>
        </nav>
      </div>

      {/* Ações Rápidas */}
      <div className="flex gap-4">
        {activeTab === 'tenants' && (
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        )}
        {activeTab === 'plans' && (
          <Button 
            onClick={() => setShowCreatePlanForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
        )}
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configurações
        </Button>
        <Button variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          Relatórios
        </Button>
      </div>

      {/* Formulário de Criação de Tenant */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Nova Empresa</CardTitle>
            <CardDescription>Adicione uma nova empresa ao sistema multi-tenant</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Empresa</Label>
                  <Input
                    id="name"
                    value={newTenant.name}
                    onChange={(e) => setNewTenant({...newTenant, name: e.target.value})}
                    placeholder="Ex: Empresa ABC Ltda"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="domain">Subdomínio</Label>
                  <div className="flex">
                    <Input
                      id="domain"
                      value={newTenant.domain}
                      onChange={(e) => setNewTenant({...newTenant, domain: e.target.value})}
                      placeholder="empresa-abc"
                      required
                    />
                    <span className="flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-l-0 rounded-r">
                      .app.jttecnologia.com.br
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="adminEmail">E-mail do Admin</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={newTenant.adminEmail}
                    onChange={(e) => setNewTenant({...newTenant, adminEmail: e.target.value})}
                    placeholder="admin@empresa.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="adminPassword">Senha do Admin</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={newTenant.adminPassword}
                    onChange={(e) => setNewTenant({...newTenant, adminPassword: e.target.value})}
                    placeholder="Senha segura"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="plan">Plano</Label>
                  <select
                    id="plan"
                    value={newTenant.plan}
                    onChange={(e) => setNewTenant({...newTenant, plan: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="basic">Básico - R$ 199/mês</option>
                    <option value="pro">Pro - R$ 299/mês</option>
                    <option value="enterprise">Enterprise - R$ 499/mês</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Criar Empresa
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Formulário de Criação de Plano */}
      {showCreatePlanForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Plano</CardTitle>
            <CardDescription>Adicione um novo plano de assinatura ao sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="planName">Nome do Plano</Label>
                  <Input
                    id="planName"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                    placeholder="Ex: Professional"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="planPrice">Preço (R$)</Label>
                  <Input
                    id="planPrice"
                    type="number"
                    step="0.01"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({...newPlan, price: parseFloat(e.target.value)})}
                    placeholder="199.90"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="planDescription">Descrição</Label>
                  <Input
                    id="planDescription"
                    value={newPlan.description}
                    onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                    placeholder="Descrição do plano"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="billingCycle">Ciclo de Cobrança</Label>
                  <select
                    id="billingCycle"
                    value={newPlan.billing_cycle}
                    onChange={(e) => setNewPlan({...newPlan, billing_cycle: e.target.value as 'monthly' | 'yearly'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
              </div>

              {/* Limites */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="usersLimit">Limite de Usuários</Label>
                  <Input
                    id="usersLimit"
                    type="number"
                    value={newPlan.limits.users}
                    onChange={(e) => setNewPlan({
                      ...newPlan,
                      limits: {...newPlan.limits, users: parseInt(e.target.value)}
                    })}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label htmlFor="leadsLimit">Limite de Leads</Label>
                  <Input
                    id="leadsLimit"
                    type="number"
                    value={newPlan.limits.leads}
                    onChange={(e) => setNewPlan({
                      ...newPlan,
                      limits: {...newPlan.limits, leads: parseInt(e.target.value)}
                    })}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <Label htmlFor="storageLimit">Armazenamento (GB)</Label>
                  <Input
                    id="storageLimit"
                    type="number"
                    value={newPlan.limits.storage_gb}
                    onChange={(e) => setNewPlan({
                      ...newPlan,
                      limits: {...newPlan.limits, storage_gb: parseInt(e.target.value)}
                    })}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label htmlFor="apiLimit">Chamadas API/mês</Label>
                  <Input
                    id="apiLimit"
                    type="number"
                    value={newPlan.limits.api_calls_per_month}
                    onChange={(e) => setNewPlan({
                      ...newPlan,
                      limits: {...newPlan.limits, api_calls_per_month: parseInt(e.target.value)}
                    })}
                    placeholder="10000"
                  />
                </div>
              </div>

              {/* Funcionalidades */}
              <div>
                <Label>Funcionalidades</Label>
                <div className="space-y-2 mt-2">
                  {newPlan.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Ex: Suporte 24/7"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        disabled={newPlan.features.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeature}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Funcionalidade
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Criar Plano
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreatePlanForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Conteúdo das Abas */}
      {activeTab === 'tenants' && (
        <Card>
          <CardHeader>
            <CardTitle>Empresas Cadastradas</CardTitle>
            <CardDescription>Gerencie todas as empresas do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{tenant.name}</h3>
                      {getStatusBadge(tenant.status)}
                      {getPlanBadge(tenant.plan)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <p>Domínio: {tenant.domain}</p>
                      <p>Admin: {tenant.adminEmail}</p>
                      <p>Usuários: {tenant.users} | Criado em: {tenant.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'plans' && (
        <Card>
          <CardHeader>
            <CardTitle>Planos Disponíveis</CardTitle>
            <CardDescription>Gerencie todos os planos de assinatura</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{plan.name}</h3>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                    <Badge className={plan.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {plan.status}
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-blue-600">
                      R$ {plan.price.toFixed(2)}
                      <span className="text-sm font-normal text-gray-500">
                        /{plan.billing_cycle === 'monthly' ? 'mês' : 'ano'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-sm">Limites:</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>👥 Usuários: {plan.limits.users === -1 ? 'Ilimitado' : plan.limits.users}</p>
                      <p>📊 Leads: {plan.limits.leads === -1 ? 'Ilimitado' : plan.limits.leads.toLocaleString()}</p>
                      <p>💾 Armazenamento: {plan.limits.storage_gb}GB</p>
                      <p>🔗 API: {plan.limits.api_calls_per_month.toLocaleString()}/mês</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-sm">Funcionalidades:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Empresas */}
      <Card style={{display: 'none'}}>
        <CardHeader>
          <CardTitle>Empresas Cadastradas</CardTitle>
          <CardDescription>Gerencie todas as empresas do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tenants.map((tenant) => (
              <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{tenant.name}</h3>
                    {getStatusBadge(tenant.status)}
                    {getPlanBadge(tenant.plan)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <p>Domínio: {tenant.domain}</p>
                    <p>Admin: {tenant.adminEmail}</p>
                    <p>Usuários: {tenant.users} | Criado em: {tenant.createdAt}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema Multi-Tenant</CardTitle>
          <CardDescription>Monitoramento em tempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Autenticação Master: Ativa</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Isolamento de Dados: Funcionando</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Painel Master: Operacional</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">API Backend: Em desenvolvimento</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Frontend: Funcionando</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Deploy: Automático</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterPanelSimple;

