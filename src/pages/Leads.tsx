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
  Users, Plus, Search, Edit, Trash2, Mail, Phone, Building, Download, Upload, 
  MessageCircle, CheckSquare, Filter, TrendingUp, Target, Award, List, Grid3X3,
  MapPin, Calendar, Star, ExternalLink, PhoneCall
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LeadModal from '@/components/LeadModal';
import ContactHistoryModal from '@/components/ContactHistoryModal';

type ViewMode = 'list' | 'card';

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [availableTags] = useState<Tag[]>([
    { id: '1', name: 'VIP', color: '#FFD700', created_at: new Date().toISOString() },
    { id: '2', name: 'Urgente', color: '#FF4444', created_at: new Date().toISOString() },
    { id: '3', name: 'Qualificado', color: '#00AA00', created_at: new Date().toISOString() },
    { id: '4', name: 'Follow-up', color: '#4169E1', created_at: new Date().toISOString() },
    { id: '5', name: 'Orçamento Alto', color: '#8B5CF6', created_at: new Date().toISOString() }
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
      
      // Conectar à API real da JT Telecom
      const token = import.meta.env.VITE_EASEPANEL_TOKEN;
      
      if (!token) {
        throw new Error('Token EASEPANEL_TOKEN não configurado');
      }

      const response = await fetch('https://api.app.jttecnologia.com.br/leads', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const apiData = await response.json();
      
      // Mapear dados da API para o formato esperado
      const mappedLeads: Lead[] = apiData.map((lead: any) => ({
        id: lead.id,
        name: lead.nome,
        email: lead.email,
        phone: lead.telefone || '',
        whatsapp: lead.whatsapp || lead.telefone || '',
        company: lead.empresa || '',
        status: lead.status || 'new',
        source: lead.origem || 'website',
        responsible: lead.responsavel || 'Não definido',
        score: lead.pontuacao || 0,
        interest: lead.interesse || '',
        budget: lead.orcamento || 0,
        expected_close: lead.previsao_fechamento || '',
        notes: lead.observacoes || '',
        created_at: lead.data_criacao || new Date().toISOString(),
        updated_at: lead.data_atualizacao || new Date().toISOString()
      }));

      setLeads(mappedLeads);
      
      if (mappedLeads.length === 0) {
        toast({
          title: 'Nenhum lead encontrado',
          description: 'Não há leads cadastrados no sistema.',
        });
      } else {
        toast({
          title: 'Leads carregados',
          description: `${mappedLeads.length} leads carregados com sucesso.`,
        });
      }
        
    } catch (error: any) {
      console.error('Failed to fetch leads:', error);
      setLeads([]);
      toast({
        title: 'Erro ao carregar leads',
        description: error.message || 'Não foi possível carregar a lista de leads.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterLeads = () => {
    if (!searchTerm.trim()) {
      setFilteredLeads(leads);
      return;
    }

    const filtered = leads.filter(lead =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLeads(filtered);
  };

  const handleCreateLead = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleDeleteLead = async (leadId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lead?')) {
      try {
        await apiService.deleteLead(leadId);
        toast({
          title: 'Lead excluído',
          description: 'Lead excluído com sucesso.',
        });
        fetchLeads();
      } catch (error) {
        console.error('Failed to delete lead:', error);
        toast({
          title: 'Erro ao excluir',
          description: 'Não foi possível excluir o lead.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleConvertToClient = async (leadId: string) => {
    try {
      await apiService.convertLeadToClient(leadId);
      toast({
        title: 'Lead convertido',
        description: 'Lead convertido para cliente com sucesso.',
      });
      fetchLeads();
    } catch (error) {
      console.error('Failed to convert lead:', error);
      toast({
        title: 'Erro na conversão',
        description: 'Não foi possível converter o lead para cliente.',
        variant: 'destructive',
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  const handleModalSuccess = () => {
    fetchLeads();
    handleCloseModal();
  };

  const handleMakeCall = async (phone: string, leadName: string) => {
    try {
      await apiService.makeCall(phone);
      toast({
        title: 'Chamada iniciada',
        description: `Chamada para ${leadName} (${phone}) iniciada via JT Vox PABX.`,
      });
    } catch (error) {
      console.error('Failed to make call:', error);
      toast({
        title: 'Erro na chamada',
        description: 'Não foi possível iniciar a chamada. Verifique as configurações do PABX.',
        variant: 'destructive',
      });
    }
  };

  const handleSendWhatsApp = async (phone: string, leadName: string) => {
    try {
      const message = `Olá ${leadName}! Sou da JT Telecom e gostaria de conversar sobre nossas soluções de telecomunicações. Quando seria um bom momento para conversarmos?`;
      await apiService.sendWhatsAppMessage(phone, message);
      toast({
        title: 'WhatsApp enviado',
        description: `Mensagem enviada para ${leadName} via Smartbot.`,
      });
    } catch (error) {
      console.error('Failed to send WhatsApp:', error);
      toast({
        title: 'Erro no WhatsApp',
        description: 'Não foi possível enviar a mensagem. Verifique as configurações do Smartbot.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'novo':
        return 'bg-blue-100 text-blue-800';
      case 'qualificado':
        return 'bg-green-100 text-green-800';
      case 'em negociação':
        return 'bg-yellow-100 text-yellow-800';
      case 'perdido':
        return 'bg-red-100 text-red-800';
      case 'convertido':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredLeads.map((lead) => (
        <Card key={lead.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-[#0057B8] text-white">
                    {lead.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{lead.name}</CardTitle>
                  <p className="text-sm text-gray-600">{lead.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className={`w-4 h-4 ${getScoreColor(lead.score || 0)}`} />
                <span className={`text-sm font-medium ${getScoreColor(lead.score || 0)}`}>
                  {lead.score || 0}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="truncate">{lead.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{lead.phone}</span>
              </div>
              {lead.city && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{lead.city}, {lead.state}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(lead.status)}>
                {lead.status}
              </Badge>
              <span className="text-xs text-gray-500">
                {lead.source}
              </span>
            </div>

            {lead.tags && lead.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {lead.tags.slice(0, 2).map((tag, index) => {
                  const tagObj = typeof tag === 'string' ? { id: index.toString(), name: tag, color: '#0057B8' } : tag;
                  return (
                    <Badge
                      key={tagObj.id}
                      variant="outline"
                      style={{ 
                        backgroundColor: `${tagObj.color}20`,
                        borderColor: tagObj.color,
                        color: tagObj.color
                      }}
                      className="text-xs"
                    >
                      {tagObj.name}
                    </Badge>
                  );
                })}
                {lead.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{lead.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {lead.next_contact && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>Próximo contato: {new Date(lead.next_contact).toLocaleDateString('pt-BR')}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEditLead(lead)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleMakeCall(lead.phone, lead.name)}
                className="text-blue-600 hover:text-blue-700"
              >
                <PhoneCall className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSendWhatsApp(lead.whatsapp || lead.phone, lead.name)}
                className="text-green-600 hover:text-green-700"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
              <ContactHistoryModal 
                contactId={lead.id}
                contactType="lead"
                contactName={lead.name}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleConvertToClient(lead.id)}
                className="text-purple-600 hover:text-purple-700"
              >
                <CheckSquare className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Lead</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Próximo Contato</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow key={lead.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-[#0057B8] text-white text-xs">
                        {lead.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{lead.company}</div>
                    <div className="text-sm text-gray-500">{lead.city}, {lead.state}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="w-3 h-3" />
                      {lead.phone}
                    </div>
                    <div className="text-xs text-gray-500">{lead.source}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className={`w-4 h-4 ${getScoreColor(lead.score || 0)}`} />
                    <span className={`font-medium ${getScoreColor(lead.score || 0)}`}>
                      {lead.score || 0}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{lead.responsible}</span>
                </TableCell>
                <TableCell>
                  {lead.next_contact ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3" />
                      {new Date(lead.next_contact).toLocaleDateString('pt-BR')}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditLead(lead)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleMakeCall(lead.phone, lead.name)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSendWhatsApp(lead.whatsapp || lead.phone, lead.name)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <ContactHistoryModal 
                      contactId={lead.id}
                      contactType="lead"
                      contactName={lead.name}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleConvertToClient(lead.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckSquare className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteLead(lead.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#0057B8]">Leads</h1>
        </div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#0057B8]">Leads</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-[#0057B8] hover:bg-[#003d82]" onClick={handleCreateLead}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2 border rounded-lg p-1">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-[#0057B8] hover:bg-[#003d82]' : ''}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'card' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('card')}
            className={viewMode === 'card' ? 'bg-[#0057B8] hover:bg-[#003d82]' : ''}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {filteredLeads.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 mb-4">
              {searchTerm ? 'Nenhum lead encontrado com os filtros aplicados.' : 'Nenhum lead cadastrado ainda.'}
            </div>
            <Button className="bg-[#0057B8] hover:bg-[#003d82]" onClick={handleCreateLead}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Lead
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'list' ? renderListView() : renderCardView()}
        </>
      )}

      <LeadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        lead={selectedLead}
      />
    </div>
  );
};

export default Leads;

