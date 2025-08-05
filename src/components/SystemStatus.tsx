import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { systemService, SystemMetrics } from '@/services/system';
import { 
  Server, 
  Database, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Cpu,
  HardDrive,
  MemoryStick,
  Users,
  RefreshCw,
  Shield
} from 'lucide-react';

const SystemStatus: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const adminStatus = await systemService.isUserAdmin();
      setIsAdmin(adminStatus);
      if (adminStatus) {
        fetchSystemMetrics();
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
    }
  };

  const fetchSystemMetrics = async () => {
    try {
      setIsLoading(true);
      const data = await systemService.getSystemMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
      toast({
        title: 'Erro ao carregar status',
        description: 'Não foi possível carregar o status do sistema.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4" />;
      case 'down': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      degraded: 'secondary',
      down: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500 mb-4">
            Acesso restrito para administradores
          </div>
          <p className="text-sm text-muted-foreground">
            Você não tem permissão para visualizar o status do sistema.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0057B8]">Status do Sistema</h2>
        <Button 
          variant="outline" 
          onClick={fetchSystemMetrics}
          disabled={isLoading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {metrics && (
        <>
          {/* Informações Gerais do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-[#0057B8]" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Versão</p>
                  <p className="font-medium">{metrics.info.version}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ambiente</p>
                  <Badge variant="outline">{metrics.info.environment}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="font-medium">{metrics.info.uptime}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Build</p>
                  <p className="font-medium">{metrics.info.build_date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Commit</p>
                  <p className="font-medium">{metrics.info.git_commit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Node.js</p>
                  <p className="font-medium">{metrics.info.node_version}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status dos Serviços */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#0057B8]" />
                  Banco de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <div className={`flex items-center gap-2 ${getStatusColor(metrics.health.database.status)}`}>
                      {getStatusIcon(metrics.health.database.status)}
                      {getStatusBadge(metrics.health.database.status)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Latência</span>
                    <span className="font-medium">{metrics.health.database.latency}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conexões</span>
                    <span className="font-medium">{metrics.health.database.connections}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#0057B8]" />
                  API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <div className={`flex items-center gap-2 ${getStatusColor(metrics.health.api.status)}`}>
                      {getStatusIcon(metrics.health.api.status)}
                      {getStatusBadge(metrics.health.api.status)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tempo de Resposta</span>
                    <span className="font-medium">{metrics.health.api.response_time}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-[#0057B8]" />
                  Armazenamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <div className={`flex items-center gap-2 ${getStatusColor(metrics.health.storage.status)}`}>
                      {getStatusIcon(metrics.health.storage.status)}
                      {getStatusBadge(metrics.health.storage.status)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uso</span>
                    <span className="font-medium">{metrics.health.storage.usage_percentage}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Disponível</span>
                    <span className="font-medium">{metrics.health.storage.available_space}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas de Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#0057B8]" />
                Performance do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <Cpu className="w-8 h-8 text-[#0057B8] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-[#0057B8]">
                    {metrics.performance.cpu_usage}%
                  </div>
                  <p className="text-sm text-muted-foreground">CPU</p>
                </div>
                <div className="text-center">
                  <MemoryStick className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.performance.memory_usage}%
                  </div>
                  <p className="text-sm text-muted-foreground">Memória</p>
                </div>
                <div className="text-center">
                  <HardDrive className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {metrics.performance.disk_usage}%
                  </div>
                  <p className="text-sm text-muted-foreground">Disco</p>
                </div>
                <div className="text-center">
                  <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {metrics.performance.active_sessions}
                  </div>
                  <p className="text-sm text-muted-foreground">Sessões Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alertas do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#0057B8]" />
                Alertas do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.alerts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum alerta no momento
                  </p>
                ) : (
                  metrics.alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded-full ${
                          alert.type === 'error' ? 'bg-red-100 text-red-600' :
                          alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {alert.type === 'error' ? <XCircle className="w-4 h-4" /> :
                           alert.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                           <CheckCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString('pt-BR')}
                        </p>
                        {alert.resolved ? (
                          <Badge variant="outline" className="text-green-600">Resolvido</Badge>
                        ) : (
                          <Badge variant="destructive">Ativo</Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SystemStatus;