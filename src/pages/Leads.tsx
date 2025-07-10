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
import { Users, Plus, Search, Edit, Trash2, Mail, Phone, Building, Download, Upload, MessageCircle, CheckSquare, Filter, TrendingUp, Target, Award } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LeadModal from '@/components/LeadModal';
import LeadScoring from '@/components/LeadScoring';
import TagSystem from '@/components/TagSystem';
import AdvancedFilters from '@/components/AdvancedFilters';

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [availableTags] = useState<Tag[]>([
    { id: '1', name: 'VIP', color: '#FFD700', created_at: new Date().toISOString() },
    { id: '2', name: 'Urgente', color: '#FF4444', created_at: new Date().toISOString() },
    { id: '3', name: 'Qualificado', color: '#00AA00', created_at: new Date().toISOString() },
    { id: '4', name: 'Follow-up', color: '#4169E1', created_at: new Date().toISOString() },
    { id: '5', name: 'Orçamento Alto', color: '#8B5CF6', created_at: new Date().toISOString() }
  ]);
  const [availableUsers] = useState([
    { id: '1', name: 'João Silva' },
    { id: '2', name: 'Maria Santos' },
    { id: '3', name: 'Pedro Costa' }
  ]);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm]);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      
      // Sempre tentar localStorage primeiro para dados mais atualizados
      const storedLeads = localStorage.getItem('jt-crm-leads');
      if (storedLeads) {
        const parsedLeads = JSON.parse(storedLeads);
        setLeads([...parsedLeads]); // Forçar nova referência para trigger re-render
        setIsLoading(false);
        return;
      }
      
      // Se não houver dados no localStorage, tentar API
      try {
        const data = await apiService.getLeads();
        setLeads([...data]); // Forçar nova referência
        // Salvar no localStorage para próximas consultas
        localStorage.setItem('jt-crm-leads', JSON.stringify(data));
        return;
      } catch (apiError) {
        console.log('API não disponível, usando dados mock');
      }
      
      // Se nem localStorage nem API funcionarem, usar dados mock
      const mockLeads: Lead[] = [
        {
          id: '1',
          name: 'João Silva',
          email: 'joao@empresa.com',
          phone: '11999999999',
          whatsapp: '11999999999',
          company: 'Empresa ABC Ltda',
          cnpj_cpf: '12.345.678/0001-90',
          ie_rg: '123456789',
          address: 'Rua das Flores, 123',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          cep: '01234-567',
          source: 'Website',
          status: 'Qualificado',
          score: 85,
          tags: [
            { id: '1', name: 'VIP', color: '#FFD700', created_at: new Date().toISOString() },
            { id: '3', name: 'Qualificado', color: '#00AA00', created_at: new Date().toISOString() }
          ],
          responsible: 'João Silva',
          last_contact: '2025-01-15',
          next_contact: '2025-01-20',
          custom_fields: {
            website: 'https://empresa.com',
            budget: 50000,
            industry: 'Tecnologia'
          },
          notes: 'Lead muito interessado em PABX em nuvem',
          created_at: '2025-01-10T10:00:00Z',
          updated_at: '2025-01-15T14:30:00Z'
        },
        {
          id: '2',
          name: 'Maria Santos',
          email: 'maria@comercio.com',
          phone: '11888888888',
          whatsapp: '11888888888',
          company: 'Comércio XYZ',
          cnpj_cpf: '98.765.432/0001-10',
          address: 'Av. Principal, 456',
          number: '456',
          neighborhood: 'Jardins',
          city: 'São Paulo',
          state: 'SP',
          cep: '01234-567',
          source: 'Indicação',
          status: 'Em Contato',
          score: 72,
          tags: [
            { id: '2', name: 'Urgente', color: '#FF4444', created_at: new Date().toISOString() },
            { id: '4', name: 'Follow-up', color: '#4169E1', created_at: new Date().toISOString() }
          ],
          responsible: 'Maria Santos',
          last_contact: '2025-01-12',
          next_contact: '2025-01-18',
          custom_fields: {
            company_size: '11-50 funcionários',
            timeline: '15 dias'
          },
          notes: 'Interessada em URA Reversa',
          created_at: '2025-01-08T09:00:00Z',
          updated_at: '2025-01-12T16:45:00Z'
        },
        {
          id: '3',
          name: 'Pedro Costa',
          email: 'pedro@startup.com',
          phone: '11777777777',
          company: 'Startup Tech',
          source: 'LinkedIn',
          status: 'Novo',
          score: 45,
          tags: [
            { id: '5', name: 'Orçamento Alto', color: '#8B5CF6', created_at: new Date().toISOString() }
          ],
          responsible: 'Pedro Costa',
          city: 'Rio de Janeiro',
          state: 'RJ',
          custom_fields: {
            industry: 'Tecnologia',
            budget: 100000
          },
          notes: 'Startup em crescimento',
          created_at: '2025-01-05T11:00:00Z'
        }
      ];
      setLeads(mockLeads);
      localStorage.setItem('jt-crm-leads', JSON.stringify(mockLeads));
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLeads = () => {
    if (!searchTerm) {
      setFilteredLeads(leads);
      return;
    }

    const filtered = leads.filter(lead =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.state?.toLowerCase().includes(searchTerm.toLowerCase())
    );
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

    if (filters.responsible?.length) {
      filtered = filtered.filter(lead => filters.responsible.includes(lead.responsible));
    }

    if (filters.scoreRange) {
      filtered = filtered.filter(lead => 
        (lead.score || 0) >= filters.scoreRange[0] && 
        (lead.score || 0) <= filters.scoreRange[1]
      );
    }

    if (filters.city) {
      filtered = filtered.filter(lead => 
        lead.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.state) {
      filtered = filtered.filter(lead => lead.state === filters.state);
    }

    if (filters.tags?.length) {
      filtered = filtered.filter(lead => 
        lead.tags?.some(tag => filters.tags.includes(tag.id))
      );
    }

    setFilteredLeads(filtered);
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
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

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const message = `Olá ${name}, tudo bem? Sou da JT Tecnologia e gostaria de conversar sobre nossas soluções de telefonia.`;
    const url = `https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleEmail = (email: string, name: string) => {
    const subject = 'Proposta JT Tecnologia - Soluções de Telefonia';
    const body = `Olá ${name},\n\nEspero que esteja bem! Sou da JT Tecnologia e gostaria de apresentar nossas soluções de telefonia que podem otimizar a comunicação da sua empresa.\n\nGostaria de agendar uma conversa?\n\nAtenciosamente,\nEquipe JT Tecnologia`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
  };

  const handleTasks = (leadId: string) => {
    navigate(`/tasks?lead=${leadId}`);
  };

  const handleLeadClick = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Novo': 'bg-blue-100 text-blue-800',
      'Em Contato': 'bg-yellow-100 text-yellow-800',
      'Qualificado': 'bg-green-100 text-green-800',
      'Proposta Enviada': 'bg-purple-100 text-purple-800',
      'Em Negociação': 'bg-orange-100 text-orange-800',
      'Ganho': 'bg-emerald-100 text-emerald-800',
      'Perdido': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      'Website': 'bg-blue-100 text-blue-800',
      'Google Ads': 'bg-red-100 text-red-800',
      'Facebook': 'bg-blue-100 text-blue-800',
      'Instagram': 'bg-pink-100 text-pink-800',
      'Indicação': 'bg-green-100 text-green-800',
      'LinkedIn': 'bg-blue-100 text-blue-800',
      'WhatsApp': 'bg-green-100 text-green-800'
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  // Estatísticas dos leads
  const stats = {
    total: leads.length,
    qualified: leads.filter(l => l.status === 'Qualificado').length,
    hot: leads.filter(l => (l.score || 0) >= 80).length,
    thisMonth: leads.filter(l => {
      const created = new Date(l.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">Gerencie seus leads com scoring automático e filtros avançados</p>
        </div>
        <div className="flex gap-2">
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
            className="bg-jt-blue hover:bg-jt-blue/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Leads</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Qualificados</p>
                <p className="text-2xl font-bold text-green-600">{stats.qualified}</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Leads Quentes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.hot}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Este Mês</p>
                <p className="text-2xl font-bold text-purple-600">{stats.thisMonth}</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, email, telefone, empresa, cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsAdvancedFiltersOpen(true)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros Avançados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Leads */}
      <Card>
        <CardHeader>
          <CardTitle>
            Leads ({filteredLeads.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jt-blue"></div>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8">
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
                  className="bg-jt-blue hover:bg-jt-blue/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Lead
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div 
                          className="flex items-center gap-3 cursor-pointer hover:text-jt-blue"
                          onClick={() => handleLeadClick(lead.id)}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-jt-blue text-white text-xs">
                              {getInitials(lead.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{lead.name}</div>
                            <div className="text-sm text-gray-500">{lead.email}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span>{lead.company || '-'}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {lead.phone}
                          </div>
                          {lead.whatsapp && (
                            <div className="flex items-center gap-1 text-sm text-green-600">
                              <MessageCircle className="w-3 h-3" />
                              WhatsApp
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary" className={getSourceColor(lead.source)}>
                          {lead.source}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <LeadScoring score={lead.score || 0} size="sm" />
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {lead.tags?.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              style={{ backgroundColor: tag.color, color: 'white' }}
                              className="text-xs"
                            >
                              {tag.name}
                            </Badge>
                          ))}
                          {(lead.tags?.length || 0) > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{(lead.tags?.length || 0) - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          {lead.city && lead.state ? `${lead.city}, ${lead.state}` : '-'}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCall(lead.phone)}
                            title="Ligar"
                          >
                            <Phone className="w-4 h-4 text-green-600" />
                          </Button>

                          {lead.whatsapp && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleWhatsApp(lead.whatsapp!, lead.name)}
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4 text-green-600" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEmail(lead.email, lead.name)}
                            title="Email"
                          >
                            <Mail className="w-4 h-4 text-blue-600" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTasks(lead.id)}
                            title="Tarefas"
                          >
                            <CheckSquare className="w-4 h-4 text-purple-600" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(lead)}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(lead.id)}
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtros Avançados */}
      <AdvancedFilters
        isOpen={isAdvancedFiltersOpen}
        onClose={() => setIsAdvancedFiltersOpen(false)}
        onApplyFilters={handleAdvancedFilters}
      />

      {/* Modal de Lead */}
      {isModalOpen && (
        <LeadModal
          onClose={() => {
            setIsModalOpen(false);
            setSelectedLead(null);
          }}
          onSuccess={async () => {
            // Pequeno delay para garantir que o localStorage foi atualizado
            setTimeout(async () => {
              await fetchLeads();
            setIsModalOpen(false);
            setSelectedLead(null);
          }, 100);
        }}
        lead={selectedLead}
        />
      )}
    </div>
  );
};

export default Leads;

