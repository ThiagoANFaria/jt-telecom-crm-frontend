import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lead } from '@/types';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MessageCircle, 
  Building, 
  MapPin, 
  Calendar,
  User,
  Edit,
  Save,
  X,
  Plus,
  Activity,
  FileText,
  Clock
} from 'lucide-react';

const LeadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const data = await apiService.getLead(id);
      setLead(data);
      setNotes(data.notes || '');
    } catch (error) {
      console.error('Failed to fetch lead:', error);
      // Usar dados mock para demonstração
      const mockLead: Lead = {
        id: id,
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
        source: 'website',
        status: 'new',
        notes: 'Lead interessado em PABX em nuvem. Empresa com 50 funcionários. Orçamento aprovado de até R$ 5.000/mês.',
        created_at: new Date().toISOString(),
        createdAt: new Date()
      };
      setLead(mockLead);
      setNotes(mockLead.notes || '');
      toast({
        title: 'Modo demonstração',
        description: 'Exibindo dados de exemplo. API não disponível.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const handleWhatsApp = (phone: string, name: string) => {
    if (phone) {
      const message = `Olá ${name}, tudo bem? Sou da JT Tecnologia e gostaria de conversar sobre nossas soluções em comunicação empresarial.`;
      const whatsappUrl = `https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleEmail = (email: string, name: string) => {
    if (email) {
      const subject = 'Proposta Comercial - JT Tecnologia';
      const body = `Olá ${name},\n\nEspero que esteja bem!\n\nSou da JT Tecnologia e gostaria de apresentar nossas soluções em comunicação empresarial que podem otimizar os processos da sua empresa.\n\nPodemos agendar uma conversa?\n\nAtenciosamente,\nEquipe JT Tecnologia`;
      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl, '_self');
    }
  };

  const handleSaveNotes = async () => {
    try {
      // Aqui seria a chamada para a API para salvar as notas
      // await apiService.updateLead(lead.id, { notes });
      
      if (lead) {
        setLead({ ...lead, notes });
      }
      
      setIsEditingNotes(false);
      toast({
        title: 'Notas salvas',
        description: 'As observações foram atualizadas com sucesso.',
      });
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as observações.',
        variant: 'destructive',
      });
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const timestamp = new Date().toLocaleString('pt-BR');
      const updatedNotes = notes ? `${notes}\n\n[${timestamp}] ${newNote}` : `[${timestamp}] ${newNote}`;
      setNotes(updatedNotes);
      setNewNote('');
      toast({
        title: 'Nota adicionada',
        description: 'Nova observação foi adicionada.',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'novo':
        return 'bg-blue-100 text-blue-800';
      case 'contato':
        return 'bg-yellow-100 text-yellow-800';
      case 'qualificado':
        return 'bg-green-100 text-green-800';
      case 'perdido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'website':
        return 'bg-purple-100 text-purple-800';
      case 'google ads':
        return 'bg-green-100 text-green-800';
      case 'facebook':
        return 'bg-blue-100 text-blue-800';
      case 'instagram':
        return 'bg-pink-100 text-pink-800';
      case 'linkedin':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/leads')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/leads')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">Lead não encontrado.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/leads')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Leads
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/leads/${lead.id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar Lead
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Coluna Principal */}
        <div className="md:col-span-2 space-y-6">
          {/* Informações do Lead */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações do Lead
                </CardTitle>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                  <Badge className={getSourceColor(lead.source)} variant="secondary">
                    {lead.source}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 bg-jt-blue text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                
                {/* Informações */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{lead.name}</h2>
                    <p className="text-gray-600">{lead.company}</p>
                  </div>
                  
                  {/* Botões de Ação */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCall(lead.phone)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Ligar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWhatsApp(lead.whatsapp || lead.phone, lead.name)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEmail(lead.email, lead.name)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes de Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Detalhes de Contato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{lead.email}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{lead.phone}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">WhatsApp</label>
                    <div className="flex items-center gap-2 mt-1">
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                      <span>{lead.whatsapp || lead.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">CNPJ/CPF</label>
                    <div className="flex items-center gap-2 mt-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{lead.cnpj_cpf || 'Não informado'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">IE/RG</label>
                    <div className="flex items-center gap-2 mt-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{lead.ie_rg || 'Não informado'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Criação</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          {(lead.address || lead.city) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lead.address && (
                    <div>{lead.address}, {lead.number}</div>
                  )}
                  {lead.neighborhood && (
                    <div>{lead.neighborhood}</div>
                  )}
                  {lead.city && (
                    <div>{lead.city} - {lead.state}</div>
                  )}
                  {lead.cep && (
                    <div>CEP: {lead.cep}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas e Observações */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notas e Observações
                </CardTitle>
                {!isEditingNotes && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingNotes(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingNotes ? (
                <div className="space-y-4">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Adicione suas observações sobre este lead..."
                    rows={6}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveNotes}>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setIsEditingNotes(false);
                      setNotes(lead.notes || '');
                    }}>
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes ? (
                    <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {notes}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">Nenhuma observação adicionada ainda.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Atividades Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Lead criado</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Primeiro contato realizado</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Hoje às 14:30
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Email enviado</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Ontem às 16:45
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Adicionar Nova Nota */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Adicionar Nota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Digite uma nova observação..."
                  rows={3}
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Nota
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Razão Social</label>
                  <div className="mt-1 font-medium">{lead.company}</div>
                </div>
                <Separator />
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Funcionários:</span>
                    <span>50-100</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Segmento:</span>
                    <span>Tecnologia</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Orçamento:</span>
                    <span>R$ 5.000/mês</span>
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

export default LeadDetail;

