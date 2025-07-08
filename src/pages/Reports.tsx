import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, TrendingUp, Users } from 'lucide-react';

const Reports: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
        <Button className="bg-[#0057B8] hover:bg-[#003d82] text-white">
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#0057B8]" />
              Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Relatório de vendas e performance</p>
            <Button variant="outline" className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0057B8]" />
              Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Relatório de clientes ativos</p>
            <Button variant="outline" className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0057B8]" />
              Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Relatório mensal consolidado</p>
            <Button variant="outline" className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;