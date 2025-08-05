import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { analyticsService, AnalyticsData } from '@/services/analytics';
import { 
  TrendingUp, 
  Users, 
  Target,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Percent,
  RefreshCw,
  DollarSign,
  CheckCircle,
  FileText,
  Briefcase,
  Download
} from 'lucide-react';
import { 
  PieChart as RechartsPieChart, 
  Pie,
  Cell, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const data = await analyticsService.getAnalyticsData({
        period: parseInt(selectedPeriod)
      });
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      toast({
        title: 'Erro ao carregar analytics',
        description: 'Não foi possível carregar os dados de analytics.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async (format: 'json' | 'csv') => {
    try {
      setIsExporting(true);
      const data = await analyticsService.exportAnalyticsData({
        period: parseInt(selectedPeriod)
      }, format);
      
      const blob = new Blob([format === 'json' ? JSON.stringify(data, null, 2) : data as string], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${selectedPeriod}days.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Dados exportados',
        description: `Relatório exportado em formato ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Failed to export data:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'instagram':
        return '📱';
      case 'site':
      case 'website':
        return '🌐';
      case 'indicação':
      case 'referral':
        return '👥';
      case 'google ads':
        return '🎯';
      case 'facebook':
        return '📘';
      case 'linkedin':
        return '💼';
      default:
        return '📊';
    }
  };

  const COLORS = ['#0057B8', '#059669', '#DC2626', '#7C3AED', '#F59E0B', '#EC4899'];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#0057B8]">Analytics</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#0057B8]">Analytics</h1>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => handleExportData('csv')}
            disabled={isExporting || !analyticsData}
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExportData('json')}
            disabled={isExporting || !analyticsData}
          >
            <Download className="w-4 h-4 mr-2" />
            JSON
          </Button>
          <Button 
            variant="outline" 
            onClick={fetchAnalyticsData}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {analyticsData && (
        <>
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
                <Users className="h-4 w-4 text-[#0057B8]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#0057B8]">
                  {analyticsData.kpis.total_leads}
                </div>
                <p className="text-xs text-muted-foreground">
                  leads captados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                <Percent className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {analyticsData.kpis.conversion_rate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  leads → clientes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Mensal</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {analyticsData.kpis.monthly_revenue.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground">
                  faturamento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deals Ativos</CardTitle>
                <Briefcase className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {analyticsData.kpis.active_deals}
                </div>
                <p className="text-xs text-muted-foreground">
                  em negociação
                </p>
              </CardContent>
            </Card>
          </div>

          {/* KPIs Secundários */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {analyticsData.kpis.total_clients}
                </div>
                <p className="text-xs text-muted-foreground">
                  clientes ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Propostas</CardTitle>
                <FileText className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {analyticsData.kpis.total_proposals}
                </div>
                <p className="text-xs text-muted-foreground">
                  propostas enviadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contratos</CardTitle>
                <FileText className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {analyticsData.kpis.total_contracts}
                </div>
                <p className="text-xs text-muted-foreground">
                  contratos fechados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Concluídas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {analyticsData.kpis.completed_tasks}
                </div>
                <p className="text-xs text-muted-foreground">
                  tarefas finalizadas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Funil de Vendas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#0057B8]" />
                Funil de Vendas - Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.funil_vendas.etapas.map((etapa, index) => (
                  <div key={etapa.nome} className="relative">
                    <div 
                      className="flex items-center justify-between p-4 rounded-lg border-2"
                      style={{ borderColor: etapa.cor, backgroundColor: `${etapa.cor}10` }}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: etapa.cor }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{etapa.nome}</h3>
                          <p className="text-sm text-muted-foreground">
                            {etapa.tempo_medio_dias} dias em média
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: etapa.cor }}>
                          {etapa.quantidade}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {etapa.percentual_conversao.toFixed(1)}% do total
                        </div>
                      </div>
                    </div>
                    {index < analyticsData.funil_vendas.etapas.length - 1 && (
                      <div className="flex justify-center my-2">
                        <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[15px] border-l-transparent border-r-transparent border-t-gray-300"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Origem de Leads - Gráfico de Pizza */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-[#0057B8]" />
                  Origem de Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData.origem_leads}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ canal, percentual }) => `${canal}: ${percentual.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="quantidade"
                    >
                      {analyticsData.origem_leads.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Origem de Leads - Lista Detalhada */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#0057B8]" />
                  Performance por Canal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.origem_leads.map((origem, index) => (
                    <div key={origem.canal} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getChannelIcon(origem.canal)}</span>
                        <div>
                          <h4 className="font-medium">{origem.canal}</h4>
                          <p className="text-sm text-muted-foreground">
                            {origem.conversao.toFixed(1)}% conversão
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#0057B8]">
                          {origem.quantidade}
                        </div>
                        <Badge 
                          variant="outline" 
                          style={{ 
                            backgroundColor: `${COLORS[index % COLORS.length]}20`,
                            borderColor: COLORS[index % COLORS.length],
                            color: COLORS[index % COLORS.length]
                          }}
                        >
                          {origem.percentual.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Barras - Quantidade por Canal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#0057B8]" />
                Volume de Leads por Canal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={analyticsData.origem_leads}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="canal" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [value, 'Quantidade de Leads']}
                  />
                  <Bar dataKey="quantidade" fill="#0057B8" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          
          {/* Gráficos de Tendência */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendência de Leads */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#0057B8]" />
                  Tendência de Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.tendencias.leads_por_mes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="quantidade" stroke="#0057B8" fill="#0057B8" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="conversoes" stroke="#059669" fill="#059669" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Evolução de Revenue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Evolução de Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.tendencias.revenue_por_mes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Revenue']}
                    />
                    <Line type="monotone" dataKey="valor" stroke="#059669" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance dos Usuários */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0057B8]" />
                Performance Individual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.performance_usuarios.map((usuario, index) => (
                  <div key={usuario.usuario} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0057B8] text-white flex items-center justify-center font-bold">
                        {usuario.usuario.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium">{usuario.usuario}</h4>
                        <p className="text-sm text-muted-foreground">
                          {usuario.conversoes > 0 ? ((usuario.conversoes / usuario.leads) * 100).toFixed(1) : 0}% conversão
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-[#0057B8]">{usuario.leads}</div>
                        <div className="text-xs text-muted-foreground">Leads</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">{usuario.conversoes}</div>
                        <div className="text-xs text-muted-foreground">Conversões</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          R$ {usuario.revenue.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#0057B8]" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tenant ID</p>
                  <p className="font-medium">{analyticsData.tenant_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Última Atualização</p>
                  <p className="font-medium">
                    {new Date(analyticsData.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Período Analisado</p>
                  <p className="font-medium">Últimos {selectedPeriod} dias</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!analyticsData && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 mb-4">
              Nenhum dado de analytics disponível.
            </div>
            <Button onClick={fetchAnalyticsData} className="bg-[#0057B8] hover:bg-[#003d82]">
              <TrendingUp className="w-4 h-4 mr-2" />
              Carregar Dados
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;

