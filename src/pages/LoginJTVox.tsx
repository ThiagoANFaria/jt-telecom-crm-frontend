
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import JTVoxLogo from '@/components/JTVoxLogo';

const LoginJTVox: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-jt-blue flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Floating Particles */}
      <div className="floating-particles">
        <div className="particle particle-blue w-4 h-4" style={{top: '10%', left: '15%', animationDelay: '0s'}}></div>
        <div className="particle particle-green w-3 h-3" style={{top: '20%', right: '20%', animationDelay: '2s'}}></div>
        <div className="particle particle-blue w-2 h-2" style={{bottom: '30%', left: '10%', animationDelay: '4s'}}></div>
        <div className="particle particle-green w-5 h-5" style={{bottom: '15%', right: '15%', animationDelay: '6s'}}></div>
        <div className="particle particle-blue w-3 h-3" style={{top: '50%', left: '5%', animationDelay: '1s'}}></div>
        <div className="particle particle-green w-2 h-2" style={{top: '70%', right: '8%', animationDelay: '3s'}}></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo Container */}
        <div className="text-center mb-8">
          <JTVoxLogo />
        </div>

        {/* Main Login Card */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden pulse-border">
          <CardHeader className="text-center pb-6 pt-8 px-8">
            {/* Slogan */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-[#2C2C2C] font-montserrat">
                Sua <span className="highlight-text">comunicação</span>. Mais <span className="highlight-text">simples</span>. Mais <span className="highlight-text">inteligente</span>.
              </h1>
              <p className="text-sm font-opensans leading-relaxed" style={{color: '#2C2C2C'}}>
                Transforme a forma como você se conecta com seus clientes através de tecnologia avançada de comunicação.
              </p>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#2C2C2C] font-opensans">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-2xl border-gray-200 focus:border-[#0033A0] focus:ring-[#0033A0] transition-all duration-200 font-opensans"
                    placeholder="Digite seu e-mail"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-[#2C2C2C] font-opensans">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 rounded-2xl border-gray-200 focus:border-[#0033A0] focus:ring-[#0033A0] transition-all duration-200 font-opensans"
                    placeholder="Digite sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#0033A0] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-[#0033A0] hover:text-[#002875] font-opensans transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#0033A0] hover:bg-[#002875] text-white font-semibold rounded-2xl transition-all duration-200 transform hover:scale-[1.02] font-montserrat text-base"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Entrando...
                  </div>
                ) : (
                  'Acessar Plataforma'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-white/80 font-opensans">
            Desenvolvido pela JT Telecom
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 bg-jt-green rounded-full animate-pulse"></div>
            <span className="text-xs text-white/60 font-opensans">Sistema Online</span>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-[#0033A0]/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#00A651]/10 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 left-5 w-16 h-16 bg-[#0033A0]/5 rounded-full blur-lg"></div>
    </div>
  );
};

export default LoginJTVox;
