import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { 
  Phone, PhoneCall, Clock, CheckCircle, XCircle, Play, Pause, 
  Volume2, VolumeX, Settings, BarChart3, Users, Timer,
  PhoneIncoming, PhoneOutgoing, PhoneMissed, Headphones
} from 'lucide-react';

interface CallRecord {
  id: string;
  phone: string;
  contact_name?: string;
  direction: 'inbound' | 'outbound';
  status: 'completed' | 'in-progress' | 'failed' | 'missed' | 'busy';
  duration?: number;
  timestamp: Date;
  call_id?: string;
  recording_url?: string;
}

interface PABXStats {
  total_calls_today: number;
  completed_calls: number;
  missed_calls: number;
  average_duration: number;
  active_extensions: number;
  queue_waiting: number;
}

const JTVoxPABX: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [pabxStats, setPabxStats] = useState<PABXStats | null>(null);
  const [activeCall, setActiveCall] = useState<CallRecord | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCallHistory();
    fetchPABXStats();
    // Atualizar stats a cada 30 segundos
    const interval = setInterval(fetchPABXStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCallHistory = async () => {
    try {
      // Simular dados de histórico de chamadas
      const mockHistory: CallRecord[] = [
        {
          id: '1',
          phone: '11999999999',
          contact_name: 'João Silva',
          direction: 'outbound',
          status: 'completed',
          duration: 180,
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          call_id: 'call_001',
          recording_url: '/recordings/call_001.mp3'
        },
        {
          id: '2',
          phone: '11888888888',
          contact_name: 'Maria Santos',
          direction: 'inbound',
          status: 'completed',
          duration: 240,
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          call_id: 'call_002',
          recording_url: '/recordings/call_002.mp3'
        },
        {
          id: '3',
          phone: '11777777777',
          direction: 'outbound',
          status: 'missed',
          timestamp: new Date(Date.now() - 1000 * 60 * 90),
          call_id: 'call_003'
        },
        {
          id: '4',
          phone: '11666666666',
          contact_name: 'Pedro Costa',
          direction: 'inbound',
          status: 'failed',
          timestamp: new Date(Date.now() - 1000 * 60 * 120),
          call_id: 'call_004'
        }
      ];
      setCallHistory(mockHistory);
    } catch (error) {
      console.error('Failed to fetch call history:', error);
    }
  };

  const fetchPABXStats = async () => {
    try {
      // Simular dados de estatísticas do PABX
      const mockStats: PABXStats = {
        total_calls_today: 47,
        completed_calls: 38,
        missed_calls: 9,
        average_duration: 195,
        active_extensions: 12,
        queue_waiting: 3
      };
      setPabxStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch PABX stats:', error);
    }
  };

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
        direction: 'outbound',
        status: 'in-progress',
        timestamp: new Date(),
        call_id: response.call_id,
      };
      
      setCallHistory(prev => [newCall, ...prev]);
      setActiveCall(newCall);
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
              ? { ...call, status: 'completed' as const, duration: Math.floor(Math.random() * 300) + 60 }
              : call
          )
        );
        setActiveCall(null);
        fetchPABXStats(); // Atualizar estatísticas
      }, 5000);
      
    } catch (error) {
      console.error('Failed to make call:', error);
      
      const failedCall: CallRecord = {
        id: Date.now().toString(),
        phone: phoneNumber,
        direction: 'outbound',
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

  const endCall = () => {
    if (activeCall) {
      setCallHistory(prev => 
        prev.map(call => 
          call.id === activeCall.id 
            ? { ...call, status: 'completed' as const, duration: Math.floor(Math.random() * 300) + 60 }
            : call
        )
      );
      setActiveCall(null);
      toast({
        title: 'Chamada encerrada',
        description: 'Chamada encerrada com sucesso.',
      });
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    }
    return phone;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: string, direction: string) => {
    switch (status) {
      case 'completed':
        return direction === 'inbound' ? 
          <PhoneIncoming className="w-4 h-4 text-green-600" /> : 
          <PhoneOutgoing className="w-4 h-4 text-blue-600" />;
      case 'missed':
        return <PhoneMissed className="w-4 h-4 text-red-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'in-progress':
        return <Phone className="w-4 h-4 text-yellow-600 animate-pulse" />;
      default:
        return <Phone className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'busy':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Phone className="w-8 h-8 text-[#0057B8]" />
          <h1 className="text-3xl font-bold text-[#0057B8]">JT Vox PABX</h1>
        </div>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Configurações
        </Button>
      </div>

      {/* Estatísticas do PABX */}
      {pabxStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chamadas Hoje</CardTitle>
              <PhoneCall className="h-4 w-4 text-[#0057B8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0057B8]">
                {pabxStats.total_calls_today}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {pabxStats.completed_calls}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perdidas</CardTitle>
              <PhoneMissed className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {pabxStats.missed_calls}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
              <Timer className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatDuration(pabxStats.average_duration)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ramais Ativos</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {pabxStats.active_extensions}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fila de Espera</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {pabxStats.queue_waiting}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Discagem */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-[#0057B8]" />
              Fazer Chamada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="tel"
                placeholder="Digite o número..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && makeCall()}
                disabled={isLoading || !!activeCall}
              />
              <div className="text-sm text-gray-500">
                Formato: (11) 99999-9999
              </div>
            </div>

            {activeCall ? (
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Phone className="w-4 h-4 animate-pulse" />
                    <span className="font-medium">Chamada em andamento</span>
                  </div>
                  <div className="text-sm text-yellow-700 mt-1">
                    {formatPhoneNumber(activeCall.phone)}
                  </div>
                </div>
                <Button 
                  onClick={endCall}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <PhoneCall className="w-4 h-4 mr-2" />
                  Encerrar Chamada
                </Button>
              </div>
            ) : (
              <Button 
                onClick={makeCall}
                disabled={isLoading || !phoneNumber.trim()}
                className="w-full bg-[#0057B8] hover:bg-[#003d82]"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Discando...
                  </>
                ) : (
                  <>
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Fazer Chamada
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Chamadas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0057B8]" />
              Histórico de Chamadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contato</TableHead>
                  <TableHead>Direção</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {callHistory.slice(0, 10).map((call) => (
                  <TableRow key={call.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {call.contact_name || 'Desconhecido'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatPhoneNumber(call.phone)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(call.status, call.direction)}
                        <span className="capitalize">{call.direction === 'inbound' ? 'Entrada' : 'Saída'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(call.status)}>
                        {call.status === 'completed' ? 'Completada' :
                         call.status === 'missed' ? 'Perdida' :
                         call.status === 'failed' ? 'Falhou' :
                         call.status === 'in-progress' ? 'Em andamento' : call.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {call.duration ? formatDuration(call.duration) : '-'}
                    </TableCell>
                    <TableCell>
                      {call.timestamp.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </TableCell>
                    <TableCell>
                      {call.recording_url && (
                        <Button variant="outline" size="sm">
                          <Headphones className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JTVoxPABX;

