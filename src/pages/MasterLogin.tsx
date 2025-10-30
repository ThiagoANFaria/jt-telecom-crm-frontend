import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MasterAuthService } from '@/services/masterAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import JTVoxLogo from '@/components/JTVoxLogo';

const MasterLogin: React.FC = () => {
  const [email, setEmail] = useState('master@jttelecom.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
      });
      navigate('/auth');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });

      toast({
        title: 'Login realizado',
        description: 'Bem-vindo ao Painel Master!',
      });

      navigate('/master');
      
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMasterUser = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Criando usuário Master...');
      const result = await MasterAuthService.createMasterUser();
      
      if (result.success) {
        toast({
          title: 'Usuário Master configurado!',
          description: result.message || 'Agora você pode fazer login.',
        });
        setError('');
      } else {
        const errorMessage = result.error || 'Erro ao criar usuário Master.';
        setError(errorMessage);
        toast({
          title: 'Erro ao criar usuário',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro inesperado.';
      setError(errorMessage);
      toast({
        title: 'Erro inesperado',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(to bottom, #001A47 0%, #000D24 100%)'}}>
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Lado esquerdo - Informações */}
        <div className="text-white space-y-8 text-center">
          <div className="flex justify-center mb-8">
            <JTVoxLogo />
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">
              Painel Master
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Área de administração e gerenciamento completo do sistema JT Telecom CRM.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span>Gerenciamento de tenants</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span>Controle total de usuários</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span>Monitoramento do sistema</span>
            </div>
          </div>
        </div>

        {/* Lado direito - Autenticação Master */}
        <Card className="bg-white rounded-2xl shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Acesso Master
            </CardTitle>
            <CardDescription>
              Entre com suas credenciais de administrador
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {user && (
              <Alert className="mb-4">
                <AlertDescription>
                  Logado: {user.email}
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="ml-2"
                  >
                    Sair
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Master
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="master@jttelecom.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha master"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Credenciais Master:</strong><br />
                  Email: master@jttelecom.com<br />
                  Senha: JTMaster2024!
                </AlertDescription>
              </Alert>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Conectando...
                  </div>
                ) : (
                  'Entrar no Painel Master'
                )}
              </Button>

              <div className="pt-4 border-t">
                <Button
                  type="button"
                  onClick={handleCreateMasterUser}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  Criar Usuário Master
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Utilize apenas se o usuário master ainda não foi criado
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MasterLogin;