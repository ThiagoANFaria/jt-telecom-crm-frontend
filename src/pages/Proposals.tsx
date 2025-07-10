
import React, { useEffect, useState } from 'react';
import { Proposal } from '@/types';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, FileText, DollarSign, Download, Mail, MessageCircle } from 'lucide-react';
import ProposalModal from '@/components/ProposalModal';

const Proposals: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getProposals();
      setProposals(data);
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
      toast({
        title: 'Erro ao carregar propostas',
        description: 'Não foi possível carregar a lista de propostas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProposal = () => {
    setSelectedProposal(null);
    setIsModalOpen(true);
  };

  const handleEditProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsModalOpen(true);
  };

  const handleDeleteProposal = async (proposalId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta proposta?')) {
      try {
        await apiService.deleteProposal(proposalId);
        toast({
          title: 'Proposta excluída',
          description: 'Proposta excluída com sucesso.',
        });
        fetchProposals();
      } catch (error) {
        console.error('Failed to delete proposal:', error);
        toast({
          title: 'Erro ao excluir',
          description: 'Não foi possível excluir a proposta.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProposal(null);
  };

  const handleModalSuccess = () => {
    fetchProposals();
  };

  const handleExportProposals = () => {
    try {
      // Preparar dados para exportação
      const exportData = proposals.map(proposal => ({
        ID: proposal.id,
        Título: proposal.title,
        'Cliente ID': proposal.client_id,
        'Nome do Cliente': proposal.client_name || '',
        'Email do Cliente': proposal.client_email || '',
        'Telefone do Cliente': proposal.client_phone || '',
        Descrição: proposal.description || '',
        Valor: proposal.amount,
        Desconto: proposal.discount || 0,
        'Valor Total': proposal.total_amount,
        Status: proposal.status,
        'Válida até': proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString('pt-BR') : '',
        Observações: proposal.notes || '',
        'Data de Criação': new Date(proposal.created_at).toLocaleDateString('pt-BR'),
        'Última Atualização': new Date(proposal.updated_at).toLocaleDateString('pt-BR'),
      }));

      // Converter para CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => `"${row[header] || ''}"`).join(',')
        )
      ].join('\n');

      // Download do arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `propostas_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Exportação concluída',
        description: 'Lista de propostas exportada com sucesso.',
      });
    } catch (error) {
      console.error('Failed to export proposals:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar a lista de propostas.',
        variant: 'destructive',
      });
    }
  };

  const handleSendEmail = async (proposal: Proposal) => {
    try {
      await apiService.sendProposalByEmail(proposal.id, proposal.client_email || 'cliente@exemplo.com');
      toast({
        title: 'Email enviado',
        description: 'Proposta enviada por email com sucesso.',
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      toast({
        title: 'Erro ao enviar email',
        description: 'Não foi possível enviar a proposta por email.',
        variant: 'destructive',
      });
    }
  };

  const handleSendWhatsApp = async (proposal: Proposal) => {
    try {
      await apiService.sendProposalByWhatsApp(proposal.id, proposal.client_phone || '11999999999');
      toast({
        title: 'WhatsApp enviado',
        description: 'Proposta enviada por WhatsApp com sucesso.',
      });
    } catch (error) {
      console.error('Failed to send WhatsApp:', error);
      toast({
        title: 'Erro ao enviar WhatsApp',
        description: 'Não foi possível enviar a proposta por WhatsApp.',
        variant: 'destructive',
      });
    }
  };

  const filteredProposals = proposals.filter(proposal =>
    proposal.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'enviada':
        return 'bg-blue-100 text-blue-800';
      case 'aceita':
        return 'bg-green-100 text-green-800';
      case 'rejeitada':
        return 'bg-red-100 text-red-800';
      case 'revisao':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-jt-blue">Propostas</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-jt-blue">Propostas</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportProposals}
            disabled={proposals.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-jt-blue hover:bg-blue-700" onClick={handleCreateProposal}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Proposta
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar propostas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProposals.map((proposal) => (
          <Card key={proposal.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {proposal.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Cliente ID: {proposal.client_id}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(proposal.status)}>
                  {proposal.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-lg font-semibold text-jt-blue">
                  <DollarSign className="w-5 h-5" />
                  <span>R$ {proposal.amount.toLocaleString('pt-BR')}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Criada em: {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
                </div>
                <div className="text-xs text-gray-500">
                  Atualizada em: {new Date(proposal.updated_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditProposal(proposal)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSendEmail(proposal)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Mail className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSendWhatsApp(proposal)}
                  className="text-green-600 hover:text-green-700"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteProposal(proposal.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProposals.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm ? 'Nenhuma proposta encontrada com os filtros aplicados.' : 'Nenhuma proposta criada ainda.'}
            </div>
            <Button className="mt-4 bg-jt-blue hover:bg-blue-700" onClick={handleCreateProposal}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Proposta
            </Button>
          </CardContent>
        </Card>
      )}

      {isModalOpen && (
        <ProposalModal
          onClose={handleCloseModal}
          onSuccess={handleModalSuccess}
          proposal={selectedProposal}
        />
      )}
    </div>
  );
};

export default Proposals;
