import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Mail, Phone, MessageSquare, Star, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Lead } from '@/types';
import { api } from '@/services/api';

interface LeadModalProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  lead?: Lead;
  onSave?: (lead: Lead) => void;
}

const LeadModal: React.FC<LeadModalProps> = ({ trigger, isOpen: externalOpen, onClose, onSuccess, lead, onSave }) => {
  const [open, setOpen] = useState(false);
  const actualOpen = externalOpen !== undefined ? externalOpen : open;
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    company: string;
    position: string;
    source: 'website' | 'referral' | 'social' | 'email' | 'phone' | 'other';
    status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed' | 'lost';
    score: number;
    tags: string[];
    notes: string;
    budget: string;
    timeline: string;
    interests: string[];
  }>({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    source: 'website',
    status: 'new',
    score: 0,
    tags: [],
    notes: '',
    budget: '',
    timeline: '',
    interests: []
  });

  useEffect(() => {
    if (lead && open) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        position: lead.position || '',
        source: (lead.source === 'Website' ? 'website' : lead.source === 'Instagram' ? 'social' : lead.source === 'Indicação' ? 'referral' : lead.source) || 'website',
        status: (lead.status === 'Novo' ? 'new' : lead.status === 'Qualificado' ? 'qualified' : lead.status === 'Em Negociação' ? 'proposal' : lead.status) || 'new',
        score: lead.score || 0,
        tags: Array.isArray(lead.tags) ? lead.tags.map(tag => typeof tag === 'string' ? tag : tag.name) : [],
        notes: lead.notes || '',
        budget: lead.budget?.toString() || '',
        timeline: lead.timeline || '',
        interests: lead.interests || []
      });
    }
  }, [lead, open]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const leadData = {
        ...formData,
        source: formData.source as 'website' | 'social' | 'referral' | 'phone' | 'email' | 'event' | 'ad',
        status: formData.status as 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
      };

      let savedLead;
      if (lead?.id) {
        savedLead = await api.updateLead(lead.id, leadData);
      } else {
        savedLead = await api.createLead(leadData);
      }

      onSave?.(savedLead);
      onSuccess?.();
      if (onClose) {
        onClose();
      } else {
        setOpen(false);
      }
      
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
      options: ['website', 'social', 'referral', 'phone', 'email', 'event', 'ad'] 
    },
    { 
      label: 'Status', 
      key: 'status', 
      type: 'select', 
      options: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] 
    },
    { label: 'Orçamento', key: 'budget', type: 'text', placeholder: 'R$ 0,00' },
    { label: 'Timeline', key: 'timeline', type: 'text', placeholder: 'Ex: 3 meses' }
  ];

  return (
    <Dialog open={actualOpen} onOpenChange={onClose || setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
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
                      <SelectItem key={option} value={option}>
                        {option}
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
          <Button variant="outline" onClick={onClose || (() => setOpen(false))}>
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
