
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  FileCheck, 
  DollarSign, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  Clock,
  Star,
  Zap,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: React.ElementType;
  color: string;
  description: string;
}

const DashboardModern: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const getMockData = () => {
    if (user?.user_level === 'master') {
      return {
        totalLeads: 2847,
        totalClients: 891,
        totalProposals: 234,
        totalContracts: 156,
        monthlyRevenue: 2850000,
        conversionRate: 64.8,
        tenants: 24,
        totalUsers: 187,
        activeDeals: 89,
        closingDeals: 23
      };
    } else if (user?.user_level === 'admin') {
      return {
        totalLeads: 145,
        totalClients: 78,
        totalProposals: 34,
        totalContracts: 21,
        monthlyRevenue: 185000,
        conversionRate: 53.8,
        activeUsers: 12,
        pendingTasks: 8,
        activeDeals: 19,
        closingDeals: 5
      };
    } else {
      return {
        totalLeads: 58,
        totalClients: 24,
        totalProposals: 12,
        totalContracts: 8,
        monthlyRevenue: 45000,
        conversionRate: 41.4,
        myTasks: 6,
        completedTasks: 18,
        activeDeals: 7,
        closingDeals: 2
      };
    }
  };

  const mockData = getMockData();

  const mainMetrics: MetricCard[] = [
    {
      title: 'Total de Leads',
      value: mockData.totalLeads,
      change: 12.5,
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      description: 'vs. mês anterior'
    },
    {
      title: 'Clientes Ativos',
      value: mockData.totalClients,
      change: 8.2,
      trend: 'up',
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600',
      description: 'clientes convertidos'
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${mockData.monthlyRevenue.toLocaleString('pt-BR')}`,
      change: 15.7,
      trend: 'up',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      description: 'crescimento mensal'
    },
    {
      title: 'Taxa de Conversão',
      value: `${mockData.conversionRate}%`,
      change: -2.1,
      trend: 'down',
      icon: Target,
      color: 'from-orange-500 to-orange-600',
      description: 'leads para clientes'
    }
  ];

  const recentActivities = [
    { type: 'lead', message: 'Novo lead: Tech Corp Solutions', time: '2 min atrás', icon: Users },
    { type: 'proposal', message: 'Proposta enviada para ACME Ltd', time: '15 min atrás', icon: FileText },
    { type: 'call', message: 'Ligação agendada com cliente VIP', time: '1h atrás', icon: Phone },
    { type: 'contract', message: 'Contrato assinado - R$ 85.000', time: '2h atrás', icon: FileCheck },
    { type: 'meeting', message: 'Reunião marcada para amanhã', time: '3h atrás', icon: Calendar }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0057B8] to-[#003d82] bg-clip-text text-transparent font-montserrat">
              {user?.user_level === 'master' ? 'Painel Master' : 
               user?.user_level === 'admin' ? 'Dashboard Executivo' : 'Meu Dashboard'}
            </h1>
            <p className="text-gray-600 mt-2 font-opensans">
              Bem-vindo de volta, <span className="font-semibold text-[#0057B8]">{user?.name}</span>! 
              Aqui está seu resumo de hoje.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-white rounded-lg p-1 shadow-sm border">
              {['7d', '30d', '90d'].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className={selectedPeriod === period ? 'bg-[#0057B8] text-white' : 'text-gray-600'}
                >
                  {period === '7d' ? '7 dias' : period === '30d' ? '30 dias' : '90 dias'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {mainMetrics.map((metric, index) => (
            <Card key={index} className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5`}></div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {metric.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color}`}>
                    <metric.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900 font-montserrat">
                    {metric.value}
                  </div>
                  <div className="flex items-center text-sm">
                    {metric.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {metric.change}%
                    </span>
                    <span className="text-gray-500 ml-1">{metric.description}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Analytics */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Performance Chart */}
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#0057B8] font-montserrat">Performance de Vendas</CardTitle>
                  <CardDescription>Evolução das métricas principais</CardDescription>
                </div>
                <BarChart3 className="w-5 h-5 text-[#0057B8]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Meta Mensal</span>
                    <span className="font-semibold">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Leads Qualificados</span>
                    <span className="font-semibold">68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Propostas Aceitas</span>
                    <span className="font-semibold">82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#0057B8] font-montserrat">Atividades Recentes</CardTitle>
                <Activity className="w-5 h-5 text-[#0057B8]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-1 rounded-full bg-[#0057B8]/10">
                      <activity.icon className="w-3 h-3 text-[#0057B8]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Status */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-[#0057B8] to-[#003d82] text-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white font-montserrat flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <Users className="w-4 h-4 mr-2" />
                  Novo Lead
                </Button>
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <FileText className="w-4 h-4 mr-2" />
                  Nova Proposta
                </Button>
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <Phone className="w-4 h-4 mr-2" />
                  Fazer Ligação
                </Button>
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Reunião
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Cards */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#0057B8] font-montserrat">Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                    <span className="font-medium">Sistema Online</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Funcionando
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-[#0057B8] mr-3" />
                    <span className="font-medium">Performance</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Excelente
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-orange-500 mr-3" />
                    <span className="font-medium">Tarefas Pendentes</span>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    {mockData.activeDeals}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Stats */}
        <Card className="bg-gradient-to-r from-[#00C853]/10 to-[#0057B8]/10 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0057B8] font-montserrat">
                  {mockData.activeDeals}
                </div>
                <div className="text-sm text-gray-600">Negócios Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#00C853] font-montserrat">
                  {mockData.closingDeals}
                </div>
                <div className="text-sm text-gray-600">Fechando Hoje</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0057B8] font-montserrat">
                  R$ {(mockData.monthlyRevenue / 30).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-gray-600">Receita Diária</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#00C853] font-montserrat">
                  98.5%
                </div>
                <div className="text-sm text-gray-600">Satisfação</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardModern;
