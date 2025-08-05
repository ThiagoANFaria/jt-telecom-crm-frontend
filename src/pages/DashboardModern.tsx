import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Activity,
  Filter,
  Download,
  RefreshCw,
  Bell,
  TrendingDown,
  Flame,
  MousePointer,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { apiService } from '@/services/api';
import { secureLog } from '@/utils/security';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: React.ElementType;
  color: string;
  description: string;
  bgGradient: string;
}

interface QuickAction {
  title: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
  loading?: boolean;
}

const DashboardModern: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedResponsible, setSelectedResponsible] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Animação de carregamento mais sofisticada
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoadingData(true);
      const data = await apiService.getDashboardSummary();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Em caso de erro, usar dados vazios
      setDashboardData({
        totalLeads: 0,
        totalClients: 0,
        totalProposals: 0,
        totalContracts: 0,
        monthlyRevenue: 0,
        conversionRate: 0,
        hotLeads: 0,
        callsMade: 0,
        emailsSent: 0,
        meetingsScheduled: 0,
        tasksCompleted: 0,
        pendingFollowUps: 0,
        avgResponseTime: '0h',
        customerSatisfaction: 0,
        automationSuccess: 0,
        activeDeals: 0,
        closingDeals: 0,
        activeContractsThisMonth: 0,
        meetingsHeld: 0
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getMockData = () => {
    if (profile?.user_level === 'master') {
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
        closingDeals: 23,
        hotLeads: 45,
        callsMade: 156,
        emailsSent: 289,
        meetingsScheduled: 34,
        tasksCompleted: 127,
        pendingFollowUps: 18,
        avgResponseTime: '2.5h',
        customerSatisfaction: 98.5,
        automationSuccess: 94.2,
        activeContractsThisMonth: 42,
        meetingsHeld: 67
      };
    } else if (profile?.user_level === 'admin') {
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
        closingDeals: 5,
        hotLeads: 12,
        callsMade: 45,
        emailsSent: 89,
        meetingsScheduled: 8,
        tasksCompleted: 34,
        pendingFollowUps: 6,
        avgResponseTime: '1.8h',
        customerSatisfaction: 96.3,
        automationSuccess: 91.7,
        activeContractsThisMonth: 12,
        meetingsHeld: 28
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
        closingDeals: 2,
        hotLeads: 4,
        callsMade: 23,
        emailsSent: 45,
        meetingsScheduled: 3,
        tasksCompleted: 15,
        pendingFollowUps: 3,
        avgResponseTime: '1.2h',
        customerSatisfaction: 94.8,
        automationSuccess: 87.3,
        activeContractsThisMonth: 5,
        meetingsHeld: 12
      };
    }
  };

  // Usar dados reais ou dados vazios se ainda carregando
  const currentData = dashboardData || {
    totalLeads: 0,
    totalClients: 0,
    totalProposals: 0,
    totalContracts: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    hotLeads: 0,
    callsMade: 0,
    emailsSent: 0,
    meetingsScheduled: 0,
    tasksCompleted: 0,
    pendingFollowUps: 0,
    avgResponseTime: '0h',
    customerSatisfaction: 0,
    automationSuccess: 0,
    activeDeals: 0,
    closingDeals: 0,
    activeContractsThisMonth: 0,
    meetingsHeld: 0
  };

  const mainMetrics: MetricCard[] = [
    {
      title: 'Total de Leads',
      value: isLoadingData ? '...' : currentData.totalLeads.toLocaleString('pt-BR'),
      change: 12.5,
      trend: 'up',
      icon: Users,
      color: 'from-[#0057B8] to-[#003d82]',
      description: 'vs. mês anterior',
      bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100'
    },
    {
      title: 'Clientes Ativos',
      value: currentData.totalClients.toLocaleString('pt-BR'),
      change: 8.2,
      trend: 'up',
      icon: CheckCircle2,
      color: 'from-[#00C853] to-[#00A843]',
      description: 'clientes convertidos',
      bgGradient: 'bg-gradient-to-br from-green-50 to-green-100'
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${(currentData.monthlyRevenue / 1000).toFixed(0)}K`,
      change: 15.7,
      trend: 'up',
      icon: DollarSign,
      color: 'from-[#0057B8] to-[#00C853]',
      description: 'crescimento mensal',
      bgGradient: 'bg-gradient-to-br from-purple-50 to-purple-100'
    },
    {
      title: 'Taxa de Conversão',
      value: `${currentData.conversionRate}%`,
      change: -2.1,
      trend: 'down',
      icon: Target,
      color: 'from-orange-500 to-orange-600',
      description: 'leads para clientes',
      bgGradient: 'bg-gradient-to-br from-orange-50 to-orange-100'
    }
  ];

  const performanceIndicators = [
    {
      icon: Flame,
      label: 'Leads Quentes',
      value: currentData.hotLeads,
      color: 'text-red-500',
      bgColor: 'bg-red-100'
    },
    {
      icon: FileCheck,
      label: 'Contratos Ativos no Mês',
      value: currentData.activeContractsThisMonth || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Calendar,
      label: 'Reuniões Realizadas',
      value: currentData.meetingsHeld || 0,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Phone,
      label: 'Chamadas Realizadas',
      value: currentData.callsMade,
      color: 'text-[#0057B8]',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Send,
      label: 'E-mails Enviados',
      value: currentData.emailsSent,
      color: 'text-[#00C853]',
      bgColor: 'bg-green-100'
    },
    {
      icon: Calendar,
      label: 'Reuniões Agendadas',
      value: currentData.meetingsScheduled,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    }
  ];

  const quickActions: QuickAction[] = [
    {
      title: 'Novo Lead',
      icon: Users,
      color: 'bg-[#0057B8] hover:bg-[#003d82] text-white shadow-lg hover:shadow-xl',
      onClick: () => secureLog('Quick action: Novo Lead clicked')
    },
    {
      title: 'Nova Proposta',
      icon: FileText,
      color: 'bg-[#00C853] hover:bg-[#00A843] text-white shadow-lg hover:shadow-xl',
      onClick: () => secureLog('Quick action: Nova Proposta clicked')
    },
    {
      title: 'Fazer Ligação',
      icon: Phone,
      color: 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl',
      onClick: () => secureLog('Quick action: Fazer Ligação clicked')
    },
    {
      title: 'Agendar Reunião',
      icon: Calendar,
      color: 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl',
      onClick: () => secureLog('Quick action: Agendar Reunião clicked')
    }
  ];

  const recentActivities = [
    { 
      type: 'lead', 
      message: 'Novo lead: Tech Solutions Corp', 
      time: '2 min atrás', 
      icon: Users, 
      color: 'text-[#0057B8]',
      bgColor: 'bg-blue-100'
    },
    { 
      type: 'proposal', 
      message: 'Proposta enviada para ACME Ltd', 
      time: '15 min atrás', 
      icon: FileText, 
      color: 'text-[#00C853]',
      bgColor: 'bg-green-100'
    },
    { 
      type: 'call', 
      message: 'Ligação agendada com cliente VIP', 
      time: '1h atrás', 
      icon: Phone, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    { 
      type: 'contract', 
      message: 'Contrato assinado - R$ 85.000', 
      time: '2h atrás', 
      icon: FileCheck, 
      color: 'text-[#00C853]',
      bgColor: 'bg-green-100'
    },
    { 
      type: 'meeting', 
      message: 'Reunião marcada para amanhã', 
      time: '3h atrás', 
      icon: Calendar, 
      color: 'text-orange-500',
      bgColor: 'bg-orange-100'
    }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular refresh dos dados
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Loading skeleton com animações mais sofisticadas */}
          <div className="space-y-4">
            <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-2xl animate-pulse bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
            <div className="h-6 w-2/3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite_0.2s]"></div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-2xl animate-pulse bg-[length:200%_100%]" 
                   style={{ animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
          
          <div className="grid gap-6 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-2xl animate-pulse bg-[length:200%_100%]"
                   style={{ animationDelay: `${i * 0.15}s` }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header com Filtros Avançados */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0057B8] to-[#00C853] bg-clip-text text-transparent font-montserrat">
              {profile?.user_level === 'master' ? 'Painel Master JT' : 
               profile?.user_level === 'admin' ? 'Dashboard Executivo' : 'Meu Dashboard'}
            </h1>
            <p className="text-gray-600 font-opensans text-lg">
              Bem-vindo de volta, <span className="font-semibold text-[#0057B8]">{profile?.name || user?.email?.split('@')[0] || 'Usuário'}</span>! 
              Aqui está seu resumo em tempo real.
            </p>
          </div>
          
          {/* Filtros Rápidos */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border">
              <Filter className="w-4 h-4 text-gray-500 ml-2" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="border-0 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                  <SelectItem value="year">Este ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border">
              <Users className="w-4 h-4 text-gray-500 ml-2" />
              <Select value={selectedResponsible} onValueChange={setSelectedResponsible}>
                <SelectTrigger className="border-0 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os responsáveis</SelectItem>
                  <SelectItem value="me">Apenas eu</SelectItem>
                  <SelectItem value="team">Minha equipe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white hover:bg-gray-50 border-gray-200 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-50 border-gray-200 shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Métricas Principais com Microinterações */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {mainMetrics.map((metric, index) => (
            <Card 
              key={index} 
              className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`absolute inset-0 ${metric.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600 font-opensans">
                    {metric.title}
                  </CardTitle>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <metric.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-gray-900 font-montserrat group-hover:scale-105 transition-transform duration-300">
                    {metric.value}
                  </div>
                  <div className="flex items-center text-sm">
                    {metric.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-[#00C853] mr-1 group-hover:animate-bounce" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500 mr-1 group-hover:animate-bounce" />
                    )}
                    <span className={metric.trend === 'up' ? 'text-[#00C853] font-semibold' : 'text-red-500 font-semibold'}>
                      {Math.abs(metric.change)}%
                    </span>
                    <span className="text-gray-500 ml-1 font-opensans">{metric.description}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Indicadores de Performance */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#0057B8] font-montserrat flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Indicadores de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {performanceIndicators.map((indicator, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 cursor-pointer group"
                >
                  <div className={`p-3 rounded-full ${indicator.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <indicator.icon className={`w-5 h-5 ${indicator.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-montserrat text-gray-900">{indicator.value}</p>
                    <p className="text-xs text-gray-600 font-opensans">{indicator.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráficos e Analytics */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Performance Chart */}
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#0057B8] font-montserrat">Performance de Vendas</CardTitle>
                  <CardDescription className="font-opensans">Evolução das métricas principais</CardDescription>
                </div>
                <BarChart3 className="w-5 h-5 text-[#0057B8]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-opensans">Meta Mensal</span>
                    <span className="font-semibold font-montserrat">75%</span>
                  </div>
                  <div className="relative">
                    <Progress value={75} className="h-3 bg-gray-200" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0057B8] to-[#00C853] rounded-full" 
                         style={{ width: '75%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-opensans">Leads Qualificados</span>
                    <span className="font-semibold font-montserrat">68%</span>
                  </div>
                  <div className="relative">
                    <Progress value={68} className="h-3 bg-gray-200" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00C853] to-[#0057B8] rounded-full" 
                         style={{ width: '68%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-opensans">Propostas Aceitas</span>
                    <span className="font-semibold font-montserrat">82%</span>
                  </div>
                  <div className="relative">
                    <Progress value={82} className="h-3 bg-gray-200" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0057B8] via-[#00C853] to-[#0057B8] rounded-full" 
                         style={{ width: '82%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Atividades Recentes */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#0057B8] font-montserrat">Atividades Recentes</CardTitle>
                <Bell className="w-5 h-5 text-[#0057B8]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-102 cursor-pointer group">
                    <div className={`p-2 rounded-full ${activity.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                      <activity.icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate font-opensans group-hover:text-[#0057B8] transition-colors">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 font-opensans">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card className="bg-gradient-to-br from-[#0057B8] to-[#003d82] text-white border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-white font-montserrat flex items-center">
              <Zap className="w-5 h-5 mr-2 animate-pulse" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  className={`${action.color} h-16 flex-col space-y-2 transition-all duration-300 hover:scale-105 active:scale-95`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-sm font-opensans">{action.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resumo Executivo */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-[#0057B8] font-montserrat">Resumo Executivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:scale-102 transition-transform duration-300">
                  <div className="flex items-center">
                    <CheckCircle2 className="w-5 h-5 text-[#00C853] mr-3 animate-pulse" />
                    <span className="font-medium font-opensans">Meta Mensal Atingida</span>
                  </div>
                  <Badge variant="secondary" className="bg-[#00C853] text-white hover:bg-[#00A843]">
                    85%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:scale-102 transition-transform duration-300">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-[#0057B8] mr-3 animate-pulse" />
                    <span className="font-medium font-opensans">Satisfação do Cliente</span>
                  </div>
                  <Badge variant="secondary" className="bg-[#0057B8] text-white hover:bg-[#003d82]">
                    {currentData.customerSatisfaction}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl hover:scale-102 transition-transform duration-300">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-orange-500 mr-3 animate-pulse" />
                    <span className="font-medium font-opensans">Tempo Médio de Resposta</span>
                  </div>
                  <Badge variant="secondary" className="bg-orange-500 text-white hover:bg-orange-600">
                    {currentData.avgResponseTime}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:scale-102 transition-transform duration-300">
                  <div className="flex items-center">
                    <Zap className="w-5 h-5 text-purple-500 mr-3 animate-pulse" />
                    <span className="font-medium font-opensans">Automação Efetiva</span>
                  </div>
                  <Badge variant="secondary" className="bg-purple-500 text-white hover:bg-purple-600">
                    {currentData.automationSuccess}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-[#0057B8] font-montserrat">Resumo de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-[#0057B8] font-montserrat">
                    {currentData.activeDeals}
                  </div>
                  <div className="text-sm text-gray-600 font-opensans">Negócios Ativos</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-[#00C853] font-montserrat">
                    {currentData.closingDeals}
                  </div>
                  <div className="text-sm text-gray-600 font-opensans">Fechando Hoje</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-[#0057B8] font-montserrat">
                    R$ {(currentData.monthlyRevenue / 30 / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-600 font-opensans">Receita Diária</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-[#00C853] font-montserrat">
                    {currentData.tasksCompleted}
                  </div>
                  <div className="text-sm text-gray-600 font-opensans">Tarefas Concluídas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardModern;
