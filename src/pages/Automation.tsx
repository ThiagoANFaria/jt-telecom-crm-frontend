
import React, { useState } from 'react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Play, Clock, CheckCircle, XCircle } from 'lucide-react';

interface AutomationRecord {
  id: string;
  trigger: string;
  data: any;
  status: 'success' | 'failed' | 'running';
  timestamp: Date;
  result?: string;
}

const Automation: React.FC = () => {
  const [selectedTrigger, setSelectedTrigger] = useState('');
  const [automationData, setAutomationData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [automationHistory, setAutomationHistory] = useState<AutomationRecord[]>([]);
  const { toast } = useToast();

  const triggerOptions = [
    { value: 'email_campaign', label: 'Campanha de Email' },
    { value: 'lead_followup', label: 'Follow-up de Lead' },
    { value: 'contract_reminder', label: 'Lembrete de Contrato' },
    { value: 'payment_notification', label: 'Notificação de Pagamento' },
    { value: 'client_onboarding', label: 'Onboarding de Cliente' },
    { value: 'task_assignment', label: 'Atribuição de Tarefa' },
  ];

  const runAutomation = async () => {
    if (!selectedTrigger) {
      toast({
        title: 'Trigger obrigatório',
        description: 'Por favor, selecione um tipo de automação.',
        variant: 'destructive',
      });
      return;
    }

    let parsedData;
    try {
      parsedData = automationData ? JSON.parse(automationData) : {};
    } catch (error) {
      toast({
        title: 'Dados inválidos',
        description: 'Os dados devem estar em formato JSON válido.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    const newAutomation: AutomationRecord = {
      id: Date.now().toString(),
      trigger: selectedTrigger,
      data: parsedData,
      status: 'running',
      timestamp: new Date(),
    };
    
    setAutomationHistory(prev => [newAutomation, ...prev]);
    
    try {
      const response = await apiService.triggerAutomation(parsedData);
      
      setAutomationHistory(prev => 
        prev.map(automation => 
          automation.id === newAutomation.id 
            ? { 
                ...automation, 
                status: 'success' as const,
                result: response.status 
              }
            : automation
        )
      );
      
      toast({
        title: 'Automação executada',
        description: `Automação "${getTriggerLabel(selectedTrigger)}" foi executada com sucesso.`,
      });
      
      setSelectedTrigger('');
      setAutomationData('');
      
    } catch (error) {
      console.error('Failed to run automation:', error);
      
      setAutomationHistory(prev => 
        prev.map(automation => 
          automation.id === newAutomation.id 
            ? { 
                ...automation, 
                status: 'failed' as const,
                result: 'Falha na execução' 
              }
            : automation
        )
      );
      
      toast({
        title: 'Falha na automação',
        description: 'Não foi possível executar a automação. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTriggerLabel = (trigger: string) => {
    const option = triggerOptions.find(opt => opt.value === trigger);
    return option ? option.label : trigger;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'running':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Sucesso';
      case 'running':
        return 'Executando';
      case 'failed':
        return 'Falhou';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Zap className="w-8 h-8 text-jt-blue" />
        <h1 className="text-3xl font-bold text-jt-blue">Sistema de Automação</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Executar Automação
          </CardTitle>
          <CardDescription>
            Configure e execute automações personalizadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tipo de Automação
            </label>
            <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de automação" />
              </SelectTrigger>
              <SelectContent>
                {triggerOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Dados da Automação (JSON)
            </label>
            <Textarea
              placeholder={`{
  "recipient": "cliente@email.com",
  "template": "welcome",
  "variables": {
    "name": "João Silva"
  }
}`}
              value={automationData}
              onChange={(e) => setAutomationData(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
          
          <Button
            onClick={runAutomation}
            disabled={isLoading || !selectedTrigger}
            className="bg-jt-blue hover:bg-blue-700 w-full"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Executando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Executar Automação
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Automações</CardTitle>
          <CardDescription>
            Últimas automações executadas pelo sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {automationHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma automação executada ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {automationHistory.map((automation) => (
                <div
                  key={automation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(automation.status)}
                    <div>
                      <div className="font-medium">
                        {getTriggerLabel(automation.trigger)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {automation.timestamp.toLocaleString('pt-BR')}
                      </div>
                      {automation.result && (
                        <div className="text-xs text-gray-400 mt-1">
                          Resultado: {automation.result}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(automation.status)}`}>
                    {getStatusText(automation.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Automation;
