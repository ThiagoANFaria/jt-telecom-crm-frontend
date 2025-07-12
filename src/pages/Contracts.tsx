import React, { useEffect, useState } from 'react';
import { Contract } from '@/types';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, FileCheck, DollarSign, Calendar, Download, Send } from 'lucide-react';
import ContractModal from '@/components/ContractModal';

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
      console.error('Failed to fetch contracts:', error);
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
        console.error('Failed to delete contract:', error);
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
      console.error('Failed to send to D4Sign:', error);
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
        Título: contract.title,
        'Nome do Cliente': contract.client_name || '',
        'Email do Cliente': contract.client_email || '',
        Valor: contract.amount,
        Status: contract.status,
        'Data de Início': contract.start_date ? new Date(contract.start_date).toLocaleDateString('pt-BR') : '',
        'Data de Fim': contract.end_date ? new Date(contract.end_date).toLocaleDateString('pt-BR') : '',
        'D4Sign ID': contract.d4sign_document_id || '',
        'Data de Criação': new Date(contract.created_at).toLocaleDateString('pt-BR'),
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
      console.error('Failed to export contracts:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar a lista de contratos.',
        variant: 'destructive',
      });
    }
  };

  const filteredContracts = contracts.filter(contract =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contract.client_name && contract.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h1 className="text-3xl font-bold text-[#0057B8]">Contratos</h1>
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
        <h1 className="text-3xl font-bold text-[#0057B8]">Contratos</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportContracts}
            disabled={contracts.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-[#0057B8] hover:bg-[#003d82]" onClick={handleCreateContract}>
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
        <Card>
          <CardContent className="text-center py-12">
            <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 mb-4">
              {searchTerm ? 'Nenhum contrato encontrado com os filtros aplicados.' : 'Nenhum contrato criado ainda.'}
            </div>
            <Button className="bg-[#0057B8] hover:bg-[#003d82]" onClick={handleCreateContract}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Contrato
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Título</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>D4Sign</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-[#0057B8]" />
                        <div>
                          <div className="font-medium">{contract.title}</div>
                          <div className="text-sm text-gray-500">ID: {contract.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{contract.client_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{contract.client_email || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-semibold text-[#0057B8]">
                        <DollarSign className="w-4 h-4" />
                        R$ {contract.amount?.toLocaleString('pt-BR') || '0'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(contract.status)}>
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {contract.start_date ? 
                            new Date(contract.start_date).toLocaleDateString('pt-BR') : 
                            'N/A'
                          }
                        </div>
                        <div className="text-gray-500">
                          até {contract.end_date ? 
                            new Date(contract.end_date).toLocaleDateString('pt-BR') : 
                            'N/A'
                          }
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {contract.d4sign_document_id ? (
                        <Badge variant="outline" className="text-green-600">
                          Enviado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Não enviado
                        </Badge>
                      )}
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

