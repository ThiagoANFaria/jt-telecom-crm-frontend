
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Zap,
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
    title: 'Chatbot',
    url: '/chatbot',
    icon: MessageCircle,
  },
  {
    title: 'Telefonia',
    url: '/telephony',
    icon: Phone,
  },
  {
    title: 'Automação',
    url: '/automation',
    icon: Zap,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className="border-r border-gray-200 bg-white shadow-xl">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#0057B8] font-bold font-montserrat text-lg px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#0057B8] to-[#003d82] text-white px-3 py-2 rounded-xl font-montserrat font-black text-sm shadow-lg">
                JT
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex gap-1 items-center">
                    {[8, 12, 10, 14, 7].map((height, index) => (
                      <div
                        key={index}
                        className="w-1 bg-[#00C853] rounded-full animate-pulse"
                        style={{
                          height: `${height}px`,
                          animationDelay: `${index * 0.2}s`,
                          animationDuration: '1.5s',
                          boxShadow: '0 0 8px rgba(0,200,83,0.4)'
                        }}
                      ></div>
                    ))}
                  </div>
                  <span className="text-[#0057B8] font-montserrat font-bold text-xl tracking-wide">
                    VOX
                  </span>
                </>
              )}
            </div>
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-3 mt-4">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 font-medium group relative overflow-hidden ${
                          isActive
                            ? 'bg-[#0057B8] text-white shadow-2xl shadow-[#0057B8]/30 scale-105 border-l-4 border-[#00C853]'
                            : 'text-gray-700 hover:bg-[#0057B8] hover:text-white hover:scale-102 hover:shadow-lg'
                        }`}
                      >
                        {/* Efeito de brilho ao passar o mouse */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        
                        <item.icon className={`w-6 h-6 transition-all duration-300 ${
                          isActive ? 'text-white scale-110' : 'group-hover:text-white group-hover:scale-110'
                        }`} />
                        
                        {!isCollapsed && (
                          <span className={`font-opensans text-base transition-all duration-300 ${
                            isActive ? 'font-semibold text-white' : 'group-hover:font-semibold group-hover:text-white'
                          }`}>
                            {item.title}
                          </span>
                        )}
                        
                        {/* Indicador pulsante para item ativo */}
                        {isActive && !isCollapsed && (
                          <div className="ml-auto flex items-center">
                            <div className="w-3 h-3 bg-[#00C853] rounded-full animate-pulse shadow-lg shadow-[#00C853]/50"></div>
                          </div>
                        )}
                        
                        {/* Micro-feedback visual no clique */}
                        <div className={`absolute inset-0 bg-white/20 rounded-2xl scale-0 transition-transform duration-200 ${
                          isActive ? 'group-active:scale-100' : ''
                        }`}></div>
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
