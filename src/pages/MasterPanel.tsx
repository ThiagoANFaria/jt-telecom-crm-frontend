import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';

const MasterPanel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tenantsData = await api.getTenants();
        setTenants(tenantsData);

        const usersData = await api.getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Painel Master</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tenants.length}</div>
            <p className="text-sm text-gray-500">Tenants ativos no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
            <p className="text-sm text-gray-500">Usuários cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <Button>Criar Tenant</Button>
            <Button className="ml-2">Criar Usuário</Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Lista de Tenants</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider">
                  ID
                </th>
                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant: any) => (
                <tr key={tenant.id}>
                  <td className="px-5 py-5 border-b text-sm">
                    {tenant.id}
                  </td>
                  <td className="px-5 py-5 border-b text-sm">
                    {tenant.name}
                  </td>
                  <td className="px-5 py-5 border-b text-sm">
                    <Badge>{tenant.active ? 'Ativo' : 'Inativo'}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MasterPanel;
