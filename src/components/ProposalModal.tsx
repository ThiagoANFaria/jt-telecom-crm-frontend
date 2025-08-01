import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Proposal } from '@/types';
import { apiService } from '@/services/api';
import ClientSearch from '@/components/ClientSearch';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  proposal?: Proposal | null;
}

const ProposalModal: React.FC<ProposalModalProps> = ({ isOpen, onClose, onSuccess, proposal }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<{
    title: string;
    client_id: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    description: string;
    amount: number;
    discount: number;
    total_amount: number;
    status: 'rascunho' | 'enviada' | 'aceita' | 'rejeitada' | 'revisao';
    valid_until: string;
    notes: string;
    number: string;
    content: string;
  }>({
    title: '',
    client_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    description: '',
    amount: 0,
    discount: 0,
    total_amount: 0,
    status: 'rascunho',
    valid_until: '',
    notes: '',
    number: '',
    content: ''
  });

  useEffect(() => {
    if (proposal && isOpen) {
      setFormData({
        title: proposal.title || '',
        client_id: proposal.client_id || '',
        client_name: proposal.client_name || '',
        client_email: proposal.client_email || '',
        client_phone: proposal.client_phone || '',
        description: proposal.description || '',
        amount: proposal.amount || 0,
        discount: proposal.discount || 0,
        total_amount: proposal.total_amount || 0,
        status: (proposal.status as 'rascunho' | 'enviada' | 'aceita' | 'rejeitada' | 'revisao') || 'rascunho',
        valid_until: proposal.valid_until || '',
        notes: proposal.notes || '',
        number: proposal.number || '',
        content: proposal.content || ''
      });
    } else if (isOpen && !proposal) {
      // Reset form for new proposal
      setFormData({
        title: '',
        client_id: '',
        client_name: '',
        client_email: '',
        client_phone: '',
        description: '',
        amount: 0,
        discount: 0,
        total_amount: 0,
        status: 'rascunho',
        valid_until: '',
        notes: '',
        number: '',
        content: ''
      });
    }
  }, [proposal, isOpen]);

  const calculateTotal = () => {
    const total = formData.amount - (formData.amount * formData.discount / 100);
    setFormData(prev => ({ ...prev, total_amount: total }));
  };

  useEffect(() => {
    calculateTotal();
  }, [formData.amount, formData.discount]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'O título da proposta é obrigatório.',
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

    try {
      setLoading(true);
      
      const proposalData = {
        ...formData,
        status: formData.status as 'rascunho' | 'enviada' | 'aceita' | 'rejeitada' | 'revisao'
      };

      if (proposal?.id) {
        await apiService.updateProposal(proposal.id, proposalData);
        toast({
          title: 'Proposta atualizada',
          description: `${proposalData.title} foi atualizada com sucesso.`,
        });
      } else {
        await apiService.createProposal(proposalData);
        toast({
          title: 'Proposta criada',
          description: `${proposalData.title} foi criada com sucesso.`,
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save proposal:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao salvar a proposta.',
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
            {proposal?.id ? 'Editar Proposta' : 'Nova Proposta'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título da proposta"
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
              placeholder="Descrição da proposta"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
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
              <Label htmlFor="discount">Desconto (%)</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            <div className="grid gap-2">
              <Label>Valor Total</Label>
              <div className="flex items-center h-10 px-3 py-2 border border-input bg-background rounded-md text-sm">
                <span className="text-[#0057B8] font-semibold">
                  R$ {formData.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="enviada">Enviada</SelectItem>
                  <SelectItem value="aceita">Aceita</SelectItem>
                  <SelectItem value="rejeitada">Rejeitada</SelectItem>
                  <SelectItem value="revisao">Em Revisão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="valid_until">Válida até</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações sobre a proposta"
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
            {loading ? 'Salvando...' : (proposal?.id ? 'Atualizar' : 'Criar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalModal;

