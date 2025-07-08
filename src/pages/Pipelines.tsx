import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  BarChart3,
  Filter,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';

interface PipelineStage {
  id: string;
  name: string;
  description?: string;
  leads: number;
  value: number;
  conversionRate: number;
  avgDealSize: number;
  avgTimeInStage: number;
  color: string;
}

interface Lead {
  id: string;
  name: string;
  company: string;
  value: number;
  probability: number;
  status: 'hot' | 'warm' | 'cold';
  lastActivity: string;
  nextAction: string;
  daysInStage: number;
}

const Pipelines: React.FC = () => {
  const [stages, setStages] = useState<PipelineStage[]>([
    { 
      id: '1', 
      name: 'Prospecção', 
      description: 'Identificação de potenciais clientes',
      leads: 45,
      value: 2250000,
      conversionRate: 25,
      avgDealSize: 50000,
      avgTimeInStage: 7,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: '2', 
      name: 'Qualificação', 
      description: 'Validação de fit e necessidades',
      leads: 28,
      value: 1680000,
      conversionRate: 35,
      avgDealSize: 60000,
      avgTimeInStage: 12,
      color: 'from-indigo-500 to-indigo-600'
    },
    { 
      id: '3', 
      name: 'Proposta', 
      description: 'Elaboração de propostas comerciais',
      leads: 18,
      value: 1440000,
      conversionRate: 55,
      avgDealSize: 80000,
      avgTimeInStage: 15,
      color: 'from-purple-500 to-purple-600'
    },
    { 
      id: '4', 
      name: 'Negociação', 
      description: 'Ajustes finais e negociação',
      leads: 12,
      value: 1200000,
      conversionRate: 70,
      avgDealSize: 100000,
      avgTimeInStage: 18,
      color: 'from-orange-500 to-orange-600'
    },
    { 
      id: '5', 
      name: 'Fechamento', 
      description: 'Contratos e assinatura',
      leads: 8,
      value: 960000,
      conversionRate: 85,
      avgDealSize: 120000,
      avgTimeInStage: 8,
      color: 'from-green-500 to-green-600'
    }
  ]);

  const [selectedStage, setSelectedStage] = useState<string>('1');
  const [activeTab, setActiveTab] = useState('funnel');

  // Dados simulados de leads para a fase selecionada
  const [stageLeads] = useState<Lead[]>([
    {
      id: '1',
      name: 'João Silva',
      company: 'Tech Solutions Ltda',
      value: 85000,
      probability: 75,
      status: 'hot',
      lastActivity: '2 horas atrás',
      nextAction: 'Apresentação da proposta',
      daysInStage: 3
    },
    {
      id: '2',
      name: 'Maria Santos',
      company: 'Digital Corp',
      value: 120000,
      probability: 60,
      status: 'warm',
      lastActivity: '1 dia atrás',
      nextAction: 'Reunião de follow-up',
      daysInStage: 8
    },
    {
      id: '3',
      name: 'Carlos Oliveira',
      company: 'Innovation Hub',
      value: 95000,
      probability: 45,
      status: 'cold',
      lastActivity: '5 dias atrás',
      nextAction: 'Reativar contato',
      daysInStage: 15
    }
  ]);

  const totalPipelineValue = stages.reduce((sum, stage) => sum + stage.value, 0);
  const totalLeads = stages.reduce((sum, stage) => sum + stage.leads, 0);
  const overallConversion = Math.round((stages[stages.length - 1].leads / stages[0].leads) * 100);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hot': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'warm': return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      case 'cold': return <TrendingDown className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-100 text-red-800 border-red-200';
      case 'warm': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cold': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pipeline de Vendas B2B
            </h1>
            <p className="text-gray-600">
              Acompanhe o progresso dos seus leads através do funil de vendas
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Lead
            </Button>
          </div>
        </div>

        {/* KPIs Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total no Pipeline</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {(totalPipelineValue / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">+12% vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total de Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">+8% vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Taxa de Conversão</p>
                  <p className="text-2xl font-bold text-gray-900">{overallConversion}%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">+3% vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Ticket Médio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {Math.round(totalPipelineValue / totalLeads / 1000)}k
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">+15% vs mês anterior</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-96">
            <TabsTrigger value="funnel">Visualização Funil</TabsTrigger>
            <TabsTrigger value="details">Detalhes por Fase</TabsTrigger>
          </TabsList>

          <TabsContent value="funnel" className="space-y-6">
            {/* Funnel Visualization */}
            <Card className="bg-white shadow-md border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Funil de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stages.map((stage, index) => {
                    const width = Math.max(20, (stage.leads / stages[0].leads) * 100);
                    return (
                      <div key={stage.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800">{stage.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{stage.leads} leads</span>
                            <span>R$ {(stage.value / 1000000).toFixed(1)}M</span>
                            <Badge variant="outline" className="text-xs">
                              {stage.conversionRate}% conversão
                            </Badge>
                          </div>
                        </div>
                        <div className="relative">
                          <div 
                            className={`h-12 bg-gradient-to-r ${stage.color} rounded-lg transition-all duration-500 flex items-center justify-center text-white font-medium`}
                            style={{ width: `${width}%` }}
                          >
                            {stage.leads} leads
                          </div>
                        </div>
                        {index < stages.length - 1 && (
                          <div className="flex justify-center py-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <TrendingDown className="w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stage Selection */}
              <Card className="bg-white shadow-md border-0">
                <CardHeader>
                  <CardTitle>Fases do Pipeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stages.map((stage) => (
                    <button
                      key={stage.id}
                      onClick={() => setSelectedStage(stage.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedStage === stage.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{stage.name}</h4>
                        <Badge variant="secondary">{stage.leads}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{stage.description}</p>
                      <div className="mt-2">
                        <Progress value={stage.conversionRate} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{stage.conversionRate}% conversão</p>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Stage Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Stage Metrics */}
                <Card className="bg-white shadow-md border-0">
                  <CardHeader>
                    <CardTitle>
                      Métricas - {stages.find(s => s.id === selectedStage)?.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {stages.find(s => s.id === selectedStage)?.leads}
                        </p>
                        <p className="text-sm text-gray-600">Leads Ativos</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          R$ {(stages.find(s => s.id === selectedStage)?.avgDealSize || 0) / 1000}k
                        </p>
                        <p className="text-sm text-gray-600">Ticket Médio</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {stages.find(s => s.id === selectedStage)?.avgTimeInStage}
                        </p>
                        <p className="text-sm text-gray-600">Dias Médios</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {stages.find(s => s.id === selectedStage)?.conversionRate}%
                        </p>
                        <p className="text-sm text-gray-600">Conversão</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Leads in Stage */}
                <Card className="bg-white shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Leads na Fase</span>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Ver Todos
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stageLeads.map((lead) => (
                        <div key={lead.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div>
                                <h4 className="font-medium text-gray-900">{lead.name}</h4>
                                <p className="text-sm text-gray-600">{lead.company}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(lead.status)}>
                                {getStatusIcon(lead.status)}
                                <span className="ml-1 capitalize">{lead.status}</span>
                              </Badge>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">R$ {lead.value.toLocaleString()}</p>
                                <p className="text-sm text-gray-600">{lead.probability}% prob.</p>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Última atividade: {lead.lastActivity}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Próxima ação: {lead.nextAction}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{lead.daysInStage} dias na fase</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Pipelines;