import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Bot, Plus, Eye, Edit, Trash2, Play, Pause } from 'lucide-react';
import { Smartbot } from '@/types';
import SmartbotModal from '@/components/SmartbotModal';

const SmartbotPage: React.FC = () => {
  const [smartbots, setSmartbots] = useState<Smartbot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSmartbot, setSelectedSmartbot] = useState<Smartbot | undefined>();
  const { toast } = useToast();

  const fetchSmartbots = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getSmartbots();
      setSmartbots(data || []);
    } catch (error) {
      console.error('Failed to fetch smartbots:', error);
      toast({
        title: 'Erro ao carregar smartbots',
        description: 'Não foi possível carregar a lista de smartbots.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSmartbots();
  }, []);

  const handleCreateSmartbot = () => {
    setSelectedSmartbot(undefined);
    setIsModalOpen(true);
  };

  const handleEditSmartbot = (smartbot: Smartbot) => {
    setSelectedSmartbot(smartbot);
    setIsModalOpen(true);
  };

  const handleDeleteSmartbot = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este smartbot?')) {
      return;
    }

    try {
      await apiService.deleteSmartbot(id);
      toast({
        title: 'Smartbot excluído',
        description: 'O smartbot foi excluído com sucesso.',
      });
      fetchSmartbots();
    } catch (error) {
      console.error('Failed to delete smartbot:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o smartbot.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (smartbot: Smartbot) => {
    const newStatus = smartbot.status === 'ativo' ? 'pausado' : 'ativo';
    
    try {
      await apiService.updateSmartbot(smartbot.id, {
        ...smartbot,
        status: newStatus
      });
      toast({
        title: 'Status atualizado',
        description: `Smartbot ${newStatus === 'ativo' ? 'ativado' : 'pausado'} com sucesso.`,
      });
      fetchSmartbots();
    } catch (error) {
      console.error('Failed to toggle smartbot status:', error);
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível atualizar o status do smartbot.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { variant: 'default' as const, label: 'Ativo' },
      inativo: { variant: 'secondary' as const, label: 'Inativo' },
      pausado: { variant: 'outline' as const, label: 'Pausado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inativo;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCanalBadge = (canal: string) => {
    const canalConfig = {
      whatsapp: { color: 'bg-green-100 text-green-800', label: 'WhatsApp' },
      telegram: { color: 'bg-blue-100 text-blue-800', label: 'Telegram' },
      webchat: { color: 'bg-purple-100 text-purple-800', label: 'Web Chat' },
      email: { color: 'bg-orange-100 text-orange-800', label: 'Email' }
    };

    const config = canalConfig[canal as keyof typeof canalConfig] || canalConfig.webchat;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary">Smartbots</h1>
        </div>
        <Button onClick={handleCreateSmartbot} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Smartbot
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Smartbots</CardTitle>
          <CardDescription>
            Gerencie seus assistentes virtuais e automações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : smartbots.length === 0 ? (
            <EmptyState
              icon={Bot}
              title="Nenhum smartbot encontrado"
              description="Crie seu primeiro smartbot para automatizar atendimentos"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {smartbots.map((smartbot) => (
                    <TableRow key={smartbot.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{smartbot.nome}</div>
                          {smartbot.descricao && (
                            <div className="text-sm text-muted-foreground">
                              {smartbot.descricao}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(smartbot.status)}
                      </TableCell>
                      <TableCell>
                        {getCanalBadge(smartbot.canal)}
                      </TableCell>
                      <TableCell>
                        {formatDate(smartbot.data_criacao)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(smartbot)}
                            title={smartbot.status === 'ativo' ? 'Pausar' : 'Ativar'}
                          >
                            {smartbot.status === 'ativo' ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSmartbot(smartbot)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSmartbot(smartbot.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
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

      <SmartbotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSmartbots}
        smartbot={selectedSmartbot}
      />
    </div>
  );
};

export default SmartbotPage;