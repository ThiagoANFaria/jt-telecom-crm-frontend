import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@/types';
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
  Clock,
  CheckSquare,
  Package
} from 'lucide-react';

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const data = await apiService.getClient(id);
      setClient(data);
      setNotes(data.notes || '');
    } catch (error) {
      console.error('Failed to fetch client:', error);
      setClient(null);
      toast({
        title: 'Erro ao carregar cliente',
        description: 'Não foi possível carregar os dados do cliente.',
        variant: 'destructive',
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
      const message = `Olá ${name}, tudo bem? Sou da JT Tecnologia e gostaria de verificar como estão nossos serviços.`;
      const whatsappUrl = `https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleEmail = (email: string, name: string) => {
    if (email) {
      const subject = 'Atendimento JT Tecnologia';
      const body = `Olá ${name},\n\nEspero que esteja bem!\n\nSou da JT Tecnologia e gostaria de verificar como estão nossos serviços e se há algo em que possamos ajudar.\n\nFique à vontade para entrar em contato!\n\nAtenciosamente,\nEquipe JT Tecnologia`;
      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl, '_self');
    }
  };

  const handleSaveNotes = async () => {
    try {
      if (client) {
        setClient({ ...client, notes });
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
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'inativo':
        return 'bg-red-100 text-red-800';
      case 'prospecto':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspenso':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductColor = (product: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-yellow-100 text-yellow-800',
    ];
    const index = product.length % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/clients')}>
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

  if (!client) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/clients')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">Cliente não encontrado.</div>
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
          <Button variant="ghost" onClick={() => navigate('/clients')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Clientes
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/clients/${client.id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar Cliente
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Coluna Principal */}
        <div className="md:col-span-2 space-y-6">
          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações do Cliente
                </CardTitle>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(client.status)}>
                    {client.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 bg-jt-blue text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                
                {/* Informações */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
                    <p className="text-gray-600">{client.company}</p>
                  </div>
                  
                  {/* Botões de Ação */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCall(client.phone)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Ligar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWhatsApp(client.whatsapp || client.phone, client.name)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEmail(client.email, client.name)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/tasks?client=${client.id}`)}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Tarefas
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Produtos Contratados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Produtos Contratados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {client.products && client.products.length > 0 ? (
                  client.products.map((product, idx) => (
                    <Badge key={idx} className={getProductColor(product)} variant="secondary">
                      {product}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 italic">Nenhum produto contratado</span>
                )}
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
                      <span>{client.email}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{client.phone}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">WhatsApp</label>
                    <div className="flex items-center gap-2 mt-1">
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                      <span>{client.whatsapp || client.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">CNPJ/CPF</label>
                    <div className="flex items-center gap-2 mt-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{client.cnpj_cpf || 'Não informado'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">IE/RG</label>
                    <div className="flex items-center gap-2 mt-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{client.ie_rg || 'Não informado'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Cadastro</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{new Date(client.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          {(client.address || client.city) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {client.address && (
                    <div>{client.address}, {client.number}</div>
                  )}
                  {client.neighborhood && (
                    <div>{client.neighborhood}</div>
                  )}
                  {client.city && (
                    <div>{client.city} - {client.state}</div>
                  )}
                  {client.cep && (
                    <div>CEP: {client.cep}</div>
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
                    placeholder="Adicione suas observações sobre este cliente..."
                    rows={6}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveNotes}>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setIsEditingNotes(false);
                      setNotes(client.notes || '');
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
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Pagamento recebido</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Hoje às 10:30
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Suporte técnico realizado</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Ontem às 15:20
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Contrato renovado</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(client.created_at).toLocaleDateString('pt-BR')}
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

          {/* Informações Financeiras */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Valor Mensal:</span>
                    <span className="font-medium text-green-600">R$ 2.500,00</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Valor Anual:</span>
                    <span className="font-medium">R$ 30.000,00</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Próximo Vencimento:</span>
                    <span>15/07/2025</span>
                  </div>
                </div>
                <Separator />
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>Status Financeiro:</span>
                    <Badge className="bg-green-100 text-green-800">Em dia</Badge>
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

export default ClientDetail;

