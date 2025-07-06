import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  created_at: string;
}

const TenantAdminPanel: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const data = await api.getTenants();
        setTenants(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar tenants.');
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  if (loading) {
    return <div>Carregando tenants...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Painel de Administração de Tenants</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tenants.map((tenant) => (
          <Card key={tenant.id}>
            <CardHeader>
              <CardTitle>{tenant.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Domain:</strong> {tenant.domain}</p>
              <p><strong>Created At:</strong> {new Date(tenant.created_at).toLocaleDateString()}</p>
              <Button>Ver Detalhes</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TenantAdminPanel;
