
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  FileCheck,
  CheckSquare,
  GitBranch,
  MessageCircle,
  Phone,
  Bot,
  Zap,
  BarChart,
  Settings,
  Shield,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Leads',
    url: '/leads',
    icon: UserPlus,
  },
  {
    title: 'Clientes',
    url: '/clients',
    icon: Users,
  },
  {
    title: 'Propostas',
    url: '/proposals',
    icon: FileText,
  },
  {
    title: 'Contratos',
    url: '/contracts',
    icon: FileCheck,
  },
  {
    title: 'Tarefas',
    url: '/tasks',
    icon: CheckSquare,
  },
  {
    title: 'Pipelines',
    url: '/pipelines',
    icon: GitBranch,
  },
  {
    title: 'Smartbot',
    url: '/smartbot',
    icon: Bot,
  },
  {
    title: 'JT Vox PABX',
    url: '/telephony',
    icon: Phone,
  },
  {
    title: 'Analytics',
    url: '/analytics',
    icon: BarChart,
  },
  {
    title: 'Relatórios',
    url: '/reports',
    icon: FileText,
  },
  {
    title: 'Configurações',
    url: '/settings',
    icon: Settings,
  },
  {
    title: 'Master Panel',
    url: '/master',
    icon: Shield,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { isMaster } = useProfile();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';
  // Deploy: Nomes dos módulos atualizados para Smartbot e JT Vox PABX

  // Filtrar itens do menu baseado no nível do usuário
  const filteredMenuItems = menuItems.filter(item => {
    if (item.title === 'Master Panel') {
      return isMaster;
    }
    return true;
  });

  return (
    <Sidebar className="border-r-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 py-8">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[#0057B8] via-[#0066CC] to-[#003d82] text-white px-4 py-3 rounded-2xl font-montserrat font-black text-base shadow-lg ring-2 ring-white/20">
                JT
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex gap-1 items-center">
                    {[10, 16, 12, 18, 8].map((height, index) => (
                      <div
                        key={index}
                        className="w-1 bg-gradient-to-t from-[#00C853] to-[#00E676] rounded-full animate-pulse shadow-sm"
                        style={{
                          height: `${height}px`,
                          animationDelay: `${index * 0.2}s`,
                          animationDuration: '2s',
                          boxShadow: '0 0 8px rgba(0,200,83,0.4)'
                        }}
                      ></div>
                    ))}
                  </div>
                  <span className="text-white font-montserrat font-bold text-2xl tracking-wide drop-shadow-sm">
                    VOX
                  </span>
                </>
              )}
            </div>
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3 px-4 mt-6">
              {filteredMenuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 font-medium group relative overflow-hidden ${
                          isActive
                            ? 'bg-gradient-to-r from-[#0057B8] via-[#0066CC] to-[#0057B8] text-white shadow-xl shadow-[#0057B8]/40 ring-2 ring-white/20'
                            : 'text-gray-300 hover:bg-gradient-to-r hover:from-slate-700 hover:to-slate-600 hover:text-white hover:shadow-lg hover:ring-1 hover:ring-white/10'
                        }`}
                      >
                        {/* Efeito de brilho sutil */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        
                        <item.icon className={`w-5 h-5 transition-all duration-300 relative z-10 ${
                          isActive ? 'text-white drop-shadow-sm' : 'group-hover:text-white'
                        }`} />
                        
                        {!isCollapsed && (
                          <span className={`font-opensans text-sm transition-all duration-300 relative z-10 ${
                            isActive ? 'font-semibold text-white drop-shadow-sm' : 'group-hover:font-medium group-hover:text-white'
                          }`}>
                            {item.title}
                          </span>
                        )}
                        
                        {/* Indicador ativo discreto */}
                        {isActive && (
                          <div className="ml-auto relative z-10">
                            <div className="w-2 h-2 bg-gradient-to-r from-[#00C853] to-[#00E676] rounded-full shadow-sm"></div>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
