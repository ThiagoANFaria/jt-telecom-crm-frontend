
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { pabxService, PabxCallHistory, PabxExtension } from '@/services/pabx';
import { settingsService } from '@/services/settings';
import { Phone, PhoneCall, Clock, CheckCircle, XCircle, Play, Download, Filter, CalendarIcon, Headphones } from 'lucide-react';
import { format, isWithinInterval, subDays } from 'date-fns';
import { pt } from 'date-fns/locale';

interface CallRecord {
  id: string;
  phone: string;
  status: 'completed' | 'in-progress' | 'failed';
  timestamp: Date;
  call_id?: string;
}

const Telephony: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedExtension, setSelectedExtension] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [callHistory, setCallHistory] = useState<PabxCallHistory[]>([]);
  const [extensions, setExtensions] = useState<PabxExtension[]>([]);
  const [pabxEnabled, setPabxEnabled] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [filters, setFilters] = useState({
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
    direction: 'all' as 'all' | 'inbound' | 'outbound',
    extension: 'all'
  });
  const { toast } = useToast();

  // Verificar se PABX está habilitado e carregar dados iniciais
  useEffect(() => {
    const initializePabx = async () => {
      try {
        const pabxEnabledSetting = await settingsService.getSetting('pabx_enabled', 'pabx');
        const isEnabled = pabxEnabledSetting?.value || false;
        setPabxEnabled(isEnabled);

        if (isEnabled) {
          const extensionsList = await pabxService.getExtensions();
          setExtensions(extensionsList);
          
          if (extensionsList.length > 0) {
            setSelectedExtension(extensionsList[0].number);
          }

          await loadCallHistory();
        }
      } catch (error) {
        console.error('Erro ao inicializar PABX:', error);
        toast({
          title: 'Erro de configuração',
          description: 'Configure o token do PABX nas Configurações do sistema.',
          variant: 'destructive',
        });
      }
    };

    initializePabx();
  }, []);

  const loadCallHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const history = await pabxService.getCallHistory({
        startDate: format(filters.startDate, 'yyyy-MM-dd'),
        endDate: format(filters.endDate, 'yyyy-MM-dd'),
        extension: filters.extension !== 'all' ? filters.extension : undefined,
        direction: filters.direction !== 'all' ? filters.direction : undefined
      });
      setCallHistory(history);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast({
        title: 'Erro ao carregar histórico',
        description: 'Não foi possível carregar o histórico de chamadas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingHistory(false);
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

    if (!selectedExtension) {
      toast({
        title: 'Ramal obrigatório',
        description: 'Por favor, selecione um ramal.',
        variant: 'destructive',
      });
      return;
    }

    if (!pabxEnabled) {
      toast({
        title: 'PABX não configurado',
        description: 'Configure o token do PABX nas Configurações do sistema.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await pabxService.makeCall(selectedExtension, phoneNumber);
      
      toast({
        title: 'Chamada iniciada',
        description: `Chamada para ${phoneNumber} foi iniciada com sucesso.`,
      });

      setPhoneNumber('');
      
      // Recarregar histórico após alguns segundos
      setTimeout(() => {
        loadCallHistory();
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao realizar chamada:', error);
      
      toast({
        title: 'Falha na chamada',
        description: error instanceof Error ? error.message : 'Não foi possível realizar a chamada.',
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: string, direction: string) => {
    switch (status) {
      case 'answered':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'ringing':
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'busy':
        return <Phone className="w-4 h-4 text-orange-600" />;
      case 'no_answer':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Phone className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'ringing':
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'busy':
        return 'bg-orange-100 text-orange-800';
      case 'no_answer':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'answered':
      case 'completed':
        return 'Atendida';
      case 'ringing':
      case 'in-progress':
        return 'Tocando';
      case 'busy':
        return 'Ocupado';
      case 'no_answer':
        return 'Não atendeu';
      case 'failed':
        return 'Falhou';
      default:
        return 'Desconhecido';
    }
  };

  const handlePlayRecording = async (recordingUrl: string) => {
    try {
      window.open(recordingUrl, '_blank');
    } catch (error) {
      toast({
        title: 'Erro ao reproduzir gravação',
        description: 'Não foi possível abrir a gravação.',
        variant: 'destructive',
      });
    }
  };

  if (!pabxEnabled) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Phone className="w-8 h-8 text-jt-blue" />
          <h1 className="text-3xl font-bold text-jt-blue">Sistema de Telefonia</h1>
        </div>

        <Card>
          <CardContent className="text-center py-8">
            <Phone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">PABX não configurado</h3>
            <p className="text-gray-600 mb-4">
              Configure o token do PABX nas Configurações do sistema para utilizar a telefonia.
            </p>
            <Button onClick={() => window.location.href = '/settings'}>
              Ir para Configurações
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Phone className="w-8 h-8 text-jt-blue" />
        <h1 className="text-3xl font-bold text-jt-blue">Sistema de Telefonia</h1>
      </div>

      {/* Discador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5" />
            Discador
          </CardTitle>
          <CardDescription>
            Realize chamadas através do PABX
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ramal</label>
                <Select value={selectedExtension} onValueChange={setSelectedExtension}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ramal" />
                  </SelectTrigger>
                  <SelectContent>
                    {extensions.map((ext) => (
                      <SelectItem key={ext.id} value={ext.number}>
                        {ext.number} - {ext.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Número de telefone</label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              onClick={makeCall}
              disabled={isLoading || !phoneNumber.trim() || !selectedExtension}
              className="bg-jt-blue hover:bg-blue-700 w-full md:w-auto"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Chamando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4" />
                  Realizar Chamada
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros do Histórico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data início</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(filters.startDate, 'dd/MM/yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => date && setFilters(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                    locale={pt}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data fim</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(filters.endDate, 'dd/MM/yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) => date && setFilters(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                    locale={pt}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Direção</label>
              <Select value={filters.direction} onValueChange={(value: any) => setFilters(prev => ({ ...prev, direction: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="inbound">Recebidas</SelectItem>
                  <SelectItem value="outbound">Realizadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ramal</label>
              <Select value={filters.extension} onValueChange={(value) => setFilters(prev => ({ ...prev, extension: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {extensions.map((ext) => (
                    <SelectItem key={ext.id} value={ext.number}>
                      {ext.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={loadCallHistory} disabled={isLoadingHistory}>
              {isLoadingHistory ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Carregando...
                </div>
              ) : (
                'Atualizar Histórico'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Chamadas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Chamadas</CardTitle>
          <CardDescription>
            {callHistory.length} chamada(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando histórico...</p>
            </div>
          ) : callHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p>Nenhuma chamada encontrada no período selecionado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Direção</TableHead>
                    <TableHead>Originador</TableHead>
                    <TableHead>Destinatário</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Ramal</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {callHistory.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(call.status, call.direction)}
                          <Badge className={getStatusColor(call.status)}>
                            {getStatusText(call.status)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={call.direction === 'inbound' ? 'secondary' : 'outline'}>
                          {call.direction === 'inbound' ? 'Recebida' : 'Realizada'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPhoneNumber(call.caller)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPhoneNumber(call.called)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(call.start_time), 'dd/MM/yyyy HH:mm:ss', { locale: pt })}
                      </TableCell>
                      <TableCell>
                        {call.duration ? formatDuration(call.duration) : '--'}
                      </TableCell>
                      <TableCell>
                        {call.extension || '--'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {call.recording_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePlayRecording(call.recording_url!)}
                              title="Reproduzir gravação"
                            >
                              <Headphones className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Telephony;
