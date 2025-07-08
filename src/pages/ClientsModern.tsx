
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@/types';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, Plus, Search, MoreHorizontal, Phone, Mail, 
  MessageSquare, Building, MapPin, DollarSign, Calendar,
  Crown, Activity, TrendingUp, Shield, Grid3X3, List
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import ClientModal from '@/components/ClientModal';

const ClientsModern: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, selectedFilter]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      
      const storedClients = localStorage.getItem('jt-crm-clients');
      if (storedClients) {
        const parsedClients = JSON.parse(storedClients);
        setClients(parsedClients);
        setIsLoading(false);
        return;
      }
      
      try {
        const data = await apiService.getClients();
        setClients(data);
        localStorage.setItem('jt-crm-clients', JSON.stringify(data));
      } catch (apiError) {
        const mockClients: Client[] = [
          {
            id: '1',
            name: 'Carlos Eduardo',
            email: 'carlos@empresa.com',
            phone: '11999999999',
            whatsapp: '11999999999',
            company: 'Empresa ABC Ltda',
            cnpj_cpf: '12.345.678/0001-90',
            address: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'SP',
            status: 'ativo',
            products: ['Pabx em Nuvem', 'Discador Preditivo'],
            monthly_value: 1500,
            annual_value: 18000,
            contract_start: '2024-01-15',
            contract_end: '2025-01-15',
            payment_status: 'em_dia',
            notes: 'Cliente premium com contrato anual',
            created_at: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            name: 'Ana Paula Silva',
            email: 'ana@comercio.com',
            phone: '11888888888',
            company: 'Comércio XYZ',
            city: 'São Paulo',
            state: 'SP',
            status: 'ativo',
            products: ['0800 Virtual'],
            monthly_value: 800,
            payment_status: 'em_dia',
            notes: 'Cliente desde 2023',
            created_at: '2023-06-10T09:00:00Z'
          },
          {
            id: '3',
            name: 'Roberto Santos',
            email: 'roberto@startup.com',
            phone: '11777777777',
            company: 'Startup Tech',
            city: 'Rio de Janeiro',
            state: 'RJ',
            status: 'prospecto',
            products: ['Chatbot'],
            monthly_value: 500,
            payment_status: 'pendente',
            notes: 'Em negociação para upgrade',
            created_at: '2024-12-01T11:00:00Z'
          }
        ];
        setClients(mockClients);
        localStorage.setItem('jt-crm-clients', JSON.stringify(mockClients));
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = clients;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(client => {
        switch (selectedFilter) {
          case 'active':
            return client.status === 'ativo';
          case 'premium':
            return (client.monthly_value || 0) >= 1000;
          case 'prospect':
            return client.status === 'prospecto';
          case 'overdue':
            return client.payment_status === 'em_atraso';
          default:
            return true;
        }
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClients(filtered);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ativo': 'bg-green-500',
      'inativo': 'bg-gray-500',
      'prospecto': 'bg-blue-500',
      'suspenso': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'em_dia': 'text-green-600 bg-green-100',
      'pendente': 'text-yellow-600 bg-yellow-100',
      'em_atraso': 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'em_dia': 'Em Dia',
      'pendente': 'Pendente',
      'em_atraso': 'Em Atraso'
    };
    return labels[status] || status;
  };

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'ativo').length,
    premium: clients.filter(c => (c.monthly_value || 0) >= 1000).length,
    revenue: clients.reduce((sum, c) => sum + (c.monthly_value || 0), 0)
  };

  const filterOptions = [
    { value: 'all', label: 'Todos os Clientes', count: stats.total },
    { value: 'active', label: 'Ativos', count: stats.active },
    { value: 'premium', label: 'Premium', count: stats.premium },
    { value: 'prospect', label: 'Prospectos', count: clients.filter(c => c.status === 'prospecto').length },
    { value: 'overdue', label: 'Em Atraso', count: clients.filter(c => c.payment_status === 'em_atraso').length }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600">Gerencie sua base de clientes</p>
          </div>
          <Button 
            onClick={() => {
              setSelectedClient(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total de Clientes</p>
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
                  <p className="text-green-100 text-sm">Clientes Ativos</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <Activity className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Clientes Premium</p>
                  <p className="text-2xl font-bold">{stats.premium}</p>
                </div>
                <Crown className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Receita Mensal</p>
                  <p className="text-2xl font-bold">R$ {stats.revenue.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar clientes..."
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
          </div>
        </div>

        {/* Clients Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando seu primeiro cliente.'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => {
                    setSelectedClient(null);
                    setIsModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Cliente
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6">
                  {/* Header do Cliente */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {client.name}
                        </h3>
                        <p className="text-sm text-gray-500">{client.email}</p>
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
                          setSelectedClient(client);
                          setIsModalOpen(true);
                        }}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`tel:${client.phone}`)}>
                          Ligar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`mailto:${client.email}`)}>
                          Enviar Email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Company e Location */}
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{client.company}</span>
                  </div>
                  
                  {client.city && client.state && (
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{client.city}, {client.state}</span>
                    </div>
                  )}

                  {/* Status e Payment Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(client.status)}`}></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">{client.status}</span>
                    </div>
                    
                    {client.payment_status && (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(client.payment_status)}`}>
                        {getPaymentStatusLabel(client.payment_status)}
                      </div>
                    )}
                  </div>

                  {/* Produtos */}
                  {client.products && client.products.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Produtos:</p>
                      <div className="flex flex-wrap gap-1">
                        {client.products.slice(0, 2).map((product, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                        {client.products.length > 2 && (
                          <Badge variant="outline" className="text-xs">+{client.products.length - 2}</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Valor Mensal */}
                  {client.monthly_value && (
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">
                        R$ {client.monthly_value.toLocaleString()}/mês
                      </span>
                    </div>
                  )}

                  {/* Contract Info */}
                  {client.contract_start && (
                    <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>Contrato desde {new Date(client.contract_start).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open(`tel:${client.phone}`)}>
                      <Phone className="w-3 h-3 mr-1" />
                      Ligar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open(`mailto:${client.email}`)}>
                      <Mail className="w-3 h-3 mr-1" />
                      Email
                    </Button>
                    {client.whatsapp && (
                      <Button variant="outline" size="sm" onClick={() => {
                        const message = `Olá ${client.name}, como está? Sou da JT Tecnologia, como posso ajudá-lo hoje?`;
                        window.open(`https://wa.me/55${client.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`);
                      }}>
                        <MessageSquare className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Cliente */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClient(null);
        }}
        onSuccess={async () => {
          setTimeout(async () => {
            await fetchClients();
            setIsModalOpen(false);
            setSelectedClient(null);
          }, 100);
        }}
        client={selectedClient}
      />
    </div>
  );
};

export default ClientsModern;
