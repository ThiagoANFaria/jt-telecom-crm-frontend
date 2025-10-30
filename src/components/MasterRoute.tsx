import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { roleVerificationService } from '@/services/roleVerification';

interface MasterRouteProps {
  children: React.ReactNode;
}

const MasterRoute: React.FC<MasterRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [isMasterVerified, setIsMasterVerified] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(true);

  // Verificação segura usando RPC
  useEffect(() => {
    const verifyAccess = async () => {
      if (!user) {
        setVerifying(false);
        return;
      }

      try {
        const isMaster = await roleVerificationService.isMaster(user.id);
        setIsMasterVerified(isMaster);
      } catch (error) {
        console.error('Erro ao verificar acesso master:', error);
        setIsMasterVerified(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyAccess();
  }, [user]);

  if (isLoading || verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Verificação de nível Master usando validação segura do servidor
  if (isMasterVerified === false) {
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