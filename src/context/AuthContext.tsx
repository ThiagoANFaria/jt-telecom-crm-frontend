
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  logout: () => void;
  getUserLevel: () => 'master' | 'admin' | 'user' | null;
  isMaster: () => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('Auth check - Token:', !!token, 'User data:', !!userData);
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        console.log('User authenticated from localStorage');
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      console.log('Attempting login for:', credentials.email);
      
      const response = await api.login(credentials);
      
      console.log('Login successful:', response);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      
      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo, ${response.user.name}!`,
      });
      
      return response.user;
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: 'Erro no login',
        description: 'Credenciais inválidas ou erro de conexão. Tente novamente.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserLevel = (): 'master' | 'admin' | 'user' | null => {
    return user?.user_level || null;
  };

  const isMaster = (): boolean => {
    return user?.user_level === 'master';
  };

  const isAdmin = (): boolean => {
    return user?.user_level === 'admin';
  };

  const logout = () => {
    console.log('User logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
    });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    getUserLevel,
    isMaster,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
