import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lead, Tag } from '@/types';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, Plus, Search, Filter, MoreHorizontal, Phone, Mail, 
  MessageSquare, Calendar, TrendingUp, Target, Award, Star,
  Building, MapPin, Clock, Zap, Download, Upload, CheckSquare, Edit, Trash2,
  Grid3X3, List
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import LeadModal from '@/components/LeadModal';
import AdvancedFilters from '@/components/AdvancedFilters';

const LeadsModern: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, selectedFilter]);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      
      const storedLeads = localStorage.getItem('jt-crm-leads');
      if (storedLeads) {
        const parsedLeads = JSON.parse(storedLeads);
        setLeads(parsedLeads);
        setIsLoading(false);
        return;
      }
      
      try {
        const data = await apiService.getLeads();
        setLeads(data);
        localStorage.setItem('jt-crm-leads', JSON.stringify(data));
      } catch (apiError) {
        const mockLeads: Lead[] = [
          {
            id: '1',
            name: 'João Silva',
            email: 'joao@empresa.com',
            phone: '11999999999',
            createdAt: new Date('2025-01-10T10:00:00Z'),
            company: 'Empresa ABC Ltda',
            source: 'Website',
            status: 'Qualificado',
            score: 85,
            position: 'Diretor',
            budget: 50000,
            timeline: '3 meses',
            interests: ['PABX em Nuvem'],
            tags: ['VIP', 'Qualificado'],
            notes: 'Lead muito interessado em PABX em nuvem'
          },
          {
            id: '2',
            name: 'Maria Santos',
            email: 'maria@comercio.com',
            phone: '11888888888',
            createdAt: new Date('2025-01-08T09:00:00Z'),
            company: 'Comércio XYZ',
            source: 'Indicação',
            status: 'Em Contato',
            score: 72,
            tags: ['Urgente'],
            notes: 'Interessada em URA Reversa'
          },
          {
            id: '3',
            name: 'Pedro Costa',
            email: 'pedro@startup.com',
            phone: '11777777777',
            createdAt: new Date('2025-01-05T11:00:00Z'),
            company: 'Startup Tech',
            source: 'LinkedIn',
            status: 'Novo',
            score: 45,
            notes: 'Startup em crescimento'
          }
        ];
        setLeads(mockLeads);
        localStorage.setItem('jt-crm-leads', JSON.stringify(mockLeads));
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(lead => {
        switch (selectedFilter) {
          case 'hot':
            return (lead.score || 0) >= 80;
          case 'qualified':
            return lead.status === 'Qualificado';
          case 'new':
            return lead.status === 'Novo';
          case 'contact':
            return lead.status === 'Em Contato';
          default:
            return true;
        }
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLeads(filtered);
  };

  const handleAdvancedFilters = (filters: any) => {
    let filtered = [...leads];

    if (filters.status?.length) {
      filtered = filtered.filter(lead => filters.status.includes(lead.status));
    }

    if (filters.source?.length) {
      filtered = filtered.filter(lead => filters.source.includes(lead.source));
    }

    if (filters.scoreRange) {
      filtered = filtered.filter(lead => 
        (lead.score || 0) >= filters.scoreRange[0] && 
        (lead.score || 0) <= filters.scoreRange[1]
      );
    }

    if (filters.tags?.length) {
      filtered = filtered.filter(lead => 
        lead.tags?.some(tag => filters.tags.includes(tag))
      );
    }

    setFilteredLeads(filtered);
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;

    try {
      await apiService.deleteLead(leadId);
      setLeads(leads.filter(lead => lead.id !== leadId));
      toast({
        title: 'Lead excluído',
        description: 'Lead excluído com sucesso!',
      });
    } catch (error) {
      console.error('Failed to delete lead:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir lead.',
        variant: 'destructive',
      });
    }
  };

  const handleTasks = (leadId: string) => {
    navigate(`/tasks?lead=${leadId}`);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Novo': 'bg-blue-500',
      'Em Contato': 'bg-yellow-500',
      'Qualificado': 'bg-green-500',
      'Proposta Enviada': 'bg-purple-500',
      'Ganho': 'bg-emerald-500',
      'Perdido': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const stats = {
    total: leads.length,
    qualified: leads.filter(l => l.status === 'Qualificado').length,
    hot: leads.filter(l => (l.score || 0) >= 80).length,
    thisMonth: leads.filter(l => {
      const created = new Date(l.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length
  };

  const filterOptions = [
    { value: 'all', label: 'Todos os Leads', count: stats.total },
    { value: 'hot', label: 'Leads Quentes', count: stats.hot },
    { value: 'qualified', label: 'Qualificados', count: stats.qualified },
    { value: 'new', label: 'Novos', count: leads.filter(l => l.status === 'Novo').length },
    { value: 'contact', label: 'Em Contato', count: leads.filter(l => l.status === 'Em Contato').length }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
            <p className="text-gray-600">Gerencie e acompanhe seus leads</p>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button 
              onClick={() => {
                setSelectedLead(null);
                setIsModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Lead
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total de Leads</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Qualificados</p>
                  <p className="text-2xl font-bold">{stats.qualified}</p>
                </div>
                <Target className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Leads Quentes</p>
                  <p className="text-2xl font-bold">{stats.hot}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Este Mês</p>
                  <p className="text-2xl font-bold">{stats.thisMonth}</p>
                </div>
                <Award className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedFilter === option.value ? "default" : "outline"}
                onClick={() => setSelectedFilter(option.value)}
                className="flex-shrink-0"
              >
                {option.label}
                <Badge variant="secondary" className="ml-2">
                  {option.count}
                </Badge>
              </Button>
            ))}
            <Button 
              variant="outline" 
              onClick={() => setIsAdvancedFiltersOpen(true)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros Avançados
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum lead encontrado</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando seu primeiro lead.'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => {
                    setSelectedLead(null);
                    setIsModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Lead
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLeads.map((lead) => (
                  <Card key={lead.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                    <CardContent className="p-6">
                      {/* Header do Lead */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                              {getInitials(lead.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {lead.name}
                            </h3>
                            <p className="text-sm text-gray-500">{lead.email}</p>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedLead(lead);
                              setIsModalOpen(true);
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}`)}>
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTasks(lead.id)}>
                              <CheckSquare className="w-4 h-4 mr-2" />
                              Tarefas
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`tel:${lead.phone}`)}>
                              <Phone className="w-4 h-4 mr-2" />
                              Ligar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`mailto:${lead.email}`)}>
                              <Mail className="w-4 h-4 mr-2" />
                              Enviar Email
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(lead.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Company e info */}
                      <div className="space-y-2 mb-4">
                        {lead.company && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building className="w-4 h-4" />
                            {lead.company}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {lead.phone}
                        </div>
                      </div>

                      {/* Score e Status */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(lead.status)}`}></div>
                          <span className="text-sm font-medium text-gray-700">{lead.status}</span>
                        </div>
                        {lead.score && (
                          <Badge className={`${getScoreColor(lead.score)} border-0 font-semibold`}>
                            <Star className="w-3 h-3 mr-1" />
                            {lead.score}
                          </Badge>
                        )}
                      </div>

                      {/* Tags */}
                      {lead.tags && lead.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {lead.tags.slice(0, 2).map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {lead.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{lead.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Source */}
                      <div className="text-xs text-gray-500 mb-4">
                        <span className="font-medium">Fonte:</span> {lead.source}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => window.open(`tel:${lead.phone}`)}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Ligar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => window.open(`mailto:${lead.email}`)}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Email
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/leads/${lead.id}`)}
                        >
                          Ver Mais
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-gray-900">Lead</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-900">Empresa</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-900">Status</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-900">Score</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-900">Fonte</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-900">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-sm">
                                    {getInitials(lead.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900">{lead.name}</p>
                                  <p className="text-sm text-gray-500">{lead.email}</p>
                                  <p className="text-sm text-gray-500">{lead.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-sm text-gray-900">{lead.company || '-'}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(lead.status)}`}></div>
                                <span className="text-sm text-gray-900">{lead.status}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              {lead.score ? (
                                <Badge className={`${getScoreColor(lead.score)} border-0`}>
                                  {lead.score}
                                </Badge>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              <p className="text-sm text-gray-900">{lead.source || '-'}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`tel:${lead.phone}`)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Phone className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`mailto:${lead.email}`)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/leads/${lead.id}`)}
                                  className="h-8 w-8 p-0"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedLead(lead);
                                      setIsModalOpen(true);
                                    }}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}`)}>
                                      Ver Detalhes
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleTasks(lead.id)}>
                                      <CheckSquare className="w-4 h-4 mr-2" />
                                      Tarefas
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDelete(lead.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLead(null);
        }}
        onSuccess={fetchLeads}
        lead={selectedLead}
      />

      <AdvancedFilters
        isOpen={isAdvancedFiltersOpen}
        onClose={() => setIsAdvancedFiltersOpen(false)}
        onApplyFilters={handleAdvancedFilters}
        type="leads"
      />
    </div>
  );
};

export default LeadsModern;