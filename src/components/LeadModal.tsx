import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Lead, LeadModalProps } from '@/types';
import { api } from '@/services/api';

const LeadModal: React.FC<LeadModalProps> = ({ onClose, onSuccess, lead }) => {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    source: 'website' as Lead['source'],
    status: 'new' as Lead['status'],
    score: 0,
    tags: [] as string[],
    notes: '',
    budget: '',
    timeline: '',
    interests: [] as string[]
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        position: lead.position || '',
        source: lead.source || 'website',
        status: lead.status || 'new',
        score: lead.score || 0,
        tags: lead.tags?.map(tag => typeof tag === 'string' ? tag : tag.name) || [],
        notes: lead.notes || '',
        budget: lead.budget?.toString() || '',
        timeline: lead.timeline || '',
        interests: lead.interests || []
      });
    }
  }, [lead]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const leadData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : undefined
      };

      if (lead?.id) {
        await api.updateLead(lead.id, leadData);
      } else {
        await api.createLead(leadData);
      }

      await onSuccess();
      handleClose();
      
      toast({
        title: lead?.id ? 'Lead atualizado' : 'Lead criado',
        description: `${leadData.name} foi ${lead?.id ? 'atualizado' : 'criado'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar o lead.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const formFields = [
    { label: 'Nome', key: 'name', type: 'text', placeholder: 'Nome completo' },
    { label: 'Email', key: 'email', type: 'email', placeholder: 'email@exemplo.com' },
    { label: 'Telefone', key: 'phone', type: 'tel', placeholder: '(11) 99999-9999' },
    { label: 'Empresa', key: 'company', type: 'text', placeholder: 'Nome da empresa' },
    { label: 'Cargo', key: 'position', type: 'text', placeholder: 'Cargo/Função' },
    { 
      label: 'Fonte', 
      key: 'source', 
      type: 'select', 
      options: [
        { value: 'website', label: 'Website' },
        { value: 'referral', label: 'Indicação' },
        { value: 'social', label: 'Social' },
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Telefone' },
        { value: 'other', label: 'Outro' }
      ]
    },
    { 
      label: 'Status', 
      key: 'status', 
      type: 'select', 
      options: [
        { value: 'new', label: 'Novo' },
        { value: 'contacted', label: 'Contatado' },
        { value: 'qualified', label: 'Qualificado' },
        { value: 'proposal', label: 'Proposta' },
        { value: 'closed', label: 'Fechado' },
        { value: 'lost', label: 'Perdido' }
      ]
    },
    { label: 'Orçamento', key: 'budget', type: 'text', placeholder: 'R$ 0,00' },
    { label: 'Timeline', key: 'timeline', type: 'text', placeholder: 'Ex: 3 meses' }
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#0057B8] font-montserrat">
            {lead?.id ? 'Editar Lead' : 'Novo Lead'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {formFields.map((field) => (
            <div key={field.key} className="grid gap-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              {'options' in field ? (
                <Select
                  value={formData[field.key as keyof typeof formData] as string}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, [field.key]: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.key}
                  type={field.type}
                  placeholder={'placeholder' in field ? field.placeholder : ''}
                  value={formData[field.key as keyof typeof formData] as string}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                />
              )}
            </div>
          ))}

          <div className="grid gap-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Anotações sobre o lead..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
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

export default LeadModal;