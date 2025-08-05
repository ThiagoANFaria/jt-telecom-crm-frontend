import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown, Shield, Lock, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MasterAuthService } from '@/services/masterAuth';

const MasterLogin: React.FC = () => {
  const [email, setEmail] = useState('master@jttelecom.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verificar e criar usuário master se necessário
  useEffect(() => {
    const ensureMasterUser = async () => {
      try {
        await MasterAuthService.ensureMasterExists();
      } catch (error) {
        console.error('Erro ao verificar usuário master:', error);
      }
    };
    
    ensureMasterUser();
  }, []);

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
    setIsCreatingUser(true);
    setError('');
    
    try {
      const result = await MasterAuthService.createMasterUser();
      
      if (result.success) {
        toast({
          title: 'Usuário Master criado',
          description: 'Agora você pode fazer login com as credenciais fornecidas.',
        });
      } else {
        setError('Erro ao criar usuário Master. Tente novamente.');
      }
    } catch (error: any) {
      console.error('Erro ao criar usuário master:', error);
      setError('Erro ao criar usuário Master. Tente novamente.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-jt-blue p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Master Panel
          </CardTitle>
          <p className="text-gray-600">
            Acesso restrito - JT Telecom
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Master</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="master@jttelecom.com"
                required
                disabled={isLoading}
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <Shield className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                <strong>Credenciais Master:</strong><br />
                Email: master@jttelecom.com<br />
                Senha: JTMaster2024!
              </AlertDescription>
            </Alert>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
              disabled={isLoading || isCreatingUser}
            >
              {isLoading ? 'Conectando...' : 'Acessar Painel Master'}
            </Button>
          </form>

          {/* Botão para criar usuário Master se necessário */}
          <div className="mt-4">
            <Button
              onClick={handleCreateMasterUser}
              variant="outline"
              className="w-full"
              disabled={isLoading || isCreatingUser}
            >
              {isCreatingUser ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Criando Usuário Master...
                </>
              ) : (
                'Criar Usuário Master'
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Clique aqui se for o primeiro acesso
            </p>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Apenas superadministradores têm acesso
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterLogin;