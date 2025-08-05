import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { dealService, pipelineService, stageService } from '@/services/pipelines';
import { leadsService } from '@/services/leads';
import { clientsService } from '@/services/clients';

interface Deal {
  id?: string;
  title: string;
  description?: string;
  value?: number;
  probability?: number;
  expected_close_date?: string;
  pipeline_id: string;
  stage_id: string;
  lead_id?: string;
  client_id?: string;
}

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: Deal | null;
  pipelineId?: string;
  stageId?: string;
  onSuccess: () => void;
}

export const DealModal: React.FC<DealModalProps> = ({
  isOpen,
  onClose,
  deal,
  pipelineId,
  stageId,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Deal>({
    title: '',
    description: '',
    value: 0,
    probability: 50,
    pipeline_id: pipelineId || '',
    stage_id: stageId || '',
    expected_close_date: ''
  });

  const [pipelines, setPipelines] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (deal) {
      setFormData(deal);
      if (deal.pipeline_id) {
        loadStages(deal.pipeline_id);
      }
    } else {
      setFormData({
        title: '',
        description: '',
        value: 0,
        probability: 50,
        pipeline_id: pipelineId || '',
        stage_id: stageId || '',
        expected_close_date: ''
      });
      if (pipelineId) {
        loadStages(pipelineId);
      }
    }
  }, [deal, isOpen, pipelineId, stageId]);

  const loadInitialData = async () => {
    setIsLoadingData(true);
    try {
      const [pipelinesData, leadsData, clientsData] = await Promise.all([
        pipelineService.getPipelines(),
        leadService.getLeads(),
        clientService.getClients()
      ]);

      setPipelines(pipelinesData);
      setLeads(leadsData);
      setClients(clientsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados necessários',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadStages = async (pipelineId: string) => {
    try {
      const stagesData = await stageService.getStages(pipelineId);
      setStages(stagesData);
    } catch (error) {
      console.error('Erro ao carregar estágios:', error);
    }
  };

  const handlePipelineChange = (selectedPipelineId: string) => {
    setFormData(prev => ({
      ...prev,
      pipeline_id: selectedPipelineId,
      stage_id: '' // Reset stage when pipeline changes
    }));
    loadStages(selectedPipelineId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Erro',
        description: 'Título do negócio é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.pipeline_id || !formData.stage_id) {
      toast({
        title: 'Erro',
        description: 'Pipeline e estágio são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const dealData = {
        title: formData.title,
        description: formData.description,
        value: formData.value || 0,
        probability: formData.probability || 0,
        expected_close_date: formData.expected_close_date || null,
        pipeline_id: formData.pipeline_id,
        stage_id: formData.stage_id,
        lead_id: formData.lead_id || null,
        client_id: formData.client_id || null
      };

      if (deal?.id) {
        await dealService.updateDeal(deal.id, dealData);
        toast({
          title: 'Sucesso',
          description: 'Negócio atualizado com sucesso!',
        });
      } else {
        await dealService.createDeal(dealData);
        toast({
          title: 'Sucesso',
          description: 'Negócio criado com sucesso!',
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar negócio:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar negócio. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {deal?.id ? 'Editar Negócio' : 'Novo Negócio'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Título do Negócio *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Venda de sistema CRM para empresa X"
                required
              />
            </div>

            <div>
              <Label htmlFor="pipeline">Pipeline *</Label>
              <Select
                value={formData.pipeline_id}
                onValueChange={handlePipelineChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o pipeline" />
                </SelectTrigger>
                <SelectContent>
                  {pipelines.map((pipeline) => (
                    <SelectItem key={pipeline.id} value={pipeline.id}>
                      {pipeline.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stage">Estágio *</Label>
              <Select
                value={formData.stage_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, stage_id: value }))}
                required
                disabled={!formData.pipeline_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estágio" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                type="number"
                min="0"
                step="0.01"
                value={formData.value || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor="probability">Probabilidade (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
                placeholder="50"
              />
            </div>

            <div>
              <Label htmlFor="expected_close_date">Data Prevista de Fechamento</Label>
              <Input
                id="expected_close_date"
                type="date"
                value={formData.expected_close_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_close_date: e.target.value }))}
              />
            </div>
          </div>

          {/* Associações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lead">Lead Relacionado</Label>
              <Select
                value={formData.lead_id || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, lead_id: value || undefined, client_id: undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um lead (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum lead</SelectItem>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name} - {lead.company || 'Sem empresa'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="client">Cliente Relacionado</Label>
              <Select
                value={formData.client_id || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value || undefined, lead_id: undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum cliente</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.company || 'Sem empresa'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva os detalhes do negócio..."
              rows={4}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Salvando...' : (deal?.id ? 'Atualizar' : 'Criar Negócio')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};