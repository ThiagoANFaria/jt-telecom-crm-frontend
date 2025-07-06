
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import JTVoxLogo from '../components/JTVoxLogo';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginModern() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = await login({ email, password });
      
      // Redirecionar baseado no tipo de usuário
      if (userData.user_level === 'master') {
        navigate('/master');
      } else if (userData.user_level === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#0057B8] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#00C853] rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#0057B8] rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Lado esquerdo - Branding e Informações */}
        <div className="text-center lg:text-left space-y-8">
          {/* Logo JT VOX */}
          <div className="flex justify-center lg:justify-start">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <JTVoxLogo />
            </div>
          </div>

          {/* Headline Principal */}
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-[#2C2C2C] leading-tight">
              Sua comunicação.
              <span className="block text-[#0057B8]">Mais simples.</span>
              <span className="block text-[#00C853]">Mais inteligente.</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">
              Plataforma completa de telefonia, CRM e atendimento inteligente. 
              Conecte-se com seus clientes de forma mais eficiente e profissional.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 max-w-md">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-[#00C853] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <span className="text-[#2C2C2C] font-medium">Sistema de telefonia integrado</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-[#00C853] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <span className="text-[#2C2C2C] font-medium">CRM completo e intuitivo</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-[#00C853] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <span className="text-[#2C2C2C] font-medium">Atendimento automatizado inteligente</span>
            </div>
          </div>
        </div>

        {/* Lado direito - Formulário de Login */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md">
            {/* Card do Login */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-300">
              {/* Header do Card */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#2C2C2C] mb-2">Acesse sua conta</h2>
                <p className="text-gray-600">Entre para continuar sua jornada</p>
              </div>

              {/* Erro */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center space-x-2 animate-fade-in">
                  <span className="text-red-500">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Campo E-mail */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-[#2C2C2C]">
                    E-mail
                  </label>
                  <div className={`relative transition-all duration-300 ${emailFocused ? 'scale-[1.02]' : ''}`}>
                    <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${emailFocused ? 'text-[#0057B8]' : 'text-gray-400'}`}>
                      <Mail size={20} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300 bg-white/70 ${
                        emailFocused 
                          ? 'border-[#0057B8] shadow-lg shadow-[#0057B8]/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Campo Senha */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-[#2C2C2C]">
                    Senha
                  </label>
                  <div className={`relative transition-all duration-300 ${passwordFocused ? 'scale-[1.02]' : ''}`}>
                    <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${passwordFocused ? 'text-[#0057B8]' : 'text-gray-400'}`}>
                      <Lock size={20} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300 bg-white/70 ${
                        passwordFocused 
                          ? 'border-[#0057B8] shadow-lg shadow-[#0057B8]/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Sua senha"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#0057B8] transition-colors duration-300"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Opções */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-[#0057B8] border-gray-300 rounded focus:ring-[#0057B8] focus:ring-2" 
                    />
                    <span className="text-sm text-gray-600">Lembrar-me</span>
                  </label>
                  <a 
                    href="#" 
                    className="text-sm text-[#0057B8] hover:text-[#00C853] transition-colors duration-300 font-medium"
                  >
                    Esqueci minha senha
                  </a>
                </div>

                {/* Botão de Login */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full bg-[#0057B8] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-[#004494] focus:ring-4 focus:ring-[#0057B8]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Entrando...</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </form>

              {/* Rodapé do Card */}
              <div className="text-center mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Desenvolvido pela <span className="text-[#0057B8] font-semibold">JT Telecom</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
