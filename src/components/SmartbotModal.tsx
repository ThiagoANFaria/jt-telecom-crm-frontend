import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Smartbot } from '@/types';

interface SmartbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  smartbot?: Smartbot;
}

const SmartbotModal: React.FC<SmartbotModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  smartbot
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    status: 'ativo' as 'ativo' | 'inativo' | 'pausado',
    canal: 'whatsapp' as 'whatsapp' | 'telegram' | 'webchat' | 'email'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (smartbot) {
      setFormData({
        nome: smartbot.nome || '',
        descricao: smartbot.descricao || '',
        status: smartbot.status || 'ativo',
        canal: smartbot.canal || 'whatsapp'
      });
    } else {
      setFormData({
        nome: '',
        descricao: '',
        status: 'ativo',
        canal: 'whatsapp'
      });
    }
  }, [smartbot, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome do smartbot.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const smartbotData = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        status: formData.status,
        canal: formData.canal,
        data_criacao: smartbot?.data_criacao || new Date().toISOString()
      };

      if (smartbot) {
        await apiService.updateSmartbot(smartbot.id, smartbotData);
        toast({
          title: 'Smartbot atualizado',
          description: 'O smartbot foi atualizado com sucesso.',
        });
      } else {
        await apiService.createSmartbot(smartbotData);
        toast({
          title: 'Smartbot criado',
          description: 'O smartbot foi criado com sucesso.',
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save smartbot:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o smartbot. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {smartbot ? 'Editar Smartbot' : 'Novo Smartbot'}
          </DialogTitle>
          <DialogDescription>
            {smartbot 
              ? 'Atualize as informações do smartbot.' 
              : 'Preencha as informações para criar um novo smartbot.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Atendimento WhatsApp"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva a função do smartbot..."
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="canal">Canal</Label>
            <Select
              value={formData.canal}
              onValueChange={(value: 'whatsapp' | 'telegram' | 'webchat' | 'email') => 
                setFormData(prev => ({ ...prev, canal: value }))
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="webchat">Web Chat</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'ativo' | 'inativo' | 'pausado') => 
                setFormData(prev => ({ ...prev, status: value }))
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="pausado">Pausado</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Salvando...
                </div>
              ) : (
                smartbot ? 'Atualizar' : 'Criar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SmartbotModal;