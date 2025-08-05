import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { PipelineModal } from '@/components/PipelineModal';
import { DealModal } from '@/components/DealModal';
import { pipelineService, stageService, dealService, pipelineRealtimeService } from '@/services/pipelines';
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
  Eye,
  Edit,
  Trash2,
  GitBranch
} from 'lucide-react';

interface Pipeline {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  stages?: PipelineStage[];
}

interface PipelineStage {
  id: string;
  name: string;
  color?: string;
  position: number;
  pipeline_id: string;
  deals?: Deal[];
  stats?: {
    count: number;
    value: number;
    conversionRate: number;
    avgDealSize: number;
  };
}

interface Deal {
  id: string;
  title: string;
  description?: string;
  value?: number;
  probability?: number;
  position: number;
  stage_id: string;
  pipeline_id: string;
  lead_id?: string;
  client_id?: string;
  expected_close_date?: string;
  created_at: string;
  updated_at: string;
}

const Pipelines: React.FC = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [activeTab, setActiveTab] = useState('funnel');
  const [isLoading, setIsLoading] = useState(true);
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const { toast } = useToast();

  // Carregamento inicial
  useEffect(() => {
    loadPipelines();
  }, []);

  // Carregar pipelines
  const loadPipelines = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await pipelineService.getPipelines();
      setPipelines(data);
      
      if (data.length > 0 && !selectedPipeline) {
        const firstPipeline = data[0];
        setSelectedPipeline(firstPipeline);
        await loadPipelineDetails(firstPipeline.id);
      }
    } catch (error) {
      console.error('Erro ao carregar pipelines:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar pipelines',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedPipeline, toast]);

  // Carregar detalhes do pipeline (estágios e deals)
  const loadPipelineDetails = async (pipelineId: string) => {
    try {
      const [stagesData, dealsData] = await Promise.all([
        stageService.getStages(pipelineId),
        dealService.getDeals(pipelineId)
      ]);

      setStages(stagesData);
      setDeals(dealsData);
      
      if (stagesData.length > 0 && !selectedStage) {
        setSelectedStage(stagesData[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do pipeline:', error);
    }
  };

  // Calcular estatísticas
  const calculateStats = () => {
    const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const totalDeals = deals.length;
    const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0;

    // Estatísticas por estágio
    const stageStats = stages.map(stage => {
      const stageDeals = deals.filter(deal => deal.stage_id === stage.id);
      const stageValue = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      
      return {
        ...stage,
        stats: {
          count: stageDeals.length,
          value: stageValue,
          conversionRate: 0, // Calcular baseado no funil
          avgDealSize: stageDeals.length > 0 ? stageValue / stageDeals.length : 0
        },
        deals: stageDeals
      };
    });

    // Calcular taxa de conversão baseada no funil
    for (let i = 0; i < stageStats.length; i++) {
      if (i === 0) {
        stageStats[i].stats!.conversionRate = 100; // Primeiro estágio = 100%
      } else {
        const previousCount = stageStats[i - 1].stats!.count;
        const currentCount = stageStats[i].stats!.count;
        stageStats[i].stats!.conversionRate = previousCount > 0 ? Math.round((currentCount / previousCount) * 100) : 0;
      }
    }

    return {
      totalValue,
      totalDeals,
      avgDealValue,
      overallConversion: stageStats.length > 1 ? stageStats[stageStats.length - 1].stats!.conversionRate : 0,
      stages: stageStats
    };
  };

  const stats = calculateStats();

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
                    R$ {(stats.totalValue / 1000000).toFixed(1)}M
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
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDeals}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.overallConversion}%</p>
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
                    R$ {stats.totalDeals > 0 ? Math.round(stats.avgDealValue / 1000) : 0}k
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
                  {stats.stages.map((stage, index) => {
                    const width = Math.max(20, stats.stages[0]?.stats?.count ? (stage.stats?.count || 0) / stats.stages[0].stats.count * 100 : 100);
                    return (
                      <div key={stage.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800">{stage.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{stage.stats?.count || 0} deals</span>
                            <span>R$ {((stage.stats?.value || 0) / 1000000).toFixed(1)}M</span>
                            <Badge variant="outline" className="text-xs">
                              {stage.stats?.conversionRate || 0}% conversão
                            </Badge>
                          </div>
                        </div>
                        <div className="relative">
                          <div 
                            className="h-12 rounded-lg transition-all duration-500 flex items-center justify-center text-white font-medium"
                            style={{ 
                              width: `${width}%`,
                              backgroundColor: stage.color || '#3B82F6'
                            }}
                          >
                            {stage.stats?.count || 0} deals
                          </div>
                        </div>
                        {index < stats.stages.length - 1 && (
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
                  {stats.stages.map((stage) => (
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
                        <Badge variant="secondary">{stage.stats?.count || 0}</Badge>
                      </div>
                      <div className="mt-2">
                        <Progress value={stage.stats?.conversionRate || 0} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{stage.stats?.conversionRate || 0}% conversão</p>
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
                      Métricas - {stats.stages.find(s => s.id === selectedStage)?.name || 'Selecione um estágio'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.stages.find(s => s.id === selectedStage)?.stats?.count || 0}
                        </p>
                        <p className="text-sm text-gray-600">Deals Ativos</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          R$ {((stats.stages.find(s => s.id === selectedStage)?.stats?.avgDealSize || 0) / 1000).toFixed(0)}k
                        </p>
                        <p className="text-sm text-gray-600">Ticket Médio</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          -
                        </p>
                        <p className="text-sm text-gray-600">Dias Médios</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.stages.find(s => s.id === selectedStage)?.stats?.conversionRate || 0}%
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
                      {selectedStage && stats.stages.find(s => s.id === selectedStage)?.deals?.map((deal) => (
                        <div key={deal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div>
                                <h4 className="font-medium text-gray-900">{deal.title}</h4>
                                <p className="text-sm text-gray-600">{deal.description || 'Sem descrição'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-medium text-gray-900">R$ {(deal.value || 0).toLocaleString()}</p>
                                <p className="text-sm text-gray-600">{deal.probability || 0}% prob.</p>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                Criado em: {new Date(deal.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                Atualizado: {new Date(deal.updated_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {deal.expected_close_date ? 
                                  `Fechamento: ${new Date(deal.expected_close_date).toLocaleDateString('pt-BR')}` : 
                                  'Sem data prevista'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-500">
                          {selectedStage ? 'Nenhum deal neste estágio' : 'Selecione um estágio para ver os deals'}
                        </div>
                      )}
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