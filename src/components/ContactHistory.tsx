import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { 
  Phone, MessageCircle, Clock, PhoneIncoming, PhoneOutgoing, 
  PhoneMissed, Headphones, Edit, Save, X, FileText
} from 'lucide-react';

interface CallRecord {
  id: string;
  phone: string;
  direction: 'inbound' | 'outbound';
  status: 'completed' | 'missed' | 'failed';
  duration?: number;
  timestamp: string;
  recording_url?: string;
  call_transcript?: string;
  meeting_transcript?: string;
}

interface ChatRecord {
  id: string;
  message: string;
  response: string;
  timestamp: string;
  platform: 'whatsapp' | 'telegram' | 'webchat';
  status: 'delivered' | 'read' | 'failed';
}

interface ContactHistoryProps {
  contactId: string;
  contactType: 'lead' | 'client';
  contactName: string;
}

const ContactHistory: React.FC<ContactHistoryProps> = ({ contactId, contactType, contactName }) => {
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTranscript, setEditingTranscript] = useState<string | null>(null);
  const [callTranscriptText, setCallTranscriptText] = useState('');
  const [meetingTranscriptText, setMeetingTranscriptText] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, [contactId, contactType]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const [calls, chats] = await Promise.all([
        apiService.getCallHistory(contactId, contactType),
        apiService.getChatHistory(contactId, contactType)
      ]);
      setCallHistory(calls);
      setChatHistory(chats);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      toast({
        title: 'Erro ao carregar histórico',
        description: 'Não foi possível carregar o histórico de contatos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTranscript = (call: CallRecord) => {
    setEditingTranscript(call.id);
    setCallTranscriptText(call.call_transcript || '');
    setMeetingTranscriptText(call.meeting_transcript || '');
  };

  const handleSaveTranscript = async (callId: string) => {
    try {
      await apiService.updateCallTranscript(callId, callTranscriptText, meetingTranscriptText);
      
      // Atualizar o histórico local
      setCallHistory(prev => 
        prev.map(call => 
          call.id === callId 
            ? { ...call, call_transcript: callTranscriptText, meeting_transcript: meetingTranscriptText }
            : call
        )
      );
      
      setEditingTranscript(null);
      setCallTranscriptText('');
      setMeetingTranscriptText('');
      
      toast({
        title: 'Transcrições salvas',
        description: 'Transcrições da call e da reunião atualizadas com sucesso.',
      });
    } catch (error) {
      console.error('Failed to save transcript:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as transcrições.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingTranscript(null);
    setCallTranscriptText('');
    setMeetingTranscriptText('');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallIcon = (direction: string, status: string) => {
    if (status === 'missed') return <PhoneMissed className="w-4 h-4 text-red-600" />;
    return direction === 'inbound' ? 
      <PhoneIncoming className="w-4 h-4 text-green-600" /> : 
      <PhoneOutgoing className="w-4 h-4 text-blue-600" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'read':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-green-600" />;
      case 'telegram':
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Contatos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-[#0057B8]" />
          Histórico de Contatos - {contactName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calls" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calls" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Chamadas ({callHistory.length})
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Conversas ({chatHistory.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calls" className="space-y-4">
            {callHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma chamada registrada ainda.</p>
              </div>
            ) : (
              callHistory.map((call) => (
                <Card key={call.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getCallIcon(call.direction, call.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {call.direction === 'inbound' ? 'Recebida' : 'Realizada'}
                            </span>
                            <Badge className={getStatusColor(call.status)}>
                              {call.status === 'completed' ? 'Completada' : 
                               call.status === 'missed' ? 'Perdida' : 'Falhou'}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-4">
                            <span>{new Date(call.timestamp).toLocaleString('pt-BR')}</span>
                            {call.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(call.duration)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {call.recording_url && (
                          <Button variant="outline" size="sm">
                            <Headphones className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditTranscript(call)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {editingTranscript === call.id ? (
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="text-sm font-medium">Transcrição da Call:</label>
                          <Textarea
                            value={callTranscriptText}
                            onChange={(e) => setCallTranscriptText(e.target.value)}
                            placeholder="Digite a transcrição da chamada..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Transcrição da Reunião:</label>
                          <Textarea
                            value={meetingTranscriptText}
                            onChange={(e) => setMeetingTranscriptText(e.target.value)}
                            placeholder="Digite a transcrição da reunião..."
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveTranscript(call.id)}
                            className="bg-[#0057B8] hover:bg-[#003d82]"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Salvar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleCancelEdit}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {call.call_transcript && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-medium">Transcrição da Call:</span>
                            </div>
                            <p className="text-sm text-gray-700">{call.call_transcript}</p>
                          </div>
                        )}
                        {call.meeting_transcript && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Edit className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium">Transcrição da Reunião:</span>
                            </div>
                            <p className="text-sm text-blue-700">{call.meeting_transcript}</p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="chats" className="space-y-4">
            {chatHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma conversa registrada ainda.</p>
              </div>
            ) : (
              chatHistory.map((chat) => (
                <Card key={chat.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(chat.platform)}
                        <span className="font-medium capitalize">{chat.platform}</span>
                        <Badge className={getStatusColor(chat.status)}>
                          {chat.status === 'delivered' ? 'Entregue' : 
                           chat.status === 'read' ? 'Lida' : 'Falhou'}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(chat.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-600 mb-1">Cliente:</div>
                        <p className="text-sm">{chat.message}</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-blue-600 mb-1">Smartbot:</div>
                        <p className="text-sm">{chat.response}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ContactHistory;

