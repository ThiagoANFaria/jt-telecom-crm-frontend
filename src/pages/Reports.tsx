import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  BarChart3,
  LineChart,
  Filter
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar
} from 'recharts';

interface SalesReport {
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_revenue: number;
    total_deals: number;
    average_deal_size: number;
    conversion_rate: number;
    growth_rate: number;
  };
  by_salesperson: Array<{
    name: string;
    deals_closed: number;
    revenue: number;
    conversion_rate: number;
    average_deal_size: number;
  }>;
  monthly_evolution: Array<{
    month: string;
    revenue: number;
    deals: number;
  }>;
}

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<SalesReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [reportType, setReportType] = useState('sales');
  const { toast } = useToast();

  useEffect(() => {
    fetchSalesReport();
  }, [selectedPeriod]);

  const fetchSalesReport = async () => {
    try {
      setIsLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(selectedPeriod));

      const data = await apiService.getSalesReport(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setReportData(data);
    } catch (error) {
      console.error('Failed to fetch sales report:', error);
      toast({
        title: 'Erro ao carregar relatório',
        description: 'Não foi possível carregar os dados do relatório.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!reportData) return;

    try {
      // Preparar dados para exportação
      const exportData = {
        periodo: `${reportData.period.start_date} a ${reportData.period.end_date}`,
        resumo: reportData.summary,
        vendedores: reportData.by_salesperson,
        evolucao_mensal: reportData.monthly_evolution
      };

      // Converter para JSON formatado
      const jsonContent = JSON.stringify(exportData, null, 2);
      
      // Download do arquivo
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_vendas_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Relatório exportado',
        description: 'Relatório exportado com sucesso.',
      });
    } catch (error) {
      console.error('Failed to export report:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar o relatório.',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#0057B8]">Relatórios</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
        <h1 className="text-3xl font-bold text-[#0057B8]">Relatórios</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportReport}
            disabled={!reportData}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">Relatório de Vendas</SelectItem>
            <SelectItem value="leads">Relatório de Leads</SelectItem>
            <SelectItem value="clients">Relatório de Clientes</SelectItem>
          </SelectContent>
        </Select>
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
      </div>

      {reportData && (
        <>
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-[#0057B8]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#0057B8]">
                  {formatCurrency(reportData.summary.total_revenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {reportData.period.start_date} a {reportData.period.end_date}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Negócios</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {reportData.summary.total_deals}
                </div>
                <p className="text-xs text-muted-foreground">
                  negócios fechados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                <BarChart3 className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(reportData.summary.average_deal_size)}
                </div>
                <p className="text-xs text-muted-foreground">
                  por negócio
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatPercentage(reportData.summary.conversion_rate)}
                </div>
                <p className="text-xs text-muted-foreground">
                  leads convertidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
                <LineChart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatPercentage(reportData.summary.growth_rate)}
                </div>
                <p className="text-xs text-muted-foreground">
                  vs período anterior
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Evolução Mensal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#0057B8]" />
                Evolução Mensal de Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={reportData.monthly_evolution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(Number(value)) : value,
                      name === 'revenue' ? 'Receita' : 'Negócios'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#0057B8" 
                    strokeWidth={2}
                    name="revenue"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance por Vendedor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0057B8]" />
                Performance por Vendedor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Negócios Fechados</TableHead>
                    <TableHead>Receita</TableHead>
                    <TableHead>Ticket Médio</TableHead>
                    <TableHead>Taxa de Conversão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.by_salesperson.map((person, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{person.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{person.deals_closed}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-[#0057B8]">
                        {formatCurrency(person.revenue)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(person.average_deal_size)}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          {formatPercentage(person.conversion_rate)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Gráfico de Performance por Vendedor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#0057B8]" />
                Receita por Vendedor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={reportData.by_salesperson}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Receita']}
                  />
                  <Bar dataKey="revenue" fill="#0057B8" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {!reportData && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 mb-4">
              Nenhum dado disponível para o período selecionado.
            </div>
            <Button onClick={fetchSalesReport} className="bg-[#0057B8] hover:bg-[#003d82]">
              <TrendingUp className="w-4 h-4 mr-2" />
              Recarregar Dados
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;

