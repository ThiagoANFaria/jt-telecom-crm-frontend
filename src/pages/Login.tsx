
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import JTVoxLogo from '../components/JTVoxLogo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(to bottom, #001A47 0%, #000D24 100%)'}}>
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Lado esquerdo - Informações */}
        <div className="text-white space-y-8 text-center">
          {/* Logo JT Vox Institucional Centralizado */}
          <div className="flex justify-center mb-8">
            <JTVoxLogo width="320" height="160" />
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">
              Seja Bem Vindo!
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Transforme a forma como você se conecta com seus 
              clientes através de tecnologia avançada de 
              comunicação.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span>Sistema de telefonia integrado</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span>CRM completo e intuitivo</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span>Atendimento automatizado inteligente</span>
            </div>
          </div>
        </div>

        {/* Lado direito - Login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesse sua conta</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Manter-me conectado</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                Esqueci minha senha?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
