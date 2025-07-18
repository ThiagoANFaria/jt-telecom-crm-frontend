import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Save, 
  Zap,
  Link,
  FileText,
  Tag,
  Monitor,
  Globe,
  Key,
  MessageSquare,
  Phone,
  Mail,
  Bot,
  FileCheck,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  CheckSquare,
  FileBarChart,
  TrendingUp,
  UserPlus,
  Users,
  AlertTriangle,
  Database,
  Lock,
  Workflow,
  GitBranch
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user, isAdmin, isMaster } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  
  // Verificar se o usuário tem permissão de administrador para acessar Configurações
  const hasAccess = isAdmin() || isMaster();

  // Se não for admin, mostrar tela de acesso negado
  if (!hasAccess) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Shield className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-4">
            Este módulo é restrito a usuários <strong>Administradores</strong> e <strong>Master</strong>.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Configurações do sistema são sensíveis e requerem privilégios administrativos para garantir a segurança e integridade dos dados.
          </p>
          <Button 
            onClick={() => navigate('/dashboard')} 
            className="mt-4 bg-[#0057B8] hover:bg-[#003d82] text-white"
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleSaveSettings = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Configurações salvas",
        description: "Todas as alterações foram salvas com sucesso.",
      });
    }, 1000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações do Sistema</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as configurações e integrações do sistema
          </p>
        </div>
        <Button 
          className="bg-[#0057B8] hover:bg-[#003d82] text-white"
          onClick={handleSaveSettings}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-1 h-auto p-1">
          <TabsTrigger value="general" className="flex items-center gap-2 py-2 px-3">
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">Geral</span>
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2 py-2 px-3">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Leads</span>
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2 py-2 px-3">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Clientes</span>
          </TabsTrigger>
          <TabsTrigger value="proposals" className="flex items-center gap-2 py-2 px-3">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Propostas</span>
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2 py-2 px-3">
            <FileCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Contratos</span>
          </TabsTrigger>
          <TabsTrigger value="jtvox" className="flex items-center gap-2 py-2 px-3">
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">JT Vox</span>
          </TabsTrigger>
          <TabsTrigger value="smartbot" className="flex items-center gap-2 py-2 px-3">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Smartbot</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2 py-2 px-3">
            <Link className="w-4 h-4" />
            <span className="hidden sm:inline">Integrações</span>
          </TabsTrigger>
        </TabsList>

        {/* Aba Geral */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-[#0057B8]" />
                  Configurações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="company-name">Nome da Empresa</Label>
                  <Input id="company-name" placeholder="JT Telecom" defaultValue="JT Telecom" />
                </div>
                <div>
                  <Label htmlFor="company-domain">Domínio</Label>
                  <Input id="company-domain" placeholder="jttelecom.com.br" defaultValue="jttelecom.com.br" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">Ativar tema escuro</p>
                  </div>
                  <Switch id="dark-mode" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-save">Salvamento Automático</Label>
                    <p className="text-sm text-muted-foreground">Salvar alterações automaticamente</p>
                  </div>
                  <Switch id="auto-save" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#0057B8]" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">E-mail</Label>
                    <p className="text-sm text-muted-foreground">Notificações por email</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push</Label>
                    <p className="text-sm text-muted-foreground">Notificações no navegador</p>
                  </div>
                  <Switch id="push-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-notifications">SMS</Label>
                    <p className="text-sm text-muted-foreground">Notificações por SMS</p>
                  </div>
                  <Switch id="sms-notifications" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Leads */}
        <TabsContent value="leads" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#0057B8]" />
                  Configurações de Leads
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="lead-qualification">Regras de Qualificação</Label>
                  <Textarea 
                    id="lead-qualification" 
                    placeholder="Definir critérios automáticos de qualificação..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-follow-up">Follow-up Automático</Label>
                    <p className="text-sm text-muted-foreground">Ativar seguimento automático de leads</p>
                  </div>
                  <Switch id="auto-follow-up" defaultChecked />
                </div>
                <div>
                  <Label>Fontes de Lead Ativas</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <Badge variant="outline">Website</Badge>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <Badge variant="outline">Instagram</Badge>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <Badge variant="outline">Indicação</Badge>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#0057B8]" />
                  Campos Personalizados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span>Orçamento (number)</span>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span>Urgência (select)</span>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Campo
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Clientes */}
        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#0057B8]" />
                  Configurações de Clientes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="client-notifications">Notificar Novos Clientes</Label>
                    <p className="text-sm text-muted-foreground">Enviar notificação quando cliente for adicionado</p>
                  </div>
                  <Switch id="client-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="payment-tracking">Acompanhar Pagamentos</Label>
                    <p className="text-sm text-muted-foreground">Monitorar status de pagamentos</p>
                  </div>
                  <Switch id="payment-tracking" defaultChecked />
                </div>
                <div>
                  <Label>Tags Padrão</Label>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-green-500 text-white">VIP</Badge>
                    <Badge className="bg-blue-500 text-white">Recorrente</Badge>
                    <Badge className="bg-purple-500 text-white">Empresarial</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5 text-[#0057B8]" />
                  Integrações Ativas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="jtvox-integration">JT Vox (Telefonia)</Label>
                    <p className="text-sm text-muted-foreground">Integrar botão de ligação</p>
                  </div>
                  <Switch id="jtvox-integration" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smartbot-integration">Smartbot (Chat)</Label>
                    <p className="text-sm text-muted-foreground">Integrar botão de chat</p>
                  </div>
                  <Switch id="smartbot-integration" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-integration">Email SMTP</Label>
                    <p className="text-sm text-muted-foreground">Integrar envio de emails</p>
                  </div>
                  <Switch id="email-integration" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Propostas */}
        <TabsContent value="proposals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0057B8]" />
                  Templates de Propostas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-medium">Template Padrão</h4>
                      <p className="text-sm text-muted-foreground">Proposta comercial básica</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Template
                </Button>
                <div className="mt-4">
                  <Label>Variáveis Disponíveis</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Badge variant="secondary">{'{{client_name}}'}</Badge>
                    <Badge variant="secondary">{'{{value}}'}</Badge>
                    <Badge variant="secondary">{'{{date}}'}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-[#0057B8]" />
                  Configurações de Processo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-proposal">Propostas Automáticas</Label>
                    <p className="text-sm text-muted-foreground">Gerar propostas automaticamente</p>
                  </div>
                  <Switch id="auto-proposal" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lead-autocomplete">Autocomplete de Leads</Label>
                    <p className="text-sm text-muted-foreground">Busca rápida de leads (3+ caracteres)</p>
                  </div>
                  <Switch id="lead-autocomplete" defaultChecked />
                </div>
                <div>
                  <Label htmlFor="validity-days">Validade Padrão (dias)</Label>
                  <Input id="validity-days" type="number" defaultValue="30" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Contratos */}
        <TabsContent value="contracts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-[#0057B8]" />
                  Templates de Contratos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-medium">Prestação de Serviços</h4>
                      <p className="text-sm text-muted-foreground">Contrato padrão mensal</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#0057B8]" />
                  Assinatura Digital
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="d4sign-contracts">D4Sign Ativo</Label>
                    <p className="text-sm text-muted-foreground">Usar assinatura digital</p>
                  </div>
                  <Switch id="d4sign-contracts" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="contract-autocomplete">Autocomplete de Leads</Label>
                    <p className="text-sm text-muted-foreground">Busca rápida de leads (3+ caracteres)</p>
                  </div>
                  <Switch id="contract-autocomplete" defaultChecked />
                </div>
                <div>
                  <Label htmlFor="contract-duration">Duração Padrão</Label>
                  <Select defaultValue="12">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 meses</SelectItem>
                      <SelectItem value="12">12 meses</SelectItem>
                      <SelectItem value="24">24 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba JT Vox */}
        <TabsContent value="jtvox" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[#0057B8]" />
                  Configurações PABX
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pabx-server">Servidor PABX</Label>
                  <Input id="pabx-server" placeholder="192.168.1.100" />
                </div>
                <div>
                  <Label htmlFor="pabx-extensions">Extensões Ativas</Label>
                  <Input id="pabx-extensions" placeholder="1001, 1002, 1003..." />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="call-recording">Gravação de Chamadas</Label>
                    <p className="text-sm text-muted-foreground">Gravar todas as chamadas</p>
                  </div>
                  <Switch id="call-recording" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-dial">Discagem Automática</Label>
                    <p className="text-sm text-muted-foreground">Habilitar discagem rápida</p>
                  </div>
                  <Switch id="auto-dial" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#0057B8]" />
                  Relatórios de Chamadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="call-analytics">Analytics Ativo</Label>
                    <p className="text-sm text-muted-foreground">Coletar dados de chamadas</p>
                  </div>
                  <Switch id="call-analytics" defaultChecked />
                </div>
                <div>
                  <Label htmlFor="retention-days">Retenção de Logs (dias)</Label>
                  <Input id="retention-days" type="number" defaultValue="90" />
                </div>
                <div className="space-y-2">
                  <Label>Métricas Ativas</Label>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Duração de chamadas</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Taxa de atendimento</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Smartbot */}
        <TabsContent value="smartbot" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#0057B8]" />
                  Configurações do Bot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bot-name">Nome do Bot</Label>
                  <Input id="bot-name" defaultValue="JT Assistant" />
                </div>
                <div>
                  <Label htmlFor="welcome-message">Mensagem de Boas-vindas</Label>
                  <Textarea 
                    id="welcome-message" 
                    defaultValue="Olá! Sou o assistente virtual da JT Telecom. Como posso ajudá-lo?"
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-response">Resposta Automática</Label>
                    <p className="text-sm text-muted-foreground">Responder automaticamente</p>
                  </div>
                  <Switch id="auto-response" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lead-capture">Captura de Leads</Label>
                    <p className="text-sm text-muted-foreground">Converter conversas em leads</p>
                  </div>
                  <Switch id="lead-capture" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[#0057B8]" />
                  Inteligência Artificial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ai-enabled">IA Habilitada</Label>
                    <p className="text-sm text-muted-foreground">Usar OpenAI para respostas</p>
                  </div>
                  <Switch id="ai-enabled" />
                </div>
                <div>
                  <Label htmlFor="ai-model">Modelo de IA</Label>
                  <Select defaultValue="gpt-3.5-turbo">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="response-delay">Delay de Resposta (ms)</Label>
                  <Input id="response-delay" type="number" defaultValue="1000" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Integrações */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SMTP Email */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-red-600" />
                  Email SMTP
                  <Badge variant="outline">Email</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-enabled">Habilitado</Label>
                  <Switch id="email-enabled" defaultChecked />
                </div>
                <div>
                  <Label htmlFor="smtp-server">Servidor SMTP</Label>
                  <Input id="smtp-server" placeholder="smtp.gmail.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp-port">Porta</Label>
                    <Input id="smtp-port" type="number" defaultValue="587" />
                  </div>
                  <div>
                    <Label htmlFor="smtp-security">Segurança</Label>
                    <Select defaultValue="tls">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                        <SelectItem value="none">Nenhuma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="smtp-username">Usuário</Label>
                  <Input id="smtp-username" placeholder="email@exemplo.com" />
                </div>
                <div>
                  <Label htmlFor="smtp-password">Senha</Label>
                  <Input id="smtp-password" type="password" placeholder="••••••••" />
                </div>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Testar Conexão
                </Button>
              </CardContent>
            </Card>

            {/* OpenAI */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-600" />
                  OpenAI
                  <Badge variant="outline">IA</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="openai-enabled">Habilitado</Label>
                  <Switch id="openai-enabled" />
                </div>
                <div>
                  <Label htmlFor="openai-key">API Key</Label>
                  <Input id="openai-key" type="password" placeholder="sk-••••••••" />
                </div>
                <div>
                  <Label htmlFor="openai-model">Modelo</Label>
                  <Select defaultValue="gpt-3.5-turbo">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="openai-max-tokens">Max Tokens</Label>
                  <Input id="openai-max-tokens" type="number" defaultValue="500" />
                </div>
                <Button variant="outline" className="w-full">
                  <Bot className="w-4 h-4 mr-2" />
                  Testar API
                </Button>
              </CardContent>
            </Card>

            {/* D4Sign */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  D4Sign
                  <Badge variant="outline">Assinatura</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="d4sign-enabled">Habilitado</Label>
                  <Switch id="d4sign-enabled" defaultChecked />
                </div>
                <div>
                  <Label htmlFor="d4sign-token">API Token</Label>
                  <Input id="d4sign-token" type="password" placeholder="••••••••" />
                </div>
                <div>
                  <Label htmlFor="d4sign-environment">Ambiente</Label>
                  <Select defaultValue="production">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox</SelectItem>
                      <SelectItem value="production">Produção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Verificar Status
                </Button>
              </CardContent>
            </Card>

            {/* Webhook */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Webhooks
                  <Badge variant="outline">Automação</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="webhook-enabled">Habilitado</Label>
                  <Switch id="webhook-enabled" />
                </div>
                <div>
                  <Label htmlFor="webhook-url">URL do Webhook</Label>
                  <Input id="webhook-url" placeholder="https://sua-empresa.com/webhook" />
                </div>
                <div>
                  <Label htmlFor="webhook-secret">Secret Key</Label>
                  <Input id="webhook-secret" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Eventos</Label>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Novo Lead</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Proposta Aceita</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Contrato Assinado</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;