import { useAuth } from '@/context/AuthContext';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute' | '*';
}

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  master: [
    // Master has all permissions
    { resource: '*', action: 'create' },
    { resource: '*', action: 'read' },
    { resource: '*', action: 'update' },
    { resource: '*', action: 'delete' },
    { resource: '*', action: 'execute' },
  ],
  admin: [
    // Admin permissions (tenant-specific)
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
    { resource: 'users', action: 'delete' },
    { resource: 'clients', action: 'create' },
    { resource: 'clients', action: 'read' },
    { resource: 'clients', action: 'update' },
    { resource: 'clients', action: 'delete' },
    { resource: 'leads', action: 'create' },
    { resource: 'leads', action: 'read' },
    { resource: 'leads', action: 'update' },
    { resource: 'leads', action: 'delete' },
    { resource: 'proposals', action: 'create' },
    { resource: 'proposals', action: 'read' },
    { resource: 'proposals', action: 'update' },
    { resource: 'proposals', action: 'delete' },
    { resource: 'contracts', action: 'create' },
    { resource: 'contracts', action: 'read' },
    { resource: 'contracts', action: 'update' },
    { resource: 'contracts', action: 'delete' },
    { resource: 'telephony', action: 'execute' },
    { resource: 'chatbot', action: 'execute' },
    { resource: 'reports', action: 'read' },
  ],
  user: [
    // User permissions (limited)
    { resource: 'clients', action: 'read' },
    { resource: 'leads', action: 'create' },
    { resource: 'leads', action: 'read' },
    { resource: 'leads', action: 'update' },
    { resource: 'proposals', action: 'create' },
    { resource: 'proposals', action: 'read' },
    { resource: 'proposals', action: 'update' },
    { resource: 'contracts', action: 'read' },
    { resource: 'telephony', action: 'execute' },
    { resource: 'chatbot', action: 'execute' },
  ],
};

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (resource: string, action: Exclude<Permission['action'], '*'>): boolean => {
    if (!user) return false;

    const userPermissions = ROLE_PERMISSIONS[user.user_level] || [];
    
    // Check for exact match
    const exactMatch = userPermissions.some(
      perm => perm.resource === resource && perm.action === action
    );
    
    // Check for wildcard permission (master role)
    const wildcardMatch = userPermissions.some(
      perm => perm.resource === '*' && (perm.action === action || perm.action === '*')
    );
    
    return exactMatch || wildcardMatch;
  };

  const canCreate = (resource: string) => hasPermission(resource, 'create');
  const canRead = (resource: string) => hasPermission(resource, 'read');
  const canUpdate = (resource: string) => hasPermission(resource, 'update');
  const canDelete = (resource: string) => hasPermission(resource, 'delete');
  const canExecute = (resource: string) => hasPermission(resource, 'execute');

  return {
    hasPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canExecute,
  };
};