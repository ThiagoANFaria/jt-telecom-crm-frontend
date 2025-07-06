import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PipelineStage } from '@/types';

const Pipelines: React.FC = () => {
  const [stages, setStages] = useState<PipelineStage[]>([
    { id: '1', name: 'Qualificação', description: 'Leads em fase de qualificação', leads: 5 },
    { id: '2', name: 'Proposta', description: 'Propostas em elaboração', leads: 3 },
    { id: '3', name: 'Negociação', description: 'Negociações em andamento', leads: 2 },
    { id: '4', name: 'Fechamento', description: 'Leads próximos do fechamento', leads: 1 },
  ]);

  useEffect(() => {
    // Simulação de carregamento de dados
    const timer = setTimeout(() => {
      setStages([
        { id: '1', name: 'Qualificação', description: 'Leads em fase de qualificação', leads: 7 },
        { id: '2', name: 'Proposta', description: 'Propostas em elaboração', leads: 4 },
        { id: '3', name: 'Negociação', description: 'Negociações em andamento', leads: 3 },
        { id: '4', name: 'Fechamento', description: 'Leads próximos do fechamento', leads: 2 },
      ]);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Pipelines de Vendas
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button className="bg-[#0057B8] hover:bg-[#003d82]">
              Adicionar Pipeline
            </Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stages.map((stage) => (
            <Card key={stage.id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardHeader className="px-4 py-5 sm:px-6">
                <CardTitle className="text-lg font-medium text-gray-900">{stage.name}</CardTitle>
              </CardHeader>
              <CardContent className="bg-gray-50 px-4 py-5 sm:p-6">
                <p className="text-sm text-gray-500">{stage.description}</p>
                <div className="mt-4">
                  <span className="text-xl font-bold text-gray-900">{stage.leads}</span>
                  <span className="text-sm font-medium text-gray-500 ml-2">Leads</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pipelines;
