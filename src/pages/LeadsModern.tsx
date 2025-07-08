import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, Plus, Users, TrendingUp, PhoneCall, Mail } from 'lucide-react';
import { Lead } from '@/types';

const LeadsModern: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Safe mock data with correct types
  const mockLeads: Lead[] = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@empresa.com',
      phone: '(11) 99999-9999',
      company: 'Empresa ABC',
      source: 'website',
      status: 'qualified',
      score: 85,
      createdAt: new Date('2025-01-15'),
      tags: ['VIP', 'Interessado'],
      notes: 'Cliente muito interessado em nossos serviços',
      budget: 50000,
      timeline: '3 meses'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@company.com',
      phone: '(11) 88888-8888',
      company: 'Company XYZ',
      source: 'referral',
      status: 'contacted',
      score: 70,
      createdAt: new Date('2025-01-10'),
      tags: ['Referência'],
      notes: 'Indicação de cliente atual',
      budget: 30000,
      timeline: '2 meses'
    },
    {
      id: '3',
      name: 'Carlos Oliveira',
      email: 'carlos@tech.com',
      phone: '(11) 77777-7777',
      company: 'Tech Solutions',
      source: 'social',
      status: 'new',
      score: 60,
      createdAt: new Date('2025-01-05'),
      tags: ['LinkedIn'],
      notes: 'Contato inicial via LinkedIn',
      budget: 25000,
      timeline: '1 mês'
    }
  ];

  useEffect(() => {
    const loadLeads = async () => {
      try {
        setLoading(true);
        console.log('Loading leads...');
        
        // Using safe mock data
        setLeads(mockLeads);
        setFilteredLeads(mockLeads);
      } catch (err) {
        console.error('Error loading leads:', err);
        // Still set mock data on error
        setLeads(mockLeads);
        setFilteredLeads(mockLeads);
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredLeads(leads);
      return;
    }

    const filtered = leads.filter(lead => {
      if (!lead) return false;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        (lead.name || '').toLowerCase().includes(searchLower) ||
        (lead.email || '').toLowerCase().includes(searchLower) ||
        (lead.company || '').toLowerCase().includes(searchLower) ||
        (lead.phone || '').includes(searchTerm)
      );
    });
    
    setFilteredLeads(filtered);
  }, [searchTerm, leads]);

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'qualified': 'bg-green-100 text-green-800',
      'proposal': 'bg-purple-100 text-purple-800',
      'closed': 'bg-emerald-100 text-emerald-800',
      'lost': 'bg-red-100 text-red-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      'new': 'Novo',
      'contacted': 'Em Contato',
      'qualified': 'Qualificado',
      'proposal': 'Proposta',
      'closed': 'Fechado',
      'lost': 'Perdido'
    };
    return statusLabels[status] || status;
  };

  const getSourceLabel = (source: string) => {
    const sourceLabels: Record<string, string> = {
      'website': 'Website',
      'referral': 'Indicação',
      'social': 'Redes Sociais',
      'email': 'Email',
      'phone': 'Telefone',
      'other': 'Outros'
    };
    return sourceLabels[source] || source;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando leads...</p>
        </div>
      </div>
    );
  }

  const newLeadsCount = filteredLeads.filter(lead => lead?.status === 'new').length;
  const qualifiedLeadsCount = filteredLeads.filter(lead => lead?.status === 'qualified').length;
  const totalLeads = filteredLeads.length;
  const averageScore = totalLeads > 0 
    ? Math.round(filteredLeads.reduce((sum, lead) => sum + (lead?.score || 0), 0) / totalLeads)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Gerencie seus leads e oportunidades de vendas
                </p>
              </div>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Novo Lead
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Qualificados</p>
                  <p className="text-2xl font-bold text-gray-900">{qualifiedLeadsCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <PhoneCall className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Novos</p>
                  <p className="text-2xl font-bold text-gray-900">{newLeadsCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Score Médio</p>
                  <p className="text-2xl font-bold text-gray-900">{averageScore}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar leads por nome, email, empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leads List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => {
            if (!lead) return null;
            
            return (
              <Card key={lead.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{lead.name}</CardTitle>
                      <p className="text-sm text-gray-600">{lead.company}</p>
                    </div>
                    <Badge className={getStatusColor(lead.status)}>
                      {getStatusLabel(lead.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <Mail className="w-4 h-4 inline mr-2" />
                      {lead.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      <PhoneCall className="w-4 h-4 inline mr-2" />
                      {lead.phone}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <p className="text-xs text-gray-500">Fonte</p>
                        <p className="text-sm font-medium">{getSourceLabel(lead.source)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Score</p>
                        <p className="text-sm font-medium">{lead.score || 0}/100</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        Editar
                      </Button>
                      <Button size="sm" className="flex-1" asChild>
                        <NavLink to={`/leads/${lead.id}`}>
                          Ver Detalhes
                        </NavLink>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredLeads.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum lead encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Tente ajustar sua busca.' : 'Comece adicionando seu primeiro lead.'}
              </p>
              {!searchTerm && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Lead
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LeadsModern;