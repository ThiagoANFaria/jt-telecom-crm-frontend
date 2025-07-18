import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User, Users } from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: 'client' | 'lead';
}

interface ClientSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClientSelect?: (client: Client) => void;
  placeholder?: string;
}

const ClientSearch: React.FC<ClientSearchProps> = ({
  value,
  onChange,
  onClientSelect,
  placeholder = "Digite o nome do cliente ou lead"
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fechar resultados quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchClients = async (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setIsSearching(true);
      
      // Buscar em clientes e leads simultaneamente
      const [clientsResponse, leadsResponse] = await Promise.allSettled([
        apiService.getClients(),
        apiService.getLeads()
      ]);

      const clients: Client[] = [];

      // Processar resultados de clientes
      if (clientsResponse.status === 'fulfilled' && clientsResponse.value) {
        const clientData = Array.isArray(clientsResponse.value) ? clientsResponse.value : clientsResponse.value.data || [];
        clients.push(...clientData.map((client: any) => ({
          id: client.id,
          name: client.name || client.client_name || 'Nome não informado',
          email: client.email,
          phone: client.phone || client.whatsapp,
          type: 'client' as const
        })));
      }

      // Processar resultados de leads
      if (leadsResponse.status === 'fulfilled' && leadsResponse.value) {
        const leadData = Array.isArray(leadsResponse.value) ? leadsResponse.value : leadsResponse.value.data || [];
        clients.push(...leadData.map((lead: any) => ({
          id: lead.id,
          name: lead.name || lead.lead_name || 'Nome não informado',
          email: lead.email,
          phone: lead.phone || lead.whatsapp,
          type: 'lead' as const
        })));
      }

      setSearchResults(clients);
      setShowResults(clients.length > 0);
      
    } catch (error) {
      console.error('Erro ao buscar clientes/leads:', error);
      toast({
        title: 'Erro na pesquisa',
        description: 'Não foi possível buscar clientes e leads.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    setSearchTerm(inputValue);
    
    // Debounce da pesquisa
    const timeoutId = setTimeout(() => {
      searchClients(inputValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleClientSelect = (client: Client) => {
    onChange(client.name);
    setShowResults(false);
    setSearchResults([]);
    
    if (onClientSelect) {
      onClientSelect(client);
    }
  };

  const handleSearchClick = () => {
    if (searchTerm) {
      searchClients(searchTerm);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSearchClick}
          disabled={isSearching}
          className="px-3"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Resultados da pesquisa */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((client) => (
            <div
              key={`${client.type}-${client.id}`}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleClientSelect(client)}
            >
              <div className="flex items-center gap-2">
                {client.type === 'client' ? (
                  <User className="h-4 w-4 text-blue-500" />
                ) : (
                  <Users className="h-4 w-4 text-green-500" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-sm">{client.name}</div>
                  <div className="text-xs text-gray-500 flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      client.type === 'client' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {client.type === 'client' ? 'Cliente' : 'Lead'}
                    </span>
                    {client.email && <span>{client.email}</span>}
                    {client.phone && <span>{client.phone}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensagem quando não há resultados */}
      {showResults && searchResults.length === 0 && searchTerm.length >= 2 && !isSearching && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
          <div className="text-sm text-gray-500 text-center">
            Nenhum cliente ou lead encontrado para "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSearch;

