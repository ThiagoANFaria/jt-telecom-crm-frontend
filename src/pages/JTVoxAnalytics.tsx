
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Users, Target, DollarSign, Calendar, Phone, Mail, MessageSquare, Star, Trophy, Medal, Filter, Instagram, Globe, UserCheck } from 'lucide-react';

// Dados mock para demonstração
const performanceData = [
  { name: 'Maria (SDR)', reunioes: 45, propostas: 32, fechamentos: 18 },
  { name: 'João (SDR)', reunioes: 38, propostas: 28, fechamentos: 15 },
  { name: 'Ana (Closer)', reunioes: 0, propostas: 42, fechamentos: 24 },
  { name: 'Carlos (Closer)', reunioes: 0, propostas: 35, fechamentos: 19 },
];

const salesEvolutionData = [
  { dia: '1', vendas: 12000 },
  { dia: '5', vendas: 18000 },
  { dia: '10', vendas: 25000 },
  { dia: '15', vendas: 31000 },
  { dia: '20', vendas: 28000 },
  { dia: '25', vendas: 45000 },
  { dia: '30', vendas: 52000 },
];

const teamGoalsData = [
  { equipe: 'SDR', meta: 100, atingido: 85 },
  { equipe: 'Vendas', meta: 100, atingido: 92 },
  { equipe: 'CS', meta: 100, atingido: 78 },
];

// Dados mock do pipeline
const pipelineData = {
  sdr: {
    'Novo Lead': [
      { id: '1', name: 'Empresa ABC', value: 'R$ 2.500', source: 'Instagram', lastAction: '2h', responsible: 'Maria', status: 'hot' },
      { id: '2', name: 'Tech Solutions', value: 'R$ 5.000', source: 'Site', lastAction: '4h', responsible: 'João', status: 'warm' },
    ],
    'Qualificando': [
      { id: '3', name: 'Digital Corp', value: 'R$ 3.200', source: 'Indicação', lastAction: '1d', responsible: 'Maria', status: 'warm' },
    ],
    'Reunião Agendada': [
      { id: '4', name: 'Inovação Ltda', value: 'R$ 4.800', source: 'Instagram', lastAction: '30min', responsible: 'João', status: 'hot' },
    ],
  },
  vendas: {
    'Reunião Feita': [
      { id: '5', name: 'StartupXYZ', value: 'R$ 8.500', source: 'Site', lastAction: '2h', responsible: 'Ana', status: 'hot' },
    ],
    'Proposta Enviada': [
      { id: '6', name: 'MegaCorp', value: 'R$ 12.000', source: 'Indicação', lastAction: '1d', responsible: 'Carlos', status: 'warm' },
      { id: '7', name: 'TechStart', value: 'R$ 6.700', source: 'Instagram', lastAction: '3h', responsible: 'Ana', status: 'hot' },
    ],
    'Fechamento': [
      { id: '8', name: 'Enterprise Co', value: 'R$ 15.000', source: 'Site', lastAction: '1h', responsible: 'Carlos', status: 'hot' },
    ],
  },
  cs: {
    'Onboarding': [
      { id: '9', name: 'NewClient Inc', value: 'R$ 9.200', source: 'Indicação', lastAction: '2d', responsible: 'CS Team', status: 'warm' },
    ],
    'Ativo': [
      { id: '10', name: 'Stable Corp', value: 'R$ 7.500', source: 'Site', lastAction: '1w', responsible: 'CS Team', status: 'cold' },
      { id: '11', name: 'Growth Ltd', value: 'R$ 11.300', source: 'Instagram', lastAction: '3d', responsible: 'CS Team', status: 'warm' },
    ],
    'Renovação': [
      { id: '12', name: 'Renew Co', value: 'R$ 8.900', source: 'Indicação', lastAction: '1d', responsible: 'CS Team', status: 'hot' },
    ],
    'Risco de Cancelamento': [
      { id: '13', name: 'Risk Corp', value: 'R$ 4.500', source: 'Site', lastAction: '5d', responsible: 'CS Team', status: 'cold' },
    ],
  },
};

const JTVoxAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedChannel, setSelectedChannel] = useState('todos');
  const [selectedProduct, setSelectedProduct] = useState('todos');

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'Instagram': return <Instagram className="w-4 h-4" />;
      case 'Site': return <Globe className="w-4 h-4" />;
      case 'Indicação': return <UserCheck className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-100 border-red-300 text-red-800';
      case 'warm': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'cold': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const renderPipelineColumn = (title: string, items: any[], bgColor: string) => (
    <div className="min-w-[300px] bg-white rounded-lg shadow-sm border border-gray-200">
      <div className={`${bgColor} text-white p-4 rounded-t-lg`}>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm opacity-90">{items.length} itens</p>
      </div>
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
              <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                {item.status}
              </Badge>
            </div>
            <div className="text-lg font-bold text-[#0057B8] mb-2">{item.value}</div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-1">
                {getSourceIcon(item.source)}
                <span>{item.source}</span>
              </div>
              <span>{item.lastAction}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Resp: {item.responsible}
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" className="text-xs">
                Mover
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                Nota
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                Histórico
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-['Montserrat']">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2C2C2C]">JT VOX Analytics</h1>
              <p className="text-gray-600 mt-1">Plataforma de Performance Comercial</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os canais</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="site">Site</SelectItem>
                  <SelectItem value="indicacao">Indicação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Analytics Dashboard */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#2C2C2C] mb-6">📊 Analytics de Vendas</h2>
          
          {/* KPIs Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-[#0057B8] to-[#003d82] text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Taxa de Conversão</p>
                    <p className="text-2xl font-bold">73.5%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#00C853] to-[#00A843] text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Ticket Médio</p>
                    <p className="text-2xl font-bold">R$ 8.240</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300">Total Vendido</p>
                    <p className="text-2xl font-bold">R$ 347K</p>
                  </div>
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Meta Batida</p>
                    <p className="text-2xl font-bold">127%</p>
                    <Trophy className="w-4 h-4 text-yellow-300 inline ml-1" />
                  </div>
                  <Medal className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-700 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Ciclo Médio</p>
                    <p className="text-2xl font-bold">14 dias</p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#2C2C2C]">Performance por Pessoa</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="reunioes" fill="#00C853" name="Reuniões" />
                    <Bar dataKey="propostas" fill="#0057B8" name="Propostas" />
                    <Bar dataKey="fechamentos" fill="#2C2C2C" name="Fechamentos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sales Evolution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#2C2C2C]">Evolução de Vendas (30 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesEvolutionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Vendas']} />
                    <Line type="monotone" dataKey="vendas" stroke="#0057B8" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Team Goals Radar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                🎯 Radar de Metas por Equipe
                <div className="flex gap-2 ml-4">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <Medal className="w-5 h-5 text-gray-400" />
                  <Star className="w-5 h-5 text-blue-500" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={teamGoalsData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="equipe" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Meta" dataKey="meta" stroke="#2C2C2C" fill="#2C2C2C" fillOpacity={0.1} />
                  <Radar name="Atingido" dataKey="atingido" stroke="#00C853" fill="#00C853" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Kanban */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#2C2C2C] mb-6">🔄 Pipeline: SDR → Vendas → CS</h2>
          
          {/* SDR Pipeline */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#0057B8] mb-4 flex items-center gap-2">
              <Phone className="w-6 h-6" />
              SDR - Geração de Leads
            </h3>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {renderPipelineColumn('Novo Lead', pipelineData.sdr['Novo Lead'], 'bg-blue-500')}
              {renderPipelineColumn('Qualificando', pipelineData.sdr['Qualificando'], 'bg-blue-600')}
              {renderPipelineColumn('Reunião Agendada', pipelineData.sdr['Reunião Agendada'], 'bg-blue-700')}
            </div>
          </div>

          {/* Vendas Pipeline */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#00C853] mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              Vendas - Fechamento
            </h3>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {renderPipelineColumn('Reunião Feita', pipelineData.vendas['Reunião Feita'], 'bg-green-500')}
              {renderPipelineColumn('Proposta Enviada', pipelineData.vendas['Proposta Enviada'], 'bg-green-600')}
              {renderPipelineColumn('Fechamento', pipelineData.vendas['Fechamento'], 'bg-green-700')}
            </div>
          </div>

          {/* CS Pipeline */}
          <div>
            <h3 className="text-xl font-semibold text-[#2C2C2C] mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" />
              CS - Sucesso do Cliente
            </h3>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {renderPipelineColumn('Onboarding', pipelineData.cs['Onboarding'], 'bg-purple-500')}
              {renderPipelineColumn('Ativo', pipelineData.cs['Ativo'], 'bg-purple-600')}
              {renderPipelineColumn('Renovação', pipelineData.cs['Renovação'], 'bg-purple-700')}
              {renderPipelineColumn('Risco de Cancelamento', pipelineData.cs['Risco de Cancelamento'], 'bg-red-600')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JTVoxAnalytics;
