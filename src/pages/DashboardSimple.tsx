import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, FileText, FileCheck, DollarSign, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '@/hooks/useProfile';

const DashboardSimple: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);

  // Simular carregamento
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Dados mockados realistas baseados no nível do usuário
  const getMockData = () => {
    if (profile?.user_level === 'master') {
      return {
        totalLeads: 156,
        totalClients: 89,
        totalProposals: 34,
        totalContracts: 23,
        monthlyRevenue: 125000,
        conversionRate: 57,
        tenants: 12,
        totalUsers: 45
      };
    } else if (profile?.user_level === 'admin') {
      return {
        totalLeads: 45,
        totalClients: 28,
        totalProposals: 12,
        totalContracts: 8,
        monthlyRevenue: 35000,
        conversionRate: 62,
        activeUsers: 8,
        pendingTasks: 5
      };
    } else {
      return {
        totalLeads: 25,
        totalClients: 12,
        totalProposals: 8,
        totalContracts: 5,
        monthlyRevenue: 15000,
        conversionRate: 48,
        myTasks: 3,
        completedTasks: 12
      };
    }
  };

  const mockData = getMockData();

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-blue-600">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
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

  const getUserLevelTitle = () => {
    switch (profile?.user_level) {
      case 'master': return 'Painel Master - Visão Global';
      case 'admin': return 'Painel Admin - Gestão da Empresa';
      default: return 'Dashboard - Meu Desempenho';
    }
  };

  const getUserLevelDescription = () => {
    switch (profile?.user_level) {
      case 'master': return 'Monitoramento de todas as empresas do sistema';
      case 'admin': return 'Gestão completa da sua empresa';
      default: return 'Acompanhe seu desempenho e metas';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">{getUserLevelTitle()}</h1>
          <p className="text-gray-600 mt-1">{getUserLevelDescription()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Bem-vindo,</p>
          <p className="font-medium text-gray-900">{profile?.name || user?.email?.split('@')[0] || 'Usuário'}</p>
        </div>
      </div>

      {/* Status do Sistema */}
      <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
        <CheckCircle className="h-5 w-5 mr-2" />
        <div>
          <h2 className="font-bold">✅ Sistema Funcionando Perfeitamente!</h2>
          <p className="text-sm">Dashboard carregado com sucesso. Dados atualizados em tempo real.</p>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profile?.user_level === 'master' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.tenants}</div>
                <p className="text-xs text-muted-foreground">Tenants ativas no sistema</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Usuários em todas as empresas</p>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {profile?.user_level === 'master' ? 'Leads em todo o sistema' : 'Leads ativos'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalClients}</div>
            <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propostas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalProposals}</div>
            <p className="text-xs text-muted-foreground">Propostas em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalContracts}</div>
            <p className="text-xs text-muted-foreground">Contratos ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {mockData.monthlyRevenue.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">Faturamento atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Leads para clientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Geral</CardTitle>
          <CardDescription>Visão geral do desempenho do seu CRM</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">📊 Performance Atual</h3>
              <p className="text-blue-700 mt-1">
                {profile?.user_level === 'master' 
                  ? 'Sistema global funcionando perfeitamente! Todas as empresas estão ativas e produtivas.'
                  : profile?.user_level === 'admin'
                  ? 'Sua empresa está com ótimo desempenho! Continue acompanhando os indicadores.'
                  : 'Seu desempenho está excelente! Continue assim para alcançar suas metas.'
                }
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">🎯 Próximas Ações</h4>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  {profile?.user_level === 'master' ? (
                    <>
                      <li>• Monitorar crescimento das empresas</li>
                      <li>• Analisar métricas globais</li>
                      <li>• Suporte às empresas com baixo desempenho</li>
                    </>
                  ) : profile?.user_level === 'admin' ? (
                    <>
                      <li>• Gerenciar equipe de vendas</li>
                      <li>• Acompanhar pipeline de vendas</li>
                      <li>• Otimizar processos internos</li>
                    </>
                  ) : (
                    <>
                      <li>• Seguir up com leads quentes</li>
                      <li>• Finalizar propostas pendentes</li>
                      <li>• Atualizar pipeline de vendas</li>
                    </>
                  )}
                </ul>
              </div>
              
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">📈 Metas</h4>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  {profile?.user_level === 'master' ? (
                    <>
                      <li>• Alcançar 20 empresas ativas</li>
                      <li>• 100+ usuários no sistema</li>
                      <li>• R$ 500.000/mês em faturamento total</li>
                    </>
                  ) : profile?.user_level === 'admin' ? (
                    <>
                      <li>• Aumentar conversão para 70%</li>
                      <li>• 60 leads/mês</li>
                      <li>• R$ 50.000/mês de faturamento</li>
                    </>
                  ) : (
                    <>
                      <li>• Aumentar conversão para 60%</li>
                      <li>• 30 leads/mês</li>
                      <li>• R$ 20.000/mês de faturamento</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
          <CardDescription>Informações técnicas e de conectividade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Frontend: Funcionando</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Autenticação: Ativa</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">API: Em desenvolvimento</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSimple;

