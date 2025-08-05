
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, ExternalLink, Bot } from 'lucide-react';

const Chatbot: React.FC = () => {
  const { user } = useAuth();

  const handleSmartbotAccess = () => {
    const smartbotUrl = user?.email 
      ? `https://app.smartbot.jttecnologia.com.br/login?email=${encodeURIComponent(user.email)}`
      : 'https://app.smartbot.jttecnologia.com.br/login';
    
    window.open(smartbotUrl, '_blank');
  };

  if (!user) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-jt-blue" />
          <h1 className="text-3xl font-bold text-jt-blue">Acesso ao Smartbot</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Faça login para acessar o Smartbot.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <MessageCircle className="w-8 h-8 text-jt-blue" />
        <h1 className="text-3xl font-bold text-jt-blue">Acesso ao Smartbot</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Bot className="w-8 h-8 text-jt-blue" />
            Smartbot JT Tecnologia
          </CardTitle>
          <CardDescription className="text-base">
            Acesse a plataforma Smartbot para gerenciar seus chatbots e automações
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 p-8">
          {/* Informações sobre credenciais */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Suas credenciais são as mesmas!
            </h3>
            <p className="text-blue-800 text-sm">
              Para acessar o Smartbot, utilize o mesmo e-mail e senha cadastrados no JT Vox CRM. 
              Suas credenciais são as mesmas para ambas as plataformas.
            </p>
            {user?.email && (
              <p className="text-blue-700 text-sm mt-2">
                <strong>E-mail:</strong> {user.email}
              </p>
            )}
          </div>

          {/* Botão de acesso */}
          <div className="text-center">
            <Button
              onClick={handleSmartbotAccess}
              size="lg"
              className="bg-jt-blue hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Acessar Smartbot
            </Button>
          </div>

          {/* Logo do Smartbot */}
          <div className="flex justify-center">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Bot className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="text-center text-sm text-muted-foreground">
            <p>A plataforma Smartbot será aberta em uma nova aba do navegador.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chatbot;
