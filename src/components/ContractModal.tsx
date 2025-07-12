import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Contract } from '@/types';
import { apiService } from '@/services/api';
import ClientSearch from '@/components/ClientSearch';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contract?: Contract | null;
}

const ContractModal: React.FC<ContractModalProps> = ({ isOpen, onClose, onSuccess, contract }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    description: '',
    amount: 0,
    status: 'pendente' as const,
    start_date: '',
    end_date: '',
    template_id: '',
    notes: '',
    content: ''
  });

  useEffect(() => {
    if (contract && isOpen) {
      setFormData({
        title: contract.title || '',
        client_id: contract.client_id || '',
        client_name: contract.client_name || '',
        client_email: contract.client_email || '',
        client_phone: contract.client_phone || '',
        description: contract.description || '',
        amount: contract.amount || 0,
        status: contract.status || 'pendente',
        start_date: contract.start_date || '',
        end_date: contract.end_date || '',
        template_id: contract.template_id || '',
        notes: contract.notes || '',
        content: contract.content || ''
      });
    } else if (isOpen && !contract) {
      // Reset form for new contract
      setFormData({
        title: '',
        client_id: '',
        client_name: '',
        client_email: '',
        client_phone: '',
        description: '',
        amount: 0,
        status: 'pendente',
        start_date: '',
        end_date: '',
        template_id: '',
        notes: '',
        content: ''
      });
    }
  }, [contract, isOpen]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'O título do contrato é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.client_name.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'O nome do cliente é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.start_date) {
      toast({
        title: 'Erro de validação',
        description: 'A data de início é obrigatória.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.end_date) {
      toast({
        title: 'Erro de validação',
        description: 'A data de fim é obrigatória.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const contractData = {
        ...formData,
        status: formData.status as 'pendente' | 'ativo' | 'expirado' | 'cancelado' | 'assinado'
      };

      if (contract?.id) {
        await apiService.updateContract(contract.id, contractData);
        toast({
          title: 'Contrato atualizado',
          description: `${contractData.title} foi atualizado com sucesso.`,
        });
      } else {
        await apiService.createContract(contractData);
        toast({
          title: 'Contrato criado',
          description: `${contractData.title} foi criado com sucesso.`,
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save contract:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao salvar o contrato.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#0057B8] font-semibold">
            {contract?.id ? 'Editar Contrato' : 'Novo Contrato'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título do contrato"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="client_name">Nome do Cliente *</Label>
              <ClientSearch
                value={formData.client_name}
                onChange={(value) => setFormData(prev => ({ ...prev, client_name: value }))}
                onClientSelect={(client) => {
                  setFormData(prev => ({
                    ...prev,
                    client_id: client.id,
                    client_name: client.name,
                    client_email: client.email || prev.client_email,
                    client_phone: client.phone || prev.client_phone
                  }));
                }}
                placeholder="Digite o nome do cliente ou lead"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client_id">ID do Cliente</Label>
              <Input
                id="client_id"
                value={formData.client_id}
                onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                placeholder="ID do cliente"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="client_email">Email do Cliente</Label>
              <Input
                id="client_email"
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client_phone">Telefone do Cliente</Label>
              <Input
                id="client_phone"
                value={formData.client_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do contrato"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as typeof formData.status }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="assinado">Assinado</SelectItem>
                  <SelectItem value="expirado">Expirado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start_date">Data de Início *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="end_date">Data de Fim *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Conteúdo do Contrato</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Conteúdo detalhado do contrato"
              rows={5}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações sobre o contrato"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="bg-[#0057B8] hover:bg-[#003d82]"
          >
            {loading ? 'Salvando...' : (contract?.id ? 'Atualizar' : 'Criar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContractModal;

