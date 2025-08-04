import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredLevel?: 'master' | 'admin' | 'user';
  requiredPermission?: { resource: string; action: 'create' | 'read' | 'update' | 'delete' | 'execute' };
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredLevel, requiredPermission }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { hasPermission } = usePermissions();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar nível de acesso se especificado
  if (requiredLevel && user?.user_level !== requiredLevel) {
    // Redirecionar para o painel correto baseado no nível do usuário
    if (user?.user_level === 'master') {
      return <Navigate to="/master" replace />;
    } else if (user?.user_level === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Verificar permissão específica se especificada
  if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

