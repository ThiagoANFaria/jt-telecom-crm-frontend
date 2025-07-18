import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@/types';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, Plus, Search, Edit, Trash2, Mail, Phone, Building, Download, Upload, 
  MessageCircle, CheckSquare, List, Grid3X3, MapPin, Calendar, Star, ExternalLink,
  CreditCard, FileText, PhoneCall
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ClientModal from '@/components/ClientModal';
import ContactHistoryModal from '@/components/ContactHistoryModal';

type ViewMode = 'list' | 'card';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      
      // Buscar dados da API real da JT Telecom
      const token = import.meta.env.VITE_EASEPANEL_TOKEN;
      
      if (!token) {
        throw new Error('Token EASEPANEL_TOKEN não configurado');
      }

      const response = await fetch('https://api.app.jttecnologia.com.br/clientes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Mapear dados da API para o formato esperado pela interface
      const mappedClients: Client[] = data.map((client: any) => ({
        id: client.id,
        name: client.nome,
        email: client.email,
        phone: client.telefone || '',
        whatsapp: client.whatsapp || client.telefone || '',
        company: client.empresa,
        cnpj_cpf: client.cnpj || client.cpf || '',
        ie_rg: client.ie || client.rg || '',
        address: client.endereco || '',
        number: client.numero || '',
        neighborhood: client.bairro || '',
        city: client.cidade || '',
        state: client.estado || '',
        cep: client.cep || '',
        status: client.status,
        responsible: client.responsavel || 'Não definido',
        contract_value: client.valor_contrato || 0,
        contract_start: client.inicio_contrato || '',
        contract_end: client.fim_contrato || '',
        notes: client.observacoes || '',
        created_at: client.created_at || new Date().toISOString(),
        updated_at: client.updated_at || new Date().toISOString()
      }));

      setClients(mappedClients);
      
      toast({
        title: 'Clientes carregados',
        description: `${mappedClients.length} clientes carregados da API JT Telecom.`,
      });
      
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      toast({
        title: 'Erro ao carregar clientes',
        description: 'Não foi possível carregar a lista de clientes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterClients = () => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }

    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  const handleCreateClient = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await apiService.deleteClient(clientId);
        toast({
          title: 'Cliente excluído',
          description: 'Cliente excluído com sucesso.',
        });
        fetchClients();
      } catch (error) {
        console.error('Failed to delete client:', error);
        toast({
          title: 'Erro ao excluir',
          description: 'Não foi possível excluir o cliente.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  const handleModalSuccess = () => {
    fetchClients();
    handleCloseModal();
  };

  const handleMakeCall = async (phone: string, clientName: string) => {
    try {
      await apiService.makeCall(phone);
      toast({
        title: 'Chamada iniciada',
        description: `Chamada para ${clientName} (${phone}) iniciada via JT Vox PABX.`,
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

  const handleSendWhatsApp = async (phone: string, clientName: string) => {
    try {
      const message = `Olá ${clientName}! Como está tudo? Estamos entrando em contato para verificar se está tudo funcionando bem com nossos serviços e se há algo em que possamos ajudar.`;
      await apiService.sendWhatsAppMessage(phone, message);
      toast({
        title: 'WhatsApp enviado',
        description: `Mensagem enviada para ${clientName} via Smartbot.`,
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
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'inativo':
        return 'bg-red-100 text-red-800';
      case 'suspenso':
        return 'bg-yellow-100 text-yellow-800';
      case 'pendente':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredClients.map((client) => (
        <Card key={client.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-[#0057B8] text-white">
                    {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <p className="text-sm text-gray-600">{client.company}</p>
                </div>
              </div>
              <Badge className={getStatusColor(client.status)}>
                {client.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{client.phone}</span>
              </div>
              {client.city && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{client.city}, {client.state}</span>
                </div>
              )}
            </div>

            {client.contract_value && (
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-600">
                  {formatCurrency(client.contract_value)}
                </span>
              </div>
            )}

            {client.contract_end && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>Contrato até: {new Date(client.contract_end).toLocaleDateString('pt-BR')}</span>
              </div>
            )}

            <div className="text-xs text-gray-500">
              <span>Responsável: {client.responsible}</span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEditClient(client)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleMakeCall(client.phone, client.name)}
                className="text-blue-600 hover:text-blue-700"
              >
                <PhoneCall className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSendWhatsApp(client.whatsapp || client.phone, client.name)}
                className="text-green-600 hover:text-green-700"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
              <ContactHistoryModal 
                contactId={client.id}
                contactType="client"
                contactName={client.name}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/proposals?client=${client.id}`)}
                className="text-purple-600 hover:text-purple-700"
              >
                <FileText className="w-4 h-4" />
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
              <TableHead className="w-[250px]">Cliente</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valor do Contrato</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-[#0057B8] text-white text-xs">
                        {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{client.company}</div>
                    <div className="text-sm text-gray-500">{client.city}, {client.state}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="w-3 h-3" />
                      {client.phone}
                    </div>
                    <div className="text-xs text-gray-500">{client.cnpj_cpf}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(client.status)}>
                    {client.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {client.contract_value ? (
                    <div className="flex items-center gap-1 font-semibold text-green-600">
                      <CreditCard className="w-4 h-4" />
                      {formatCurrency(client.contract_value)}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{client.responsible}</span>
                </TableCell>
                <TableCell>
                  {client.contract_end ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3" />
                      {new Date(client.contract_end).toLocaleDateString('pt-BR')}
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
                      onClick={() => handleEditClient(client)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleMakeCall(client.phone, client.name)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSendWhatsApp(client.whatsapp || client.phone, client.name)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <ContactHistoryModal 
                      contactId={client.id}
                      contactType="client"
                      contactName={client.name}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/proposals?client=${client.id}`)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteClient(client.id)}
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
          <h1 className="text-3xl font-bold text-[#0057B8]">Clientes</h1>
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
        <h1 className="text-3xl font-bold text-[#0057B8]">Clientes</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-[#0057B8] hover:bg-[#003d82]" onClick={handleCreateClient}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar clientes..."
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

      {filteredClients.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 mb-4">
              {searchTerm ? 'Nenhum cliente encontrado com os filtros aplicados.' : 'Nenhum cliente cadastrado ainda.'}
            </div>
            <Button className="bg-[#0057B8] hover:bg-[#003d82]" onClick={handleCreateClient}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Cliente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'list' ? renderListView() : renderCardView()}
        </>
      )}

      <ClientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        client={selectedClient}
      />
    </div>
  );
};

export default Clients;

