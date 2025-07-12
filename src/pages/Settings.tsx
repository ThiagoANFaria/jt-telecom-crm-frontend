import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  Plus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  // Force deploy: Menu completo de configurações implementado com todas as funcionalidades
  
  // Verificar se o usuário tem permissão de administrador para acessar Configurações
  const isAdmin = user?.user_level === 'admin' || user?.user_level === 'master';

  // Se não for admin, mostrar tela de acesso negado
  if (!isAdmin) {
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

  const handleAutomationAccess = () => {
    navigate('/automation');
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
        <Button className="bg-[#0057B8] hover:bg-[#003d82] text-white">
          <Save className="w-4 h-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="fields" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Campos
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Tags
          </TabsTrigger>
          <TabsTrigger value="proposal-templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Templates Propostas
          </TabsTrigger>
          <TabsTrigger value="contract-templates" className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Templates Contratos
          </TabsTrigger>
          <TabsTrigger value="d4sign" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            D4Sign
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Automação
          </TabsTrigger>
        </TabsList>

        {/* Aba Perfil */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#0057B8]" />
                Perfil do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" placeholder="Seu nome completo" defaultValue="Admin User" />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" defaultValue="admin@jttecnologia.com.br" />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" placeholder="(11) 99999-9999" defaultValue="(11) 99999-9999" />
                </div>
                <div>
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input id="avatar" placeholder="https://..." />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Notificações */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#0057B8]" />
                Configurações de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Notificações por E-mail</Label>
                  <p className="text-sm text-muted-foreground">Receber notificações importantes por email</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">Notificações em tempo real no navegador</p>
                </div>
                <Switch id="push-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="marketing-emails">E-mails de Marketing</Label>
                  <p className="text-sm text-muted-foreground">Receber newsletters e atualizações</p>
                </div>
                <Switch id="marketing-emails" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Sistema */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-[#0057B8]" />
                Preferências do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dark-mode">Modo Escuro</Label>
                      <p className="text-sm text-muted-foreground">Tema escuro da interface</p>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compact-view">Visualização Compacta</Label>
                      <p className="text-sm text-muted-foreground">Interface mais compacta</p>
                    </div>
                    <Switch id="compact-view" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="language">Idioma</Label>
                    <Input id="language" defaultValue="pt-BR" placeholder="pt-BR" />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <Input id="timezone" defaultValue="America/Sao_Paulo" placeholder="America/Sao_Paulo" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Integrações */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* JT Vox PABX */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  JT Vox PABX
                  <Badge variant="outline">Telefonia</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pabx-enabled">Habilitado</Label>
                  <Switch id="pabx-enabled" />
                </div>
                <div>
                  <Label htmlFor="pabx-url">URL da API</Label>
                  <Input id="pabx-url" placeholder="https://api.pabx.com" />
                </div>
                <div>
                  <Label htmlFor="pabx-token">Token</Label>
                  <Input id="pabx-token" type="password" placeholder="••••••••" />
                </div>
                <div>
                  <Label htmlFor="pabx-username">Usuário</Label>
                  <Input id="pabx-username" placeholder="username" />
                </div>
              </CardContent>
            </Card>

            {/* Smartbot */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Smartbot
                  <Badge variant="outline">Chatbot</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="smartbot-enabled">Habilitado</Label>
                  <Switch id="smartbot-enabled" />
                </div>
                <div>
                  <Label htmlFor="smartbot-url">URL da API</Label>
                  <Input id="smartbot-url" defaultValue="https://app.smartbot.jttecnologia.com.br/messages-api" />
                </div>
                <div>
                  <Label htmlFor="smartbot-token">Token</Label>
                  <Input id="smartbot-token" type="password" placeholder="••••••••" />
                </div>
              </CardContent>
            </Card>

            {/* Email SMTP */}
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
                  <Switch id="email-enabled" />
                </div>
                <div>
                  <Label htmlFor="smtp-server">Servidor SMTP</Label>
                  <Input id="smtp-server" placeholder="smtp.gmail.com" />
                </div>
                <div>
                  <Label htmlFor="smtp-port">Porta</Label>
                  <Input id="smtp-port" type="number" defaultValue="587" />
                </div>
                <div>
                  <Label htmlFor="smtp-username">Usuário</Label>
                  <Input id="smtp-username" placeholder="email@exemplo.com" />
                </div>
                <div>
                  <Label htmlFor="smtp-password">Senha</Label>
                  <Input id="smtp-password" type="password" placeholder="••••••••" />
                </div>
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
                  <Input id="openai-model" defaultValue="gpt-3.5-turbo" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Campos Customizados */}
        <TabsContent value="fields" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0057B8]" />
                  Campos de Leads
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span>Orçamento (number)</span>
                    <Button variant="outline" size="sm">Editar</Button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span>Urgência (select)</span>
                    <Button variant="outline" size="sm">Editar</Button>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Adicionar Campo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0057B8]" />
                  Campos de Clientes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span>Segmento (text)</span>
                    <Button variant="outline" size="sm">Editar</Button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span>Tamanho da Empresa (select)</span>
                    <Button variant="outline" size="sm">Editar</Button>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Adicionar Campo
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Tags */}
        <TabsContent value="tags" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#0057B8]" />
                Sistema de Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Badge className="bg-red-500 text-white">VIP</Badge>
                <Badge className="bg-yellow-500 text-white">Urgente</Badge>
                <Badge className="bg-green-500 text-white">Qualificado</Badge>
                <Badge className="bg-blue-500 text-white">Follow-up</Badge>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Nome da tag" />
                <Input placeholder="#FF0000" />
                <Button>
                  <Tag className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Templates de Propostas */}
        <TabsContent value="proposal-templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0057B8]" />
                Templates de Propostas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Templates Disponíveis</h3>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Template
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h4 className="font-medium">Template Padrão</h4>
                    <p className="text-sm text-muted-foreground">Proposta comercial para {{client_name}}...</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">client_name</Badge>
                      <Badge variant="outline">value</Badge>
                      <Badge variant="outline">description</Badge>
                    </div>
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

              <div className="space-y-4 mt-6">
                <h4 className="font-medium">Variáveis Disponíveis</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Badge variant="secondary">{{client_name}}</Badge>
                  <Badge variant="secondary">{{client_email}}</Badge>
                  <Badge variant="secondary">{{value}}</Badge>
                  <Badge variant="secondary">{{description}}</Badge>
                  <Badge variant="secondary">{{date}}</Badge>
                  <Badge variant="secondary">{{valid_until}}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Templates de Contratos */}
        <TabsContent value="contract-templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#0057B8]" />
                Templates de Contratos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Templates Disponíveis</h3>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Template
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h4 className="font-medium">Contrato de Prestação de Serviços</h4>
                    <p className="text-sm text-muted-foreground">Template padrão para contratos de serviços</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">Mensal</Badge>
                      <Badge variant="outline">Auto-renovação</Badge>
                    </div>
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

              <div className="space-y-4 mt-6">
                <h4 className="font-medium">Variáveis de Contrato</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Badge variant="secondary">{{client_name}}</Badge>
                  <Badge variant="secondary">{{contract_number}}</Badge>
                  <Badge variant="secondary">{{value}}</Badge>
                  <Badge variant="secondary">{{start_date}}</Badge>
                  <Badge variant="secondary">{{end_date}}</Badge>
                  <Badge variant="secondary">{{client_cnpj}}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba D4Sign */}
        <TabsContent value="d4sign" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Integração D4Sign
                <Badge variant="outline">Assinatura Digital</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="d4sign-enabled">Integração Habilitada</Label>
                  <p className="text-sm text-muted-foreground">Ativar assinatura digital de contratos</p>
                </div>
                <Switch id="d4sign-enabled" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="d4sign-url">URL da API</Label>
                  <Input id="d4sign-url" defaultValue="https://secure.d4sign.com.br/api/v1" />
                </div>
                <div>
                  <Label htmlFor="d4sign-token">Token de Autenticação</Label>
                  <Input id="d4sign-token" type="password" placeholder="••••••••" />
                </div>
                <div>
                  <Label htmlFor="d4sign-crypto">Chave Criptográfica</Label>
                  <Input id="d4sign-crypto" type="password" placeholder="••••••••" />
                </div>
                <div>
                  <Label htmlFor="d4sign-webhook">URL do Webhook</Label>
                  <Input id="d4sign-webhook" placeholder="https://api.app.jttecnologia.com.br/contracts/webhook/d4sign" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 border rounded">
                  <h4 className="font-medium">Contratos Enviados</h4>
                  <p className="text-2xl font-bold text-blue-600">24</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <h4 className="font-medium">Assinados Hoje</h4>
                  <p className="text-2xl font-bold text-green-600">8</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <h4 className="font-medium">Taxa de Assinatura</h4>
                  <p className="text-2xl font-bold text-purple-600">87.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Automação */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Sistema de Automação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Gerenciar Automações e Cadências</h3>
                  <p className="text-sm text-muted-foreground">
                    Criar e configurar automações de marketing, follow-up de leads e cadências de email.
                  </p>
                </div>
                <Button 
                  onClick={handleAutomationAccess}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Acessar Automações
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 border rounded">
                  <h4 className="font-medium">Regras Ativas</h4>
                  <p className="text-2xl font-bold text-blue-600">12</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <h4 className="font-medium">Execuções Hoje</h4>
                  <p className="text-2xl font-bold text-green-600">45</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <h4 className="font-medium">Taxa de Sucesso</h4>
                  <p className="text-2xl font-bold text-purple-600">91.7%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

