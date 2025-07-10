
import React, { useState } from 'react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, PhoneCall, Clock, CheckCircle } from 'lucide-react';

interface CallRecord {
  id: string;
  phone: string;
  status: 'completed' | 'in-progress' | 'failed';
  timestamp: Date;
  call_id?: string;
}

const Telephony: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const { toast } = useToast();

  const makeCall = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: 'Número obrigatório',
        description: 'Por favor, insira um número de telefone.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiService.makeCall(phoneNumber);
      
      const newCall: CallRecord = {
        id: Date.now().toString(),
        phone: phoneNumber,
        status: 'in-progress',
        timestamp: new Date(),
        call_id: response.call_id,
      };
      
      setCallHistory(prev => [newCall, ...prev]);
      setPhoneNumber('');
      
      toast({
        title: 'Chamada iniciada',
        description: `Chamada para ${phoneNumber} foi iniciada com sucesso.`,
      });

      // Simular mudança de status após alguns segundos
      setTimeout(() => {
        setCallHistory(prev => 
          prev.map(call => 
            call.id === newCall.id 
              ? { ...call, status: 'completed' as const }
              : call
          )
        );
      }, 5000);
      
    } catch (error) {
      console.error('Failed to make call:', error);
      
      const failedCall: CallRecord = {
        id: Date.now().toString(),
        phone: phoneNumber,
        status: 'failed',
        timestamp: new Date(),
      };
      
      setCallHistory(prev => [failedCall, ...prev]);
      
      toast({
        title: 'Falha na chamada',
        description: 'Não foi possível realizar a chamada. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Formata o número no padrão brasileiro
    if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    }
    return phone;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <Phone className="w-4 h-4 text-red-600" />;
      default:
        return <Phone className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'in-progress':
        return 'Em andamento';
      case 'failed':
        return 'Falhou';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Phone className="w-8 h-8 text-jt-blue" />
        <h1 className="text-3xl font-bold text-jt-blue">Sistema de Telefonia</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5" />
            Realizar Chamada
          </CardTitle>
          <CardDescription>
            Digite o número de telefone para realizar uma chamada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="(11) 99999-9999"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={makeCall}
              disabled={isLoading || !phoneNumber.trim()}
              className="bg-jt-blue hover:bg-blue-700 min-w-[120px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Chamando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4" />
                  Ligar
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Chamadas</CardTitle>
          <CardDescription>
            Últimas chamadas realizadas pelo sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {callHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma chamada realizada ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {callHistory.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(call.status)}
                    <div>
                      <div className="font-medium">
                        {formatPhoneNumber(call.phone)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {call.timestamp.toLocaleString('pt-BR')}
                      </div>
                      {call.call_id && (
                        <div className="text-xs text-gray-400">
                          ID: {call.call_id}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                    {getStatusText(call.status)}
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

export default Telephony;
