
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Trophy, Target, TrendingUp, Users, Clock, Award, Medal, Star, ArrowRight, Filter } from 'lucide-react';

// Mock data para demonstração
const performanceData = [
  { name: 'Carlos SDR', reunioes: 12, propostas: 8, fechamentos: 3 },
  { name: 'Ana SDR', reunioes: 15, propostas: 10, fechamentos: 4 },
  { name: 'João Closer', reunioes: 20, propostas: 18, fechamentos: 7 },
  { name: 'Maria Closer', reunioes: 18, propostas: 15, fechamentos: 6 }
];

const salesEvolution = [
  { day: '1', vendas: 12000 },
  { day: '5', vendas: 15000 },
  { day: '10', vendas: 18000 },
  { day: '15', vendas: 22000 },
  { day: '20', vendas: 19000 },
  { day: '25', vendas: 28000 },
  { day: '30', vendas: 32000 }
];

const teamGoals = [
  { team: 'SDR', meta: 100, atual: 85 },
  { team: 'Vendas', meta: 100, atual: 92 },
  { team: 'CS', meta: 100, atual: 78 }
];

const pipelineData = {
  sdr: {
    'Novo Lead': [
      { id: '1', name: 'Tech Solutions', value: 'R$ 5.000', source: 'Instagram', responsible: 'Carlos', lastAction: '2h' },
      { id: '2', name: 'Digital Corp', value: 'R$ 8.000', source: 'Site', responsible: 'Ana', lastAction: '1h' }
    ],
    'Qualificando': [
      { id: '3', name: 'Startup AI', value: 'R$ 12.000', source: 'Indicação', responsible: 'Carlos', lastAction: '4h' }
    ],
    'Reunião Agendada': [
      { id: '4', name: 'E-commerce Plus', value: 'R$ 15.000', source: 'Site', responsible: 'Ana', lastAction: '30min' }
    ]
  },
  vendas: {
    'Reunião Feita': [
      { id: '5', name: 'LogisTech', value: 'R$ 25.000', source: 'Indicação', responsible: 'João', lastAction: '2h' }
    ],
    'Proposta Enviada': [
      { id: '6', name: 'FinanceApp', value: 'R$ 35.000', source: 'Instagram', responsible: 'Maria', lastAction: '1d' },
      { id: '7', name: 'RetailMax', value: 'R$ 18.000', source: 'Site', responsible: 'João', lastAction: '3h' }
    ],
    'Fechamento': [
      { id: '8', name: 'CloudSys', value: 'R$ 42.000', source: 'Indicação', responsible: 'Maria', lastAction: '1h' }
    ]
  },
  cs: {
    'Onboarding': [
      { id: '9', name: 'MedTech', value: 'R$ 28.000', source: 'Site', responsible: 'Paula', lastAction: '2d' }
    ],
    'Ativo': [
      { id: '10', name: 'EduPlatform', value: 'R$ 22.000', source: 'Indicação', responsible: 'Roberto', lastAction: '1w' },
      { id: '11', name: 'FoodDelivery', value: 'R$ 31.000', source: 'Instagram', responsible: 'Paula', lastAction: '3d' }
    ],
    'Renovação': [
      { id: '12', name: 'TechBank', value: 'R$ 58.000', source: 'Indicação', responsible: 'Roberto', lastAction: '1d' }
    ],
    'Risco de Cancelamento': [
      { id: '13', name: 'StartupX', value: 'R$ 14.000', source: 'Site', responsible: 'Paula', lastAction: '5h' }
    ]
  }
};

const JTVoxAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedChannel, setSelectedChannel] = useState('todos');

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'Instagram': return 'bg-pink-100 text-pink-700';
      case 'Site': return 'bg-blue-100 text-blue-700';
      case 'Indicação': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const PipelineCard = ({ item }: { item: any }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-3">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-[#2C2C2C] text-sm">{item.name}</h4>
        <Badge className={getSourceColor(item.source)}>{item.source}</Badge>
      </div>
      <div className="text-lg font-bold text-[#0057B8] mb-2">{item.value}</div>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{item.responsible}</span>
        <span>{item.lastAction}</span>
      </div>
      <div className="flex gap-1 mt-2">
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">Mover</Button>
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">Nota</Button>
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">Histórico</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-[#0057B8] to-[#003d82] rounded-lg flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#2C2C2C]">JT VOX Analytics</h1>
            <p className="text-gray-600">Performance Comercial & Pipeline de Vendas</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>
          </div>
          <select 
            value={selectedChannel} 
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="todos">Todos os canais</option>
            <option value="instagram">Instagram</option>
            <option value="site">Site</option>
            <option value="indicacao">Indicação</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Painel Analytics - 2/3 da tela */}
        <div className="xl:col-span-2 space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-[#00C853]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Taxa Conversão</p>
                    <p className="text-2xl font-bold text-[#00C853]">28.5%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-[#00C853]" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#0057B8]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ticket Médio</p>
                    <p className="text-2xl font-bold text-[#0057B8]">R$ 24.500</p>
                  </div>
                  <Target className="w-8 h-8 text-[#0057B8]" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#00C853]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Vendido</p>
                    <p className="text-2xl font-bold text-[#00C853]">R$ 186K</p>
                  </div>
                  <Trophy className="w-8 h-8 text-[#00C853]" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#0057B8]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ciclo Médio</p>
                    <p className="text-2xl font-bold text-[#0057B8]">18 dias</p>
                  </div>
                  <Clock className="w-8 h-8 text-[#0057B8]" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <Users className="w-5 h-5" />
                Performance por Colaborador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="reunioes" fill="#0057B8" name="Reuniões" />
                  <Bar dataKey="propostas" fill="#00C853" name="Propostas" />
                  <Bar dataKey="fechamentos" fill="#2C2C2C" name="Fechamentos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Evolução */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Evolução de Vendas - Últimos 30 dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={salesEvolution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value?.toLocaleString()}`, 'Vendas']} />
                  <Line type="monotone" dataKey="vendas" stroke="#0057B8" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Radar de Metas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <Award className="w-5 h-5" />
                Radar de Metas por Equipe
                <div className="flex gap-2 ml-auto">
                  <Medal className="w-5 h-5 text-yellow-500" />
                  <Trophy className="w-5 h-5 text-[#00C853]" />
                  <Star className="w-5 h-5 text-[#0057B8]" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={teamGoals}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="team" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Meta" dataKey="meta" stroke="#2C2C2C" fill="#2C2C2C" fillOpacity={0.1} />
                  <Radar name="Atual" dataKey="atual" stroke="#0057B8" fill="#0057B8" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Kanban - 1/3 da tela */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                Pipeline: SDR → Vendas → CS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* SDR Section */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-[#0057B8] mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  SDR
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-[#2C2C2C] mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Novo Lead ({pipelineData.sdr['Novo Lead'].length})
                    </h4>
                    {pipelineData.sdr['Novo Lead'].map(item => (
                      <PipelineCard key={item.id} item={item} />
                    ))}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-[#2C2C2C] mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Qualificando ({pipelineData.sdr['Qualificando'].length})
                    </h4>
                    {pipelineData.sdr['Qualificando'].map(item => (
                      <PipelineCard key={item.id} item={item} />
                    ))}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-[#2C2C2C] mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Reunião Agendada ({pipelineData.sdr['Reunião Agendada'].length})
                    </h4>
                    {pipelineData.sdr['Reunião Agendada'].map(item => (
                      <PipelineCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Vendas Section */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-[#00C853] mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Vendas (Closer)
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-[#2C2C2C] mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Reunião Feita ({pipelineData.vendas['Reunião Feita'].length})
                    </h4>
                    {pipelineData.vendas['Reunião Feita'].map(item => (
                      <PipelineCard key={item.id} item={item} />
                    ))}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-[#2C2C2C] mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Proposta Enviada ({pipelineData.vendas['Proposta Enviada'].length})
                    </h4>
                    {pipelineData.vendas['Proposta Enviada'].map(item => (
                      <PipelineCard key={item.id} item={item} />
                    ))}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-[#2C2C2C] mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Fechamento ({pipelineData.vendas['Fechamento'].length})
                    </h4>
                    {pipelineData.vendas['Fechamento'].map(item => (
                      <PipelineCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>

              {/* CS Section */}
              <div className="p-4">
                <h3 className="font-bold text-[#2C2C2C] mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  CS (Sucesso do Cliente)
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-[#2C2C2C] mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Onboarding ({pipelineData.cs['Onboarding'].length})
                    </h4>
                    {pipelineData.cs['Onboarding'].map(item => (
                      <PipelineCard key={item.id} item={item} />
                    ))}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-[#2C2C2C] mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Ativo ({pipelineData.cs['Ativo'].length})
                    </h4>
                    {pipelineData.cs['Ativo'].map(item => (
                      <PipelineCard key={item.id} item={item} />
                    ))}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-[#2C2C2C] mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Renovação ({pipelineData.cs['Renovação'].length})
                    </h4>
                    {pipelineData.cs['Renovação'].map(item => (
                      <PipelineCard key={item.id} item={item} />
                    ))}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-[#2C2C2C] mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      Risco de Cancelamento ({pipelineData.cs['Risco de Cancelamento'].length})
                    </h4>
                    {pipelineData.cs['Risco de Cancelamento'].map(item => (
                      <PipelineCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JTVoxAnalytics;
