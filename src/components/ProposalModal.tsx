
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Proposal } from '@/types';
import { api } from '@/services/api';

interface ProposalModalProps {
  trigger: React.ReactNode;
  proposal?: Proposal;
  onSave?: (proposal: Proposal) => void;
}

const ProposalModal: React.FC<ProposalModalProps> = ({ trigger, proposal, onSave }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    description: '',
    amount: 0,
    discount: 0,
    total_amount: 0,
    status: 'draft' as const,
    valid_until: '',
    template_id: '',
    notes: '',
    number: '',
    content: ''
  });

  useEffect(() => {
    if (proposal && open) {
      setFormData({
        title: proposal.title || '',
        client_id: proposal.client_id || '',
        description: proposal.description || '',
        amount: proposal.amount || 0,
        discount: proposal.discount || 0,
        total_amount: proposal.total_amount || 0,
        status: proposal.status || 'draft',
        valid_until: proposal.valid_until || '',
        template_id: proposal.template_id || '',
        notes: proposal.notes || '',
        number: proposal.number || '',
        content: proposal.content || ''
      });
    }
  }, [proposal, open]);

  const calculateTotal = () => {
    const total = formData.amount - (formData.amount * formData.discount / 100);
    setFormData(prev => ({ ...prev, total_amount: total }));
  };

  useEffect(() => {
    calculateTotal();
  }, [formData.amount, formData.discount]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const proposalData = {
        ...formData,
        status: formData.status as 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
      };

      let savedProposal;
      if (proposal?.id) {
        savedProposal = await api.updateProposal(proposal.id, proposalData);
      } else {
        savedProposal = await api.createProposal(proposalData);
      }

      onSave?.(savedProposal);
      setOpen(false);
      
      toast({
        title: proposal?.id ? 'Proposta atualizada' : 'Proposta criada',
        description: `${proposalData.title} foi ${proposal?.id ? 'atualizada' : 'criada'} com sucesso.`,
      });
    } catch (error) {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#0057B8] font-montserrat">
            {proposal?.id ? 'Editar Proposta' : 'Nova Proposta'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título da proposta"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="client_id">Cliente</Label>
            <Input
              id="client_id"
              value={formData.client_id}
              onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
              placeholder="ID do cliente"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da proposta"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="discount">Desconto (%)</Label>
              <Input
                id="discount"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Valor Total</Label>
            <div className="text-2xl font-bold text-[#0057B8]">
              R$ {formData.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
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
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="sent">Enviada</SelectItem>
                <SelectItem value="viewed">Visualizada</SelectItem>
                <SelectItem value="accepted">Aceita</SelectItem>
                <SelectItem value="rejected">Rejeitada</SelectItem>
                <SelectItem value="expired">Expirada</SelectItem>
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

          <div className="grid gap-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações sobre a proposta"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="bg-[#0057B8] hover:bg-[#003d82]"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalModal;
