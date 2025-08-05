
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardMetrics, dashboardService } from '@/services/dashboard';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Users, FileText, FileCheck, DollarSign, Target } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await dashboardService.getDashboardSummary();
        setSummary(data);
      } catch (error) {
        console.error('Failed to fetch dashboard summary:', error);
        toast({
          title: 'Erro ao carregar dashboard',
          description: 'Não foi possível carregar os dados do dashboard.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-jt-blue">Dashboard</h1>
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-jt-blue">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo ao CRM JT Telecom</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-jt-blue">
              {summary?.total_leads || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Leads ativos no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-jt-blue">
              {summary?.total_clients || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propostas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-jt-blue">
              {summary?.total_proposals || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Propostas em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-jt-blue">
              {summary?.total_contracts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Contratos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-jt-blue">
              R$ {summary?.revenue_this_month?.toLocaleString('pt-BR') || '0,00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Faturamento atual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-jt-blue">
              {summary?.conversion_rate?.toFixed(1) || '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Leads para clientes
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-jt-blue">Resumo Geral</CardTitle>
          <CardDescription>
            Visão geral do desempenho do seu CRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Performance Geral</span>
              <span className="text-sm text-green-600">↗ Crescimento</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-jt-blue h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min((summary?.conversion_rate || 0) * 2, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Seu CRM está funcionando bem! Continue acompanhando os indicadores
              para manter o crescimento.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
