import React, { useEffect, useState } from 'react';
import { Contract } from '@/types';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, FileCheck, Calendar, Download, Send } from 'lucide-react';
import ContractModal from '@/components/ContractModal';
import { secureLog } from '@/utils/security';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';

const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getContracts();
      setContracts(data);
    } catch (error) {
      secureLog('Failed to fetch contracts');
      toast({
        title: 'Erro ao carregar contratos',
        description: 'Não foi possível carregar a lista de contratos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateContract = () => {
    setSelectedContract(null);
    setIsModalOpen(true);
  };

  const handleEditContract = (contract: Contract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const handleDeleteContract = async (contractId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      try {
        await apiService.deleteContract(contractId);
        toast({
          title: 'Contrato excluído',
          description: 'Contrato excluído com sucesso.',
        });
        fetchContracts();
      } catch (error) {
        secureLog('Failed to delete contract');
        toast({
          title: 'Erro ao excluir',
          description: 'Não foi possível excluir o contrato.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContract(null);
  };

  const handleModalSuccess = () => {
    fetchContracts();
    handleCloseModal();
  };

  const handleSendToD4Sign = async (contract: Contract) => {
    try {
      await apiService.sendContractToD4Sign(contract.id);
      toast({
        title: 'Contrato enviado',
        description: 'Contrato enviado para assinatura via D4Sign.',
      });
      fetchContracts();
    } catch (error) {
      secureLog('Failed to send to D4Sign');
      toast({
        title: 'Erro ao enviar',
        description: 'Não foi possível enviar o contrato para assinatura.',
        variant: 'destructive',
      });
    }
  };

  const handleExportContracts = () => {
    try {
      const exportData = contracts.map(contract => ({
        ID: contract.id,
        Título: contract.titulo || contract.title,
        'Cliente ID': contract.cliente_id || contract.client_id,
        'Nome do Cliente': contract.client_name || '',
        'Email do Cliente': contract.client_email || '',
        Valor: contract.amount,
        Status: contract.status,
        'Data de Início': contract.start_date ? new Date(contract.start_date).toLocaleDateString('pt-BR') : '',
        'Data de Fim': contract.end_date ? new Date(contract.end_date).toLocaleDateString('pt-BR') : '',
        'Validade': contract.validade ? new Date(contract.validade).toLocaleDateString('pt-BR') : '',
        'D4Sign ID': contract.d4sign_document_id || '',
        'Data de Criação': contract.data_criacao ? 
          new Date(contract.data_criacao).toLocaleDateString('pt-BR') : 
          (contract.created_at ? new Date(contract.created_at).toLocaleDateString('pt-BR') : ''),
      }));

      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => `"${row[header] || ''}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `contratos_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Exportação concluída',
        description: 'Lista de contratos exportada com sucesso.',
      });
    } catch (error) {
      secureLog('Failed to export contracts');
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar a lista de contratos.',
        variant: 'destructive',
      });
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const title = contract.titulo || contract.title || '';
    const clientName = contract.client_name || '';
    
    return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'expirado':
        return 'bg-red-100 text-red-800';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'assinado':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Contratos</h1>
        </div>
        <LoadingSpinner size="lg" text="Carregando contratos..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Contratos</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportContracts}
            disabled={contracts.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleCreateContract}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Contrato
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar contratos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredContracts.length === 0 && !isLoading ? (
        <EmptyState
          icon={FileCheck}
          title={searchTerm ? 'Nenhum contrato encontrado' : 'Nenhum contrato criado ainda'}
          description={searchTerm ? 'Nenhum contrato encontrado com os filtros aplicados.' : 'Crie seu primeiro contrato para começar.'}
          action={
            <Button className="bg-primary hover:bg-primary/90" onClick={handleCreateContract}>
              <Plus className="w-4 h-4 mr-2" />
              {searchTerm ? 'Novo Contrato' : 'Criar Primeiro Contrato'}
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Título</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-primary" />
                        <div>
                          <div className="font-medium">{contract.titulo || contract.title}</div>
                          <div className="text-sm text-muted-foreground">ID: {contract.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{contract.client_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{contract.client_email || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {contract.lead_id ? `Lead ID: ${contract.lead_id}` : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(contract.status)}>
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {contract.validade ? 
                          new Date(contract.validade).toLocaleDateString('pt-BR') : 
                          (contract.end_date ? 
                            new Date(contract.end_date).toLocaleDateString('pt-BR') : 'N/A'
                          )
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      {contract.data_criacao ? 
                        new Date(contract.data_criacao).toLocaleDateString('pt-BR') : 
                        (contract.created_at ? 
                          new Date(contract.created_at).toLocaleDateString('pt-BR') : 
                          (contract.createdAt ? 
                            new Date(contract.createdAt).toLocaleDateString('pt-BR') : 'N/A'
                          )
                        )
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditContract(contract)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!contract.d4sign_document_id && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSendToD4Sign(contract)}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteContract(contract.id)}
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
      )}

      <ContractModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        contract={selectedContract}
      />
    </div>
  );
};

export default Contracts;

