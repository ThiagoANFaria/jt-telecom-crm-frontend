import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface MasterRouteProps {
  children: React.ReactNode;
}

const MasterRoute: React.FC<MasterRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  // 🔍 DEBUG: Logs de renderização
  console.log('🔐 [MasterRoute] Renderizando...');
  console.log('👤 [MasterRoute] User:', user?.email);
  console.log('📋 [MasterRoute] Profile:', { name: profile?.name, level: profile?.user_level });
  console.log('⏳ [MasterRoute] Loading states:', { isLoading, profileLoading });

  // Wait for both auth and profile to load
  if (isLoading || profileLoading || (user && !profile)) {
    console.log('⏳ [MasterRoute] Aguardando carregamento...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Verificar se é Master e sem tenant_id
  if (!profile || profile.user_level !== 'master') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-4">
              Este módulo é exclusivo para usuários Master da JT Telecom.
            </p>
            <p className="text-sm text-muted-foreground">
              Apenas o superadministrador pode acessar o Painel Master.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default MasterRoute;