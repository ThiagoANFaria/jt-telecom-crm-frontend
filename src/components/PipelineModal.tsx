import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { pipelineService, stageService } from '@/services/pipelines';
import { Plus, X, GripVertical } from 'lucide-react';

interface Pipeline {
  id?: string;
  name: string;
  description?: string;
  is_active?: boolean;
  stages?: PipelineStage[];
}

interface PipelineStage {
  id?: string;
  name: string;
  color?: string;
  position?: number;
}

interface PipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipeline?: Pipeline | null;
  onSuccess: () => void;
}

const defaultStages: PipelineStage[] = [
  { name: 'Prospecção', color: '#3B82F6' },
  { name: 'Qualificação', color: '#6366F1' },
  { name: 'Proposta', color: '#8B5CF6' },
  { name: 'Negociação', color: '#F59E0B' },
  { name: 'Fechamento', color: '#10B981' }
];

export const PipelineModal: React.FC<PipelineModalProps> = ({
  isOpen,
  onClose,
  pipeline,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Pipeline>({
    name: '',
    description: '',
    stages: [...defaultStages]
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (pipeline) {
      setFormData({
        ...pipeline,
        stages: pipeline.stages || [...defaultStages]
      });
    } else {
      setFormData({
        name: '',
        description: '',
        stages: [...defaultStages]
      });
    }
  }, [pipeline, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome do pipeline é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    if (formData.stages.length === 0) {
      toast({
        title: 'Erro',
        description: 'Pipeline deve ter pelo menos um estágio',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      let savedPipeline;

      if (pipeline?.id) {
        // Atualizar pipeline existente
        savedPipeline = await pipelineService.updatePipeline(pipeline.id, {
          name: formData.name,
          description: formData.description
        });

        // Atualizar estágios
        const existingStages = pipeline.stages || [];
        
        // Atualizar estágios existentes
        for (const stage of formData.stages) {
          if (stage.id) {
            await stageService.updateStage(stage.id, {
              name: stage.name,
              color: stage.color
            });
          } else {
            // Criar novo estágio
            await stageService.createStage({
              pipeline_id: savedPipeline.id,
              name: stage.name,
              color: stage.color
            });
          }
        }

        // Remover estágios que foram excluídos
        const stageIdsToKeep = formData.stages
          .filter(s => s.id)
          .map(s => s.id);
        
        for (const existingStage of existingStages) {
          if (existingStage.id && !stageIdsToKeep.includes(existingStage.id)) {
            await stageService.deleteStage(existingStage.id);
          }
        }
      } else {
        // Criar novo pipeline
        savedPipeline = await pipelineService.createPipeline({
          name: formData.name,
          description: formData.description
        });

        // Criar estágios
        for (let i = 0; i < formData.stages.length; i++) {
          const stage = formData.stages[i];
          await stageService.createStage({
            pipeline_id: savedPipeline.id,
            name: stage.name,
            color: stage.color || '#3B82F6'
          });
        }
      }

      toast({
        title: 'Sucesso',
        description: `Pipeline ${pipeline?.id ? 'atualizado' : 'criado'} com sucesso!`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar pipeline:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar pipeline. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addStage = () => {
    setFormData(prev => ({
      ...prev,
      stages: [
        ...prev.stages,
        { name: '', color: '#3B82F6' }
      ]
    }));
  };

  const removeStage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index)
    }));
  };

  const updateStage = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.map((stage, i) => 
        i === index ? { ...stage, [field]: value } : stage
      )
    }));
  };

  const moveStage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.stages.length) return;

    setFormData(prev => {
      const newStages = [...prev.stages];
      [newStages[index], newStages[newIndex]] = [newStages[newIndex], newStages[index]];
      return { ...prev, stages: newStages };
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {pipeline?.id ? 'Editar Pipeline' : 'Novo Pipeline'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações básicas */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Pipeline *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Vendas B2B"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o objetivo deste pipeline..."
                rows={3}
              />
            </div>
          </div>

          {/* Estágios */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Estágios do Pipeline</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStage}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Estágio
              </Button>
            </div>

            <div className="space-y-3">
              {formData.stages.map((stage, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    <Badge 
                      variant="outline" 
                      className="px-2 py-1 text-xs font-medium"
                      style={{ borderColor: stage.color, color: stage.color }}
                    >
                      {index + 1}
                    </Badge>
                  </div>

                  <div className="flex-1">
                    <Input
                      value={stage.name}
                      onChange={(e) => updateStage(index, 'name', e.target.value)}
                      placeholder="Nome do estágio"
                      className="text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={stage.color || '#3B82F6'}
                      onChange={(e) => updateStage(index, 'color', e.target.value)}
                      className="w-8 h-8 rounded border cursor-pointer"
                      title="Cor do estágio"
                    />
                    
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStage(index, 'up')}
                        disabled={index === 0}
                        className="h-6 px-2"
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStage(index, 'down')}
                        disabled={index === formData.stages.length - 1}
                        className="h-6 px-2"
                      >
                        ↓
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStage(index)}
                      disabled={formData.stages.length === 1}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {formData.stages.length === 0 && (
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 mb-3">Nenhum estágio adicionado</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addStage}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Primeiro Estágio
                </Button>
              </div>
            )}
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
              {isLoading ? 'Salvando...' : (pipeline?.id ? 'Atualizar' : 'Criar Pipeline')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};